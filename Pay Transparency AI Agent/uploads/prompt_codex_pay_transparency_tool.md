# Pay Transparency Assessment Tool — Prompt di sviluppo per Codex

## 1. Obiettivo del prodotto

Realizzare un'applicazione web full-stack chiamata **Pay Transparency Assessment Tool**: uno strumento AI guidato che consente alle aziende di comprendere la Direttiva UE sulla trasparenza retributiva (2023/970), confrontare i requisiti normativi tra paesi europei, analizzare gli impatti sulle aree HR e organizzative, e ottenere un report strutturato (web + PDF).

Il sistema **non è una chat libera**, ma un **sistema guidato di assessment + generazione report**.

Questa è la **Fase 1**, che implementa:
- Interpretazione normativa su base di fonti verificate
- Confronto multi-country (solo paesi con normativa nazionale disponibile)
- Analisi impatti sulle aree HR
- Raccomandazioni preliminari

In Fase 1 **non** vanno implementati: analisi automatica di documenti aziendali caricati dall'utente, gap analysis completa, action plan completo.

---

## 2. Contesto e vincoli non negoziabili

Questi vincoli sovrascrivono qualsiasi altra indicazione in caso di conflitto.

1. **Lingua:** l'intera applicazione è in **italiano**. UI, messaggi, tooltip, questionario, report, PDF, output AI. Non mescolare italiano e inglese nei testi rivolti all'utente. Le strutture tecniche (nomi API, JSON, codice, identificatori) restano in inglese. Alcune eccezioni terminologiche concordate restano in inglese: "Talent Attraction", "Job Architecture", "Performance Management", "payroll", "reporting", "job grading", "pay range", "salary history", "bias", "reward".

2. **AI Provider:** esclusivamente **Google Gemini**, modello **`gemini-2.5-flash`**. Tutte le chiamate avvengono solo dal backend tramite un servizio dedicato; **mai dal frontend**.

3. **API key utente:** l'utente inserisce la propria chiave Gemini. La chiave viene validata, conservata solo in memoria server-side (sessione), **mai salvata in DB, mai loggata, mai inclusa nel report**.

4. **Nessuna dichiarazione di compliance:** il tool non dichiara mai che un'azienda è "conforme", "compliant" o "in regola". Non fornisce consulenza legale vincolante.

5. **Solo fonti fornite:** l'AI usa esclusivamente le fonti normative integrate nel backend. Non attinge a conoscenza esterna sulle normative.

6. **Privacy:** i report contengono dati aziendali sensibili. Nessuna telemetria, nessun log di contenuti, nessuna condivisione con servizi terzi.

---

## 3. Stack tecnologico

### Frontend
- **Next.js** (App Router) con **TypeScript**
- **Tailwind CSS** per lo styling
- **React-PDF** per la generazione dei PDF
- Nessun localStorage / sessionStorage per dati sensibili

### Backend
- **Next.js API Routes** (stesso progetto, no server separato)
- **TypeScript**
- **Zod** per la validazione degli schemi JSON
- Storage **in-memory server-side** per sessioni utente (Map con TTL)
- Nessun database, nessun ORM, nessun Prisma, nessun Postgres

### Package manager
- **npm** (senza vincoli su versione particolare; usare Node.js LTS ≥ 20)

### Strumenti di qualità
- **ESLint** + **Prettier** configurati
- **Vitest** (o Jest se preferito) per i test automatici

---

## 4. Architettura generale

### Struttura del progetto (indicativa)

```
pay-transparency-tool/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                  # Landing
│   ├── configurazione/            # Schermata API key
│   ├── questionario/              # Wizard 3 step
│   ├── report/                    # Visualizzazione report
│   └── api/
│       ├── ai/
│       │   ├── session/           # init, status, clear
│       │   └── generate/          # generazione report
│       ├── countries/             # lista paesi con stato
│       └── regulations/           # fonti normative (solo lettura)
├── data/
│   ├── regulations/
│   │   ├── countries.json         # lista master paesi
│   │   ├── source_pdfs/           # PDF originali archiviati
│   │   └── processed/             # JSON normative per paese
│   └── maturity-assessment.json   # 9 aree maturità
├── lib/
│   ├── ai/                        # Servizio Gemini
│   ├── session/                   # Gestione sessioni in-memory
│   ├── attention/                 # Regole deterministiche livello attenzione
│   ├── pdf/                       # Componenti React-PDF
│   ├── report/                    # Assemblaggio e validazione report
│   └── schemas/                   # Zod schemas centralizzati
├── components/                    # UI condivisa
├── tests/                         # Test automatici
└── scripts/
    └── preprocess-pdf.ts          # Script di utility per PDF→JSON
```

### Principio di separazione dati/codice

I contenuti di dominio (normative, questionario, lista paesi) vivono **fuori dal codice**, in file JSON in `/data/`. Modificarli non richiede redeploy: basta sostituire il file e riavviare.

---

## 5. Flusso utente

1. **Landing page** — introduzione al tool, pulsante "Inizia assessment"
2. **Configurazione API key** — inserimento e validazione chiave Gemini
3. **Questionario guidato (wizard 3 step)**:
   - Step 1: dati azienda
   - Step 2: selezione paesi
   - Step 3: autovalutazione maturità (9 aree)
4. **Generazione report** — progress bar durante la chiamata Gemini
5. **Visualizzazione report** nel web
6. **Download PDF**
7. **Possibilità di modificare l'assessment** (torna al questionario con dati compilati) o **ricominciare da capo** (reset completo)

---

## 6. Gestione della API key e della sessione

### Flusso di configurazione

1. L'utente inserisce la chiave sulla schermata di configurazione.
2. Il backend valida con **approccio misto**:
   - **Controllo formato** immediato (verifica che la stringa sia nel formato tipico di una chiave Gemini)
   - Se il formato è corretto, **chiamata di test** a Gemini con un prompt minimo (es. "pong") e `max_output_tokens=1` per confermare che la chiave sia valida e abbia quota
