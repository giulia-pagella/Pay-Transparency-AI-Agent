import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icon';

export default function LandingPage() {
  return (
    <div className="ptt-screen">
      {/* Header */}
      <header className="ptt-header">
        <div className="ptt-header-left">
          <Image src="/assets/logo-nttdata-blue.svg" alt="NTT DATA" width={88} height={22} className="ptt-header-logo" priority />
          <div className="ptt-header-divider" />
          <div>
            <div className="ptt-header-product">Pay Transparency Assessment</div>
            <div className="ptt-header-product-sub">HR Advisory · EU Directive 2023/970</div>
          </div>
        </div>
        <div className="ptt-header-right">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--ntt-future-blue-150)', textDecoration: 'none', fontWeight: 700 }}
          >
            Come ottenere una chiave API
          </a>
        </div>
      </header>

      {/* Two-column body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left column */}
        <div style={{ flex: '1.3', padding: '64px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>HR ADVISORY · PAY TRANSPARENCY</div>
          <h1
            className="serif"
            style={{ fontSize: 52, lineHeight: 1.07, letterSpacing: '-0.015em', color: 'var(--ntt-smart-navy)', margin: '0 0 24px', maxWidth: 580 }}
          >
            Preparati alla Direttiva UE{' '}
            <span style={{ color: 'var(--ntt-future-blue)' }}>2023/970</span>{' '}
            con un assessment guidato.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ntt-text-gray)', maxWidth: 520, margin: '0 0 36px' }}>
            Uno strumento AI che confronta i requisiti normativi tra paesi europei, analizza gli impatti sulle aree HR e produce un report strutturato in pochi minuti. Non sostituisce la consulenza legale.
          </p>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 48 }}>
            <Link href="/configurazione" className="btn btn-primary btn-lg">
              Inizia assessment <Icon name="arrow-right" size={16} />
            </Link>
          </div>

          {/* Quick facts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28, borderTop: '1px solid var(--ntt-gray-50)', paddingTop: 28, maxWidth: 560 }}>
            {[
              { n: '9',      l: 'aree HR valutate',      s: 'Dal talent attraction al reporting' },
              { n: '31',     l: 'paesi mappati',          s: 'UE + UK, CH, NO' },
              { n: '~5 min', l: 'per il questionario',   s: 'Report generato in ~60 sec' },
            ].map((x) => (
              <div key={x.l}>
                <div className="serif" style={{ fontSize: 34, color: 'var(--ntt-future-blue)', lineHeight: 1, marginBottom: 6 }}>{x.n}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ntt-smart-navy)', marginBottom: 3 }}>{x.l}</div>
                <div style={{ fontSize: 12, color: 'var(--ntt-gray-100)' }}>{x.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — navy panel */}
        <div style={{ flex: 1, background: 'var(--ntt-smart-navy)', color: 'white', padding: '64px 52px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', right: -100, top: -80, width: 500, height: 500, backgroundImage: "url('/assets/innovation-curve-twothirds-white.svg')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', opacity: 0.12 }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 400 }}>
            <div className="eyebrow" style={{ color: 'var(--ntt-future-blue-50)', marginBottom: 18 }}>COSA OTTIENI</div>
            <h2 className="serif" style={{ fontSize: 25, fontWeight: 400, lineHeight: 1.3, color: 'white', margin: '0 0 28px' }}>
              Un report leggibile, basato solo su fonti normative verificate.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { icon: 'layers'    as const, t: 'Confronto multi-country',       d: 'Affianca Direttiva UE e recepimenti nazionali' },
                { icon: 'target'    as const, t: 'Livello di attenzione per area', d: '9 aree HR, priorità calcolate in modo deterministico' },
                { icon: 'lightbulb' as const, t: 'Raccomandazioni preliminari',    d: 'Ordinate per priorità e collegate alla fonte' },
                { icon: 'shield'    as const, t: 'Privacy by design',              d: 'Nessun log, nessun DB. Chiave API solo in sessione' },
              ].map((x) => (
                <div key={x.t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 34, height: 34, border: '1px solid rgba(255,255,255,.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--ntt-future-blue-50)' }}>
                    <Icon name={x.icon} size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{x.t}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>{x.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.12)', fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>
              Powered by Google Gemini 2.5 Flash. Il tool utilizza esclusivamente fonti normative integrate nel sistema e non attinge a conoscenza esterna.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
