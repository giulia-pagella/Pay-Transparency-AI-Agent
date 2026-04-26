# SYSTEM LOGIC OVERVIEW — Pay Transparency Assessment Tool

> Documento tecnico aggiuntivo (separato dal `README.md`) pensato per spiegare in modo chiaro e verificabile come funziona il sistema.

---

## 1) Panoramica generale del sistema

### 1.1 Scopo del progetto (in parole semplici)
Il progetto è un'applicazione web che guida un'azienda in un assessment sulla pay transparency.
L'utente:
1. inserisce la propria API key Gemini,
2. compila un questionario guidato,
3. seleziona i paesi da analizzare,
4. genera un report strutturato,
5. visualizza il report e può scaricare un PDF.

L'app **non usa un database** in questa fase: i dati sensibili vivono in sessione in-memory lato server.

### 1.2 Blocchi principali dell'architettura

#### Frontend (interfaccia)
- Mostra pagine e form.
- Raccoglie input utente.
- Chiama API backend.
- Mostra report e errori.

File principali:
- `app/page.tsx` (landing)
- `app/configurazione/page.tsx` (API key)
- `app/questionario/page.tsx` (dati azienda)
- `app/maturita/page.tsx` (maturità 9 aree)
- `app/paesi/page.tsx` (selezione paesi + genera report)
- `app/report/page.tsx` (visualizzazione report)
- `components/assessment-context.tsx` (stato client del questionario)
- `components/session-header.tsx` (header e controlli sessione)

#### Backend (logica)
- Valida API key e crea sessione.
- Carica fonti normative da file JSON.
- Applica regole deterministiche (livello attenzione).
- Chiama Gemini.
- Ripara/valida output AI.
- Espone API per report/PDF.

File principali:
- `app/api/ai/session/init/route.ts`
- `app/api/ai/session/status/route.ts`
- `app/api/ai/session/clear/route.ts`
- `app/api/ai/generate/route.ts`
- `app/api/countries/route.ts`
- `app/api/regulations/route.ts`
- `app/api/pdf/route.tsx`
- `app/api/reset/route.ts`

#### Data layer (contenuti)
- Fonti normative e configurazioni assessment in JSON.

File principali:
- `data/regulations/countries.json`
- `data/regulations/processed/eu_directive_2023_970.json`
- `data/regulations/processed/italia_bozza_decreto.json`
- `data/maturity-assessment.json`

#### Librerie di dominio (cartella `lib/`)
- `lib/ai/gemini.ts` (integrazione AI)
- `lib/session/store.ts` (sessioni in-memory + TTL + rate counters)
- `lib/attention/rules.ts` (regole deterministiche attenzione)
- `lib/report/assembler.ts` (skeleton + repair output AI)
- `lib/report/data.ts` (lettura/validazione fonti)
- `lib/schemas/*.ts` (schemi Zod)
- `lib/pdf/document.tsx` (render PDF)

---

## 2) Flusso logico completo: dall'input all'output

## Step A — Avvio e configurazione API key

### Cosa succede
1. L'utente apre la pagina configurazione.
2. Inserisce la chiave API.
3. Il frontend invia la chiave all'endpoint session init.
4. Il backend:
   - fa validazione formato,
   - fa una chiamata minima a Gemini,
   - se ok crea `session_id` e imposta cookie HTTP-only.

### File coinvolti
- Frontend: `app/configurazione/page.tsx`
- Backend: `app/api/ai/session/init/route.ts`
- Servizio AI: `lib/ai/gemini.ts` (`validateGeminiKey`)
- Sessioni: `lib/session/store.ts` (`createSession`)
- Regex/API util: `lib/utils/validation.ts`

---

## Step B — Compilazione questionario

### Cosa succede
L'utente compila:
1. Dati azienda (`/questionario`)
2. Maturità (`/maturita`)
3. Paesi (`/paesi`)

Il frontend salva temporaneamente i dati nel context React (client-side) per mantenere il flusso tra pagine.

