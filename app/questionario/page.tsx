'use client';

import { useRouter } from 'next/navigation';
import { useAssessment } from '@/components/assessment-context';
import { SessionHeader } from '@/components/session-header';

const sectors = ['bancario', 'assicurativo', 'telco & media', 'farmaceutico', 'energy', 'retail', 'trasporti', 'automotive', 'public sector', 'altro'];
const ranges = ['<50', '50-99', '100-149', '150-249', '250-499', '500-999', '1000+'];
const models = ['mono-entità nazionale', 'multi-entità nazionale', 'gruppo internazionale con HQ in Italia', 'filiale/branch di gruppo estero', 'altro'];

export default function QuestionarioPage() {
  const { company, setCompany } = useAssessment();
  const router = useRouter();

  const canProceed = Object.values(company).every(Boolean);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <SessionHeader />
      <h1 className="mb-5 text-3xl font-bold text-navy">Questionario — Dati azienda</h1>
      <div className="card grid gap-4">
        {([
          ['company_name', 'Nome azienda'],
          ['sector', 'Settore'],
          ['employee_range', 'Fascia dipendenti'],
          ['organizational_model', 'Modello organizzativo'],
        ] as const).map(([k, label]) => (
          <label key={k}>
            <span className="mb-1 block text-sm font-medium">{label}</span>
            {k === 'sector' || k === 'employee_range' || k === 'organizational_model' ? (
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={company[k]}
                onChange={(e) => setCompany({ ...company, [k]: e.target.value })}
              >
                <option value="">Seleziona</option>
                {(k === 'sector' ? sectors : k === 'employee_range' ? ranges : models).map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            ) : (
              <input className="w-full rounded border border-slate-300 px-3 py-2" value={company[k]} onChange={(e) => setCompany({ ...company, [k]: e.target.value })} />
            )}
          </label>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button disabled={!canProceed} className="btn btn-primary disabled:opacity-40" onClick={() => router.push('/maturita')}>
          Avanti
        </button>
      </div>
    </main>
  );
}
