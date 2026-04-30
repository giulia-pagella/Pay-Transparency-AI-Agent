'use client';

import { useRouter } from 'next/navigation';
import { useAssessment } from '@/components/assessment-context';
import { SessionHeader } from '@/components/session-header';
import { Icon } from '@/components/icon';

const sectors = ['Bancario', 'Assicurativo', 'Telco & Media', 'Farmaceutico', 'Energy', 'Retail', 'Trasporti', 'Automotive', 'Public Sector', 'Altro'];
const ranges  = ['<50', '50-99', '100-149', '150-249', '250-499', '500-999', '1000+'];
const models  = ['Mono-entità nazionale', 'Multi-entità nazionale', 'Gruppo internazionale con HQ in Italia', 'Filiale/branch di gruppo estero', 'Altro'];

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

export default function QuestionarioPage() {
  const { company, setCompany } = useAssessment();
  const router = useRouter();
  const canProceed = Object.values(company).every(Boolean);

  return (
    <div className="ptt-screen">
      <SessionHeader />
      <div style={{ flex: 1, overflowY: 'auto', background: '#FAFBFC' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 48px 80px' }}>
          <div style={{ marginBottom: 36 }}>
            <Stepper current={0} />
          </div>

          <div className="eyebrow" style={{ marginBottom: 14 }}>QUESTIONARIO · STEP 1 DI 3</div>
          <h1 className="serif" style={{ fontSize: 36, lineHeight: 1.15, margin: '0 0 10px', color: 'var(--ntt-smart-navy)' }}>
            Iniziamo dal contesto della tua azienda.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ntt-text-gray)', margin: '0 0 32px', maxWidth: 580, lineHeight: 1.6 }}>
            Questi dati aiutano il sistema a inquadrare l&apos;assessment. Non vengono salvati in alcun database e non compariranno nei log.
          </p>

          <div className="card" style={{ padding: 36 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 22 }}>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">Nome azienda <span style={{ color: 'var(--ntt-orange-100)' }}>*</span></label>
                <input
                  className="ntt-input"
                  placeholder="es. Acme S.p.A."
                  value={company.company_name}
                  onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="field-label">Settore <span style={{ color: 'var(--ntt-orange-100)' }}>*</span></label>
                <select className="ntt-select" value={company.sector} onChange={(e) => setCompany({ ...company, sector: e.target.value })}>
                  <option value="">Seleziona</option>
                  {sectors.map((s) => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                </select>
              </div>

              <div className="field">
                <label className="field-label">Fascia dipendenti <span style={{ color: 'var(--ntt-orange-100)' }}>*</span></label>
                <select className="ntt-select" value={company.employee_range} onChange={(e) => setCompany({ ...company, employee_range: e.target.value })}>
                  <option value="">Seleziona</option>
                  {ranges.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <span className="field-hint">Le fasce ≥100 attivano obblighi incrementali della Direttiva UE (100 / 150 / 250).</span>
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">Modello organizzativo <span style={{ color: 'var(--ntt-orange-100)' }}>*</span></label>
                <select className="ntt-select" value={company.organizational_model} onChange={(e) => setCompany({ ...company, organizational_model: e.target.value })}>
                  <option value="">Seleziona</option>
                  {models.map((m) => <option key={m} value={m.toLowerCase()}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="alert alert-info">
              <Icon name="shield" size={18} className="alert-icon" style={{ color: 'var(--ntt-future-blue-150)' }} />
              <div className="alert-body">
                <strong>I tuoi dati restano in sessione.</strong>
                Conservati in memoria server-side per 4 ore e cancellati alla chiusura. Nessun database, nessuna telemetria.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, alignItems: 'center' }}>
            <button className="btn btn-tertiary" onClick={() => router.push('/')}>
              <Icon name="arrow-left" size={14} /> Torna alla landing
            </button>
            <button className="btn btn-primary" disabled={!canProceed} onClick={() => router.push('/maturita')}>
              Avanti · Maturità <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
