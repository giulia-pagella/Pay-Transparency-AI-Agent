import { reportSchema, type ReportJson } from '@/lib/schemas/report';

type GenerateInput = {
  apiKey: string;
  assessmentInput: unknown;
  attentionLevels: unknown;
  sources: unknown;
  partialData: boolean;
  hasDraftSources: boolean;
};

const systemPrompt = `Sei un agente esperto di normativa europea sulla trasparenza retributiva e di assessment HR.
Il tuo compito è generare un report strutturato in italiano, in formato JSON valido, basato esclusivamente sugli input forniti e sulle fonti normative ricevute in questo messaggio.
OUTPUT: un singolo oggetto JSON conforme allo schema fornito, senza testo fuori dal JSON.`;

function runtimePrompt(input: GenerateInput, retryMessage?: string) {
  const base = `Genera un report di assessment sulla pay transparency in formato JSON.
## Input utente:\n${JSON.stringify(input.assessmentInput)}
## Livelli di attenzione già calcolati dal sistema:\n${JSON.stringify(input.attentionLevels)}
## Fonti normative da utilizzare:\n${JSON.stringify(input.sources)}
## Istruzioni finali:\n- Rispondi solo con il JSON.\n- Usa esclusivamente le fonti sopra fornite.`;
  return retryMessage ? `${retryMessage}\n\n${base}` : base;
}

async function callGemini(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        response_mime_type: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}:${errorText}`);
  }

  const json = await response.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text as string;
}

function normalizeError(error: unknown) {
  const msg = String(error);
  if (msg.includes('429')) return { code: 'RATE_LIMIT', message: 'Hai raggiunto il limite di 5 richieste al minuto del piano Gemini.' };
  if (msg.toLowerCase().includes('safety')) return { code: 'SAFETY', message: 'Il contenuto generato è stato filtrato dai sistemi di sicurezza di Google. Questo è raro; prova a rigenerare il report.' };
  if (msg.toLowerCase().includes('timeout')) return { code: 'TIMEOUT', message: 'La generazione del report ha impiegato più tempo del previsto. Riprova: se l\'errore persiste, potrebbe essere un problema temporaneo del servizio Gemini.' };
  return { code: 'UNKNOWN', message: 'Si è verificato un errore imprevisto. Riprova.' };
}

export async function validateGeminiKey(apiKey: string) {
  await callGemini(apiKey, 'pong');
  return true;
}

export async function generateReportJson(input: GenerateInput): Promise<ReportJson> {
  const attempt = async (retryMessage?: string) => {
    const text = await callGemini(input.apiKey, runtimePrompt(input, retryMessage));
    const parsed = JSON.parse(text);
    return reportSchema.parse(parsed);
  };

  try {
    return await Promise.race([
      attempt(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 90_000)),
    ]);
  } catch (e) {
    const err = normalizeError(e);
    if (err.code === 'RATE_LIMIT' || err.code === 'SAFETY') {
      throw Object.assign(new Error(err.message), { code: err.code });
    }
    try {
      return await Promise.race([
        attempt('ATTENZIONE: la tua risposta precedente aveva problemi di parsing/validazione. Rigenera JSON valido.'),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 90_000)),
      ]);
    } catch {
      throw Object.assign(new Error(err.message), { code: err.code });
    }
  }
}
