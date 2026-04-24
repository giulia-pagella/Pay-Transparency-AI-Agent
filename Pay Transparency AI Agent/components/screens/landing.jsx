// Screen 1: Landing
const Landing = () => (
  <div className="ptt-screen">
    <Chrome url="paytransparency.nttdata.com" />
    <Header showSession={false} />
    <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
      {/* Left column */}
      <div style={{ flex: 1.3, padding: "72px 64px 64px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 2 }}>
        <div className="eyebrow" style={{ marginBottom: 24 }}>HR ADVISORY · PAY TRANSPARENCY</div>
        <h1 className="serif" style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--ntt-smart-navy)", margin: 0, marginBottom: 28, maxWidth: 620 }}>
          Preparati alla Direttiva UE <span style={{ color: "var(--ntt-future-blue)" }}>2023/970</span> con un assessment guidato.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ntt-text-gray)", maxWidth: 560, marginBottom: 40 }}>
          Uno strumento AI che confronta i requisiti normativi tra paesi europei, analizza gli impatti sulle aree HR e produce un report strutturato in pochi minuti. Non sostituisce la consulenza legale.
        </p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 48 }}>
          <button className="btn btn-primary btn-lg">
            Inizia assessment <Icon name="arrow-right" size={16} />
          </button>
          <button className="btn btn-tertiary">
            <Icon name="document" size={16} /> Scopri la metodologia
          </button>
        </div>

        {/* Quick facts row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, borderTop: "1px solid var(--ntt-gray-50)", paddingTop: 28, maxWidth: 640 }}>
          {[
            { n: "9", l: "aree HR valutate", s: "Dal talent attraction al reporting" },
            { n: "31", l: "paesi mappati", s: "UE + UK, CH, NO" },
            { n: "~5 min", l: "per il questionario", s: "Report generato in ~60 sec" }
          ].map((x, i) => (
            <div key={i}>
              <div className="serif" style={{ fontSize: 40, color: "var(--ntt-future-blue)", lineHeight: 1, marginBottom: 8 }}>{x.n}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ntt-smart-navy)", marginBottom: 4 }}>{x.l}</div>
              <div style={{ fontSize: 12, color: "var(--ntt-gray-100)" }}>{x.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right column: navy panel with innovation curve */}
      <div style={{ flex: 1, background: "var(--ntt-smart-navy)", color: "white", padding: "64px 56px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ position: "absolute", right: -120, top: -80, width: 560, height: 560, backgroundImage: "url('assets/innovation-curve-twothirds-white.svg')", backgroundSize: "contain", backgroundRepeat: "no-repeat", opacity: 0.14 }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 420 }}>
          <div className="eyebrow" style={{ color: "var(--ntt-future-blue-50)", marginBottom: 20 }}>COSA OTTIENI</div>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, lineHeight: 1.25, marginBottom: 32, color: "white" }}>
            Un report leggibile, basato solo su fonti normative verificate.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              { i: "layers", t: "Confronto multi-country", d: "Affianca Direttiva UE e recepimenti nazionali" },
              { i: "target", t: "Livello di attenzione per area", d: "9 aree HR, priorità calcolate in modo deterministico" },
              { i: "lightbulb", t: "Raccomandazioni preliminari", d: "Ordinate per priorità e collegate alla fonte" },
              { i: "shield", t: "Privacy by design", d: "Nessun log, nessun DB. Chiave API solo in sessione" }
            ].map((x, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--ntt-future-blue-50)" }}>
                  <Icon name={x.i} size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{x.t}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{x.d}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 36, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.12)", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
            Powered by Google Gemini 2.5 Flash. Il tool utilizza esclusivamente fonti normative integrate nel sistema e non attinge a conoscenza esterna.
          </div>
        </div>
      </div>
    </div>
  </div>
);

window.Landing = Landing;
