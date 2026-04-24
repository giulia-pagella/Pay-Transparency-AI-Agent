'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionHeader } from '@/components/session-header';

export default function ConfigurazionePage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/ai/session/init', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? 'Errore');
    router.push('/questionario');
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <SessionHeader showClose={false} />
      <h1 className="mb-4 text-3xl font-bold text-navy">Configurazione API key</h1>
      <form className="card space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Chiave API Gemini</span>
          <input
            type="password"
            className="w-full rounded border border-slate-300 px-3 py-2"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </label>
        <button disabled={loading} className="btn btn-primary" type="submit">
          {loading ? 'Validazione in corso...' : 'Valida e accedi'}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
      <div className="mt-6 card text-sm">
        <p>
          Il piano gratuito di Gemini 2.5 Flash permette circa 18-20 report completi al giorno e un massimo di 5 richieste al minuto. Se hai bisogno di volumi maggiori, puoi attivare il piano a pagamento su Google AI Studio oppure, per sessioni separate, utilizzare una chiave API diversa.
        </p>
        <p className="mt-3">
          La chiave è conservata temporaneamente in sessione sul nostro server per 4 ore e mai loggata o esposta nei report generati.
        </p>
      </div>
    </main>
  );
}
