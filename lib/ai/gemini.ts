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
Generare un report strutturato in italiano, in formato JSON valido, che NON sia generico ma specifico per l'azienda analizzata.

Devi utilizzare in modo esplicito e integrato:
1. i dati aziendali forniti (settore, dimensione, modello organizzativo)
2. i livelli di maturità nelle 9 aree (4 livelli categorici: Iniziale, Parziale, Strutturato, Avanzato)
3. i livelli di attenzione determinati
4. le fonti normative fornite

⚠️ VINCOLO CRITICO:
Il report deve dimostrare chiaramente il collegamento tra:
- stato attuale dell'azienda (maturità nelle 9 aree)
- requisiti normativi
- gap
- azioni raccomandate

Non sono accettati contenuti generici o applicabili a qualsiasi azienda.

---

## REGOLE DI GENERAZIONE

### 1. Executive Summary
Deve evidenziare i fattori che determinano il livello di attenzione (NON giustificarlo né drammatizzarlo) e deve citare almeno:
- 1 caratteristica aziendale (dimensione, settore, modello organizzativo)
- 1 area di maturità con gap rilevante
- 1 elemento normativo specifico al paese più urgente

**Struttura obbligatoria dell'Executive Summary (3 campi):**

a) **headline**: UNA singola frase, max 30 parole.
   - Apre con il finding principale (non con il nome del cliente)
   - Stile Economist: fattuale, conciso
   - Pattern: "[Finding fattuale] espone/richiede/manca [implicazione concreta riferita a un articolo/paese]"
   - Esempio: "Architettura retributiva da rafforzare prima del recepimento italiano per coprire i requisiti di comparabilità su 4.200 dipendenti in 3 paesi."

b) **paragraph**: 3-4 frasi.
   - Frase 1: stato di fatto con numeri (chi è il cliente, cosa è stato valutato, quanti dipendenti/paesi)
   - Frase 2: finding principale + aree più deboli
   - Frase 3: vincolo normativo specifico al paese più urgente
   - Frase 4 (opzionale): raccomandazione top
   - Verbi diretti, no condizionali

c) **key_points**: ESATTAMENTE 4 bullet.
   - Ognuno apre con l'implicazione operativa (verbo d'azione tipo "richiede", "prevede", "necessita di", "deve adeguare", "è prioritario")
   - Pattern: "[Verbo d'azione + oggetto] per coprire [riferimento normativo + paese/timing]. [Contesto opzionale]"
   - Max 25 parole per bullet
   - Esempi:
     * "I processi di Talent Attraction e Percorsi di Carriera richiedono ridisegno per coprire gli obblighi di pubblicazione delle fasce retributive (art. 5)."
     * "Il framework di job architecture necessita di estensione per supportare i requisiti di comparabilità del 'lavoro di pari valore' (art. 4) sulle entità multi-paese."
     * "L'adeguamento delle policy di trasparenza pre-assuntiva è prioritario per le entità polacche, dove la normativa è già vigente."

**TONE OF VOICE EXECUTIVE — vincoli rigorosi (applicabili a headline, paragraph, key_points):**

PROIBITE le seguenti espressioni narrative deboli:
- "si trova ad affrontare", "rapida evoluzione", "attenta revisione"
- "potrebbe", "rischierebbe", "in un contesto di", "alla luce di"
- aggettivi enfatici: "elevato", "critico", "significativo", "complesso" usati come riempitivo

PROIBITE le etichette tecniche di maturità ("iniziale", "parziale", "strutturato", "avanzato") usate come stato delle aree nel testo dell'Executive Summary: sono terminologia interna del questionario, non lessico da report consulenziale. Restano confinate al pannello dettagli scoring.

PROIBITI i numeri di maturità (1, 2, 3, 4) come punteggi nel testo dell'Executive Summary.

USARE invece descrizioni narrative consulenziali: "aree da consolidare", "ambiti con gap da colmare", "processi da ridisegnare", "policy da rafforzare", "framework da estendere", "sistemi da predisporre".

---

### 2. Analisi dei gap (logica implicita)
Per ogni area rilevante, identifica se la maturità è:
- **Iniziale** → gap critico, prerequisiti normativi non coperti
- **Parziale** → gap sostanziale, copertura disomogenea o non strutturata
- **Strutturato** → gap residuale, area sostanzialmente conforme con margini di affinamento
- **Avanzato** → area conforme, eventuale leva competitiva

Collega ogni gap a obblighi normativi specifici delle fonti.

NON scrivere questa analisi come sezione separata: usala per costruire raccomandazioni e Executive Summary.

---

