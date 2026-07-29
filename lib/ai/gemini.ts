type GenerateInput = {
  apiKey: string;
  assessmentInput: unknown;
  attentionLevels: unknown;
  sources: unknown;
  partialData: boolean;
  hasDraftSources: boolean;
  schemaTemplate?: unknown;
};

type JsonRecord = Record<string, unknown>;
type NormalizedError = {
  code: string;
  message: string;
  issues?: string[];
};

const SUBJECTS = ['datore di lavoro', 'Stato membro', 'candidato', 'lavoratore'] as const;
const TARGET_ATTENTIONS = ['Alta', 'Media', 'Bassa'] as const;
const MATURITY_LEVELS = ['Iniziale', 'Parziale', 'Strutturato', 'Avanzato'] as const;
const TEMPORAL_TAGS = ['Immediata', 'Entro 6 mesi', 'Entro 12 mesi'] as const;
const SOURCE_TAG = 'FONTE UE';

const EMPTY_RECORD: JsonRecord = {};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : EMPTY_RECORD;
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

const systemPrompt = `Sei un consulente senior esperto di normativa europea sulla trasparenza retributiva, assessment HR e sistemi retributivi.

Genera esclusivamente un oggetto JSON valido e conforme allo schema fornito.
Lingua: italiano professionale.
Non inserire testo fuori dal JSON.
Non inventare fonti normative non presenti negli input.
Non dichiarare conformita, compliance o idoneita legale.

Regole strutturali obbligatorie:
- La sezione eu_directive e prescrittiva e neutra: non deve citare cliente, maturita, livelli di attenzione o raccomandazioni.
- eu_directive.key_obligations contiene 3-4 obblighi ordinati per articolo, ciascuno con article, title, description, subject e source_tag="FONTE UE".
- maturity contiene analisi diagnostica per area: usare analysis, maturity_level, attention e directive_articles. Non generare raccomandazioni dentro le aree di maturity.
- analysis maturity deve avere almeno 2 frasi se attention e Bassa, 3 frasi se Media, 4 frasi se Alta.
- recommendations contiene esattamente 4 raccomandazioni prescrittive con priority, temporal_tag, related_areas, related_countries, title, short_description, concrete_actions e directive_articles.
- Ogni raccomandazione contiene 2-3 concrete_actions specifiche, non vaghe.
- I temporal_tag coprono almeno 2 orizzonti temporali diversi.
- roadmap contiene solo roadmap.roadmap_intro e roadmap.engagement_priorities, senza duplicare le raccomandazioni.
- countries_comparison: se e selezionato un solo paese, thesis, timeline e table_rows devono essere vuoti o null; se i paesi sono piu di uno, valorizzali.
- Le date devono restare valori dati; non formattarle per l'utente finale nel testo del JSON.`;

