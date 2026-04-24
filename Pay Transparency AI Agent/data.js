// Shared data for the Pay Transparency Assessment Tool mockup
// NOT the production app data — for UI presentation only.

window.PTT_DATA = {
  // 9 maturity areas — from the prompt
  areas: [
    {
      id: "talent_attraction",
      name: "Talent Attraction",
      description: "Come l'azienda comunica informazioni retributive negli annunci di lavoro e nelle attività di employer branding.",
      hasDirectObligation: true,
      levels: [
        { value: 1, label: "Iniziale", bullet: "Le offerte di lavoro non includono alcuna informazione retributiva." },
        { value: 2, label: "Parziale", bullet: "Informazioni retributive fornite solo su richiesta o in fase avanzata." },
        { value: 3, label: "Strutturato", bullet: "Range salariali definiti per ruolo e comunicati in modo parziale." },
        { value: 4, label: "Avanzato", bullet: "Range salariali sempre inclusi negli annunci, con criteri chiari." }
      ]
    },
    {
      id: "recruiting",
      name: "Recruiting e colloqui",
      description: "Governo delle pratiche di selezione, inclusi gli obblighi come il divieto di chiedere la salary history.",
      hasDirectObligation: true,
      levels: [
        { value: 1, label: "Iniziale", bullet: "Nessuna policy sulle domande retributive; possibili richieste di salary history." },
        { value: 2, label: "Parziale", bullet: "Linee guida informali, con pratiche non uniformi tra recruiter." },
        { value: 3, label: "Strutturato", bullet: "Policy formalizzata e processo di selezione standardizzato." },
        { value: 4, label: "Avanzato", bullet: "Processo auditabile, con formazione dei recruiter su equità e bias." }
      ]
    },
    {
      id: "pay_structure",
      name: "Struttura retributiva",
      description: "Grado di formalizzazione delle logiche retributive, dei pay range e del posizionamento rispetto al mercato.",
      hasDirectObligation: false,
      levels: [
        { value: 1, label: "Iniziale", bullet: "Nessuna struttura formalizzata; salari definiti caso per caso." },
        { value: 2, label: "Parziale", bullet: "Strutture parziali o non aggiornate, con scarsa trasparenza." },
        { value: 3, label: "Strutturato", bullet: "Job grading e pay range definiti, con logiche di posizionamento chiare." },
        { value: 4, label: "Avanzato", bullet: "Sistema monitorato e aggiornato, allineato con benchmark di mercato." }
      ]
    },
    {
      id: "job_architecture",
      name: "Job Architecture",
      description: "Classificazione dei ruoli in categorie confrontabili, centrale per identificare 'lavoro di pari valore'.",
      hasDirectObligation: true,
      levels: [
        { value: 1, label: "Iniziale", bullet: "Ruoli non classificati in modo sistematico; nessun criterio formale." },
        { value: 2, label: "Parziale", bullet: "Classificazione parziale basata su criteri non sempre oggettivi." },
        { value: 3, label: "Strutturato", bullet: "Architettura formalizzata con criteri oggettivi e documentati." },
        { value: 4, label: "Avanzato", bullet: "Rivista periodicamente, validata per neutralità di genere." }
      ]
    },
    {
      id: "performance",
      name: "Performance Management",
      description: "Sistema di valutazione delle performance e sua correlazione con le decisioni retributive.",
      hasDirectObligation: false,
      levels: [
        { value: 1, label: "Iniziale", bullet: "Nessun sistema strutturato; valutazioni soggettive." },
        { value: 2, label: "Parziale", bullet: "Sistema presente ma non standardizzato, limitata correlazione." },
        { value: 3, label: "Strutturato", bullet: "Sistema formalizzato e diffuso, collegato a crescita e reward." },
        { value: 4, label: "Avanzato", bullet: "Sistema data-driven con monitoraggio di equità e bias." }
      ]
    },
    {
      id: "career_paths",
      name: "Percorsi di carriera",
      description: "Chiarezza, trasparenza e comunicazione dei percorsi di crescita professionale.",
      hasDirectObligation: false,
      levels: [
        { value: 1, label: "Iniziale", bullet: "Nessun percorso di carriera definito." },
        { value: 2, label: "Parziale", bullet: "Percorsi informali o non documentati." },
        { value: 3, label: "Strutturato", bullet: "Framework chiaro per ruoli e avanzamenti." },
        { value: 4, label: "Avanzato", bullet: "Percorsi trasparenti, comunicati e monitorati." }
      ]
    },
    {
      id: "governance",
      name: "Governance e policy",
      description: "Presenza di policy formali sulla trasparenza retributiva e responsabilità organizzative.",
      hasDirectObligation: false,
      levels: [
        { value: 1, label: "Iniziale", bullet: "Nessuna policy sulla pay transparency." },
        { value: 2, label: "Parziale", bullet: "Policy parziali o non integrate." },
        { value: 3, label: "Strutturato", bullet: "Policy formalizzate e condivise." },
        { value: 4, label: "Avanzato", bullet: "Governance chiara con responsabilità definite." }
      ]
    },
    {
      id: "data_payroll",
      name: "Dati, payroll e reporting",
      description: "Qualità dei dati retributivi e capacità di produrre reporting richiesti dalla Direttiva UE.",
      hasDirectObligation: true,
      levels: [
        { value: 1, label: "Iniziale", bullet: "Dati frammentati e non affidabili." },
        { value: 2, label: "Parziale", bullet: "Dati disponibili ma non integrati." },
        { value: 3, label: "Strutturato", bullet: "Sistemi integrati e reporting base." },
        { value: 4, label: "Avanzato", bullet: "Reporting avanzato con gender pay gap, audit e analisi ricorrenti." }
      ]
    },
    {
      id: "communication",
      name: "Comunicazione e trasparenza",
      description: "Come l'azienda comunica ai dipendenti i criteri retributivi e risponde al diritto all'informazione.",
      hasDirectObligation: true,
      levels: [
        { value: 1, label: "Iniziale", bullet: "Nessuna comunicazione sui criteri retributivi." },
        { value: 2, label: "Parziale", bullet: "Comunicazione reattiva, solo su richiesta." },
        { value: 3, label: "Strutturato", bullet: "Comunicazione strutturata con canali e contenuti definiti." },
        { value: 4, label: "Avanzato", bullet: "Trasparenza proattiva e accessibile per tutti i dipendenti." }
      ]
    }
  ],

  // 31 countries: IT bozza, all others disabled in Fase 1
  countries: [
    { code: "IT", name: "Italia", flag: "🇮🇹", status: "draft" },
    { code: "FR", name: "Francia", flag: "🇫🇷", status: "none" },
    { code: "ES", name: "Spagna", flag: "🇪🇸", status: "none" },
    { code: "DE", name: "Germania", flag: "🇩🇪", status: "none" },
    { code: "BE", name: "Belgio", flag: "🇧🇪", status: "none" },
    { code: "NL", name: "Paesi Bassi", flag: "🇳🇱", status: "none" },
    { code: "PT", name: "Portogallo", flag: "🇵🇹", status: "none" },
    { code: "IE", name: "Irlanda", flag: "🇮🇪", status: "none" },
    { code: "AT", name: "Austria", flag: "🇦🇹", status: "none" },
    { code: "PL", name: "Polonia", flag: "🇵🇱", status: "none" },
    { code: "SE", name: "Svezia", flag: "🇸🇪", status: "none" },
    { code: "DK", name: "Danimarca", flag: "🇩🇰", status: "none" },
    { code: "FI", name: "Finlandia", flag: "🇫🇮", status: "none" },
    { code: "GR", name: "Grecia", flag: "🇬🇷", status: "none" },
    { code: "CZ", name: "Rep. Ceca", flag: "🇨🇿", status: "none" },
    { code: "SK", name: "Slovacchia", flag: "🇸🇰", status: "none" },
    { code: "HU", name: "Ungheria", flag: "🇭🇺", status: "none" },
    { code: "RO", name: "Romania", flag: "🇷🇴", status: "none" },
    { code: "BG", name: "Bulgaria", flag: "🇧🇬", status: "none" },
    { code: "HR", name: "Croazia", flag: "🇭🇷", status: "none" },
    { code: "SI", name: "Slovenia", flag: "🇸🇮", status: "none" },
    { code: "LU", name: "Lussemburgo", flag: "🇱🇺", status: "none" },
    { code: "EE", name: "Estonia", flag: "🇪🇪", status: "none" },
    { code: "LV", name: "Lettonia", flag: "🇱🇻", status: "none" },
    { code: "LT", name: "Lituania", flag: "🇱🇹", status: "none" },
    { code: "MT", name: "Malta", flag: "🇲🇹", status: "none" },
    { code: "CY", name: "Cipro", flag: "🇨🇾", status: "none" },
    { code: "UK", name: "Regno Unito", flag: "🇬🇧", status: "none" },
    { code: "CH", name: "Svizzera", flag: "🇨🇭", status: "none" },
    { code: "NO", name: "Norvegia", flag: "🇳🇴", status: "none" }
  ]
};