3. Se valida: il backend genera un `session_id` casuale, salva in memoria una coppia `session_id → {api_key, timestamp, data, ...}`, restituisce al client un **cookie HTTP-only** con il session_id. Nessuna ulteriore esposizione della chiave al frontend.
4. Se non valida: messaggio di errore chiaro in italiano.

### TTL e refresh

- **TTL sessione: 4 ore**
- **Refresh on activity:** ogni chiamata al backend estende il TTL
- **Pulsante "Chiudi sessione"** visibile nell'UI: invalida immediatamente la sessione con popup di conferma

### Cosa vive in sessione

- `api_key` (stringa)
- `questionnaire_data` (dati compilati del wizard, anche parziali)
- `report_json` (ultimo report generato, se presente)
- `last_activity` (timestamp per il TTL)
- `rate_limit_counter` (contatore chiamate per minuto e per giorno, per rate limit awareness)

### Endpoint API

- `POST /api/ai/session/init` — inserimento e validazione chiave, creazione sessione
- `GET /api/ai/session/status` — stato sessione corrente (senza esporre la chiave)
- `POST /api/ai/session/clear` — invalidazione esplicita

### Comportamento in caso di scadenza

Se la sessione scade mentre l'utente sta compilando il questionario, al prossimo submit:
- Messaggio: *"La sessione è scaduta. Reinserisci la chiave API per continuare."*
- I dati del questionario **restano visibili nella UI** (il client li tiene temporaneamente in memoria React)
- Dopo reinserimento chiave, l'utente riprende da dove era

---

## 7. Repository normativo (contenuti statici)

### Collocazione

- **PDF originali:** `/data/regulations/source_pdfs/` — archiviati, linkabili nella sezione "Fonti" del report
- **JSON processati:** `/data/regulations/processed/` — un file per normativa, letti dal tool

### Schema JSON per ogni normativa

```json
{
  "country_code": "IT",
  "country_name": "Italia",
  "document_type": "bozza_decreto",
  "document_title": "Schema di decreto legislativo di recepimento della Direttiva UE 2023/970",
  "status": "draft",
  "version": "2024-11",
  "date": "2024-11-15",
  "source_pdf_filename": "italia_bozza_decreto_2024_11.pdf",
  "source_url": "https://...",
  "sections": [
    {
      "topic": "obblighi_reporting",
      "title": "Obblighi di reporting sul gender pay gap",
      "content": "...",
      "article_references": ["art. 7", "art. 8"]
    },
    {
      "topic": "diritto_informazione",
      "title": "Diritto all'informazione del lavoratore",
      "content": "...",
      "article_references": ["art. 4"]
    }
  ]
}
```

### Topic standard delle sezioni

Per garantire coerenza tra paesi, usare questi topic standard (estendibili):
- `ambito_applicazione`
- `trasparenza_preassunzione`
- `divieto_salary_history`
- `categorie_lavoratori_comparabili` (Job Architecture)
- `diritto_informazione`
- `obblighi_reporting`
- `joint_pay_assessment`
- `divieto_clausole_confidenzialita`
- `sanzioni`
- `tutele_lavoratori`

### Script di pre-processing PDF → JSON

Creare uno script eseguibile una volta, in `/scripts/preprocess-pdf.ts`:

- Input: cartella con PDF
- Output: file JSON draft per ciascun PDF in `/data/regulations/processed/`
- Estrae il testo con una libreria Node (es. `pdf-parse`)
- Segmenta per titolo/articolo dove possibile
- Marca esplicitamente i blocchi "incerti" (tabelle, formattazione ambigua) con un campo `needs_review: true`
- La revisione umana è obbligatoria prima dell'uso del file in produzione

### Contenuti iniziali della Fase 1

Il tool parte con **due JSON** pronti all'uso (che l'utente fornirà dopo il pre-processing e la revisione):

1. **Direttiva UE 2023/970** (`eu_directive_2023_970.json`, status `definitive`)
2. **Italia** (`italia_bozza_decreto.json`, status `draft`)

**Nessun contenuto placeholder generato da Codex.** Se questi file non sono ancora presenti al momento del primo `npm run dev`, il tool mostra un messaggio chiaro: *"Contenuti normativi non ancora caricati. Aggiungere i file JSON in /data/regulations/processed/."*

---

## 8. Lista paesi

### Collocazione

File `/data/regulations/countries.json`.

### Contenuto master

La lista contiene **31 paesi**: tutti i 27 stati UE + UK + Svizzera + Norvegia.

### Schema

```json
{
  "countries": [
    {"code": "IT", "name": "Italia", "flag_emoji": "🇮🇹"},
    {"code": "FR", "name": "Francia", "flag_emoji": "🇫🇷"},
    {"code": "ES", "name": "Spagna", "flag_emoji": "🇪🇸"},
    {"code": "BE", "name": "Belgio", "flag_emoji": "🇧🇪"},
    ...
  ]
}
```

### Derivazione dello stato

Lo stato di ciascun paese (definitivo / bozza / non disponibile) è **dedotto a runtime** dalla presenza e dal contenuto dei file in `/data/regulations/processed/`:

- File JSON presente con `status: "definitive"` → badge **verde**, selezionabile
- File JSON presente con `status: "draft"` → badge **giallo "BOZZA"**, selezionabile con warning
- Nessun file JSON per quel paese → badge **grigio "Non disponibile"**, disabilitato

**Non esiste uno stato intermedio** "solo Direttiva UE senza recepimento nazionale": un paese è selezionabile solo se ha un JSON nazionale proprio.

### Stato iniziale Fase 1

- Italia → bozza (selezionabile con warning)
- Tutti gli altri 30 paesi → non disponibili (disabilitati)

La Direttiva UE è una fonte normativa **sempre presente**, non un paese: viene usata come base per ogni analisi, non compare nella lista paesi selezionabili.

