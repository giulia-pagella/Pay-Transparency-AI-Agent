import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { generateReportJson } from '@/lib/ai/gemini';
import { calculateAttention } from '@/lib/attention/rules';
import { getMaturityConfig, readProcessedRegulations } from '@/lib/report/data';
import { buildReportSkeleton, repairReportFromAi } from '@/lib/report/assembler';
import { reportSchema, type ReportJson } from '@/lib/schemas/report';
import { questionnaireSchema } from '@/lib/schemas/questionnaire';
import { checkRateLimit, getSession, increaseRate } from '@/lib/session/store';

export const maxDuration = 300;

const bodySchema = z.object({
  company: questionnaireSchema.shape.company,
  selected_countries: z.array(z.string()).min(1),
  maturity: z.record(z.number().int().min(1).max(4).nullable()),
});

function buildAiSchemaTemplate(skeleton: ReportJson) {
  return {
    metadata: {
      company_name: '',
      sector: '',
      employee_range: '',
      organizational_model: '',
      generated_at: '',
      selected_countries: [],
      completed_areas_count: 0,
      has_draft_sources: false,
      has_partial_data_flag: false,
      tool_version: '',
    },

    executive_summary: {
      overall_attention: 'media',
      synthesis_sentence: '',
      key_points: [],
      brief_context: '',
    },

    perimeter: {
      company_block: {
        company_name: '',
        sector: '',
        employee_range: '',
        organizational_model: '',
      },
      countries_analyzed: skeleton.perimeter.countries_analyzed.map(() => ({
        code: '',
        name: '',
        status: 'draft',
      })),
      excluded_scope: '',
    },

    eu_directive: {
      overview: '',
      key_obligations: [],
      timeline_summary: '',
    },

    country_analysis: skeleton.country_analysis.map(() => ({
      country_code: '',
      country_name: '',
      status: 'draft',
      national_framework_summary: '',
      key_differences_vs_eu: [],
      specific_obligations: [],
      implementation_notes: '',
    })),

    countries_comparison: {
      table_rows: [],
      narrative: '',
    },

    impacts_by_area: skeleton.impacts_by_area.map((x) => ({
      area_id: x.area_id,
      area_name: x.area_name,
      attention_level: x.attention_level ?? 'media',
      impact_description: '',
      priority: x.priority ?? 'media',
      regulatory_reference: '',
    })),

    maturity: skeleton.maturity.map((x) => ({
      area_id: x.area_id,
      area_name: x.area_name,
      current_level: x.current_level,
      current_level_label: x.current_level_label,
      gap_description: '',
      recommendation: '',
    })),

    recommendations: [],

    limits: {
      scope_limitations: '',
      methodological_caveats: '',
      draft_warning: '',
      partial_data_warning: '',
    },

    sources: skeleton.sources.map(() => ({
      country_code: '',
      document_title: '',
      document_type: '',
      status: 'draft',
      version: '',
      date: '',
      pdf_link: null,
    })),
  };
}

