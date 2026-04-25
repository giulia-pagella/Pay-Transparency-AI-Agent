import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { generateReportJson } from '@/lib/ai/gemini';
import { calculateAttention } from '@/lib/attention/rules';
import { getMaturityConfig, readProcessedRegulations } from '@/lib/report/data';
import { questionnaireSchema } from '@/lib/schemas/questionnaire';
import { checkRateLimit, getSession, increaseRate } from '@/lib/session/store';

const bodySchema = z.object({
  company: questionnaireSchema.shape.company,
  selected_countries: z.array(z.string()).min(1),
  maturity: z.record(z.number().int().min(1).max(4).nullable()),
});

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
    const report = await generateReportJson({
      apiKey: session.apiKey,
      assessmentInput,
      attentionLevels: attention,
      sources: [eu, ...selectedRegs],
      partialData: compiled < 9,
      hasDraftSources,
    });

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
    return NextResponse.json({ error: 'Si è verificato un errore nell\'elaborazione del report. Il sistema sta riprovando automaticamente...' }, { status: 500 });
  }
}
