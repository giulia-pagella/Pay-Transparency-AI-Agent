# Pay Transparency Assessment Tool

Applicazione full-stack Next.js (Fase 1) per assessment guidato sulla Direttiva UE 2023/970.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Zod
- Gemini (`gemini-2.5-flash`) lato backend
- React-PDF
- Vitest

## Setup rapido
1. Installazione dipendenze:
   ```bash
   npm install
   ```
2. (Opzionale ma consigliato) Pre-processamento PDF in JSON:
   ```bash
   npx tsx scripts/preprocess-pdf.ts
   ```
3. Avvio sviluppo:
   ```bash
   npm run dev
   ```

## Struttura dati
- `data/regulations/countries.json`: lista master paesi
- `data/maturity-assessment.json`: 9 aree maturità
- `data/regulations/source_pdfs/`: PDF originali
- `data/regulations/processed/`: JSON normativi processati

Se mancano i JSON richiesti in `processed`, la generazione report viene bloccata con messaggio esplicito.

## Test
```bash
npm test
```

## Build
```bash
npm run build
```

## Script preprocess PDF
Lo script `scripts/preprocess-pdf.ts`:
- legge PDF da `data/regulations/source_pdfs/`
- genera JSON draft in `data/regulations/processed/`
- marca i blocchi con `needs_review: true`

## Limiti noti
- Sessione solo in-memory (perdita dati su restart server/deploy)
- Nessun DB in Fase 1
- PDF e report dipendono dai JSON normativi presenti
- Nessuna telemetria

## Gestione file PDF
- I PDF sorgente **non vengono versionati nel repository** (niente file binari in Git).
- Copiare localmente i PDF in `data/regulations/source_pdfs/` prima di eseguire lo script di preprocess.
- I JSON generati in `data/regulations/processed/` sono i file da versionare.


## Versione Node.js
- Versione richiesta: **Node.js >= 20**
- Se usi `nvm`:
  ```bash
  nvm use
  ```
  (legge automaticamente `.nvmrc`)