function runtimePrompt(input: GenerateInput, retryMessage?: string) {
  const assessmentInput = toRecord(input.assessmentInput);
  const selectedCountries = assessmentInput.selected_countries;
  const isSingleCountry = Array.isArray(selectedCountries) && selectedCountries.length === 1;
  const base = `Genera un report di assessment sulla pay transparency in formato JSON.

## Input utente
${JSON.stringify(input.assessmentInput, null, 2)}

## Livelli di attenzione gia calcolati dal sistema
${JSON.stringify(input.attentionLevels, null, 2)}

## Fonti normative da utilizzare
${JSON.stringify(input.sources, null, 2)}

## Struttura JSON attesa
${JSON.stringify(input.schemaTemplate ?? {}, null, 2)}

## Regole finali
- Rispondi solo con JSON.
- Non copiare placeholder o fallback dello schema.
- eu_directive.key_obligations: 3-4 elementi, ordinati per article, con article/title/description/subject/source_tag.
- subject ammessi: "datore di lavoro", "Stato membro", "candidato", "lavoratore".
- source_tag deve essere sempre "FONTE UE".
- maturity: ogni area deve avere area_name, maturity_level, attention, directive_articles e analysis diagnostica.
- Non mettere raccomandazioni dentro maturity.
- analysis maturity: Bassa almeno 2 frasi, Media almeno 3, Alta almeno 4.
- recommendations: esattamente 4 elementi.
- Ogni recommendation deve avere priority ("Alta", "Media", "Bassa"), temporal_tag, related_areas, related_countries, title, short_description, concrete_actions e directive_articles.
- concrete_actions: 2-3 azioni operative concrete. Evita azioni vaghe come "Monitorare", "Valutare" o "Considerare" senza oggetto concreto.
- Usa almeno 2 temporal_tag diversi tra le 4 raccomandazioni.
- roadmap: compila solo roadmap.roadmap_intro e roadmap.engagement_priorities (3-4 priorita), senza citare NTT DATA, fornitori o consulenti esterni.
- ${isSingleCountry
    ? 'Single-country: countries_comparison.thesis puo essere null/vuota e countries_comparison.timeline/table_rows devono essere array vuoti.'
    : 'Multi-country: countries_comparison.thesis deve essere valorizzata, timeline deve avere i paesi selezionati e table_rows deve avere almeno 4 righe.'}`;

  return retryMessage ? `${retryMessage}\n\n${base}` : base;
}

const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS ?? 90_000);