export async function POST(req: Request) {
  const sid = (await cookies()).get('session_id')?.value;
  const session = getSession(sid);
  if (!session) {
    return NextResponse.json({ error: 'La sessione è scaduta. Reinserisci la chiave API per continuare.' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Input non valido.' }, { status: 400 });

  const maturityConfig = getMaturityConfig();
  const compiled = Object.values(parsed.data.maturity).filter((v) => v !== null).length;
  if (compiled < 6) {
    return NextResponse.json({ error: 'Compila almeno 6 aree su 9 per generare il report.' }, { status: 400 });
  }

  const rate = checkRateLimit(session);
  if (!rate.ok && rate.type === 'minute') {
    return NextResponse.json({ error: `Hai raggiunto il limite di 5 richieste al minuto del piano Gemini. Attendi ${rate.remainingSeconds} secondi e riprova.`, retry_in_seconds: rate.remainingSeconds }, { status: 429 });
  }
  if (!rate.ok && rate.type === 'day') {
    return NextResponse.json({ error: 'Hai esaurito le 20 richieste giornaliere del piano gratuito di Gemini. La quota si resetta in circa 24 ore. Per volumi maggiori, valuta il passaggio al piano a pagamento di Google AI Studio.' }, { status: 429 });
  }

  const regs = await readProcessedRegulations();
  const eu = regs.find((r) => r.country_code === 'EU');
  const selectedRegs = regs.filter((r) => parsed.data.selected_countries.includes(r.country_code));
  if (!eu || selectedRegs.length < 1) {
    return NextResponse.json({ error: 'Contenuti normativi non ancora caricati. Aggiungere i file JSON in /data/regulations/processed/.' }, { status: 400 });
  }

  const hasDraftSources = selectedRegs.some((r) => r.status === 'draft');
  const attention = calculateAttention(maturityConfig, parsed.data.maturity, hasDraftSources);

  increaseRate(session);

  const assessmentInput = {
    ...parsed.data,
    completed_areas_count: compiled,
    has_partial_data_flag: compiled < 9,
    has_draft_sources: hasDraftSources,
    tool_version: '1.0.0',
  };

  try {
    const skeleton = buildReportSkeleton({
  company: parsed.data.company,
  selectedCountries: parsed.data.selected_countries,
  completedAreasCount: compiled,
  hasDraftSources,
  hasPartialDataFlag: compiled < 9,
  selectedRegulations: selectedRegs,
  euRegulation: eu,
  maturityConfig,
  maturityValues: parsed.data.maturity,
  attentionByArea: attention.byArea as any,
  overallAttention: attention.overall,
});

const schemaTemplate = buildAiSchemaTemplate(skeleton);

const aiDraft = await generateReportJson({
  apiKey: session.apiKey,
  assessmentInput,
  attentionLevels: attention,
  sources: [eu, ...selectedRegs],
  partialData: compiled < 9,
  hasDraftSources,
  schemaTemplate,
});

    const repaired = repairReportFromAi(aiDraft, skeleton);
    const report = reportSchema.parse(repaired);

    session.questionnaireData = parsed.data as any;
    session.reportJson = report;
    session.partialReportJson = null;
    return NextResponse.json({ ok: true });
  } catch (error) {
    session.partialReportJson = {
      metadata: {
        company_name: parsed.data.company.company_name,
        sector: parsed.data.company.sector,
        employee_range: parsed.data.company.employee_range,
        organizational_model: parsed.data.company.organizational_model,
        generated_at: new Date().toISOString(),
        selected_countries: parsed.data.selected_countries,
        completed_areas_count: compiled,
        has_draft_sources: hasDraftSources,
        has_partial_data_flag: compiled < 9,
        tool_version: '1.0.0',
      },
    } as any;

    const code = (error as any)?.code;
    if (code === 'SAFETY') return NextResponse.json({ error: 'Il contenuto generato è stato filtrato dai sistemi di sicurezza di Google. Questo è raro; prova a rigenerare il report.' }, { status: 400 });
    if (code === 'TIMEOUT') return NextResponse.json({ error: 'La generazione del report ha impiegato più tempo del previsto. Riprova: se l\'errore persiste, potrebbe essere un problema temporaneo del servizio Gemini.' }, { status: 504 });
    if (code === 'BAD_REQUEST') return NextResponse.json({ error: 'La richiesta a Gemini non è stata accettata. Verifica la chiave API o la quota disponibile e riprova.' }, { status: 400 });
    if (code === 'JSON_PARSE_ERROR') return NextResponse.json({ error: 'Gemini ha restituito un JSON non valido. Riprova tra qualche secondo.' }, { status: 502 });
    if (code === 'SCHEMA_VALIDATION_ERROR') return NextResponse.json({ error: 'Gemini ha restituito un JSON incompleto rispetto allo schema richiesto. Riprova.' }, { status: 502 });
    if (code === 'EMPTY_RESPONSE') return NextResponse.json({ error: 'Gemini ha restituito una risposta vuota. Riprova.' }, { status: 502 });
    if ((error as any)?.name === 'ZodError') return NextResponse.json({ error: "L'output AI è stato riparato ma resta incompleto rispetto allo schema. Riprova." }, { status: 502 });
    return NextResponse.json({ error: 'Si è verificato un errore nell\'elaborazione del report. Il sistema sta riprovando automaticamente...' }, { status: 500 });
  }
}
