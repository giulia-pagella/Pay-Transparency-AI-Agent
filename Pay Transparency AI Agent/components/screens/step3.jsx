// Screen 4: Step 3 — Maturità (card variant)
const Step3Maturity = ({ variant = "cards" }) => {
  const areas = window.PTT_DATA.areas;
  // Scenario 100-149 retail with partial data: 7/9 compiled
  const selections = {
    talent_attraction: 2,
    recruiting: 1,
    pay_structure: 2,
    job_architecture: 2,
    performance: 3,
    career_paths: null,
    governance: 1,
    data_payroll: 2,
    communication: null
  };
  const compiled = Object.values(selections).filter(v => v !== null).length;

  if (variant === "radar") return <Step3Radar selections={selections} compiled={compiled} />;

  return (
    <div className="ptt-screen">
      <Chrome />
      <Header />
      <div style={{flex: 1, overflow: "auto", background: "#FAFBFC"}}>
        <div style={{maxWidth: 1040, margin: "0 auto", padding: "40px 48px 80px"}}>
          <div style={{marginBottom: 40}}><Stepper current={2} /></div>

          <div style={{display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, gap: 32}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 16}}>QUESTIONARIO · STEP 3 DI 3</div>
              <h1 className="serif" style={{fontSize: 40, lineHeight: 1.15, margin: 0, marginBottom: 12, color: "var(--ntt-smart-navy)"}}>
                Dove si posiziona la tua organizzazione oggi?
              </h1>
              <p style={{fontSize: 15, color: "var(--ntt-text-gray)", margin: 0, maxWidth: 680}}>
                Per ogni area, seleziona il livello che descrive meglio la tua situazione attuale. Le aree con il filetto blu hanno obblighi diretti dalla Direttiva. Puoi lasciare un'area non valutata.
              </p>
            </div>
            <div style={{textAlign: "right", flexShrink: 0}}>
              <div style={{fontSize: 12, color: "var(--ntt-gray-100)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700}}>Aree compilate</div>
              <div className="serif" style={{fontSize: 36, color: compiled >= 6 ? "var(--ntt-future-blue)" : "var(--ntt-orange-100)", lineHeight: 1}}>
                {compiled}<span style={{color: "var(--ntt-gray-100)", fontSize: 20}}> / 9</span>
              </div>
              <div style={{fontSize: 11, color: compiled >= 6 ? "var(--ntt-green-150)" : "var(--ntt-orange-150)", marginTop: 4, fontWeight: 700}}>
                {compiled >= 6 ? "✓ Minimo raggiunto" : "Servono almeno 6 aree"}
              </div>
            </div>
          </div>

          {compiled < 9 && compiled >= 6 && (
            <div className="alert alert-warn" style={{marginBottom: 24}}>
              <Icon name="info" size={20} className="alert-icon" style={{color: "#8B6B00"}}/>
              <div className="alert-body">
                <strong>Assessment parziale</strong>
                Hai compilato {compiled} aree su 9. Puoi procedere, ma nel report comparirà un flag <strong>"DATI PARZIALI"</strong>. Per un'analisi completa, compila anche le aree rimanenti.
              </div>
            </div>
          )}

          <div style={{display: "flex", flexDirection: "column", gap: 16}}>
            {areas.map((a, idx) => {
              const sel = selections[a.id];
              return (
                <div key={a.id} className={`maturity-area ${a.hasDirectObligation ? "has-obligation" : ""}`}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24}}>
                    <div style={{flex: 1}}>
                      <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 6}}>
                        <span style={{fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ntt-gray-100)", fontVariantNumeric: "tabular-nums"}}>
                          {String(idx+1).padStart(2, "0")}
                        </span>
                        <h3 style={{margin: 0, fontSize: 17, fontWeight: 700, color: "var(--ntt-smart-navy)"}}>{a.name}</h3>
                        {a.hasDirectObligation && (
                          <span className="info-inline">
                            <Icon name="flag" size={11}/> Obbligo diretto UE
                          </span>
                        )}
                        {sel === null && (
                          <span className="badge badge-gray">Non valutata</span>
                        )}
                      </div>
                      <p style={{margin: 0, fontSize: 13, color: "var(--ntt-text-gray)", maxWidth: 780, lineHeight: 1.5}}>{a.description}</p>
                    </div>
                  </div>

                  <div className="maturity-levels">
                    {a.levels.map(lv => {
                      const isSel = sel === lv.value;
                      return (
                        <div key={lv.value} className={`maturity-level ${isSel ? "selected" : ""}`}>
                          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <span className="maturity-level-num">0{lv.value}</span>
                            {isSel && <Icon name="check" size={14} color="var(--ntt-future-blue-50)"/>}
                          </div>
                          <div className="maturity-level-label">{lv.label}</div>
                          <div className="maturity-level-bullet">{lv.bullet}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{display: "flex", justifyContent: "space-between", marginTop: 40, alignItems: "center", paddingTop: 24, borderTop: "1px solid var(--ntt-gray-50)"}}>
            <button className="btn btn-secondary"><Icon name="arrow-left" size={14}/> Indietro · Paesi</button>
            <button className="btn btn-primary btn-lg">
              <Icon name="sparkle" size={16}/> Genera report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Radar variant
const Step3Radar = ({ selections, compiled }) => {
  const areas = window.PTT_DATA.areas;
  const cx = 200, cy = 200, R = 150;
  const n = areas.length;
  const pointsFor = (val) => {
    const ratio = (val || 0) / 4;
    return areas.map((a, i) => {
      const v = selections[a.id];
      const r = ((v || 0) / 4) * R;
      const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
    });
  };
  const pts = pointsFor();
  const polyPts = pts.map(p => p.join(",")).join(" ");

  return (
    <div className="ptt-screen">
      <Chrome />
      <Header />
      <div style={{flex: 1, overflow: "auto", background: "#FAFBFC"}}>
        <div style={{maxWidth: 1040, margin: "0 auto", padding: "40px 48px 80px"}}>
          <div style={{marginBottom: 40}}><Stepper current={2} /></div>

          <div style={{display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, gap: 32}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 16}}>QUESTIONARIO · STEP 3 · VISTA RADAR</div>
              <h1 className="serif" style={{fontSize: 40, lineHeight: 1.15, margin: 0, marginBottom: 12, color: "var(--ntt-smart-navy)"}}>
                Mappa la maturità in un colpo d'occhio.
              </h1>
              <p style={{fontSize: 15, color: "var(--ntt-text-gray)", margin: 0, maxWidth: 680}}>
                Vista alternativa: clicca un'area per modificarne il livello, visualizza il profilo di maturità in tempo reale.
              </p>
            </div>
            <div style={{textAlign: "right", flexShrink: 0}}>
              <div style={{fontSize: 12, color: "var(--ntt-gray-100)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700}}>Aree compilate</div>
              <div className="serif" style={{fontSize: 36, color: "var(--ntt-future-blue)", lineHeight: 1}}>{compiled}<span style={{color: "var(--ntt-gray-100)", fontSize: 20}}> / 9</span></div>
            </div>
          </div>

          <div className="card" style={{padding: 32, display: "flex", gap: 40, alignItems: "flex-start"}}>
            {/* Radar */}
            <div style={{flexShrink: 0}}>
              <svg width="440" height="440" viewBox="0 0 440 440">
                <g transform="translate(20, 20)">
                  {/* Rings */}
                  {[1,2,3,4].map(k => {
                    const r = (k/4) * R;
                    const ringPts = areas.map((_, i) => {
                      const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
                      return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)].join(",");
                    }).join(" ");
                    return <polygon key={k} points={ringPts} fill={k===4 ? "#FAFBFC" : "none"} stroke="var(--ntt-gray-50)" strokeWidth="1"/>;
                  })}
                  {/* Spokes */}
                  {areas.map((_, i) => {
                    const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
                    return <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(ang)} y2={cy + R * Math.sin(ang)} stroke="var(--ntt-gray-50)" strokeWidth="1"/>;
                  })}
                  {/* Data polygon */}
                  <polygon points={polyPts} fill="rgba(0,114,188,0.18)" stroke="var(--ntt-future-blue)" strokeWidth="2" strokeLinejoin="round"/>
                  {/* Dots */}
                  {pts.map((p, i) => {
                    const v = selections[areas[i].id];
                    if (v === null) return null;
                    return <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="var(--ntt-future-blue)" stroke="white" strokeWidth="2"/>;
                  })}
                  {/* Labels */}
                  {areas.map((a, i) => {
                    const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
                    const lx = cx + (R + 28) * Math.cos(ang);
                    const ly = cy + (R + 28) * Math.sin(ang);
                    return (
                      <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="var(--ntt-smart-navy)" fontFamily="var(--font-sans)">
                        {String(i+1).padStart(2,"0")} {a.name.split(" ")[0]}
                      </text>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* List */}
            <div className="radar-list" style={{flex: 1}}>
              {areas.map((a, i) => {
                const v = selections[a.id];
                return (
                  <div key={a.id} style={{display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 2, background: v ? "#F6FAFD" : "transparent", borderLeft: a.hasDirectObligation ? "2px solid var(--ntt-future-blue)" : "2px solid transparent", cursor: "pointer"}}>
                    <span style={{fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--ntt-gray-100)", width: 22, flexShrink: 0}}>{String(i+1).padStart(2,"0")}</span>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontSize: 13, fontWeight: 700, color: "var(--ntt-smart-navy)"}}>{a.name}</div>
                      <div style={{fontSize: 11, color: "var(--ntt-gray-100)"}}>{v ? a.levels[v-1].label : "Non valutata"}</div>
                    </div>
                    <div style={{display: "flex", gap: 4}}>
                      {[1,2,3,4].map(k => (
                        <div key={k} style={{width: 18, height: 18, borderRadius: 2, background: v && k<=v ? "var(--ntt-future-blue)" : "var(--ntt-gray-50)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700}}>
                          {k}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{display: "flex", justifyContent: "space-between", marginTop: 40, alignItems: "center"}}>
            <button className="btn btn-secondary"><Icon name="arrow-left" size={14}/> Indietro</button>
            <button className="btn btn-primary btn-lg">
              <Icon name="sparkle" size={16}/> Genera report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Step3Maturity = Step3Maturity;
