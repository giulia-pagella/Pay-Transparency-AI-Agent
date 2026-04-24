// Shared tiny components: chrome, header, buttons
const { useState, useEffect, useRef, useMemo } = React;

const Icon = ({ name, size = 16, color, style }) => {
  const s = size;
  const stroke = color || "currentColor";
  const paths = {
    "arrow-right": <polyline points="10,5 17,12 10,19" />,
    "arrow-left": <polyline points="14,5 7,12 14,19" />,
    "arrow-down": <polyline points="5,10 12,17 19,10" />,
    "plus": <g><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></g>,
    "check": <polyline points="5,12 10,17 19,7" />,
    "x": <g><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g>,
    "info": <g><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="17"/><circle cx="12" cy="7.5" r="0.2" fill={stroke} stroke="none" /></g>,
    "warn": <g><path d="M12 3 L22 20 L2 20 Z"/><line x1="12" y1="10" x2="12" y2="14" /><circle cx="12" cy="17" r="0.2" fill={stroke} stroke="none"/></g>,
    "lock": <g><rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11 V7 a4 4 0 0 1 8 0 V11"/></g>,
    "download": <g><path d="M12 4 V16"/><polyline points="7,11 12,16 17,11"/><line x1="4" y1="20" x2="20" y2="20"/></g>,
    "edit": <g><path d="M4 20 L8 19 L20 7 L17 4 L5 16 Z"/></g>,
    "refresh": <g><path d="M20 11 A8 8 0 1 0 18 17"/><polyline points="20,5 20,11 14,11"/></g>,
    "file": <g><path d="M7 3 H14 L19 8 V21 H7 Z"/><polyline points="14,3 14,8 19,8"/></g>,
    "key": <g><circle cx="8" cy="14" r="4"/><path d="M11 13 L20 4 M17 7 L20 10 M15 9 L17 11"/></g>,
    "eye": <g><path d="M2 12 Q12 4 22 12 Q12 20 2 12 Z"/><circle cx="12" cy="12" r="3"/></g>,
    "globe": <g><circle cx="12" cy="12" r="9"/><path d="M3 12 H21 M12 3 Q7 12 12 21 M12 3 Q17 12 12 21"/></g>,
    "lightbulb": <g><path d="M9 18 H15 M10 21 H14 M8 14 Q6 10 8 7 A5 5 0 0 1 16 7 Q18 10 16 14 Z"/></g>,
    "chart": <g><line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="12" width="3" height="8"/><rect x="11" y="8" width="3" height="12"/><rect x="16" y="4" width="3" height="16"/></g>,
    "user": <g><circle cx="12" cy="8" r="4"/><path d="M4 20 Q12 14 20 20"/></g>,
    "shield": <g><path d="M12 3 L20 6 V12 Q20 18 12 21 Q4 18 4 12 V6 Z"/></g>,
    "clock": <g><circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 15,14"/></g>,
    "sparkle": <g><path d="M12 3 L13 10 L20 12 L13 14 L12 21 L11 14 L4 12 L11 10 Z"/></g>,
    "search": <g><circle cx="11" cy="11" r="6"/><line x1="16" y1="16" x2="20" y2="20"/></g>,
    "document": <g><path d="M6 3 H14 L18 7 V21 H6 Z"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="9" y1="17" x2="13" y2="17"/></g>,
    "external": <g><path d="M14 4 H20 V10 M20 4 L12 12 M8 6 H5 V19 H18 V16"/></g>,
    "flag": <g><path d="M5 4 V21 M5 4 H15 L13 8 L15 12 H5"/></g>,
    "layers": <g><path d="M12 3 L3 8 L12 13 L21 8 Z"/><path d="M3 13 L12 18 L21 13"/></g>,
    "menu": <g><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/></g>,
    "chevron-right": <polyline points="9,5 16,12 9,19"/>,
    "chevron-down": <polyline points="5,9 12,16 19,9"/>,
    "circle": <circle cx="12" cy="12" r="9"/>,
    "target": <g><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill={stroke} stroke="none"/></g>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name]}
    </svg>
  );
};

// Browser chrome
const Chrome = ({ url = "paytransparency.nttdata.com" }) => (
  <div className="ptt-chrome">
    <div className="ptt-chrome-dots"><span/><span/><span/></div>
    <div className="ptt-chrome-url">
      <Icon name="lock" size={10} /> <span style={{marginLeft: 6}}>{url}</span>
    </div>
    <div style={{width: 40}} />
  </div>
);

// Product header (shows session UI only on post-landing screens)
const Header = ({ showSession = true, variant = "default" }) => (
  <div className="ptt-header">
    <div className="ptt-header-left">
      <img src="assets/logo-nttdata-blue.svg" className="ptt-header-logo" alt="NTT DATA" />
      <div className="ptt-header-divider" />
      <div>
        <div className="ptt-header-product">Pay Transparency Assessment</div>
        <div className="ptt-header-product-sub">HR Advisory · EU Directive 2023/970</div>
      </div>
    </div>
    <div className="ptt-header-right">
      {showSession && (
        <>
          <div className="ptt-session">
            <span className="ptt-session-dot" />
            <span>Sessione attiva</span>
            <span className="ptt-session-time">03:42:11</span>
          </div>
          <button className="ptt-btn-ghost">
            <Icon name="x" size={12} /> Chiudi sessione
          </button>
        </>
      )}
      {!showSession && (
        <>
          <a href="#" className="ptt-session" style={{textDecoration: "none"}}>Come ottenere una chiave API</a>
          <button className="ptt-btn-ghost">IT · EN</button>
        </>
      )}
    </div>
  </div>
);

// Stepper
const Stepper = ({ current }) => {
  const steps = [
    { caption: "STEP 01", title: "Dati azienda" },
    { caption: "STEP 02", title: "Paesi" },
    { caption: "STEP 03", title: "Maturità" }
  ];
  return (
    <div className="stepper">
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <React.Fragment key={i}>
            <div className={`stepper-item ${state}`}>
              <span className="stepper-dot">
                {state === "done" ? <Icon name="check" size={14} /> : i + 1}
              </span>
              <div className="stepper-text">
                <span className="stepper-caption">{s.caption}</span>
                <span className="stepper-title">{s.title}</span>
              </div>
            </div>
            {i < steps.length - 1 && <div className={`stepper-line ${i < current ? "done" : ""}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

window.Icon = Icon;
window.Chrome = Chrome;
window.Header = Header;
window.Stepper = Stepper;
