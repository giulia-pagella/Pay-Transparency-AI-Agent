// Screen 5: Report web
const Report = () => {
  const areas = window.PTT_DATA.areas;
  const attentionLevels = {
    talent_attraction: "alta",
    recruiting: "alta",
    pay_structure: "alta",
    job_architecture: "alta",
    performance: "media",
    career_paths: "na",
    governance: "alta",
    data_payroll: "alta",
    communication: "na"
  };
  const maturityLevels = {
    talent_attraction: 2, recruiting: 1, pay_structure: 2, job_architecture: 2,
    performance: 3, career_paths: null, governance: 1, data_payroll: 2, communication: null
  };

  const Attention = ({ level }) => {
    const labels = { alta: "Attenzione Alta", media: "Attenzione Media", bassa: "Attenzione Bassa", na: "Non valutata" };
    return <span className={`attention attention-${level}`}>{labels[level]}</span>;
  };

  const sections = [
    { id: "exec", num: "01", title: "Executive Summary" },
    { id: "perimeter", num: "02", title: "Perimetro dell'analisi" },
    { id: "eu", num: "03", title: "Direttiva UE 2023/970" },
    { id: "country", num: "04", title: "Analisi per paese · Italia" },
    { id: "compare", num: "05", title: "Confronto multi-country" },
    { id: "impacts", num: "06", title: "Impatti per area HR" },
    { id: "maturity", num: "07", title: "Profilo di maturità" },
    { id: "reco", num: "08", title: "Raccomandazioni" },
    { id: "limits", num: "09", title: "Limiti e caveat" },
    { id: "sources", num: "10", title: "Fonti normative" }
  ];

  return (
    <div className="ptt-screen">
      <Chrome url="paytransparency.nttdata.com/report/aurora-retail-2026-04-24" />
      <Header />
      <div style={{flex: 1, display: "flex", overflow: "hidden"}}>
        {/* Sidebar */}
        <div className="report-sidebar">
          <div style={{fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 8}}>Report</div>
          <div className="serif" style={{fontSize: 18, color: "white", lineHeight: 1.25, marginBottom: 24}}>Aurora Retail S.p.A.</div>

          <div style={{display: "flex", flexDirection: "column", gap: 2, marginBottom: 24, position: "relative", zIndex: 2}}>
            {sections.map((s, i) => (
              <a key={s.id} className={`anchor-link ${i === 0 ? "active" : ""}`}>
                <span><span className="anchor-num" style={{marginRight: 10}}>{s.num}</span>{s.title}</span>
                {i === 0 && <Icon name="chevron-right" size={12}/>}
              </a>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{padding: 14, background: "rgba(255,255,255,0.06)", borderLeft: "2px solid var(--ntt-yellow)", borderRadius: 2, fontSize: 10, lineHeight: 1.55, color: "rgba(255,255,255,0.7)", position: "relative", zIndex: 2, marginBottom: 16}}>
            <div style={{fontSize: 10, fontWeight: 700, color: "white", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6}}>⚠ Disclaimer</div>
            Documento generato da AI, non costituisce consulenza legale né dichiarazione di conformità normativa. Per valutazioni vincolanti consulta professionisti qualificati.
          </div>

          <div style={{display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 2}}>
            <button className="btn btn-primary btn-sm" style={{justifyContent: "flex-start"}}>
              <Icon name="download" size={14}/> Scarica PDF
            </button>
            <button style={{background: "transparent", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 12px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-sans)", borderRadius: 2, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6}}>
              <Icon name="edit" size={12}/> Modifica assessment
            </button>
            <button style={{background: "transparent", color: "rgba(255,255,255,0.6)", border: "none", padding: "6px 0", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-sans)", textAlign: "left"}}>
              <Icon name="refresh" size={11} style={{marginRight: 4, verticalAlign: "middle"}}/> Ricomincia da capo
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="report-main">
          {/* Partial data banner */}
          <div className="alert alert-warn" style={{marginBottom: 24}}>
            <Icon name="info" size={20} className="alert-icon" style={{color: "#8B6B00"}}/>
            <div className="alert-body">
              <strong>Dati parziali — assessment completato al 78%</strong>
              Sono state valutate 7 aree di maturità su 9. Le raccomandazioni e il livello di attenzione complessivo si basano sui dati forniti. Per un'analisi più completa, torna al questionario e compila le aree mancanti.
            </div>
          </div>

          {/* Title block */}
          <div style={{marginBottom: 8}}>
            <div className="eyebrow" style={{marginBottom: 14}}>PAY TRANSPARENCY ASSESSMENT REPORT</div>
            <h1 className="serif" style={{fontSize: 48, lineHeight: 1.1, margin: 0, marginBottom: 12, color: "var(--ntt-smart-navy)", letterSpacing: "-0.015em"}}>
              Aurora Retail S.p.A.
            </h1>
            <div style={{display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", fontSize: 13, color: "var(--ntt-gray-100)"}}>
              <span>Retail · 100–149 dipendenti · Mono-entità nazionale</span>
              <span style={{width: 3, height: 3, borderRadius: "50%", background: "var(--ntt-gray-100)"}}/>
              <span>Generato il 24 aprile 2026 · ore 11:38</span>
              <span style={{width: 3, height: 3, borderRadius: "50%", background: "var(--ntt-gray-100)"}}/>
              <span className="badge badge-yellow"><span className="badge-dot"/>Dati parziali</span>
              <span className="badge badge-yellow"><span className="badge-dot"/>Fonte in bozza</span>
            </div>
          </div>

          {/* Executive summary dashboard */}
          <div id="exec" style={{marginTop: 40}}>
            <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 24}}>
              <span className="accordion-num" style={{margin: 0}}>01</span>
              <h2 style={{margin: 0, fontSize: 24, fontWeight: 700, color: "var(--ntt-smart-navy)"}}>Executive Summary</h2>
            </div>

            <div style={{background: "var(--ntt-smart-navy)", color: "white", padding: 32, borderRadius: 4, position: "relative", overflow: "hidden", marginBottom: 20}}>
              <div style={{position: "absolute", right: -80, top: -80, width: 340, height: 340, backgroundImage: "url('assets/innovation-curve-twothirds-white.svg')", backgroundSize: "contain", backgroundRepeat: "no-repeat", opacity: 0.08}}/>
              <div style={{display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "center", position: "relative", zIndex: 2}}>
                <div style={{textAlign: "center"}}>
                  <div style={{fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10}}>Livello complessivo</div>
                  <div style={{width: 140, height: 140, border: "3px solid var(--ntt-orange-100)", borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,80,0,0.1)"}}>
                    <div className="serif" style={{fontSize: 36, color: "var(--ntt-orange-100)", lineHeight: 1}}>Alta</div>
                    <div style={{fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 6, letterSpacing: "0.08em"}}>ATTENZIONE</div>
                  </div>
                </div>
                <div>
                  <p className="serif" style={{fontSize: 24, lineHeight: 1.3, color: "white", margin: 0, marginBottom: 20, fontWeight: 400}}>
                    "L'azienda presenta un'esposizione significativa sugli obblighi della Direttiva: priorità immediata su job architecture, reporting e trasparenza salariale pre-assunzione."
                  </p>
                  <p style={{fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.75)", margin: 0, maxWidth: 620}}>
                    Con 100–149 dipendenti, Aurora Retail rientra nella prima soglia incrementale della Direttiva. L'analisi sulle 7 aree valutate mostra un profilo di maturità iniziale-parziale (media 1,9/4), concentrato soprattutto sui processi HR core. Il recepimento italiano è in bozza: le indicazioni qui fornite andranno riviste alla pubblicazione definitiva.
                  </p>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24}}>
              {[
                { n: "1", l: "Paese analizzato", s: "Italia (bozza)", c: "var(--ntt-future-blue)" },
                { n: "7/9", l: "Aree valutate", s: "Assessment parziale", c: "var(--ntt-yellow)" },
                { n: "5", l: "Aree ad attenzione Alta", s: "Priorità immediata", c: "var(--ntt-orange-100)" },
                { n: "4", l: "Raccomandazioni ad alta priorità", s: "Su 9 totali", c: "var(--ntt-smart-navy)" }
              ].map((k, i) => (
                <div key={i} className="card" style={{padding: 18, borderTop: `3px solid ${k.c}`}}>
                  <div className="serif" style={{fontSize: 32, lineHeight: 1, color: "var(--ntt-smart-navy)"}}>{k.n}</div>
                  <div style={{fontSize: 13, fontWeight: 700, color: "var(--ntt-smart-navy)", marginTop: 10}}>{k.l}</div>
                  <div style={{fontSize: 11, color: "var(--ntt-gray-100)", marginTop: 4}}>{k.s}</div>
                </div>
              ))}
            </div>

            {/* Key points */}
            <div className="card" style={{padding: 24}}>
              <div className="eyebrow" style={{marginBottom: 16}}>PUNTI CHIAVE</div>
              <div style={{display: "flex", flexDirection: "column", gap: 14}}>
                {[
                  { i: "target", t: "La fascia 100-149 attiva il primo livello di obblighi di reporting: vanno pianificati entro la prima finestra di 3 anni dall'entrata in vigore." },
                  { i: "layers", t: "La Job Architecture attuale non consente di identificare 'lavoro di pari valore' secondo criteri oggettivi: è il prerequisito per ogni altra azione." },
                  { i: "flag", t: "Il divieto di chiedere la salary history non è ancora regolato da policy: rischio di non-conformità già in fase di recruiting." },
                  { i: "chart", t: "I sistemi payroll non sono integrati per produrre il gender pay gap reporting richiesto: gap tecnologico rilevante." }
                ].map((p, i) => (
                  <div key={i} style={{display: "flex", gap: 14, alignItems: "flex-start"}}>
                    <div style={{width: 28, height: 28, borderRadius: 2, background: "#E5F1F9", color: "var(--ntt-future-blue-150)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2}}>
                      <Icon name={p.i} size={14}/>
                    </div>
                    <p style={{margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--ntt-text-gray)"}}>{p.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accordion sections */}
          <div className="accordion" style={{marginTop: 48}}>
            {sections.slice(1).map((s, i) => {
              const isOpen = s.id === "impacts" || s.id === "reco";
              return (
                <div key={s.id} className={`accordion-item ${isOpen ? "open" : ""}`}>
                  <div className="accordion-head">
                    <span className="accordion-num">{s.num}</span>
                    <h3 className="accordion-title">{s.title}</h3>
                    {s.id === "country" && <span className="badge badge-yellow"><span className="badge-dot"/>Bozza</span>}
                    <Icon name="plus" size={20} className="accordion-toggle"/>
                  </div>

                  {isOpen && s.id === "impacts" && (
                    <div className="accordion-body">
                      <p style={{fontSize: 13, color: "var(--ntt-text-gray)", marginBottom: 20, maxWidth: 760}}>
                        Livello di attenzione per ciascuna area, calcolato in modo deterministico combinando maturità dichiarata, obbligo diretto della Direttiva e amplificatore "bozza" (Italia in status draft).
                      </p>

                      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
                        {areas.map(a => {
                          const lv = attentionLevels[a.id];
                          const mat = maturityLevels[a.id];
                          return (
                            <div key={a.id} className="card" style={{padding: 16, borderLeft: a.hasDirectObligation ? "3px solid var(--ntt-future-blue)" : "1px solid var(--ntt-gray-50)"}}>
                              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10}}>
                                <div style={{flex: 1}}>
                                  <div style={{fontSize: 13, fontWeight: 700, color: "var(--ntt-smart-navy)"}}>{a.name}</div>
                                  <div style={{fontSize: 11, color: "var(--ntt-gray-100)", marginTop: 2}}>
                                    {mat ? `Livello attuale: ${a.levels[mat-1].label}` : "Non valutata"}
                                  </div>
                                </div>
                                <Attention level={lv}/>
                              </div>
                              {/* Maturity bar */}
                              <div style={{display: "flex", gap: 3}}>
                                {[1,2,3,4].map(k => (
                                  <div key={k} style={{flex: 1, height: 4, background: mat && k <= mat ? "var(--ntt-future-blue)" : "var(--ntt-gray-50)", borderRadius: 1}}/>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isOpen && s.id === "reco" && (
                    <div className="accordion-body">
                      <p style={{fontSize: 13, color: "var(--ntt-text-gray)", marginBottom: 20, maxWidth: 760}}>
                        9 raccomandazioni preliminari ordinate per priorità. Ciascuna è collegata alle aree HR impattate e alla fonte normativa di riferimento.
                      </p>

                      <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                        {[
                          { n: "01", p: "alta", t: "Definire una Job Architecture con criteri oggettivi neutri rispetto al genere", areas: ["Job Architecture", "Struttura retributiva"], ref: "Art. 4 · Dir. UE", d: "Classificazione dei ruoli è il prerequisito per identificare lavoro di pari valore e costruire pay range difendibili. Obiettivo: framework documentato e validato entro 6 mesi." },
                          { n: "02", p: "alta", t: "Integrare i sistemi payroll per produrre il gender pay gap reporting", areas: ["Dati, payroll e reporting"], ref: "Art. 7 · Dir. UE", d: "La fascia 100-149 attiva i primi obblighi di reporting. Servono dati consolidati su retribuzione, genere, ruolo, anzianità. Obiettivo: data model completo e un primo report pilota." },
                          { n: "03", p: "alta", t: "Formalizzare una policy sul divieto di richiesta della salary history", areas: ["Recruiting e colloqui"], ref: "Art. 5 · Dir. UE", d: "Rischio presente già oggi in fase di selezione. Policy + formazione recruiter + tracciamento processo. Obiettivo: rollout in 90 giorni." },
                          { n: "04", p: "alta", t: "Introdurre range salariali negli annunci di lavoro", areas: ["Talent Attraction"], ref: "Art. 5 · Dir. UE", d: "Obbligo di trasparenza pre-assunzione. Pubblicare range coerenti con la nuova Job Architecture." },
                          { n: "05", p: "media", t: "Strutturare un sistema di Performance Management coerente con il reward", areas: ["Performance Management"], ref: "Indiretto", d: "Il livello attuale è strutturato (3/4) ma manca la correlazione con le decisioni retributive in modo tracciabile." },
                          { n: "06", p: "media", t: "Pubblicare e comunicare policy di pay transparency", areas: ["Governance e policy", "Comunicazione"], ref: "Art. 4 · Dir. UE", d: "Definizione di responsabilità e owner interni, con canale di comunicazione strutturato ai dipendenti." }
                        ].map((r, i) => (
                          <div key={i} className="card" style={{padding: 20, borderLeft: `3px solid ${r.p === "alta" ? "var(--ntt-orange-100)" : r.p === "media" ? "var(--ntt-yellow)" : "var(--ntt-green)"}`}}>
                            <div style={{display: "flex", gap: 16, alignItems: "flex-start"}}>
                              <span className="serif" style={{fontSize: 24, color: "var(--ntt-gray-100)", lineHeight: 1, minWidth: 32}}>{r.n}</span>
                              <div style={{flex: 1}}>
                                <div style={{display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8}}>
                                  <Attention level={r.p}/>
                                  <span className="badge badge-blue">{r.ref}</span>
                                  {r.areas.map((a, j) => <span key={j} className="badge badge-gray">{a}</span>)}
                                </div>
                                <div style={{fontSize: 15, fontWeight: 700, color: "var(--ntt-smart-navy)", marginBottom: 6, lineHeight: 1.35}}>{r.t}</div>
                                <p style={{margin: 0, fontSize: 13, color: "var(--ntt-text-gray)", lineHeight: 1.6}}>{r.d}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--ntt-gray-50)", fontSize: 11, color: "var(--ntt-gray-100)", lineHeight: 1.6}}>
            Report v1.0 · Generato il 24/04/2026 · Pay Transparency Assessment Tool · NTT DATA Italia · Powered by Google Gemini 2.5 Flash · <strong>Documento AI, non costituisce consulenza legale.</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Report = Report;