### 3. Raccomandazioni (REQUISITO PIÙ IMPORTANTE)

Ogni raccomandazione deve avere queste caratteristiche:

- essere SPECIFICA per l'azienda
- derivare da almeno:
  - una area di maturità con gap (Iniziale o Parziale)
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
"In presenza di una maturità Parziale nei processi di recruiting, e considerando l'obbligo normativo di trasparenza retributiva pre-assunzione (art. 5 Direttiva), è necessario introdurre range salariali formalizzati negli annunci e nei processi di selezione."

⚠️ Vietato:
- raccomandazioni vaghe ("monitorare", "valutare" senza contesto)
- raccomandazioni identiche tra aziende diverse
- raccomandazioni che non collegano gap → normativa → azione

---

### 4. Uso delle fonti normative
- Devi utilizzare le informazioni presenti nelle fonti
- Quando rilevante, includi:
  - soglie (es. 100 dipendenti)
  - condizioni (es. gap >5%)
  - obblighi specifici (es. reporting, trasparenza pre-assunzione)
- Distingui sempre tra normativa vigente e bozza/in recepimento

Non inventare normativa non presente nelle fonti.

---

### 5. Personalizzazione aziendale (OBBLIGATORIA)
Il report deve riflettere:
- settore (es. bancario → maggiore complessità regolatoria; automotive → alta visibilità)
- dimensione (es. >500 dipendenti → obblighi reporting rilevanti)
- modello organizzativo (es. multi-entità → complessità governance; multi-paese → frammentazione normativa)

Se questi elementi NON sono presenti nel testo → il report è considerato NON valido.

---

### 6. Qualità del contenuto
Il testo deve essere:
- concreto, specifico, non ripetitivo, non generico
- executive nel tono (Executive Summary in particolare)

Se non hai abbastanza informazioni:
- NON inventare dettagli
- usa al massimo le informazioni disponibili

---

## OUTPUT

Restituisci ESCLUSIVAMENTE un singolo oggetto JSON conforme allo schema fornito.

VINCOLI:
- nessun testo fuori dal JSON
- nessun commento, nessuna spiegazione
- tutti i campi devono essere presenti
- evitare campi vuoti quando possibile

---

## INPUT DISPONIBILI
- dati azienda (settore, dimensione, modello organizzativo, paesi)
- livelli di maturità nelle 9 aree (Iniziale/Parziale/Strutturato/Avanzato)
- livello di attenzione determinato (Bassa/Media/Alta) + score numerico + triggers
- fonti normative (UE + paesi selezionati, con stato vigente/bozza)
- schema JSON da rispettare

Usa TUTTI questi input in modo coerente.`;

function runtimePrompt(input: GenerateInput, retryMessage?: string) {
  const base = `Genera un report di assessment sulla pay transparency in formato JSON.

Lo schema JSON fornito di seguito definisce esclusivamente la struttura attesa dell'output.
Non copiare i testi placeholder, i fallback o le stringhe di esempio eventualmente presenti nello schema.
Ogni campo descrittivo deve essere popolato con contenuto sostanziale, specifico per l'azienda analizzata, basato sugli input ricevuti, sui livelli di maturità, sui livelli di attenzione e sulle fonti normative.
Se un campo è presente nello schema ma non ci sono elementi sufficienti per svilupparlo in modo approfondito, produci comunque un contenuto breve, concreto e coerente con gli input, evitando formule generiche riutilizzabili per qualsiasi azienda.

## Input utente:
${JSON.stringify(input.assessmentInput, null, 2)}

## Livelli di attenzione già calcolati dal sistema:
${JSON.stringify(input.attentionLevels, null, 2)}

## Fonti normative da utilizzare:
${JSON.stringify(input.sources, null, 2)}

## STRUTTURA JSON ATTESA:
${JSON.stringify(input.schemaTemplate ?? {}, null, 2)}

