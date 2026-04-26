type GenerateInput = {
  apiKey: string;
  assessmentInput: unknown;
  attentionLevels: unknown;
  sources: unknown;
  partialData: boolean;
  hasDraftSources: boolean;
  schemaTemplate?: unknown;
};

const systemPrompt = `Sei un consulente senior esperto di:
- normativa europea sulla trasparenza retributiva (Direttiva UE 2023/970)
- implementazione HR e sistemi retributivi
- assessment di maturità organizzativa

OBIETTIVO
Generare un report strutturato in italiano, in formato JSON valido, che NON sia generico ma specifico per l’azienda analizzata.

Devi utilizzare in modo esplicito e integrato:
1. i dati aziendali forniti (settore, dimensione, modello organizzativo)
2. i livelli di maturità nelle 9 aree
3. i livelli di attenzione determinati
4. le fonti normative fornite

⚠️ VINCOLO CRITICO:
Il report deve dimostrare chiaramente il collegamento tra:
- stato attuale dell’azienda (maturità)
- requisiti normativi
- gap
- azioni raccomandate

Non sono accettati contenuti generici o applicabili a qualsiasi azienda.

---

## REGOLE DI GENERAZIONE

### 1. Executive Summary
- Deve spiegare PERCHÉ il livello di attenzione è quello indicato
- Deve citare almeno:
  - 1 caratteristica aziendale (es. dimensione o settore)
  - 1 area di maturità critica
  - 1 elemento normativo rilevante
- Evitare frasi standard o boilerplate

---

### 2. Analisi dei gap (logica implicita)
Per ogni area rilevante:
- identifica se la maturità è:
  - bassa → gap critico
  - media → gap parziale
  - alta → area quasi conforme
- collega il gap a obblighi normativi specifici

NON scrivere questa analisi come sezione separata, ma usala per costruire raccomandazioni e summary.

---

### 3. Raccomandazioni (REQUISITO PIÙ IMPORTANTE)

Ogni raccomandazione deve avere queste caratteristiche:

- essere SPECIFICA per l’azienda
- derivare da almeno:
  - una area di maturità con gap
  - un obbligo normativo presente nelle fonti
- spiegare chiaramente:
  - cosa manca oggi
  - cosa richiede la normativa
  - cosa fare concretamente

STRUTTURA LOGICA (anche se non esplicitata in JSON):
- Gap identificato
- Riferimento normativo
- Azione operativa

Esempio (stile atteso, NON copiare):
"In presenza di un livello di maturità parziale nei processi di recruiting, e considerando l’obbligo normativo di trasparenza retributiva pre-assunzione, è necessario introdurre range salariali formalizzati negli annunci e nei processi di selezione."

⚠️ Vietato:
- raccomandazioni vaghe (es. “monitorare”, “valutare” senza contesto)
- raccomandazioni identiche tra aziende diverse

---

### 4. Uso delle fonti normative
- Devi utilizzare le informazioni presenti nelle fonti
- Quando rilevante, includi:
  - soglie (es. 100 dipendenti)
  - condizioni (es. gap >5%)
  - obblighi specifici (es. reporting, trasparenza pre-assunzione)

Non inventare normativa non presente nelle fonti.

---

### 5. Personalizzazione aziendale (OBBLIGATORIA)
Il report deve riflettere:
- settore (es. bancario → maggiore complessità regolatoria)
- dimensione (es. >500 dipendenti → obblighi reporting rilevanti)
- modello organizzativo (es. multi-entità → complessità governance)

Se questi elementi NON sono presenti nel testo → il report è considerato NON valido.

---

### 6. Qualità del contenuto
Il testo deve essere:
- concreto
- specifico
- non ripetitivo
- non generico

Se non hai abbastanza informazioni:
- NON inventare dettagli
- ma usa al massimo le informazioni disponibili

---

## OUTPUT

Restituisci ESCLUSIVAMENTE:
- un singolo oggetto JSON
- conforme allo schema fornito

VINCOLI:
- nessun testo fuori dal JSON
- nessun commento
- nessuna spiegazione
- tutti i campi devono essere presenti
- evitare campi vuoti quando possibile

---

## INPUT DISPONIBILI
- dati azienda
- livelli di maturità
- livelli di attenzione
- fonti normative (UE + paesi selezionati)
- schema JSON da rispettare

Usa TUTTI questi input in modo coerente.`;