### File coinvolti
- Stato client: `components/assessment-context.tsx`
- Pagine:
  - `app/questionario/page.tsx`
  - `app/maturita/page.tsx`
  - `app/paesi/page.tsx`

---

## Step C — Caricamento paesi e stato fonti

### Cosa succede
Quando apri `/paesi`, il frontend chiama `/api/countries`.
Il backend:
1. legge lista paesi master da `countries.json`,
2. legge i JSON normativi presenti in `data/regulations/processed/`,
3. marca ogni paese come:
   - `definitive`
   - `draft`
   - `none` (non disponibile)

### File coinvolti
- Endpoint: `app/api/countries/route.ts`
- Lettura dati: `lib/report/data.ts`
- Schema fonti: `lib/schemas/regulations.ts`
- File dati: `data/regulations/countries.json`, `data/regulations/processed/*.json`

---

## Step D — Generazione report (core)

### Cosa succede (pipeline)
Quando clicchi “Genera report” su `/paesi`:

1. **Frontend** invia payload a `/api/ai/generate`.
   - File: `app/paesi/page.tsx`

2. **Backend** verifica sessione e input.
   - Sessione attiva?
   - almeno 6 aree maturità compilate?
   - almeno 1 paese selezionato con fonte disponibile?
   - rate limit/minuto e /24h
   - File: `app/api/ai/generate/route.ts`, `lib/session/store.ts`

3. **Backend** carica fonti normative.
   - include fonte UE + paesi selezionati
   - File: `lib/report/data.ts`, `data/regulations/processed/*`

4. **Backend** calcola livelli di attenzione deterministici.
   - regole su livello maturità + obbligo diretto + amplificatore draft
   - File: `lib/attention/rules.ts`

5. **Backend** costruisce uno **skeleton report** valido (struttura completa).
   - serve come guida forte per AI e fallback di sicurezza
   - File: `lib/report/assembler.ts` (`buildReportSkeleton`)

6. **Backend** chiama Gemini con:
   - input utente
   - livelli attenzione
   - fonti
   - template JSON (skeleton)
   - File: `lib/ai/gemini.ts` (`generateReportJson`)

7. **Controllo qualità AI**
   - se output è troppo debole (es. no raccomandazioni), viene fatto retry qualitativo
   - File: `lib/ai/gemini.ts` (`assessQuality` + retry)

8. **Repair output AI**
   - merge tipizzato AI + skeleton
   - normalizzazione enum, array, stringhe, nullability
   - merge per `area_id` su maturity/impacts
   - File: `lib/report/assembler.ts` (`repairReportFromAi`)

9. **Validazione finale Zod**
   - `reportSchema.parse(repaired)`
   - se valida: salva in sessione `reportJson`
   - se no: salva `partialReportJson` e ritorna errore specifico
   - File: `app/api/ai/generate/route.ts`, `lib/schemas/report.ts`

---

## Step E — Visualizzazione report e PDF

### Web report
La pagina `/report` legge stato sessione da `/api/ai/session/status` e mostra il report disponibile.

File:
- `app/report/page.tsx`
- `app/api/ai/session/status/route.ts`

### PDF
Il bottone “Scarica PDF” chiama `/api/pdf`, che prende `session.reportJson` e lo renderizza con React-PDF.

File:
- `app/api/pdf/route.tsx`
- `lib/pdf/document.tsx`
- helper nome file: `lib/utils/validation.ts` (`sanitizeFilename`)

---

## 3) Analisi fonti: come vengono caricate e usate

## 3.1 Individuazione fonti
Le fonti non sono prese da internet in runtime: vengono lette da file locali in `data/regulations/processed/`.

### Meccanismo
- `readProcessedRegulations()` scansiona la cartella `processed`
- legge solo `.json`
- valida ogni file con Zod (`regulationSchema`)

File:
- `lib/report/data.ts`
- `lib/schemas/regulations.ts`

## 3.2 Selezione fonti per il report
- Fonte UE: cercata con `country_code === 'EU'`
- Fonti nazionali: filtrate in base a `selected_countries`