## Istruzioni finali:
- Rispondi solo con il JSON.
- Compila tutti i campi testuali in italiano professionale.
- Non copiare il contenuto dello schema: usalo solo come struttura.
- Collega in modo esplicito maturità, gap, normativa e raccomandazioni.
- Personalizza il testo usando settore, dimensione aziendale e modello organizzativo.
- Se un'informazione non è disponibile, usa formulazioni prudenti ma non lasciare campi vuoti.
- Raccomandazioni: da 3 a 5 elementi, con priorità, descrizione concreta, related_areas e related_countries quando applicabili.
- key_points nell'executive_summary: ESATTAMENTE 4 bullet, ognuno apre con verbo d'azione.
- headline: singola frase max 30 parole, apre con il finding (non con il nome del cliente).
- paragraph: 3-4 frasi con dati concreti e riferimento normativo al paese più urgente.
- countries_comparison.table_rows: OBBLIGATORIO popolare con almeno 4-6 righe tematiche (es. Trasparenza pre-assunzione, Reporting retributivo, Definizione "lavoro di pari valore", Sanzioni, Tempistiche di recepimento). Per ogni riga, il campo "cells" DEVE contenere una chiave per CIASCUN paese presente in metadata.selected_countries (usa i codici paese esattamente come appaiono nello schema, es. "IT", "DE", "FR"). Il valore di ogni cella deve essere una stringa concisa (max 30 parole) che descrive la situazione normativa di quel paese per quel tema.`;

  return retryMessage ? `${retryMessage}\n\n${base}` : base;
}


const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS ?? 90_000);

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

function normalizeError(error: unknown) {
  const msg = String(error);
  if ((error as any)?.code) return error as any;
  if ((error as any)?.name === 'AbortError')
    return {
      code: 'TIMEOUT',
      message:
        'La richiesta a Gemini ha superato il tempo massimo di attesa. Riprova tra qualche istante.',
    };
  if (msg.includes('429')) return { code: 'RATE_LIMIT', message: 'Hai raggiunto il limite di 5 richieste al minuto del piano Gemini.' };
  if (msg.toLowerCase().includes('safety')) return { code: 'SAFETY', message: 'Il contenuto generato è stato filtrato dai sistemi di sicurezza di Google. Questo è raro; prova a rigenerare il report.' };
  if (msg.toLowerCase().includes('timeout')) return { code: 'TIMEOUT', message: "La generazione del report ha impiegato più tempo del previsto. Riprova: se l'errore persiste, potrebbe essere un problema temporaneo del servizio Gemini." };
  if (msg.includes('400')) return { code: 'BAD_REQUEST', message: 'La richiesta a Gemini non è stata accettata. Verifica la chiave API e riprova.' };
  return { code: 'UNKNOWN', message: 'Si è verificato un errore imprevisto. Riprova.' };
}

function assessQuality(
  draft: any,
  input: {
    assessmentInput: any;
  },
) {
  const issues: string[] = [];

  if (!draft || typeof draft !== 'object') {
    issues.push('Oggetto report assente.');
    return issues;
  }

  const assessmentInput = input?.assessmentInput ?? {};
  const company = assessmentInput?.company ?? {};
  const maturityInput = assessmentInput?.maturity ?? {};
  const selectedCountries = Array.isArray(assessmentInput?.selected_countries)
    ? assessmentInput.selected_countries
    : [];

  const headline =
    typeof draft?.executive_summary?.headline === 'string'
      ? draft.executive_summary.headline.trim()
      : '';

  const paragraph =
    typeof draft?.executive_summary?.paragraph === 'string'
      ? draft.executive_summary.paragraph.trim()
      : '';

  const keyPoints = Array.isArray(draft?.executive_summary?.key_points)
    ? draft.executive_summary.key_points.filter(
        (x: unknown) => typeof x === 'string' && x.trim().length > 0,
      )
    : [];

  const recommendations = Array.isArray(draft?.recommendations) ? draft.recommendations : [];
  const countryAnalysis = Array.isArray(draft?.country_analysis) ? draft.country_analysis : [];
  const impacts = Array.isArray(draft?.impacts_by_area) ? draft.impacts_by_area : [];
  const maturity = Array.isArray(draft?.maturity) ? draft.maturity : [];

  const companyName = typeof company?.company_name === 'string' ? company.company_name.trim() : '';
  const sector =
    typeof company?.sector === 'string' ? company.sector.trim().toLowerCase() : '';

  const summaryText = `${headline} ${paragraph}`.toLowerCase();

  const maturityEntries = Object.entries(maturityInput).filter(([, value]) => value !== null);
  const lowOrMediumAreas = Object.entries(maturityInput)
    .filter(([, value]) => value === 1 || value === 2)
    .map(([key]) => key);

  if (!headline || headline.length < 40) {
    issues.push('Headline troppo breve o assente.');
  }

  if (!paragraph || paragraph.length < 100) {
    issues.push('Paragraph troppo breve o assente.');
  }

  if (keyPoints.length !== 4) {
    issues.push(`Key points insufficienti o in eccesso: attesi 4, ricevuti ${keyPoints.length}.`);
  }

  if (String(headline).toLowerCase().includes('fallback')) {
    issues.push('Executive summary in fallback.');
  }

  if (companyName && !headline.includes(companyName) && !paragraph.includes(companyName)) {
    issues.push('Executive summary non personalizzata sul nome azienda.');
  }

  if (sector && !summaryText.includes(sector)) {
    issues.push('Executive summary non personalizzata sul settore.');
  }

  if (recommendations.length < 3) {
    issues.push('Raccomandazioni insufficienti.');
  }

  const recommendationsWithDescription = recommendations.filter(
    (r: any) => typeof r?.description === 'string' && r.description.trim().length >= 80,
  );

  if (recommendationsWithDescription.length < 3) {
    issues.push('Raccomandazioni troppo brevi o generiche.');
  }

  const recommendationsLinkedToAreas = recommendations.filter(
    (r: any) => Array.isArray(r?.related_areas) && r.related_areas.length > 0,
  );

  if (recommendationsLinkedToAreas.length < 2) {
    issues.push('Raccomandazioni non sufficientemente collegate alle aree di maturità.');
  }

  const recommendationsLinkedToCountries = recommendations.filter(
    (r: any) => Array.isArray(r?.related_countries) && r.related_countries.length > 0,
  );

  if (selectedCountries.length > 0 && recommendationsLinkedToCountries.length < 1) {
    issues.push('Raccomandazioni non collegate ai paesi selezionati.');
  }

  if (countryAnalysis.length < selectedCountries.length) {
    issues.push('Analisi paese assente o incompleta rispetto ai paesi selezionati.');
  }

  const countryAnalysisWithContent = countryAnalysis.filter(
    (c: any) =>
      typeof c?.national_framework_summary === 'string' &&
      c.national_framework_summary.trim().length >= 50,
  );

  if (selectedCountries.length > 0 && countryAnalysisWithContent.length < selectedCountries.length) {
    issues.push('Country analysis troppo generica o incompleta.');
  }

  if (impacts.length < Math.max(3, Math.min(maturityEntries.length, 6))) {
    issues.push('Impatti per area insufficienti.');
  }

  const impactsWithRealContent = impacts.filter(
    (i: any) =>
      typeof i?.impact_description === 'string' &&
      i.impact_description.trim().length >= 40 &&
      typeof i?.regulatory_reference === 'string' &&
      i.regulatory_reference.trim().length >= 10,
  );

  if (impactsWithRealContent.length < Math.max(2, Math.min(maturityEntries.length, 4))) {
    issues.push('Impacts by area troppo generici.');
  }

  if (maturity.length < Math.max(3, Math.min(maturityEntries.length, 6))) {
    issues.push('Sezione maturity troppo incompleta.');
  }

  const maturityWithRealContent = maturity.filter(
    (m: any) =>
      typeof m?.gap_description === 'string' &&
      m.gap_description.trim().length >= 40 &&
      typeof m?.recommendation === 'string' &&
      m.recommendation.trim().length >= 40,
  );

  if (maturityWithRealContent.length < Math.max(2, Math.min(maturityEntries.length, 4))) {
    issues.push('Sezione maturity troppo generica o non sviluppata.');
  }

  if (lowOrMediumAreas.length > 0) {
    const recommendationsCoveringCriticalAreas = recommendations.filter(
      (r: any) =>
        Array.isArray(r?.related_areas) &&
        r.related_areas.some(
          (areaId: unknown) => typeof areaId === 'string' && lowOrMediumAreas.includes(areaId),
        ),
    );

    if (recommendationsCoveringCriticalAreas.length < 1) {
      issues.push('Le raccomandazioni non coprono le aree con maturità più critica.');
    }
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

  try {
    const first = await attempt();

    const issues = assessQuality(first, {
      assessmentInput: input.assessmentInput,
    });

    if (issues.length === 0) {
      return first;
    }

    const enriched = await attempt(`ATTENZIONE: la risposta è formalmente valida ma qualitativamente insufficiente. Problemi: ${issues.join(' ')}. Rigenera un report completo e concreto mantenendo esattamente la stessa struttura JSON.`);
    return enriched;
  } catch (e) {
    const err = normalizeError(e);
    if (err.code === 'RATE_LIMIT' || err.code === 'SAFETY' || err.code === 'BAD_REQUEST' || err.code === 'EMPTY_RESPONSE' || err.code === 'JSON_PARSE_ERROR' || err.code === 'TIMEOUT') {
      throw Object.assign(new Error(err.message ?? String(err)), { code: err.code });
    }

    try {
      return await attempt('ATTENZIONE: la tua risposta precedente aveva problemi di parsing/validazione. Rigenera JSON valido.');
    } catch (retryError) {
      const retryMapped = normalizeError(retryError);
      throw Object.assign(new Error(retryMapped.message ?? 'Errore generazione report'), { code: retryMapped.code });
    }
  }
}
