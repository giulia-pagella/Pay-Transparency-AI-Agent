'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import maturityData from '@/data/maturity-assessment.json';
import { useAssessment } from '@/components/assessment-context';
import { SessionHeader } from '@/components/session-header';
import { Icon } from '@/components/icon';

function Stepper({ current }: { current: number }) {
  const steps = [
    { caption: 'STEP 01', title: 'Dati azienda' },
    { caption: 'STEP 02', title: 'Maturità' },
    { caption: 'STEP 03', title: 'Paesi' },
  ];
  return (
    <div className="stepper">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'todo';
        return (
          <div key={i} style={{ display: 'contents' }}>
            <div className={`stepper-item ${state}`}>
              <span className="stepper-dot">
                {state === 'done' ? <Icon name="check" size={13} /> : i + 1}
              </span>
              <div className="stepper-text">
                <span className="stepper-caption">{s.caption}</span>
                <span className="stepper-title">{s.title}</span>
              </div>
            </div>
            {i < steps.length - 1 && <div className={`stepper-line ${state === 'done' ? 'done' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function MaturitaPage() {
  const { maturity: selections, setMaturity } = useAssessment();
  const router = useRouter();
  const compiled = useMemo(
    () => Object.values(selections).filter((v) => v !== null && v !== undefined).length,
    [selections],
  );

  return (
    <div className="ptt-screen">
      <SessionHeader />
      <div style={{ flex: 1, overflowY: 'auto', background: '#FAFBFC' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '36px 48px 80px' }}>
          <div style={{ marginBottom: 36 }}>
            <Stepper current={1} />
          </div>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 32 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>QUESTIONARIO · STEP 2 DI 3</div>
              <h1 className="serif" style={{ fontSize: 36, lineHeight: 1.15, margin: '0 0 10px', color: 'var(--ntt-smart-navy)' }}>
                Dove si posiziona la tua organizzazione oggi?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ntt-text-gray)', margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
                Per ogni area seleziona il livello che descrive meglio la tua situazione attuale. Le aree con il filetto blu hanno obblighi diretti dalla Direttiva.
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--ntt-gray-100)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>Aree compilate</div>
              <div className="serif" style={{ fontSize: 34, color: compiled >= 6 ? 'var(--ntt-future-blue)' : 'var(--ntt-orange-100)', lineHeight: 1 }}>
                {compiled}<span style={{ color: 'var(--ntt-gray-100)', fontSize: 18 }}> / 9</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: compiled >= 6 ? 'var(--ntt-green-150)' : 'var(--ntt-orange-150)' }}>
                {compiled >= 6 ? '✓ Minimo raggiunto' : 'Servono almeno 6 aree'}
              </div>
            </div>
          </div>

          {/* Partial data alert */}
          {compiled >= 6 && compiled < 9 && (
            <div className="alert alert-warn" style={{ marginBottom: 24 }}>
              <Icon name="info" size={18} className="alert-icon" style={{ color: '#8B6B00' }} />
              <div className="alert-body">
                <strong>Assessment parziale</strong>
                Hai compilato {compiled} aree su 9. Puoi procedere, ma nel report comparirà un flag <strong>&quot;DATI PARZIALI&quot;</strong>. Per un&apos;analisi completa, compila anche le aree rimanenti.
              </div>
            </div>
          )}

          {/* Area cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {maturityData.areas.map((area, idx) => {
              const sel = selections[area.id] ?? null;
              return (
                <div key={area.id} className={`maturity-area ${area.has_direct_obligation ? 'has-obligation' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span className="serif" style={{ fontSize: 16, color: 'var(--ntt-gray-100)', fontVariantNumeric: 'tabular-nums' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{area.name}</h3>
                        {area.has_direct_obligation && (
                          <span className="info-inline"><Icon name="flag" size={10} /> Obbligo diretto UE</span>
                        )}
                        {sel === null && (
                          <span className="badge badge-gray">Non valutata</span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--ntt-text-gray)', lineHeight: 1.5 }}>{area.description}</p>
                    </div>
                    {sel !== null && (
                      <button
                        onClick={() => setMaturity({ ...selections, [area.id]: null })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ntt-gray-100)', fontSize: 11, padding: '4px 0', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        Rimuovi selezione
                      </button>
                    )}
                  </div>

                  <div className="maturity-levels">
                    {area.levels.map((lv) => {
                      const isSel = sel === lv.value;
                      return (
                        <button
                          key={lv.value}
                          className={`maturity-level ${isSel ? 'selected' : ''}`}
                          onClick={() => setMaturity({ ...selections, [area.id]: lv.value })}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="maturity-level-num">0{lv.value}</span>
                            {isSel && <Icon name="check" size={13} color="var(--ntt-future-blue-50)" />}
                          </div>
                          <div className="maturity-level-label">{lv.label}</div>
                          <div className="maturity-level-bullet">{lv.bullet}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, alignItems: 'center', paddingTop: 24, borderTop: '1px solid var(--ntt-gray-50)' }}>
            <button className="btn btn-secondary" onClick={() => router.push('/questionario')}>
              <Icon name="arrow-left" size={14} /> Indietro · Dati azienda
            </button>
            <button className="btn btn-primary btn-lg" disabled={compiled < 6} onClick={() => router.push('/paesi')}>
              Avanti · Paesi <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
