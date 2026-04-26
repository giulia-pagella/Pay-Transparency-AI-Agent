'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import maturity from '@/data/maturity-assessment.json';
import { useAssessment } from '@/components/assessment-context';
import { SessionHeader } from '@/components/session-header';

export default function MaturitaPage() {
  const { maturity: selections, setMaturity } = useAssessment();
  const router = useRouter();
  const compiled = useMemo(
    () => Object.values(selections).filter((v) => v !== null && v !== undefined).length,
    [selections],
  );

  return (
    <main className="mx-auto max-w-6xl p-8">
      <SessionHeader />
      <h1 className="mb-2 text-3xl font-bold text-navy">Questionario — Maturità</h1>
      <p className="mb-6 text-sm">{compiled} di 9 aree compilate</p>
      {compiled < 6 ? (
        <p className="mb-4 rounded border-l-4 border-amber-400 bg-amber-50 p-3 text-sm">
          Compila almeno 6 aree su 9 per generare il report.
        </p>
      ) : null}
      <div className="space-y-3">
        {maturity.areas.map((area, idx) => (
          <section key={area.id} className="card">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{idx + 1}. {area.name}</h2>
              {selections[area.id] ? <span className="text-xs text-blue">Selezionato: {selections[area.id]}</span> : <span className="text-xs">Area non valutata</span>}
            </div>
            <p className="mb-3 text-sm text-slate-600">{area.description}</p>
            <div className="grid gap-2 md:grid-cols-4">
              {area.levels.map((lv) => (
                <button
                  key={lv.value}
                  className={`rounded border p-2 text-left text-sm ${selections[area.id] === lv.value ? 'border-blue bg-blue/10' : 'border-slate-200'}`}
                  onClick={() => setMaturity({ ...selections, [area.id]: lv.value })}
                >
                  <div className="font-semibold">{lv.label}</div>
                  <div className="text-xs text-slate-600">{lv.bullet}</div>
                </button>
              ))}
            </div>
            <button className="mt-3 text-xs underline" onClick={() => setMaturity({ ...selections, [area.id]: null })}>Lascia non valutata</button>
          </section>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <button className="btn btn-secondary" onClick={() => router.push('/questionario')}>Indietro</button>
        <button className="btn btn-primary" onClick={() => router.push('/paesi')}>Avanti</button>
      </div>
    </main>
  );
}
