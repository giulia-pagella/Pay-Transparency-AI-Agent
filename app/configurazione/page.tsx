'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icon';

export default function ConfigurazionePage() {
  const [apiKey, setApiKey] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) return setError('Inserisci una chiave API valida.');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/session/init', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ api_key: trimmedKey }),
      });
      const text = await res.text();
      let data: { error?: string } = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: 'Risposta non valida dal server.' }; }
      setLoading(false);
      if (!res.ok) { setError(data.error ?? 'Errore durante la validazione della chiave API.'); return; }
      router.push('/questionario');
    } catch {
      setLoading(false);
      setError('Errore di rete. Verifica che il server sia attivo.');
    }
  }

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
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--ntt-future-blue-150)', textDecoration: 'none', fontWeight: 700 }}>
            Come ottenere una chiave API
          </a>
        </div>
      </header>

      {/* Centered content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFBFC', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>ACCESSO</div>
          <h1 className="serif" style={{ fontSize: 36, lineHeight: 1.12, color: 'var(--ntt-smart-navy)', margin: '0 0 10px' }}>
            Inserisci la tua chiave API Gemini.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ntt-text-gray)', margin: '0 0 32px', lineHeight: 1.6 }}>
            La chiave è conservata solo in sessione server-side per 4 ore e non viene mai loggata o salvata.
          </p>

          <div className="card" style={{ padding: 32 }}>
            <form onSubmit={onSubmit}>
              <div className="field" style={{ marginBottom: 20 }}>
                <label className="field-label">
                  Chiave API Gemini <span style={{ color: 'var(--ntt-orange-100)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={show ? 'text' : 'password'}
                    className="ntt-input"
                    placeholder="AIza…"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                    autoComplete="off"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ntt-gray-100)', padding: 0 }}
                    tabIndex={-1}
                  >
                    <Icon name="eye" size={16} />
                  </button>
                </div>
                <span className="field-hint">
                  Formata come <code style={{ fontFamily: 'monospace', fontSize: 11 }}>AIza…</code> (39 caratteri). Puoi generarla su Google AI Studio.
                </span>
              </div>

              {error && (
                <div className="alert alert-danger" style={{ marginBottom: 20 }}>
                  <Icon name="warn" size={18} className="alert-icon" style={{ color: 'var(--ntt-orange-100)' }} />
                  <div className="alert-body"><strong>Errore</strong>{error}</div>
                </div>
              )}

              <button type="submit" disabled={loading || !apiKey.trim()} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Validazione in corso…' : <>Valida e accedi <Icon name="arrow-right" size={14} /></>}
              </button>
            </form>
          </div>

          {/* Info box */}
          <div className="alert alert-info" style={{ marginTop: 20 }}>
            <Icon name="info" size={18} className="alert-icon" style={{ color: 'var(--ntt-future-blue-150)' }} />
            <div className="alert-body">
              <strong>Piano gratuito Gemini</strong>
              Circa 18–20 report al giorno e max 5 richieste/minuto. Per volumi maggiori attiva il piano a pagamento su Google AI Studio.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
