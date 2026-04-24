// Screen 3: Step 2 — Selezione paesi
const Step2Countries = ({ variant = "list" }) => {
  const selected = ["IT"];
  const countries = window.PTT_DATA.countries;

  const StatusBadge = ({ status }) => {
    if (status === "definitive") return <span className="badge badge-green"><span className="badge-dot"/>Definitivo</span>;
    if (status === "draft") return <span className="badge badge-yellow"><span className="badge-dot"/>Bozza</span>;
    return <span className="badge badge-gray">Non disponibile</span>;
  };

  return (
    <div className="ptt-screen">
      <Chrome />
      <Header />
      <div style={{flex: 1, overflow: "auto", background: "#FAFBFC"}}>
        <div style={{maxWidth: 1120, margin: "0 auto", padding: "40px 48px 80px"}}>
          <div style={{marginBottom: 40}}><Stepper current={1} /></div>

          <div style={{display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, gap: 32}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 16}}>QUESTIONARIO · STEP 2 DI 3</div>
              <h1 className="serif" style={{fontSize: 40, lineHeight: 1.15, margin: 0, marginBottom: 12, color: "var(--ntt-smart-navy)"}}>
                Seleziona i paesi da analizzare.
              </h1>
              <p style={{fontSize: 15, color: "var(--ntt-text-gray)", margin: 0, maxWidth: 640}}>
                La <strong>Direttiva UE 2023/970</strong> è sempre inclusa come base. Aggiungi i recepimenti nazionali rilevanti per il tuo perimetro. Solo i paesi con normativa caricata sono selezionabili.
              </p>
            </div>
            <div style={{textAlign: "right", flexShrink: 0}}>
              <div style={{fontSize: 12, color: "var(--ntt-gray-100)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700}}>Selezionati</div>
              <div className="serif" style={{fontSize: 36, color: "var(--ntt-future-blue)", lineHeight: 1}}>{selected.length}<span style={{color: "var(--ntt-gray-100)", fontSize: 20}}> / 31</span></div>
            </div>
          </div>

          {/* EU base card */}
          <div style={{background: "var(--ntt-smart-navy)", color: "white", padding: "20px 24px", borderRadius: 4, display: "flex", alignItems: "center", gap: 16, marginBottom: 20, position: "relative", overflow: "hidden"}}>
            <div style={{position: "absolute", right: -40, top: -40, width: 160, height: 160, backgroundImage: "url('assets/innovation-curve-twothirds-white.svg')", backgroundSize: "contain", backgroundRepeat: "no-repeat", opacity: 0.1}}/>
            <div style={{fontSize: 28, zIndex: 2}}>🇪🇺</div>
            <div style={{flex: 1, zIndex: 2}}>
              <div style={{fontSize: 14, fontWeight: 700}}>Direttiva UE 2023/970</div>
              <div style={{fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2}}>Base normativa sempre inclusa. Usata come riferimento per ogni paese analizzato.</div>
            </div>
            <span className="badge badge-green" style={{zIndex: 2}}><span className="badge-dot"/>Definitivo</span>
            <span className="badge" style={{background: "rgba(255,255,255,0.1)", color: "white", zIndex: 2}}>Base · sempre inclusa</span>
          </div>

          {/* Search + filter row */}
          <div style={{display: "flex", gap: 12, marginBottom: 20, alignItems: "center"}}>
            <div style={{position: "relative", flex: 1, maxWidth: 360}}>
              <div style={{position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ntt-gray-100)"}}><Icon name="search" size={14}/></div>
              <input className="input" placeholder="Cerca paese…" style={{paddingLeft: 38}} />
            </div>
            <div style={{display: "flex", gap: 6, alignItems: "center", fontSize: 12}}>
              <span className="badge badge-green"><span className="badge-dot"/>0 definitivi</span>
              <span className="badge badge-yellow"><span className="badge-dot"/>1 in bozza</span>
              <span className="badge badge-gray">30 non disponibili</span>
            </div>
          </div>

          {/* Bozza warning (italia selezionata) */}
          <div className="alert alert-warn" style={{marginBottom: 24}}>
            <Icon name="warn" size={20} className="alert-icon" style={{color: "#8B6B00"}}/>
            <div className="alert-body">
              <strong>Attenzione: la normativa per Italia è in stato di bozza.</strong>
              I contenuti e gli obblighi qui descritti potrebbero cambiare prima dell'adozione definitiva. Il report rifletterà questa incertezza e dovrà essere rivisto quando la normativa sarà approvata.
            </div>
          </div>

          {variant === "list" ? (
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
              {countries.map(c => {
                const isSel = selected.includes(c.code);
                const isDisabled = c.status === "none";
                return (
                  <div key={c.code} className={`country-row ${isSel ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}>
                    <span className="country-flag">{c.flag}</span>
                    <div>
                      <div className="country-name">{c.name}</div>
                      <div style={{fontSize: 11, color: "var(--ntt-gray-100)", marginTop: 2}}>{c.code}</div>
                    </div>
                    <StatusBadge status={c.status}/>
                    <div className="country-check">
                      {isSel && <Icon name="check" size={12} color="white"/>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10}}>
              {countries.map(c => {
                const isSel = selected.includes(c.code);
                const isDisabled = c.status === "none";
                return (
                  <div key={c.code} className={`country-card ${isSel ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}>
                    <div className="country-card-check">
                      {isSel && <Icon name="check" size={14} color="white" style={{margin: 1}}/>}
                    </div>
                    <div className="country-flag">{c.flag}</div>
                    <div className="country-name">{c.name}</div>
                    <div style={{flex: 1}}/>
                    <StatusBadge status={c.status}/>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{display: "flex", justifyContent: "space-between", marginTop: 32, alignItems: "center"}}>
            <button className="btn btn-secondary"><Icon name="arrow-left" size={14}/> Indietro</button>
            <div style={{display: "flex", gap: 12, alignItems: "center"}}>
              <span style={{fontSize: 12, color: "var(--ntt-gray-100)"}}><strong style={{color: "var(--ntt-smart-navy)"}}>1</strong> paese selezionato (minimo 1)</span>
              <button className="btn btn-primary">Avanti · Maturità <Icon name="arrow-right" size={14}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
window.Step2Countries = Step2Countries;