function extractTextFromResponse(json: unknown) {
  const root = toRecord(json);
  const candidates = Array.isArray(root.candidates) ? root.candidates : [];
  const firstCandidate = toRecord(candidates[0]);
  const content = toRecord(firstCandidate.content);
  return records(content.parts)
    .map((part) => (typeof part.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();
}

function stripCodeFence(text: string) {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

async function callGemini(apiKey: string, prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.15,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}:${errorText}`);
    }

    const json = await response.json();
    const text = extractTextFromResponse(json);
    if (!text) throw Object.assign(new Error('EMPTY_RESPONSE'), { code: 'EMPTY_RESPONSE' });
    return stripCodeFence(text);
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeError(error: unknown): NormalizedError {
  const errorRecord = toRecord(error);
  const msg = String(error);
  if (typeof errorRecord.code === 'string') {
    return {
      code: errorRecord.code,
      message: typeof errorRecord.message === 'string' ? errorRecord.message : msg,
      issues: Array.isArray(errorRecord.issues)
        ? errorRecord.issues.filter((issue): issue is string => typeof issue === 'string')
        : undefined,
    };
  }
  if (errorRecord.name === 'AbortError') {
    return {
      code: 'TIMEOUT',
      message: 'La richiesta a Gemini ha superato il tempo massimo di attesa. Riprova tra qualche istante.',
    };
  }
  if (msg.includes('429')) {
    return { code: 'RATE_LIMIT', message: 'Hai raggiunto il limite di 5 richieste al minuto del piano Gemini.' };
  }
  if (msg.toLowerCase().includes('safety')) {
    return {
      code: 'SAFETY',
      message: 'Il contenuto generato e stato filtrato dai sistemi di sicurezza di Google. Prova a rigenerare il report.',
    };
  }
  if (msg.toLowerCase().includes('timeout')) {
    return {
      code: 'TIMEOUT',
      message: "La generazione del report ha impiegato piu tempo del previsto. Riprova.",
    };
  }
  if (msg.includes('400')) {
    return { code: 'BAD_REQUEST', message: 'La richiesta a Gemini non e stata accettata. Verifica la chiave API e riprova.' };
  }
  return { code: 'UNKNOWN', message: 'Si e verificato un errore imprevisto. Riprova.' };
}

function filledString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function filledStrings(value: unknown) {
  return Array.isArray(value) ? value.filter(filledString).map((x) => x.trim()) : [];
}

function sentenceCount(value: string) {
  return value.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean).length;
}

function hasTargetAttention(value: unknown): value is (typeof TARGET_ATTENTIONS)[number] {
  return TARGET_ATTENTIONS.includes(value as (typeof TARGET_ATTENTIONS)[number]);
}

function hasMaturityLevel(value: unknown): value is (typeof MATURITY_LEVELS)[number] {
  return MATURITY_LEVELS.includes(value as (typeof MATURITY_LEVELS)[number]);
}

function hasTemporalTag(value: unknown): value is (typeof TEMPORAL_TAGS)[number] {
  return TEMPORAL_TAGS.includes(value as (typeof TEMPORAL_TAGS)[number]);
}

function isVagueAction(action: string) {
  const normalized = action.trim().replace(/\s+/g, ' ');
  if (/^(Monitorare|Valutare|Considerare)\.?$/i.test(normalized)) return true;
  if (/^(Monitorare|Valutare|Considerare)\b/i.test(normalized)) {
    return normalized.split(' ').length < 4;
  }
  return false;
}

export function assessQuality(
  draft: unknown,
  input: {
    assessmentInput: unknown;
  },
) {
  const issues: string[] = [];

  if (!draft || typeof draft !== 'object') {
    issues.push('Oggetto report assente.');
    return issues;
  }

  const report = toRecord(draft);
  const assessmentInput = toRecord(input.assessmentInput);
  const company = toRecord(assessmentInput.company);
  const selectedCountries = Array.isArray(assessmentInput.selected_countries)
    ? assessmentInput.selected_countries
    : [];
  const isMultiCountry = selectedCountries.length > 1;
  const executiveSummary = toRecord(report.executive_summary);
  const directive = toRecord(report.eu_directive);
  const roadmap = toRecord(report.roadmap);
  const comparison = toRecord(report.countries_comparison);

  const headlineValue = executiveSummary.headline;
  const paragraphValue = executiveSummary.paragraph;
  const companyNameValue = company.company_name;
  const sectorValue = company.sector;
  const headline = filledString(headlineValue) ? headlineValue.trim() : '';
  const paragraph = filledString(paragraphValue) ? paragraphValue.trim() : '';
  const keyPoints = filledStrings(executiveSummary.key_points);
  const recommendations = records(report.recommendations);
  const maturity = records(report.maturity);
  const keyObligations = records(directive.key_obligations);

  const companyName = filledString(companyNameValue) ? companyNameValue.trim() : '';
  const sector = filledString(sectorValue) ? sectorValue.trim().toLowerCase() : '';
  const summaryText = `${headline} ${paragraph}`.toLowerCase();

  if (!headline || headline.length < 40) issues.push('Executive summary: headline troppo breve o assente.');
  if (!paragraph || paragraph.length < 100) issues.push('Executive summary: paragraph troppo breve o assente.');
  if (keyPoints.length !== 4) issues.push(`Executive summary: key_points deve avere esattamente 4 elementi, ricevuti ${keyPoints.length}.`);
  if (companyName && !headline.includes(companyName) && !paragraph.includes(companyName)) {
    issues.push('Executive summary: manca personalizzazione sul nome azienda.');
  }
  if (sector && !summaryText.includes(sector)) {
    issues.push('Executive summary: manca personalizzazione sul settore.');
  }

  if (keyObligations.length < 3 || keyObligations.length > 4) {
    issues.push(`Direttiva UE: key_obligations deve avere 3-4 elementi, ricevuti ${keyObligations.length}.`);
  }

  keyObligations.forEach((ob, index) => {
    const missing = ['article', 'title', 'description', 'subject', 'source_tag'].filter((field) => !filledString(ob[field]));
    if (missing.length > 0) {
      issues.push(`Direttiva UE: obligation ${index + 1} manca campi target: ${missing.join(', ')}.`);
    }
    if (!SUBJECTS.includes(ob.subject as (typeof SUBJECTS)[number])) {
      issues.push(`Direttiva UE: obligation ${index + 1} ha subject non ammesso.`);
    }
    if (ob.source_tag !== SOURCE_TAG) {
      issues.push(`Direttiva UE: obligation ${index + 1} deve avere source_tag "FONTE UE".`);
    }
  });

  if (recommendations.length !== 4) {
    issues.push(`Raccomandazioni: attese esattamente 4, ricevute ${recommendations.length}.`);
  }

  const temporalTags: string[] = [];
  recommendations.forEach((rec, index) => {
    const missing = [
      'priority',
      'temporal_tag',
      'title',
      'short_description',
    ].filter((field) => !filledString(rec[field]));

    if (missing.length > 0) {
      issues.push(`Raccomandazione ${index + 1}: manca campi target: ${missing.join(', ')}.`);
    }
    if (!hasTargetAttention(rec.priority)) {
      issues.push(`Raccomandazione ${index + 1}: priority non ammessa.`);
    }
    if (!hasTemporalTag(rec.temporal_tag)) {
      issues.push(`Raccomandazione ${index + 1}: temporal_tag non ammesso o assente.`);
    } else {
      temporalTags.push(rec.temporal_tag);
    }

    const relatedAreas = filledStrings(rec.related_areas);
    const relatedCountries = filledStrings(rec.related_countries);
    const directiveArticles = filledStrings(rec.directive_articles);
    const concreteActions = filledStrings(rec.concrete_actions);

    if (relatedAreas.length === 0) issues.push(`Raccomandazione ${index + 1}: related_areas vuoto.`);
    if (relatedCountries.length === 0) issues.push(`Raccomandazione ${index + 1}: related_countries vuoto.`);
    if (directiveArticles.length === 0) issues.push(`Raccomandazione ${index + 1}: directive_articles vuoto.`);
    if (concreteActions.length < 2 || concreteActions.length > 3) {
      issues.push(`Raccomandazione ${index + 1}: concrete_actions deve avere 2-3 azioni.`);
    }
    if (concreteActions.some(isVagueAction)) {
      issues.push(`Raccomandazione ${index + 1}: concrete_actions contiene azioni troppo vaghe.`);
    }
  });

  if (new Set(temporalTags).size < 2) {
    issues.push('Raccomandazioni: servono almeno 2 temporal_tag diversi.');
  }

  if (maturity.length === 0) {
    issues.push('Maturity: sezione assente.');
  }

  maturity.forEach((area, index) => {
    const missing = ['area_name', 'maturity_level', 'attention', 'analysis'].filter((field) => !filledString(area[field]));
    if (missing.length > 0) {
      issues.push(`Maturity area ${index + 1}: manca campi target: ${missing.join(', ')}.`);
    }
    if (!hasTargetAttention(area.attention)) {
      issues.push(`Maturity area ${index + 1}: attention non ammessa o assente.`);
    }
    if (!hasMaturityLevel(area.maturity_level)) {
      issues.push(`Maturity area ${index + 1}: maturity_level non ammesso o assente.`);
    }
    if (filledString(area.recommendation)) {
      issues.push(`Maturity area ${index + 1}: non deve contenere recommendation; usare analysis diagnostica.`);
    }
    const directiveArticles = filledStrings(area.directive_articles);
    if (directiveArticles.length === 0) {
      issues.push(`Maturity area ${index + 1}: directive_articles vuoto.`);
    }
    if (filledString(area.analysis) && hasTargetAttention(area.attention)) {
      const min = area.attention === 'Alta' ? 4 : area.attention === 'Media' ? 3 : 2;
      if (sentenceCount(area.analysis) < min) {
        issues.push(`Maturity area ${index + 1}: analysis troppo breve per attention ${area.attention}.`);
      }
    }
  });

  const roadmapIntro = report.roadmap_intro ?? roadmap.roadmap_intro ?? roadmap.intro;
  const engagementPriorities =
    report.engagement_priorities ??
    roadmap.engagement_priorities ??
    roadmap.engagementPriorities;

  if (!filledString(roadmapIntro)) {
    issues.push('Roadmap: roadmap_intro assente.');
  }

  const roadmapPriorities = filledStrings(engagementPriorities);
  if (roadmapPriorities.length < 3 || roadmapPriorities.length > 4) {
    issues.push(`Roadmap: engagement_priorities deve avere 3-4 elementi, ricevuti ${roadmapPriorities.length}.`);
  }
  if (roadmapPriorities.some((p) => /NTT DATA|fornitor[ei]|consulent[ei]|partner estern[oi]/i.test(p))) {
    issues.push('Roadmap: engagement_priorities non deve citare NTT DATA, fornitori o consulenti esterni.');
  }

  const comparisonRows = Array.isArray(comparison.table_rows)
    ? comparison.table_rows
    : Array.isArray(comparison.comparison_table)
      ? comparison.comparison_table
      : [];
  const comparisonTimeline = Array.isArray(comparison.timeline) ? comparison.timeline : [];

  if (isMultiCountry) {
    if (!filledString(comparison.thesis)) issues.push('Multi-country: thesis assente.');
    if (comparisonTimeline.length === 0) issues.push('Multi-country: timeline assente.');
    if (comparisonRows.length < 4) issues.push(`Multi-country: table_rows deve avere almeno 4 righe, ricevute ${comparisonRows.length}.`);
  }

  return issues;
}

export async function validateGeminiKey(apiKey: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=1`,
      { signal: controller.signal },
    );
    if (!res.ok) throw new Error(`${res.status}`);
  } finally {
    clearTimeout(timer);
  }
  return true;
}