---

## 9. Questionario di autovalutazione maturità

### Collocazione

File `/data/maturity-assessment.json`.

### Struttura

9 aree, nell'ordine indicato. Ogni area ha: `name`, `description` (1-2 frasi), 4 livelli con `label` e un `bullet` (1 frase). **Nessuna domanda sì/no.**

```json
{
  "areas": [
    {
      "id": "talent_attraction",
      "name": "Talent Attraction",
      "description": "Come l'azienda comunica informazioni retributive negli annunci di lavoro e nelle attività di employer branding, in linea con gli obblighi di trasparenza pre-assunzione previsti dalla Direttiva UE.",
      "has_direct_obligation": true,
      "levels": [
        {"value": 1, "label": "Iniziale", "bullet": "Le offerte di lavoro non includono alcuna informazione retributiva."},
        {"value": 2, "label": "Parziale", "bullet": "Informazioni retributive fornite solo su richiesta o in fase avanzata del processo."},
        {"value": 3, "label": "Strutturato", "bullet": "Range salariali definiti per ruolo e comunicati in modo parziale nelle offerte."},
        {"value": 4, "label": "Avanzato", "bullet": "Range salariali sempre inclusi negli annunci, con criteri di definizione chiari e comunicati."}
      ]
    }
    // ... altre 8 aree
  ]
}
```

### Contenuti completi delle 9 aree

1. **Talent Attraction** — `has_direct_obligation: true`
   - Descrizione: "Come l'azienda comunica informazioni retributive negli annunci di lavoro e nelle attività di employer branding, in linea con gli obblighi di trasparenza pre-assunzione previsti dalla Direttiva UE."
   - Iniziale: "Le offerte di lavoro non includono alcuna informazione retributiva."
   - Parziale: "Informazioni retributive fornite solo su richiesta o in fase avanzata del processo."
   - Strutturato: "Range salariali definiti per ruolo e comunicati in modo parziale nelle offerte."
   - Avanzato: "Range salariali sempre inclusi negli annunci, con criteri di definizione chiari e comunicati."

2. **Recruiting e colloqui** — `has_direct_obligation: true`
   - Descrizione: "Governo delle pratiche di selezione legate alla retribuzione, inclusi gli obblighi della Direttiva UE come il divieto di chiedere la storia retributiva del candidato."
   - Iniziale: "Nessuna policy sulle domande retributive; possibili richieste di salary history."
   - Parziale: "Linee guida informali, con pratiche non uniformi tra recruiter."
   - Strutturato: "Policy formalizzata e processo di selezione standardizzato."
   - Avanzato: "Processo auditabile e tracciato, con formazione dei recruiter su equità e bias."

3. **Struttura retributiva** — `has_direct_obligation: false`
   - Descrizione: "Grado di formalizzazione delle logiche retributive aziendali, dei pay range e del posizionamento dei ruoli rispetto al mercato."
   - Iniziale: "Nessuna struttura retributiva formalizzata; salari definiti caso per caso."
   - Parziale: "Strutture parziali o non aggiornate, con scarsa trasparenza interna."
   - Strutturato: "Job grading e pay range definiti, con logiche di posizionamento chiare."
   - Avanzato: "Sistema strutturato, monitorato e aggiornato, allineato con benchmark di mercato."

4. **Job Architecture** — `has_direct_obligation: true`
   - Descrizione: "Classificazione dei ruoli in categorie confrontabili sulla base di criteri oggettivi neutri rispetto al genere, requisito centrale per identificare 'lavoro di pari valore' secondo la Direttiva UE."
   - Iniziale: "I ruoli non sono classificati in modo sistematico; nessun criterio formale di valutazione."
   - Parziale: "Classificazione parziale dei ruoli, basata su criteri non sempre oggettivi o non documentati."
   - Strutturato: "Architettura dei ruoli formalizzata con criteri di valutazione oggettivi e documentati."
   - Avanzato: "Architettura rivista periodicamente, validata per neutralità di genere e collegata al sistema retributivo."

5. **Performance Management** — `has_direct_obligation: false`
   - Descrizione: "Sistema di valutazione delle performance e sua correlazione con le decisioni retributive, con attenzione alla riduzione dei bias."
   - Iniziale: "Nessun sistema strutturato; valutazioni soggettive."
   - Parziale: "Sistema presente ma non standardizzato, con limitata correlazione con la retribuzione."
   - Strutturato: "Sistema formalizzato e diffuso, collegato a crescita e reward."
   - Avanzato: "Sistema data-driven con monitoraggio di equità e bias."

6. **Percorsi di carriera** — `has_direct_obligation: false`
   - Descrizione: "Chiarezza, trasparenza e comunicazione dei percorsi di crescita professionale e dei criteri di avanzamento."
   - Iniziale: "Nessun percorso di carriera definito."
   - Parziale: "Percorsi informali o non documentati."
   - Strutturato: "Framework chiaro per ruoli e avanzamenti."
   - Avanzato: "Percorsi trasparenti, comunicati e monitorati."

7. **Governance e policy** — `has_direct_obligation: false`
   - Descrizione: "Presenza di policy formali sulla trasparenza retributiva e chiarezza delle responsabilità organizzative nella loro applicazione."
   - Iniziale: "Nessuna policy sulla pay transparency."
   - Parziale: "Policy parziali o non integrate."
   - Strutturato: "Policy formalizzate e condivise."
   - Avanzato: "Governance chiara con responsabilità definite."

8. **Dati, payroll e reporting** — `has_direct_obligation: true`
   - Descrizione: "Qualità dei dati retributivi, integrazione dei sistemi e capacità di produrre reporting richiesti dalla Direttiva UE, incluso il gender pay gap reporting."
   - Iniziale: "Dati frammentati e non affidabili."
   - Parziale: "Dati disponibili ma non integrati."
   - Strutturato: "Sistemi integrati e reporting base."
   - Avanzato: "Reporting avanzato con gender pay gap, audit e analisi ricorrenti."

