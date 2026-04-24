// Screen 6: PDF layout preview — shown as stacked A4 pages
const PdfPreview = () => {
  const Page = ({ children, num, totalPages = 14 }) =>
  <div style={{
    background: "white",
    border: "1px solid var(--ntt-gray-50)",
    boxShadow: "0 4px 24px rgba(7,15,38,0.08)",
    width: 594,
    minHeight: 840,
    padding: "48px 56px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    marginBottom: 32,
    fontSize: 11
  }}>
      {num > 1 &&
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, color: "var(--ntt-gray-100)", borderBottom: "1px solid var(--ntt-gray-50)", paddingBottom: 10, marginBottom: 28, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
          <span>Aurora Retail S.p.A.</span>
          <span>Pay Transparency Assessment</span>
          <span>Pag. {num} di {totalPages}</span>
        </div>
    }
      <div style={{ flex: 1 }}>{children}</div>
      <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid var(--ntt-gray-50)", fontSize: 8, color: "var(--ntt-gray-100)", display: "flex", justifyContent: "space-between" }}>
        <span>Documento generato da AI, non costituisce consulenza legale.</span>
        <span>24 aprile 2026</span>
      </div>
    </div>;


  return (
    <div className="ptt-screen" style={{ background: "#E8EAED" }}>
      <Chrome url="paytransparency.nttdata.com/report/aurora-retail/pdf" />
      <div style={{ background: "white", borderBottom: "1px solid var(--ntt-gray-50)", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="file" size={16} color="var(--ntt-future-blue-150)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ntt-smart-navy)" }}>PayTransparency_Assessment_Aurora_Retail_2026-04-24.pdf</span>
          <span style={{ fontSize: 11, color: "var(--ntt-gray-100)" }}>· 14 pagine · ~1.2 MB</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ptt-btn-ghost"><Icon name="external" size={12} /> Apri in nuova tab</button>
          <button className="btn btn-primary btn-sm"><Icon name="download" size={14} /> Scarica PDF</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Page 1: Cover */}
        <Page num={1}>
          <div style={{ position: "absolute", inset: 0, background: "var(--ntt-smart-navy)", color: "white", padding: "64px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -60, bottom: -60, width: 380, height: 380, backgroundImage: "url('assets/innovation-curve-twothirds-white.svg')", backgroundRepeat: "no-repeat", opacity: 0.14, backgroundSize: "contain", backgroundPosition: "right bottom" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <img src="assets/logo-nttdata-white.svg" style={{ height: 20, marginBottom: 40 }} />
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 18 }}>PAY TRANSPARENCY ASSESSMENT REPORT</div>
              <div className="serif" style={{ fontSize: 40, lineHeight: 1.1, color: "white", marginBottom: 20, letterSpacing: "-0.01em" }}>Aurora Retail S.p.A.</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 380 }}>
                Analisi degli impatti della Direttiva UE 2023/970 sulla trasparenza retributiva e piano delle raccomandazioni preliminari.
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 40, alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>Attenzione complessiva</div>
                <div style={{ border: "2px solid var(--ntt-orange-100)", padding: "8px 14px", display: "inline-flex", flexDirection: "column", gap: 4 }}>
                  <div className="serif" style={{ fontSize: 24, color: "var(--ntt-orange-100)", lineHeight: 1 }}>Alta</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>Paesi analizzati</div>
                <div style={{ fontSize: 18, color: "white" }}>🇮🇹 Italia <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginLeft: 4 }}>(bozza)</span></div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>Generato</div>
                <div style={{ fontSize: 13, color: "white" }}>24 aprile 2026</div>
              </div>
            </div>

            <div style={{ position: "absolute", bottom: 20, left: 56, right: 56, fontSize: 8, color: "rgba(255,255,255,0.55)", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 12 }}>
              Documento generato da AI, non costituisce consulenza legale né dichiarazione di conformità normativa.
            </div>
          </div>
        </Page>

        {/* Page 2: Indice + Exec */}
        <Page num={2}>
          <div className="eyebrow" style={{ marginBottom: 16, fontSize: 9 }}>01 · INDICE</div>
          <h2 className="serif" style={{ fontSize: 26, margin: 0, marginBottom: 20, color: "var(--ntt-smart-navy)", fontWeight: 400 }}>Struttura del report</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11 }}>
            {[
            ["01", "Executive Summary", "3"],
            ["02", "Perimetro dell'analisi", "4"],
            ["03", "Direttiva UE 2023/970", "5"],
            ["04", "Analisi per paese · Italia", "7"],
            ["05", "Confronto multi-country", "9"],
            ["06", "Impatti per area HR", "10"],
            ["07", "Profilo di maturità", "11"],
            ["08", "Raccomandazioni", "12"],
            ["09", "Limiti e caveat", "13"],
            ["10", "Fonti normative", "14"]].
            map(([n, t, p]) =>
            <div key={n} style={{ display: "flex", alignItems: "baseline", gap: 10, paddingBottom: 4, borderBottom: "1px dotted var(--ntt-gray-50)" }}>
                <span style={{ fontFamily: "var(--font-serif)", color: "var(--ntt-future-blue)", width: 24 }}>{n}</span>
                <span style={{ flex: 1, color: "var(--ntt-smart-navy)", fontWeight: 700 }}>{t}</span>
                <span style={{ color: "var(--ntt-gray-100)" }}>p. {p}</span>
              </div>
            )}
          </div>
        </Page>

        {/* Page 3: Exec */}
        <Page num={3}>
          <div className="eyebrow" style={{ marginBottom: 12, fontSize: 9 }}>01 · EXECUTIVE SUMMARY</div>
          <h2 className="serif" style={{ fontSize: 24, margin: 0, marginBottom: 16, color: "var(--ntt-smart-navy)", fontWeight: 400 }}>Sintesi</h2>

          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ border: "2px solid var(--ntt-orange-100)", padding: "10px 16px", textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: 8, color: "var(--ntt-gray-100)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 }}>Attenzione</div>
              <div className="serif" style={{ fontSize: 22, color: "var(--ntt-orange-100)", lineHeight: 1 }}>Alta</div>
            </div>
            <div style={{ flex: 1, background: "#FFF5D6", padding: "10px 14px", fontSize: 10, lineHeight: 1.5, color: "#8B6B00", borderLeft: "3px solid var(--ntt-yellow)" }}>
              <strong>Dati parziali</strong> · 7 aree su 9 valutate<br />
              <strong>Fonte in bozza</strong> · Schema di decreto italiano, versione 2024-11
            </div>
          </div>

          <p className="serif" style={{ fontSize: 15, lineHeight: 1.4, color: "var(--ntt-smart-navy)", margin: "0 0 16px" }}>
            "L'azienda presenta un'esposizione significativa sugli obblighi della Direttiva: priorità immediata su job architecture, reporting e trasparenza salariale pre-assunzione."
          </p>

          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ntt-smart-navy)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, marginTop: 18 }}>Punti chiave</div>
          <ul style={{ margin: 0, paddingLeft: 14, fontSize: 10.5, lineHeight: 1.55, color: "var(--ntt-text-gray)" }}>
            <li style={{ marginBottom: 6 }}>Con 100-149 dipendenti rientra nella prima soglia incrementale della Direttiva. Primi obblighi di reporting entro 3 anni.</li>
            <li style={{ marginBottom: 6 }}>Job Architecture non consente di identificare "lavoro di pari valore" con criteri oggettivi: prerequisito per ogni altra azione.</li>
            <li style={{ marginBottom: 6 }}>Divieto di richiesta salary history non regolato da policy: rischio già presente in fase di recruiting.</li>
            <li>Sistemi payroll non integrati per il gender pay gap reporting: gap tecnologico rilevante.</li>
          </ul>
        </Page>

        {/* Page 4: Impacts table */}
        <Page num={6}>
          <div className="eyebrow" style={{ marginBottom: 12, fontSize: 9 }}>06 · IMPATTI PER AREA HR</div>
          <h2 className="serif" style={{ fontSize: 24, margin: 0, marginBottom: 16, color: "var(--ntt-smart-navy)", fontWeight: 400 }}>Livelli di attenzione</h2>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--ntt-smart-navy)" }}>
                <th style={{ textAlign: "left", padding: "8px 6px", fontWeight: 700, color: "var(--ntt-smart-navy)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>Area</th>
                <th style={{ textAlign: "left", padding: "8px 6px", fontWeight: 700, color: "var(--ntt-smart-navy)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", width: 80 }}>Maturità</th>
                <th style={{ textAlign: "left", padding: "8px 6px", fontWeight: 700, color: "var(--ntt-smart-navy)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", width: 90 }}>Attenzione</th>
                <th style={{ textAlign: "left", padding: "8px 6px", fontWeight: 700, color: "var(--ntt-smart-navy)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", width: 70 }}>Obbl. UE</th>
              </tr>
            </thead>
            <tbody>
              {[
              ["Talent Attraction", "Parziale (2)", "alta", true],
              ["Recruiting e colloqui", "Iniziale (1)", "alta", true],
              ["Struttura retributiva", "Parziale (2)", "alta", false],
              ["Job Architecture", "Parziale (2)", "alta", true],
              ["Performance Management", "Strutturato (3)", "media", false],
              ["Percorsi di carriera", "Non valutata", "na", false],
              ["Governance e policy", "Iniziale (1)", "alta", false],
              ["Dati, payroll e reporting", "Parziale (2)", "alta", true],
              ["Comunicazione e trasparenza", "Non valutata", "na", true]].
              map(([n, m, att, ob], i) =>
              <tr key={i} style={{ borderBottom: "1px solid var(--ntt-gray-50)" }}>
                  <td style={{ padding: "10px 6px", color: "var(--ntt-smart-navy)", fontWeight: 700 }}>{n}</td>
                  <td style={{ padding: "10px 6px", color: "var(--ntt-text-gray)" }}>{m}</td>
                  <td style={{ padding: "10px 6px" }}>
                    <span style={{ display: "inline-block", padding: "3px 8px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                    background: att === "alta" ? "#FDEDE7" : att === "media" ? "#FFF5D6" : "var(--ntt-gray-50)",
                    color: att === "alta" ? "var(--ntt-orange-150)" : att === "media" ? "#8B6B00" : "var(--ntt-gray-100)" }}>{att === "na" ? "—" : att}</span>
                  </td>
                  <td style={{ padding: "10px 6px", color: "var(--ntt-text-gray)" }}>{ob ? "Sì" : "No"}</td>
                </tr>
              )}
            </tbody>
          </table>

          <p style={{ fontSize: 9, color: "var(--ntt-gray-100)", marginTop: 14, lineHeight: 1.5, fontStyle: "italic" }}>
            Nota: i livelli di attenzione sono calcolati dal sistema combinando maturità dichiarata e obbligo diretto, con amplificatore attivo per fonte in bozza. L'AI non può modificare questi valori.
          </p>
        </Page>
      </div>
    </div>);

};
window.PdfPreview = PdfPreview;