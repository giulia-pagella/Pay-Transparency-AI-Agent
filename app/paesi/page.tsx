'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/components/assessment-context';
import { SessionHeader } from '@/components/session-header';

type CountryRuntime = { code: string; name: string; flag_emoji: string; status: 'definitive' | 'draft' | 'none' };

export default function PaesiPage() {
  const { countries, setCountries, maturity, company } = useAssessment();
  const [rows, setRows] = useState<CountryRuntime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const compiled = useMemo(() => Object.values(maturity).filter((v) => v !== null && v !== undefined).length, [maturity]);

  useEffect(() => {
    fetch('/api/countries').then((r) => r.json()).then((d) => setRows(d.countries ?? []));
  }, []);

  const canGenerate = compiled >= 6 && countries.length >= 1;

  async function generate() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ company, selected_countries: countries, maturity }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? 'Errore');
    router.push('/report');
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <SessionHeader />
      <h1 className="mb-4 text-3xl font-bold text-navy">Questionario — Paesi</h1>
      <p className="mb-4 text-sm">La Direttiva UE è sempre inclusa come base. In Fase 1 è selezionabile solo Italia.</p>
      <div className="grid gap-2 md:grid-cols-2">
        {rows.map((c) => {
          const selected = countries.includes(c.code);
          const disabled = c.status === 'none';
          return (
            <button
              key={c.code}
              disabled={disabled}
              onClick={() => {
                if (selected) setCountries(countries.filter((x) => x !== c.code));
                else setCountries([...countries, c.code]);
              }}
              className={`flex items-center justify-between rounded border p-3 text-left ${selected ? 'border-blue bg-blue/10' : 'border-slate-200'} disabled:opacity-50`}
            >
              <span>{c.flag_emoji} {c.name}</span>
              <span className="text-xs uppercase">{c.status === 'none' ? 'Non disponibile' : c.status === 'draft' ? 'Bozza' : 'Definitivo'}</span>
            </button>
          );
        })}
      </div>
      {countries.includes('IT') ? (
        <p className="mt-4 rounded border-l-4 border-amber-400 bg-amber-50 p-3 text-sm">Attenzione: la normativa selezionata per Italia è in stato di bozza. I contenuti e gli obblighi qui descritti potrebbero cambiare prima dell'adozione definitiva. Il report prodotto rifletterà questa incertezza e dovrà essere rivisto quando la normativa sarà approvata.</p>
      ) : null}
      <div className="mt-6 flex justify-between">
        <button className="btn btn-secondary" onClick={() => router.push('/maturita')}>Indietro</button>
        <button disabled={!canGenerate || loading} className="btn btn-primary disabled:opacity-40" onClick={generate}>
          {loading ? 'Generazione in corso...' : 'Genera report'}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {compiled < 6 ? <p className="mt-3 text-sm text-amber-700">Compila almeno 6 aree su 9 per generare il report.</p> : null}
    </main>
  );
}