9. **Comunicazione e trasparenza verso i dipendenti** — `has_direct_obligation: true`
   - Descrizione: "Modalità con cui l'azienda comunica ai dipendenti i criteri retributivi e risponde al diritto all'informazione previsto dalla Direttiva UE."
   - Iniziale: "Nessuna comunicazione sui criteri retributivi."
   - Parziale: "Comunicazione reattiva, solo su richiesta."
   - Strutturato: "Comunicazione strutturata con canali e contenuti definiti."
   - Avanzato: "Trasparenza proattiva e accessibile, con informazioni sempre disponibili ai dipendenti."

### Soglia di completamento

Il tool accetta il questionario se sono compilate **almeno 6 aree su 9**:
- < 6 aree → pulsante "Genera report" disabilitato, messaggio: *"Compila almeno 6 aree su 9 per generare il report."*
- 6, 7 o 8 aree → procedibile + **flag "DATI PARZIALI" attivo nel report**
- 9 aree → procedibile senza flag

### Step 1 — Dati azienda

- **Nome azienda** (input testo, obbligatorio)
- **Settore** (select, obbligatorio): bancario, assicurativo, telco & media, farmaceutico, energy, retail, trasporti, automotive, public sector, altro
- **Fascia dipendenti** (select, obbligatorio): <50, 50-99, 100-149, 150-249, 250-499, 500-999, 1000+
  - Le fasce ≥100 sono rilevanti perché la Direttiva UE applica obblighi incrementali sopra le soglie 100 / 150 / 250
- **Modello organizzativo** (select, obbligatorio): mono-entità nazionale, multi-entità nazionale, gruppo internazionale con HQ in Italia, filiale/branch di gruppo estero, altro

### Step 2 — Selezione paesi

- Lista completa dei 31 paesi con bandiera, nome, badge stato (verde/giallo/grigio)
- Paesi grigi disabilitati (non cliccabili)
- Paesi gialli selezionabili ma mostrano tooltip + banner post-selezione (vedi sezione warning)
- Selezione multipla, minimo 1 paese selezionato per procedere

### Step 3 — Maturità

- 9 aree in ordine fisso
- Per ogni area: titolo, descrizione, 4 card cliccabili per i 4 livelli
- L'utente può lasciare un'area non valutata (nessun livello selezionato)
- Contatore visibile: "X di 9 aree compilate"

---

## 10. Schema JSON del report

Il report è il cuore del tool. Lo schema è **la single source of truth**: lo stesso JSON alimenta il rendering web e il PDF. Definire in `/lib/schemas/report.ts` come tipo TypeScript + schema Zod.

### Struttura di alto livello

```typescript
{
  metadata: {
    company_name: string,
    sector: string,
    employee_range: string,
    organizational_model: string,
    generated_at: string,           // ISO date
    selected_countries: string[],   // ["IT"]
    completed_areas_count: number,  // 6-9
    has_draft_sources: boolean,
    has_partial_data_flag: boolean,
    tool_version: string
  },
  executive_summary: {
    overall_attention: "alta" | "media" | "bassa",
    synthesis_sentence: string,     // 1 frase, max ~30 parole
    key_points: string[],           // 3-5 bullet, ciascuno max 2 righe
    brief_context: string           // 1 paragrafo, max ~100 parole
  },
  perimeter: {
    company_block: { ... },         // strutturato
    countries_analyzed: [{ code, name, status }],
    excluded_scope: string          // cosa il tool non copre
  },
  eu_directive: {
    overview: string,               // paragrafo sintetico
    key_obligations: [{             // lista strutturata
      title: string,
      description: string,          // max 3 frasi
      article_reference: string,
      relevance: "alta" | "media" | "bassa"
    }],
    timeline_summary: string        // max 2 frasi
  },
  country_analysis: [{              // uno per paese selezionato
    country_code: string,
    country_name: string,
    status: "definitive" | "draft",
    national_framework_summary: string,   // max 4 frasi
    key_differences_vs_eu: [string],      // bullet brevi
    specific_obligations: [{
      title: string,
      description: string,
      article_reference: string
    }],
    implementation_notes: string          // max 3 frasi
  }],
  countries_comparison: {
    table_rows: [{                  // tabella confronto
      topic: string,                // riga tematica
      cells: { [country_code]: string }  // valore breve per paese
    }],
    narrative: string               // max 3 frasi
  },
  impacts_by_area: [{               // 9 aree
    area_id: string,
    area_name: string,
    attention_level: "alta" | "media" | "bassa",
    impact_description: string,     // max 3 frasi
    priority: "alta" | "media" | "bassa",
    regulatory_reference: string    // quale parte della normativa impatta
  }],
  maturity: [{                      // 9 aree
    area_id: string,
    area_name: string,
    current_level: 1 | 2 | 3 | 4 | null,  // null se non compilata
    current_level_label: string,
    gap_description: string,        // max 2 frasi
    recommendation: string          // max 2 frasi
  }],
  recommendations: [{               // lista ordinata per priorità
    id: string,
    title: string,                  // max 10 parole
    priority: "alta" | "media" | "bassa",
    description: string,            // max 4 frasi
    related_areas: string[],        // area_id
    related_countries: string[]     // country_code
  }],
  limits: {
    scope_limitations: string,      // cosa il report non copre
    methodological_caveats: string, // come leggere i risultati
    draft_warning: string | null,   // presente solo se has_draft_sources
    partial_data_warning: string | null  // presente solo se has_partial_data_flag
  },
  sources: [{                       // fonti citate
    country_code: string | "EU",
    document_title: string,
    document_type: string,
    status: "definitive" | "draft",
    version: string,
    date: string,
    pdf_link: string | null         // link al PDF originale in source_pdfs/
  }]
}
```

### Vincoli di forma (riassunto)