export async function generateReportJson(input: GenerateInput): Promise<unknown> {
  const attempt = async (retryMessage?: string) => {
    const text = await callGemini(input.apiKey, runtimePrompt(input, retryMessage));
    try {
      return JSON.parse(text);
    } catch {
      throw Object.assign(new Error('JSON_PARSE_ERROR'), { code: 'JSON_PARSE_ERROR' });
    }
  };

  const retryForIssues = async (issues: string[]) => {
    const retry = await attempt(
      `ATTENZIONE: la risposta precedente non rispetta il contratto dati. Problemi specifici: ${issues.join(' ')} Rigenera un JSON completo mantenendo esattamente la struttura richiesta.`,
    );
    const retryIssues = assessQuality(retry, { assessmentInput: input.assessmentInput });
    if (retryIssues.length > 0) {
      // Il secondo tentativo resta imperfetto rispetto al controllo qualita, ma e
      // comunque un JSON valido: si affida a repairReportFromAi/reportSchema per
      // completare i campi mancanti invece di scartare una risposta gia costata
      // due round-trip a Gemini.
      console.warn('Gemini: retry ancora con issue di qualita, procedo con repair a valle.', retryIssues);
    }
    return retry;
  };

  try {
    const first = await attempt();
    const issues = assessQuality(first, { assessmentInput: input.assessmentInput });
    return issues.length === 0 ? first : retryForIssues(issues);
  } catch (e) {
    const err = normalizeError(e);
    if (err.code === 'RATE_LIMIT' || err.code === 'SAFETY' || err.code === 'BAD_REQUEST' || err.code === 'EMPTY_RESPONSE') {
      throw Object.assign(new Error(err.message ?? String(err)), { code: err.code });
    }

    try {
      const retry = await attempt(
        `ATTENZIONE: la risposta precedente aveva problemi tecnici o di validazione (${err.code}). Rigenera JSON valido e conforme al contratto dati target.`,
      );
      const retryIssues = assessQuality(retry, { assessmentInput: input.assessmentInput });
      if (retryIssues.length > 0) {
        console.warn('Gemini: retry dopo errore tecnico ancora con issue di qualita, procedo con repair a valle.', retryIssues);
      }
      return retry;
    } catch (retryError) {
      const retryMapped = normalizeError(retryError);
      throw Object.assign(new Error(retryMapped.message ?? 'Errore generazione report'), {
        code: retryMapped.code,
        issues: retryMapped.issues,
      });
    }
  }
}
