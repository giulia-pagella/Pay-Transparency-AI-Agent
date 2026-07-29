import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { generateReportJson } from '@/lib/ai/gemini';
import { calculateAttention, calculateAttentionLevel } from '@/lib/attention/rules';
import { getMaturityConfig, readProcessedRegulations } from '@/lib/report/data';
import { buildReportSkeleton, repairReportFromAi } from '@/lib/report/assembler';
import { reportSchema, type ReportJson } from '@/lib/schemas/report';
import { questionnaireSchema } from '@/lib/schemas/questionnaire';
import type { Regulation } from '@/lib/schemas/regulations';
import { checkRateLimit, getSession, increaseRate } from '@/lib/session/store';

export const maxDuration = 300;

const bodySchema = z.object({
  company: questionnaireSchema.shape.company,
  selected_countries: z.array(z.string()).min(1),
  maturity: z.record(z.number().int().min(1).max(4).nullable()),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorCode(error: unknown) {
  return isRecord(error) && typeof error.code === 'string' ? error.code : undefined;
}

function errorName(error: unknown) {
  return isRecord(error) && typeof error.name === 'string' ? error.name : undefined;
}

function compactSourcesForAi(regs: Regulation[]) {
  return regs.map((r) => ({
    country_code: r.country_code,
    country_name: r.country_name,
    document_type: r.document_type,
    document_title: r.document_title,
    status: r.status,
    version: r.version,
    date: r.date,
    source_url: r.source_url ?? null,
    sections: Array.isArray(r.sections)
      ? r.sections.slice(0, 10).map((s) => ({
          topic: s.topic,
          title: s.title,
          article_references: Array.isArray(s.article_references)
            ? s.article_references.slice(0, 5)
            : [],
          content: typeof s.content === 'string' ? s.content.slice(0, 700) : '',
        }))
      : [],
  }));
}

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
      headline: '',
      paragraph: '',
      key_points: ['', '', '', ''],
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
      key_obligations: [
        {
          article: 'Art. 5',
          title: '',
          description: '',
          subject: 'datore di lavoro',
          source_tag: 'FONTE UE',
        },
      ],
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
      thesis: skeleton.metadata.selected_countries.length > 1 ? '' : null,
      timeline: skeleton.metadata.selected_countries.length > 1
        ? skeleton.perimeter.countries_analyzed.map((c) => ({
            country_code: c.code,
            country_name: c.name,
            status: c.status === 'draft' ? 'in_bozza' : 'vigente',
            enforcement_date: '',
            phase_label: '',
          }))
        : [],
      table_rows: skeleton.metadata.selected_countries.length > 1
        ? [
            {
              topic: 'Esempio tema di confronto',
              cells: Object.fromEntries(
                skeleton.metadata.selected_countries.map((c) => [c, '']),
              ),
            },
          ]
        : [],
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
      maturity_level: x.maturity_level,
      attention: x.attention ?? 'Media',
      directive_articles: [],
      analysis: '',
      current_level: x.current_level,
      current_level_label: x.current_level_label,
      gap_description: '',
    })),

    recommendations: [
      {
        id: 'R1',
        priority: 'Alta',
        temporal_tag: 'Immediata',
        related_areas: [],
        related_countries: skeleton.metadata.selected_countries,
        title: '',
        short_description: '',
        concrete_actions: ['', ''],
        directive_articles: [],
        description: '',
      },
      {
        id: 'R2',
        priority: 'Media',
        temporal_tag: 'Entro 6 mesi',
        related_areas: [],
        related_countries: skeleton.metadata.selected_countries,
        title: '',
        short_description: '',
        concrete_actions: ['', ''],
        directive_articles: [],
        description: '',
      },
      {
        id: 'R3',
        priority: 'Media',
        temporal_tag: 'Entro 12 mesi',
        related_areas: [],
        related_countries: skeleton.metadata.selected_countries,
        title: '',
        short_description: '',
        concrete_actions: ['', ''],
        directive_articles: [],
        description: '',
      },
      {
        id: 'R4',
        priority: 'Bassa',
        temporal_tag: 'Entro 12 mesi',
        related_areas: [],
        related_countries: skeleton.metadata.selected_countries,
        title: '',
        short_description: '',
        concrete_actions: ['', ''],
        directive_articles: [],
        description: '',
      },
    ],

    roadmap: {
      roadmap_intro: '',
      engagement_priorities: ['', '', ''],
    },

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
  const attentionLevel = calculateAttentionLevel(
    parsed.data.maturity,
    parsed.data.company,
    parsed.data.selected_countries,
    selectedRegs,
  );
  const aiSources = compactSourcesForAi([eu, ...selectedRegs]);

  increaseRate(session);

  const assessmentInput = {
    ...parsed.data,
    completed_areas_count: compiled,
    has_partial_data_flag: compiled < 9,
    has_draft_sources: hasDraftSources,
    tool_version: '1.0.0',
  };

  // Da qui in poi la generazione puo' richiedere anche diversi minuti (chiamate a
  // Gemini). Alcuni proxy intermedi (es. il port-forwarding di GitHub Codespaces)
  // chiudono le connessioni HTTP/2 che restano "silenziose" troppo a lungo: la
  // risposta viene quindi inviata come stream, con heartbeat periodici (whitespace,
  // innocuo per JSON.parse che ignora gli spazi bianchi iniziali) che mantengono la
  // connessione attiva finche' il risultato non e' pronto. Lo status HTTP resta
  // sempre 200: esito ed eventuale errore sono nel body JSON (vedi `data.error` lato
  // client in app/paesi/page.tsx).
  //
  // Le costanti sotto ricatturano valori gia' "narrowed" (session non-null, parsed.data
  // definito, eu definito): il narrowing di TypeScript non attraversa i confini di una
  // closure, quindi vanno assegnati a variabili dedicate prima di essere usati dentro
  // runGeneration.
  const activeSession = session;
  const questionnaire = parsed.data;
  const euRegulation = eu;

  async function runGeneration(): Promise<string> {
    try {
      const skeleton = buildReportSkeleton({
        company: questionnaire.company,
        selectedCountries: questionnaire.selected_countries,
        completedAreasCount: compiled,
        hasDraftSources,
        hasPartialDataFlag: compiled < 9,
        selectedRegulations: selectedRegs,
        euRegulation,
        maturityConfig,
        maturityValues: questionnaire.maturity,
        attentionByArea: attention.byArea,
        overallAttention: attentionLevel.level,
        attentionScore: attentionLevel.score,
        attentionBreakdown: attentionLevel.breakdown,
        attentionTriggers: attentionLevel.triggers,
      });

      const schemaTemplate = buildAiSchemaTemplate(skeleton);

      const aiDraft = await generateReportJson({
        apiKey: activeSession.apiKey,
        assessmentInput,
        attentionLevels: {
          byArea: attention.byArea,
          overall: attentionLevel.level,
          score: attentionLevel.score,
          triggers: attentionLevel.triggers,
        },
        sources: aiSources,
        partialData: compiled < 9,
        hasDraftSources,
        schemaTemplate,
      });

      const repaired = repairReportFromAi(aiDraft, skeleton);
      const report = reportSchema.parse(repaired);

      activeSession.questionnaireData = questionnaire;
      activeSession.reportJson = report;
      activeSession.partialReportJson = null;
      return JSON.stringify({ ok: true });
    } catch (error) {
      console.error('[api/ai/generate] Generazione report fallita:', error);
      activeSession.partialReportJson = {
        metadata: {
          company_name: questionnaire.company.company_name,
          sector: questionnaire.company.sector,
          employee_range: questionnaire.company.employee_range,
          organizational_model: questionnaire.company.organizational_model,
          generated_at: new Date().toISOString(),
          selected_countries: questionnaire.selected_countries,
          completed_areas_count: compiled,
          has_draft_sources: hasDraftSources,
          has_partial_data_flag: compiled < 9,
          tool_version: '1.0.0',
        },
      };

      const code = errorCode(error);
      let message = 'Si è verificato un errore nell\'elaborazione del report. Il sistema sta riprovando automaticamente...';
      if (code === 'SAFETY') message = 'Il contenuto generato è stato filtrato dai sistemi di sicurezza di Google. Questo è raro; prova a rigenerare il report.';
      else if (code === 'TIMEOUT') message = 'La generazione del report ha impiegato più tempo del previsto. Riprova: se l\'errore persiste, potrebbe essere un problema temporaneo del servizio Gemini.';
      else if (code === 'BAD_REQUEST') message = 'La richiesta a Gemini non è stata accettata. Verifica la chiave API o la quota disponibile e riprova.';
      else if (code === 'JSON_PARSE_ERROR') message = 'Gemini ha restituito un JSON non valido. Riprova tra qualche secondo.';
      else if (code === 'SCHEMA_VALIDATION_ERROR') message = 'Gemini ha restituito un JSON incompleto rispetto allo schema richiesto. Riprova.';
      else if (code === 'EMPTY_RESPONSE') message = 'Gemini ha restituito una risposta vuota. Riprova.';
      else if (errorName(error) === 'ZodError') message = "L'output AI è stato riparato ma resta incompleto rispetto allo schema. Riprova.";
      return JSON.stringify({ error: message });
    }
  }

  const encoder = new TextEncoder();
  const heartbeatMs = Number(process.env.GENERATE_HEARTBEAT_MS ?? 15_000);
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode('\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, heartbeatMs);

      runGeneration().then(
        (resultText) => {
          clearInterval(heartbeat);
          controller.enqueue(encoder.encode(resultText));
          controller.close();
        },
        () => {
          clearInterval(heartbeat);
          controller.enqueue(encoder.encode(JSON.stringify({ error: 'Si è verificato un errore imprevisto durante la generazione del report.' })));
          controller.close();
        },
      );
    },
    cancel() {
      clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