L'AI deve rispettare questi **limiti di lunghezza**:
- `synthesis_sentence`: max ~30 parole
- `brief_context`: max ~100 parole
- `key_points`: 3-5 elementi, ciascuno max 2 righe
- Descrizioni degli obblighi e degli impatti: max 3 frasi
- `recommendations.description`: max 4 frasi

**Stile:** frasi brevi, bullet dove possibile, tono professionale non allarmistico, lessico HR/normativo coerente con la parte statica del tool.

---

## 11. Logica del livello di attenzione

### Regole deterministiche (calcolate dal backend, non dall'AI)

Modulo dedicato in `/lib/attention/rules.ts`.

**Per ogni area di maturità valutata:**

| Livello maturità | `has_direct_obligation: true` | `has_direct_obligation: false` |
|---|---|---|
| 1 (Iniziale) | ALTA | ALTA |
| 2 (Parziale) | ALTA | MEDIA |
| 3 (Strutturato) | MEDIA | MEDIA |
| 4 (Avanzato) | BASSA | BASSA |

**Amplificatore "paese in bozza":** se almeno uno dei paesi selezionati ha `status: "draft"`, ogni attenzione MEDIA o BASSA viene scalata di un livello verso l'alto:
- BASSA → MEDIA
- MEDIA → ALTA
- ALTA → resta ALTA

**Livello complessivo (Executive Summary):** il **massimo** tra i livelli di tutte le aree valutate. Se almeno un'area è ALTA, il complessivo è ALTA.

**Aree non valutate dall'utente:** non contribuiscono al calcolo dell'attenzione e compaiono nel report con `current_level: null` e nota "Area non valutata".

### L'AI riceve i livelli già calcolati

Il backend calcola i livelli prima della chiamata a Gemini e li passa nel prompt come input. L'AI **non deve reinterpretarli**: deve usarli per inquadrare il testo che genera.

---

## 12. Warning e flag visivi

Tre warning attivi nel tool. Ciascuno ha un testo standard e una visualizzazione chiara.

### Flag BOZZA

**Attivato quando:** un paese selezionato ha una normativa con `status: "draft"`.

**Visualizzazione:**
- Badge giallo "BOZZA" accanto al nome paese nel selettore
- Banner giallo sotto la selezione
- Badge giallo nell'Executive Summary del report
- Badge giallo accanto a ogni riferimento normativo nelle sezioni "Analisi per paese" e "Fonti"
- Menzione esplicita nei "Limiti"

**Testi:**
- Tooltip: *"Il contenuto per questo paese si basa su una bozza normativa non ancora definitiva."*
- Banner post-selezione: *"Attenzione: la normativa selezionata per [nome paese] è in stato di bozza. I contenuti e gli obblighi qui descritti potrebbero cambiare prima dell'adozione definitiva. Il report prodotto rifletterà questa incertezza e dovrà essere rivisto quando la normativa sarà approvata."*

### Flag DATI PARZIALI

**Attivato quando:** l'utente ha compilato 6, 7 o 8 aree di maturità su 9.

**Visualizzazione:**
- Banner nel report web sopra l'Executive Summary
- Badge "DATI PARZIALI" nell'Executive Summary
- Sezione "Limiti" con testo esteso

**Testo banner:** *"L'assessment è stato completato in modo parziale: sono state valutate [N] aree di maturità su 9. Le raccomandazioni e il livello di attenzione complessivo si basano sui dati forniti. Per un'analisi più completa, si consiglia di tornare al questionario e compilare le aree mancanti."*

### Disclaimer fisso

**Sempre presente**, in 4 punti:
- Copertina PDF
- Footer ricorrente del PDF
- Sidebar fissa del report web
- Sezione "Limiti" ampliata nel report

**Testo:** *"Questo documento è stato generato da un tool di assessment basato su intelligenza artificiale e non costituisce consulenza legale né dichiarazione di conformità normativa. I contenuti prodotti si basano esclusivamente sui dati forniti dall'utente e sulle fonti normative integrate nel sistema. Per valutazioni vincolanti è necessario il supporto di consulenti legali e del lavoro qualificati."*

### Nota: nessun flag "ASSENZA NORMATIVA NAZIONALE"

Paesi senza JSON nazionale proprio sono semplicemente **non selezionabili** (grigio, disabilitati). Non esiste un percorso "seleziona un paese basandoti solo sulla Direttiva UE".

---

## 13. Servizio Gemini e gestione errori

### Modello e strategia

- **Modello:** `gemini-2.5-flash`
- **Strategia di generazione:** **chiamata singola** con tutto il report JSON
- **Timeout per chiamata:** 90 secondi
- **Response format:** il prompt richiede JSON valido; usare `response_mime_type: "application/json"` se supportato dalla versione della API usata

### Retry mirato

**1 retry** in caso di:
- JSON malformato (parsing error)
- Schema non conforme (validazione Zod fallita)
- Risposta troncata (`finish_reason` indica truncation)
- Timeout / errore 5xx

Il retry include nel prompt un messaggio di correzione contestuale che descrive l'errore precedente.

**Nessun retry automatico** in caso di:
- Rate limit (429)
- Quota esaurita
- Safety block
- Chiave API non valida

### Rate limit awareness client-side

Il backend tiene un contatore in-memory `rate_limit_counter` per sessione:
- `calls_this_minute` (con reset dopo 60s)
- `calls_today` (con reset alle 09:00 italiane, che corrispondono alla mezzanotte Pacific Time)

Limiti di default del piano gratuito Gemini 2.5 Flash:
- **5 RPM** (richieste al minuto)
- **20 RPD** (richieste al giorno)

**Pre-controllo prima di chiamare Gemini:**
- Se `calls_this_minute ≥ 5` → errore rate limit immediato con countdown, senza chiamata a Gemini
- Se `calls_today ≥ 20` → errore quota esaurita immediato, senza chiamata a Gemini

### Validazione input pre-chiamata

