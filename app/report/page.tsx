'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionHeader } from '@/components/session-header';
import { DISCLAIMER } from '@/lib/utils/validation';

export default function ReportPage() {
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/ai/session/status')
      .then((r) => r.json())
      .then((d) => {
        if (!d.session_active) return setError('Sessione non attiva');
        if (!d.has_report) return setError('Report non presente in sessione');
        setReport(d.report_json ?? d.partial_report_json);
      });
  }, []);

  async function resetAssessment() {
    const ok = window.confirm('Ricominciando da capo verranno cancellati tutti i dati del questionario e il report attuale, ma la tua chiave API rimarrà attiva. Vuoi procedere?');
    if (!ok) return;
    await fetch('/api/reset', { method: 'POST' });
    router.push('/questionario');
  }

  if (error) return <main className="mx-auto max-w-4xl p-8"><SessionHeader /><p>{error}</p></main>;
  if (!report) return <main className="mx-auto max-w-4xl p-8"><SessionHeader /><p>Caricamento report...</p></main>;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <SessionHeader />
      {report.metadata?.has_partial_data_flag ? (
        <div className="mb-4 rounded border-l-4 border-amber-400 bg-amber-50 p-3 text-sm">L'assessment è stato completato in modo parziale: sono state valutate {report.metadata.completed_areas_count} aree di maturità su 9. Le raccomandazioni e il livello di attenzione complessivo si basano sui dati forniti. Per un'analisi più completa, si consiglia di tornare al questionario e compilare le aree mancanti.</div>
      ) : null}
      <h1 className="mb-3 text-3xl font-bold text-navy">Report</h1>
      <p className="mb-4 text-sm">{report.metadata.company_name} · {report.metadata.generated_at}</p>
      <section className="card mb-4">
        <h2 className="mb-2 text-xl font-semibold">Executive Summary</h2>
        <p className="mb-2">Attenzione complessiva: <strong>{report.executive_summary.overall_attention}</strong></p>
        <p>{report.executive_summary.synthesis_sentence}</p>
        <ul className="list-disc pl-5">
          {report.executive_summary.key_points.map((x: string, i: number) => <li key={i}>{x}</li>)}
        </ul>
      </section>
      <section className="card mb-4">
        <h2 className="mb-2 text-xl font-semibold">Raccomandazioni</h2>
        <div className="space-y-2">
          {report.recommendations.map((r: any) => (
            <div key={r.id} className="rounded border border-slate-200 p-3">
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm">{r.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="card mb-4 text-sm">
        <h2 className="mb-2 text-xl font-semibold">Limiti</h2>
        <p>{report.limits.scope_limitations}</p>
        <p className="mt-2">{report.limits.methodological_caveats}</p>
      </section>
      <p className="mb-6 rounded bg-slate-100 p-3 text-xs">{DISCLAIMER}</p>
      <div className="flex gap-3">
        <a href="/api/pdf" className="btn btn-primary">Scarica PDF</a>
        <button className="btn btn-secondary" onClick={() => router.push('/questionario')}>Modifica assessment</button>
        <button className="btn btn-secondary" onClick={resetAssessment}>Ricomincia da capo</button>
      </div>
    </main>
  );
}
