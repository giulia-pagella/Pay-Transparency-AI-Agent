// Screen 2: Step 1 — Dati azienda
const Step1Company = () => (
  <div className="ptt-screen">
    <Chrome />
    <Header />
    <div style={{flex: 1, overflow: "auto", background: "#FAFBFC"}}>
      <div style={{maxWidth: 920, margin: "0 auto", padding: "40px 48px 80px"}}>
        <div style={{marginBottom: 40}}>
          <Stepper current={0} />
        </div>

        <div className="eyebrow" style={{marginBottom: 16}}>QUESTIONARIO · STEP 1 DI 3</div>
        <h1 className="serif" style={{fontSize: 40, lineHeight: 1.15, margin: 0, marginBottom: 12, color: "var(--ntt-smart-navy)"}}>
          Iniziamo dal contesto della tua azienda.
        </h1>
        <p style={{fontSize: 15, color: "var(--ntt-text-gray)", marginBottom: 40, maxWidth: 640}}>
          Questi dati aiutano il sistema a inquadrare l'assessment. Non vengono salvati in alcun database e non compariranno nei log.
        </p>

        <div className="card" style={{padding: 40}}>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24}}>
            <div className="field" style={{gridColumn: "1 / -1"}}>
              <label className="field-label">Nome azienda <span style={{color: "var(--ntt-orange-100)"}}>*</span></label>
              <input className="input" value="Aurora Retail S.p.A." readOnly />
            </div>

            <div className="field">
              <label className="field-label">Settore <span style={{color: "var(--ntt-orange-100)"}}>*</span></label>
              <select className="select" defaultValue="retail">
                <option value="retail">Retail</option>
                <option>Bancario</option><option>Assicurativo</option><option>Telco & Media</option>
                <option>Farmaceutico</option><option>Energy</option><option>Trasporti</option>
                <option>Automotive</option><option>Public Sector</option><option>Altro</option>
              </select>
            </div>

            <div className="field">
              <label className="field-label">Fascia dipendenti <span style={{color: "var(--ntt-orange-100)"}}>*</span></label>
              <select className="select" defaultValue="100-149">
                <option>&lt;50</option><option>50-99</option>
                <option value="100-149">100-149</option>
                <option>150-249</option><option>250-499</option>
                <option>500-999</option><option>1000+</option>
              </select>
              <span className="field-hint">Le fasce ≥100 attivano obblighi incrementali della Direttiva UE (100 / 150 / 250).</span>
            </div>

            <div className="field" style={{gridColumn: "1 / -1"}}>
              <label className="field-label">Modello organizzativo <span style={{color: "var(--ntt-orange-100)"}}>*</span></label>
              <select className="select" defaultValue="mono">
                <option value="mono">Mono-entità nazionale</option>
                <option>Multi-entità nazionale</option>
                <option>Gruppo internazionale con HQ in Italia</option>
                <option>Filiale/branch di gruppo estero</option>
                <option>Altro</option>
              </select>
            </div>
          </div>

          <div className="alert alert-info" style={{marginTop: 8}}>
            <Icon name="shield" size={20} style={{flexShrink: 0, color: "var(--ntt-future-blue-150)"}}/>
            <div className="alert-body">
              <strong>I tuoi dati restano in sessione.</strong>
              Il questionario è conservato in memoria server-side per 4 ore e cancellato alla chiusura. Nessun database, nessuna telemetria, nessuna condivisione con terze parti.
            </div>
          </div>
        </div>

        <div style={{display: "flex", justifyContent: "space-between", marginTop: 32, alignItems: "center"}}>
          <button className="btn btn-tertiary"><Icon name="arrow-left" size={14}/> Torna alla landing</button>
          <div style={{display: "flex", gap: 12}}>
            <span style={{fontSize: 12, color: "var(--ntt-gray-100)", alignSelf: "center", marginRight: 8}}>Bozza salvata automaticamente</span>
            <button className="btn btn-primary">Avanti · Paesi <Icon name="arrow-right" size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
window.Step1Company = Step1Company;