Prima di chiamare Gemini, il backend verifica:
- Nome azienda, settore, fascia dipendenti, modello organizzativo compilati
- Almeno 1 paese selezionato con JSON normativa presente
- Almeno 6 aree di maturità compilate

Se manca qualcosa, errore immediato senza spreco di quota.

### Messaggi di errore all'utente

Tutti in italiano, specifici per tipo di errore.

- **Rate limit (429):** *"Hai raggiunto il limite di 5 richieste al minuto del piano Gemini. Attendi [countdown] secondi e riprova."* Con countdown visibile e pulsante "Riprova" disabilitato fino al termine.
- **Quota giornaliera esaurita:** *"Hai esaurito le 20 richieste giornaliere del piano gratuito di Gemini. La quota si resetta alle 9:00 di domani (ora italiana). Per volumi maggiori, valuta il passaggio al piano a pagamento di Google AI Studio."*
- **Chiave API non valida:** *"La chiave API inserita non è valida o è stata revocata. Verifica la chiave su Google AI Studio e reinseriscila. I dati del questionario sono conservati."*
- **Timeout:** *"La generazione del report ha impiegato più tempo del previsto. Riprova: se l'errore persiste, potrebbe essere un problema temporaneo del servizio Gemini."*
- **Errore JSON (durante retry):** *"Si è verificato un errore nell'elaborazione del report. Il sistema sta riprovando automaticamente..."*
- **Safety block:** *"Il contenuto generato è stato filtrato dai sistemi di sicurezza di Google. Questo è raro; prova a rigenerare il report."*
- **Errore sconosciuto:** *"Si è verificato un errore imprevisto (codice: [ID]). Riprova o contatta il supporto."*

### Fallback su output parziale

Se il retry fallisce definitivamente, ma c'è un output parziale parsato (anche solo alcune sezioni valide), il tool lo salva in sessione, lo mostra all'utente con un banner *"Il report è stato generato solo parzialmente"*, e offre un pulsante **"Rigenera report"** che costa una chiamata extra.

### UX durante la generazione

Progress bar basata su tempo stimato (~30-60s), con messaggi che si alternano ogni 5-10 secondi:
- *"Analizzo il contesto aziendale..."*
- *"Consulto le fonti normative..."*
- *"Valuto gli impatti sulle aree HR..."*
- *"Formulo le raccomandazioni..."*
- *"Sto finalizzando il report..."*

---

## 14. Prompt AI (sistema e runtime)

### System prompt

```
Sei un agente esperto di normativa europea sulla trasparenza retributiva e di assessment HR.
Il tuo compito è generare un report strutturato in italiano, in formato JSON valido, basato esclusivamente sugli input forniti e sulle fonti normative ricevute in questo messaggio.

OUTPUT: un singolo oggetto JSON conforme allo schema fornito, senza testo fuori dal JSON.

LINGUA: esclusivamente italiano. Eccezioni ammesse solo per termini HR ampiamente usati in italiano (Talent Attraction, Job Architecture, Performance Management, payroll, reporting, job grading, pay range, salary history, bias, reward).

TONO: professionale, chiaro, non allarmistico, costruttivo.

DIVIETI ASSOLUTI — non derogabili in nessun caso:
1. Non dichiarare mai che l'azienda è "conforme", "compliant", "in regola" o espressioni equivalenti.
2. Non fornire pareri legali o consulenza normativa vincolante.
3. Non promettere l'adeguatezza del report per scopi certificativi, ispettivi o giudiziari.
4. Non usare un tono allarmistico: privilegia linguaggio professionale e costruttivo.
5. Non citare articoli di legge, direttive o sentenze che non siano presenti nelle fonti fornite in questo prompt.
6. Non usare la conoscenza esterna sulle normative: attieniti esclusivamente alle fonti passate in questo prompt.
7. Se una fonte è marcata come "bozza" (status: draft), esplicita l'incertezza ogni volta che la citi.
8. Se un'informazione richiesta non è presente nelle fonti, dichiaralo apertamente anziché inventarla.
9. Non dedurre politiche aziendali che l'utente non ha dichiarato: basati solo sui dati forniti.
10. Non aggiungere raccomandazioni su temi fuori dal perimetro della pay transparency.

VINCOLI DI FORMA:
- Rispetta i limiti di lunghezza indicati nello schema (frasi sintetiche, bullet brevi).
- I livelli di attenzione ("alta", "media", "bassa") sono forniti dal sistema: non ricalcolarli.
- Usa solo lowercase per i valori enum ("alta", "media", "bassa", "definitive", "draft").
```

### Runtime prompt

```
Genera un report di assessment sulla pay transparency in formato JSON.

## Input utente (dati azienda + paesi + maturità):
{{ assessment_input }}

## Livelli di attenzione già calcolati dal sistema (non ricalcolare):
{{ attention_levels }}

## Fonti normative da utilizzare:
{{ sources }}

## Schema JSON atteso:
{{ report_schema }}

## Istruzioni finali:
- Rispondi solo con il JSON.
- Usa esclusivamente le fonti sopra fornite.
- Lingua: italiano.
- Se una fonte è in status "draft", esplicitalo nei campi pertinenti.
- Se l'utente ha compilato meno di 9 aree di maturità, il campo metadata.has_partial_data_flag è true e il campo limits.partial_data_warning è valorizzato.
```

### Correzione in caso di retry

Se il primo tentativo fallisce, il prompt di retry aggiunge all'inizio:

```
ATTENZIONE: la tua risposta precedente aveva questi problemi:
{{ error_description }}

Rigenera il report rispettando rigorosamente lo schema JSON e i vincoli indicati.
```

---

## 15. Frontend — pagine e componenti

### Pagina 1: Landing

- Hero con titolo e sottotitolo
- Nota informativa visibile
- Pulsante "Inizia assessment"