File:
- `app/api/ai/generate/route.ts`

## 3.3 Regole di disponibilità paesi
Un paese è selezionabile se esiste un JSON nazionale in `processed` con stato `definitive` o `draft`.
Se assente → `none`.

File:
- `app/api/countries/route.ts`
- `data/regulations/countries.json`

## 3.4 Preprocessing fonti PDF (offline)
Esiste script dedicato che converte PDF sorgente in JSON draft con campi `needs_review`.

File:
- `scripts/preprocess-pdf.ts`

---

## 4) Generazione output: regole, parametri, dipendenze

## 4.1 Parametri che influenzano Gemini
In `lib/ai/gemini.ts`:
- modello: `gemini-2.5-flash`
- temperatura: `0.15`
- `responseMimeType: application/json`
- prompt con template JSON completo

## 4.2 Dipendenze logiche forti
Output finale dipende da:
1. qualità dati questionario (`company`, `maturity`, `selected_countries`)
2. completezza fonti in `processed/`
3. regole attenzione deterministiche
4. qualità output Gemini
5. fase di repair + validazione finale

## 4.3 Fallback e resilienza
Se AI fallisce o produce output incompleto:
- mapping errori specifici (`BAD_REQUEST`, `TIMEOUT`, `EMPTY_RESPONSE`, etc.)
- retry qualitativo
- repair con skeleton
- fallback parziale in sessione (`partialReportJson`)

File:
- `lib/ai/gemini.ts`
- `lib/report/assembler.ts`
- `app/api/ai/generate/route.ts`

---

## 5) Mappa file-per-fase (rapida da verificare)

## Fase input utente
- `app/configurazione/page.tsx`
- `app/questionario/page.tsx`
- `app/maturita/page.tsx`
- `app/paesi/page.tsx`
- `components/assessment-context.tsx`

## Fase sessione
- `app/api/ai/session/init/route.ts`
- `app/api/ai/session/status/route.ts`
- `app/api/ai/session/clear/route.ts`
- `lib/session/store.ts`

## Fase fonti
- `app/api/countries/route.ts`
- `app/api/regulations/route.ts`
- `lib/report/data.ts`
- `lib/schemas/regulations.ts`
- `data/regulations/*`

## Fase business logic
- `lib/attention/rules.ts`
- `lib/schemas/questionnaire.ts`
- `lib/schemas/maturity.ts`

## Fase AI + assembly
- `lib/ai/gemini.ts`
- `lib/report/assembler.ts`
- `lib/schemas/report.ts`
- `app/api/ai/generate/route.ts`

## Fase output
- Web: `app/report/page.tsx`
- PDF: `app/api/pdf/route.tsx`, `lib/pdf/document.tsx`

---

## 6) Come verificare rapidamente che la documentazione coincide col codice

1. Apri `app/api/ai/generate/route.ts` e segui la sequenza: input → fonti → attention → skeleton → AI → repair → schema parse.
2. Confronta i fallback in `lib/report/assembler.ts` (skeleton + repair) con ciò che vedi in UI quando AI è debole.
3. Controlla `lib/ai/gemini.ts` per prompt, retry qualitativo, mappatura errori.
4. Verifica in `app/report/page.tsx` quali sezioni vengono effettivamente renderizzate nel web report.
5. Verifica in `lib/pdf/document.tsx` quali sezioni entrano davvero nel PDF.

---

## 7) Glossario minimo (non tecnico)

- **Sessione**: memoria temporanea lato server legata all’utente corrente.
- **Schema (Zod)**: regole che dicono “questo JSON è valido / non valido”.
- **Fallback**: contenuto di sicurezza usato quando AI non produce output sufficiente.
- **Repair**: correzione strutturale automatica dell’output AI.
- **Prompt**: istruzioni testuali inviate al modello AI.

---

## 8) Nota finale
Questo documento descrive lo stato implementato nel codice corrente del repository.
È volutamente operativo: ogni blocco è collegato ai file da aprire per verificare direttamente il comportamento reale.