function runtimePrompt(input: GenerateInput, retryMessage?: string) {
  const base = `Genera un report di assessment sulla pay transparency in formato JSON.
## Input utente:\n${JSON.stringify(input.assessmentInput)}
## Livelli di attenzione già calcolati dal sistema:\n${JSON.stringify(input.attentionLevels)}
## Fonti normative da utilizzare:\n${JSON.stringify(input.sources)}
## Template JSON da rispettare (stesse chiavi, stessa struttura):\n${JSON.stringify(input.schemaTemplate ?? {}, null, 2)}
## Istruzioni finali:\n- Rispondi solo con il JSON.
- Compila tutti i campi testuali in italiano professionale.
- Se un'informazione non è disponibile, usa formulazioni prudenti ma non lasciare campi vuoti.
- Raccomandazioni: da 1 a 5 elementi, con priorità e descrizione concreta.`;
  return retryMessage ? `${retryMessage}\n\n${base}` : base;
}

function extractTextFromResponse(json: any) {
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((p: any) => p?.text ?? '').join('\n').trim();
}

function stripCodeFence(text: string) {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

async function callGemini(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
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
}

function normalizeError(error: unknown) {
  const msg = String(error);
  if ((error as any)?.code) return error as any;
  if (msg.includes('429')) return { code: 'RATE_LIMIT', message: 'Hai raggiunto il limite di 5 richieste al minuto del piano Gemini.' };
  if (msg.toLowerCase().includes('safety')) return { code: 'SAFETY', message: 'Il contenuto generato è stato filtrato dai sistemi di sicurezza di Google. Questo è raro; prova a rigenerare il report.' };
  if (msg.toLowerCase().includes('timeout')) return { code: 'TIMEOUT', message: "La generazione del report ha impiegato più tempo del previsto. Riprova: se l'errore persiste, potrebbe essere un problema temporaneo del servizio Gemini." };
  if (msg.includes('400')) return { code: 'BAD_REQUEST', message: 'La richiesta a Gemini non è stata accettata. Verifica la chiave API e riprova.' };
  return { code: 'UNKNOWN', message: 'Si è verificato un errore imprevisto. Riprova.' };
}

function assessQuality(draft: any) {
  const issues: string[] = [];
  if (!draft || typeof draft !== 'object') issues.push('Oggetto report assente.');
  const synth = draft?.executive_summary?.synthesis_sentence;
  if (!synth || typeof synth !== 'string' || synth.length < 20) issues.push('Executive summary troppo breve.');
  if (String(synth).toLowerCase().includes('fallback')) issues.push('Executive summary in fallback.');
  if (!Array.isArray(draft?.recommendations) || draft.recommendations.length === 0) issues.push('Raccomandazioni assenti.');
  if (!Array.isArray(draft?.country_analysis) || draft.country_analysis.length === 0) issues.push('Analisi paese assente.');
  if (!Array.isArray(draft?.impacts_by_area) || draft.impacts_by_area.length < 6) issues.push('Impatti per area insufficienti.');
  return issues;
}

export async function validateGeminiKey(apiKey: string) {
  await callGemini(apiKey, 'pong');
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

  try {
    const first = await Promise.race([
      attempt(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 90_000)),
    ]);

    const issues = assessQuality(first);
    if (issues.length === 0) return first;

    const enriched = await Promise.race([
      attempt(`ATTENZIONE: la risposta è formalmente valida ma qualitativamente insufficiente. Problemi: ${issues.join(' ')}. Rigenera un report completo e concreto mantenendo esattamente la stessa struttura JSON.`),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 90_000)),
    ]);
    return enriched;
  } catch (e) {
    const err = normalizeError(e);
    if (err.code === 'RATE_LIMIT' || err.code === 'SAFETY' || err.code === 'BAD_REQUEST' || err.code === 'EMPTY_RESPONSE' || err.code === 'JSON_PARSE_ERROR') {
      throw Object.assign(new Error(err.message ?? String(err)), { code: err.code });
    }

    try {
      return await Promise.race([
        attempt('ATTENZIONE: la tua risposta precedente aveva problemi di parsing/validazione. Rigenera JSON valido.'),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 90_000)),
      ]);
    } catch (retryError) {
      const retryMapped = normalizeError(retryError);
      throw Object.assign(new Error(retryMapped.message ?? 'Errore generazione report'), { code: retryMapped.code });
    }
  }
}