**Testi:**
- Titolo: *"Pay Transparency Assessment Tool"*
- Sottotitolo: *"Uno strumento guidato per comprendere la Direttiva UE sulla trasparenza retributiva, confrontare requisiti normativi tra paesi e valutare gli impatti organizzativi sulla tua azienda."*
- Nota: *"Il tool utilizza intelligenza artificiale per generare un report strutturato basato sulle tue risposte e su fonti normative verificate. Non sostituisce la consulenza legale professionale."*

### Pagina 2: Configurazione API key

- Input field per la chiave (password-style, con toggle visibility)
- Pulsante "Valida e accedi"
- Box informativo con:
  - Come ottenere una chiave (link a Google AI Studio)
  - Avviso sui limiti del piano gratuito
  - Nota privacy

**Testo avviso limiti:** *"Il piano gratuito di Gemini 2.5 Flash permette circa 18-20 report completi al giorno e un massimo di 5 richieste al minuto. Se hai bisogno di volumi maggiori, puoi attivare il piano a pagamento su Google AI Studio oppure, per sessioni separate, utilizzare una chiave API diversa."*

**Testo privacy:** *"La chiave è conservata temporaneamente in sessione sul nostro server per 4 ore e mai loggata o esposta nei report generati."*

### Pagina 3: Questionario (3 step wizard)

- Progress indicator in alto (Step 1 di 3, ecc.)
- Contenuto del passo corrente
- Navigazione "Indietro" / "Avanti"
- All'ultimo passo, pulsante "Genera report" (disabilitato se meno di 6 aree compilate)
- Pulsante "Chiudi sessione" sempre visibile

**Contatore aree Step 3:** visibile ovunque durante la compilazione, tipo *"6 di 9 aree compilate ✓ (minimo richiesto)"*, con colore che cambia sotto la soglia.

### Pagina 4: Report (web)

**Layout:**
- Sidebar fissa a sinistra con navigazione per ancore alle 10 sezioni
- Dashboard in cima con Executive Summary: badge attenzione complessivo, punti chiave con icone, contatori sintetici ("[N] paesi analizzati · 9 aree impattate · [N] raccomandazioni ad alta priorità")
- Sezioni successive in **accordion** (chiuse di default, tranne Executive Summary)
- Disclaimer fisso a piede pagina

**Azioni disponibili:**
- Pulsante "Scarica PDF"
- Pulsante "Modifica assessment" (torna al questionario con dati compilati)
- Pulsante "Ricomincia da capo" (con popup di conferma, reset completo)
- Pulsante "Chiudi sessione"

**Elementi grafici ricorrenti:**
- Badge colorati per i livelli di attenzione (verde/giallo/rosso)
- Tabella confronto paesi
- Griglia o radar chart per la maturità (9 aree)
- Card per ciascuna raccomandazione con priorità visibile

---

## 16. PDF — generazione e struttura

### Libreria

**React-PDF** (`@react-pdf/renderer`).

### Stile

- Font principale: **Inter** o **IBM Plex Sans** (open-source, supporto italiano)
- Palette coerente con l'UI web
- Margini generosi
- Spaziature ampie

### Struttura pagine

**Copertina:**
- Titolo "Pay Transparency Assessment Report"
- Nome azienda
- Data di generazione
- Badge paesi analizzati
- Badge grande del livello di attenzione complessivo
- Placeholder logo (da sostituire in fase UX/UI)
- Disclaimer breve in piede pagina

**Header ricorrente pagine interne:**
- Nome azienda a sinistra
- "Pay Transparency Assessment" al centro
- Numero pagina a destra

**Footer ricorrente:**
- *"Documento generato da AI, non costituisce consulenza legale"*
- Data di generazione

**Contenuto:**
- Indice cliccabile (bookmark PDF)
- Ogni sezione principale inizia su nuova pagina
- Nel PDF tutte le sezioni sono **espanse** (no accordion)
- Badge di attenzione inline coerenti con il web
- Tabella confronto paesi impaginata correttamente
- Griglia maturità visualizzata

### Nome file scaricato

`PayTransparency_Assessment_{NomeAzienda}_{YYYY-MM-DD}.pdf`

Funzione di pulizia: rimuove caratteri speciali, spazi diventano underscore, lunghezza max 80 caratteri.

---

## 17. Testi UI standardizzati

### Popup "Chiudi sessione"

*"Chiudendo la sessione verranno cancellati la tua chiave API, i dati del questionario e il report generato. L'operazione non è reversibile. Vuoi procedere?"*

Pulsanti: "Annulla" / "Chiudi sessione"

### Popup "Ricomincia da capo"

*"Ricominciando da capo verranno cancellati tutti i dati del questionario e il report attuale, ma la tua chiave API rimarrà attiva. Vuoi procedere?"*

Pulsanti: "Annulla" / "Ricomincia"

### Progress messages durante generazione

- *"Analizzo il contesto aziendale..."*
- *"Consulto le fonti normative..."*
- *"Valuto gli impatti sulle aree HR..."*
- *"Formulo le raccomandazioni..."*
- *"Sto finalizzando il report..."*

---

## 18. Sicurezza

- **Nessun log della chiave API.** Configurare logger (se presente) per filtrare qualsiasi stringa che assomigli a una chiave.
- **Cookie HTTP-only + SameSite=Lax + Secure in production** per il session_id.
- **Validazione input con Zod** su tutti gli endpoint API.
- **Validazione output JSON dell'AI con Zod** prima di salvare in sessione.
- **Headers di sicurezza**: CSP minima, X-Frame-Options, X-Content-Type-Options.
- **Nessuna telemetria** né invio dati a servizi terzi (eccetto ovviamente Gemini per le chiamate AI dell'utente).
- **CORS** stretto: solo stesso origine.
- **Rate limit applicativo** sugli endpoint pubblici (oltre al rate limit Gemini): max 30 richieste al minuto per session_id sugli endpoint di generazione.

---

## 19. Output che Codex deve produrre

- **Codice completo** dell'applicazione, funzionante con `npm install && npm run dev`
- **Struttura progetto** come indicato nella sezione Architettura
- **API routes** complete (session, generate, countries, regulations)
- **UI completa** delle 4 pagine principali con tutti i componenti
- **Integrazione Gemini** con gestione errori completa
- **React-PDF** con layout definito
- **Schemi Zod + tipi TypeScript** centralizzati in `/lib/schemas/`
- **Script di pre-processing PDF → JSON** in `/scripts/preprocess-pdf.ts`
- **Test automatici** minimi
- **README** con:
  - Istruzioni di setup
  - Come preparare i file in `/data/regulations/processed/`
  - Come avviare l'app
  - Come eseguire i test
  - Come usare lo script di pre-processing

**NON** deve produrre:
- Contenuti placeholder per normative o questionario (i contenuti reali li fornisce l'utente)
- Configurazioni database (nessun DB)
- Sistema di autenticazione utenti (non previsto in Fase 1)

---

## 20. Criteri di accettazione

Codex deve verificare **tutti questi 20 criteri** prima di dichiarare completato il lavoro, e produrre alla fine un **report di consegna** che elenca lo stato di ciascun criterio (✓ o problema).

1. Il progetto si avvia correttamente con `npm install && npm run dev`, senza errori in console.
2. Nessun errore TypeScript (verificato con `npm run build`).
3. I file di contenuto sono validi: `/data/regulations/countries.json`, `/data/maturity-assessment.json`, i JSON normativi presenti rispettano tutti lo schema Zod definito.
4. La schermata di configurazione API key funziona: validazione formato immediata, validazione con chiamata Gemini, errori mostrati in italiano.
5. Il questionario funziona in tutti e 3 gli step: dati azienda, selezione paesi con stati corretti (verde/giallo/grigio), maturità con 9 aree e 4 livelli.
6. La soglia di 6 aree su 9 è enforced: con meno di 6 aree il pulsante "Genera report" è disabilitato.
7. Il flag BOZZA compare correttamente nel selettore paese, nel banner post-selezione, nell'Executive Summary, nelle Fonti, nell'analisi paese.
8. Il flag DATI PARZIALI compare quando 6-8 aree sono compilate.
9. La generazione del report funziona end-to-end con una chiave API Gemini valida.
10. Il retry funziona: simulando un JSON malformato, il sistema riprova automaticamente 1 volta con messaggio di correzione.
11. Gli errori vengono gestiti con messaggi specifici in italiano: rate limit (con countdown), quota esaurita (con ora reset italiana), chiave invalida, timeout, safety block.
12. Il report web mostra tutti i componenti: dashboard Executive Summary, sidebar con ancore, accordion sulle sezioni, badge colorati, tabella confronto, griglia maturità.
13. Il PDF si scarica correttamente con nome file `PayTransparency_Assessment_{Azienda}_{Data}.pdf` e caratteri speciali puliti.
14. Il PDF contiene: copertina, header/footer ricorrenti, disclaimer, tutte le sezioni del report espanse, indice cliccabile.
15. La sessione scade dopo 4 ore di inattività con refresh on activity.
16. I dati del questionario vengono preservati se la sessione scade durante la compilazione.
17. Tutte le stringhe UI sono in italiano, nessuna stringa in inglese visibile all'utente (escluse le eccezioni terminologiche concordate).
18. L'API key non appare in nessun log (console, file di log eventuali).
19. L'API key non appare in nessun report generato (né web né PDF).
20. I test automatici passano con `npm test`.

### Test automatici minimi richiesti

- Test di validazione degli schemi Zod per i file JSON (normative, countries, maturity-assessment) con esempi validi e invalidi.
- Test delle regole deterministiche del livello di attenzione: scenari input → output atteso (copertura delle combinazioni maturità × has_direct_obligation × amplificatore bozza).
- Test della soglia di completamento questionario: 5 aree → bloccato; 6 aree → ok con flag; 9 aree → ok senza flag.
- Test della gestione errori Gemini: mock di risposta malformata (retry); mock di rate limit (no retry, messaggio specifico); mock di safety block (no retry, messaggio specifico).
- Test della generazione del nome file PDF con caratteri speciali.
- Test del comportamento di sessione scaduta: i dati del questionario vengono preservati lato client.

### Report di consegna finale

Alla fine della generazione del codice, Codex deve restituire un documento strutturato così:

```
## Report di consegna

### Criteri di accettazione
1. ✓ / ✗ [descrizione problema se ✗]
2. ✓ / ✗ ...
...
20. ✓ / ✗ ...

### Test automatici
- [nome test]: ✓ / ✗
- ...

### Note e problemi noti
[eventuali limitazioni, scelte di implementazione da rivedere, ecc.]

### Istruzioni di avvio rapido
1. ...
2. ...
```

Se anche un solo criterio è ✗ e riguarda un requisito critico (avvio, flusso end-to-end, rispetto dei vincoli non negoziabili), il lavoro **non è completo** e va rilavorato.

---

## 21. Note finali per Codex

- **Chiedi conferma prima di deviare** da una scelta tecnica esplicita in questo prompt. Se un vincolo è incompatibile con l'ambiente di esecuzione, segnala il problema invece di scegliere autonomamente.
- **Commenta il codice dove serve** (logiche non ovvie), ma non sovraccomentare.
- **Segui convenzioni idiomatiche** di Next.js App Router, React, TypeScript.
- **Mantieni i contenuti di dominio separati dal codice** in `/data/`.
- **Non inventare normative**, non generare testi placeholder per le leggi. Se mancano, il tool deve mostrare un messaggio esplicito "contenuti non caricati".
- **Accessibilità**: usa HTML semantico, etichette ARIA dove appropriato, focus visibile, contrasto adeguato.
- **Responsive**: il tool deve funzionare correttamente su desktop (priorità) e tablet. Smartphone è nice-to-have in Fase 1.

---

**Fine del prompt.**
