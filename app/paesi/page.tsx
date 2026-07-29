'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/components/assessment-context';
import { SessionHeader } from '@/components/session-header';
import { Icon } from '@/components/icon';

type CountryRuntime = {
  code: string;
  name: string;
  flag_emoji: string;
  status: 'definitive' | 'draft' | 'none';
};

type ApiErrorPayload = { error?: string; countries?: CountryRuntime[] };

async function parseApiResponse(res: Response): Promise<ApiErrorPayload> {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text) as ApiErrorPayload; }
  catch { return { error: 'Risposta non valida dal server. Controlla i log del terminale.' }; }
}

function StatusBadge({ status }: { status: CountryRuntime['status'] }) {
  if (status === 'definitive') return <span className="badge badge-green"><span className="badge-dot" />Definitivo</span>;
  if (status === 'draft')      return <span className="badge badge-yellow"><span className="badge-dot" />Bozza</span>;
  return <span className="badge badge-gray">Non disponibile</span>;
}

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

export default function PaesiPage() {
  const { countries, setCountries, maturity, company } = useAssessment();
  const [rows, setRows] = useState<CountryRuntime[]>([]);
  const [loadError, setLoadError] = useState('');
  const [genError, setGenError] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const compiled = useMemo(
    () => Object.values(maturity).filter((v) => v !== null && v !== undefined).length,
    [maturity],
  );

  useEffect(() => {
    fetch('/api/countries')
      .then(async (res) => {
        const data = await parseApiResponse(res);
        if (!res.ok) throw new Error(data.error ?? 'Errore caricamento paesi.');
        setRows(data.countries ?? []);
      })
      .catch((err: Error) => setLoadError(err.message ?? 'Impossibile caricare la lista paesi. Ricarica la pagina.'));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [rows, search]);

  const canGenerate = compiled >= 6 && countries.length >= 1;
  const hasDraftSelected = countries.some((code) => rows.find((r) => r.code === code)?.status === 'draft');
  const definitiveCount = rows.filter((r) => r.status === 'definitive').length;
  const draftCount      = rows.filter((r) => r.status === 'draft').length;
  const noneCount       = rows.filter((r) => r.status === 'none').length;

  function toggleCountry(code: string) {
    if (countries.includes(code)) setCountries(countries.filter((x) => x !== code));
    else setCountries([...countries, code]);
  }

  async function generate() {
    setLoading(true);
    setGenError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300_000);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ company, selected_countries: countries, maturity }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await parseApiResponse(res);
      setLoading(false);
      // Lo status resta 200 anche per gli errori tardivi (vedi commento nella route):
      // l'esito reale e' nel body, quindi va controllato `data.error` a prescindere da res.ok.
      if (!res.ok || data.error) { setGenError(data.error ?? 'Errore durante la generazione del report.'); return; }
      router.push('/report');
    } catch (err) {
      clearTimeout(timeoutId);
      setLoading(false);
      if ((err as Error)?.name === 'AbortError') {
        setGenError('La generazione ha superato il tempo massimo (5 minuti). Riprova tra qualche istante.');
      } else {
        setGenError('Errore di rete o server non raggiungibile. Verifica che il server sia attivo.');
      }
    }
  }

  return (
    <div className="ptt-screen">
      <SessionHeader />
      <div style={{ flex: 1, overflowY: 'auto', background: '#FAFBFC' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 48px 80px' }}>
          <div style={{ marginBottom: 36 }}>
            <Stepper current={2} />
          </div>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 32 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>QUESTIONARIO · STEP 3 DI 3</div>
              <h1 className="serif" style={{ fontSize: 36, lineHeight: 1.15, margin: '0 0 10px', color: 'var(--ntt-smart-navy)' }}>
                Seleziona i paesi da analizzare.
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ntt-text-gray)', margin: 0, maxWidth: 620, lineHeight: 1.6 }}>
                La <strong>Direttiva UE 2023/970</strong> è sempre inclusa come base. Aggiungi i recepimenti nazionali rilevanti. Solo i paesi con normativa caricata sono selezionabili.
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--ntt-gray-100)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>Selezionati</div>
              <div className="serif" style={{ fontSize: 34, color: 'var(--ntt-future-blue)', lineHeight: 1 }}>
                {countries.length}<span style={{ color: 'var(--ntt-gray-100)', fontSize: 18 }}> / {rows.length}</span>
              </div>
            </div>
          </div>

          {/* EU base card */}
          <div style={{ background: 'var(--ntt-smart-navy)', color: 'white', padding: '18px 22px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, backgroundImage: "url('/assets/innovation-curve-twothirds-white.svg')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', opacity: .1 }} />
            <div style={{ fontSize: 26, zIndex: 2 }}>🇪🇺</div>
            <div style={{ flex: 1, zIndex: 2 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Direttiva UE 2023/970</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>Base normativa sempre inclusa come riferimento per ogni paese analizzato.</div>
            </div>
            <span className="badge badge-green" style={{ zIndex: 2 }}><span className="badge-dot" />Definitivo</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,.1)', color: 'white', zIndex: 2 }}>Base · sempre inclusa</span>
          </div>

          {/* Search + filter row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ntt-gray-100)', pointerEvents: 'none' }}>
                <Icon name="search" size={14} />
              </div>
              <input
                className="ntt-input"
                placeholder="Cerca paese…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              <span className="badge badge-green"><span className="badge-dot" />{definitiveCount} {definitiveCount === 1 ? 'definitivo' : 'definitivi'}</span>
              <span className="badge badge-yellow"><span className="badge-dot" />{draftCount} in bozza</span>
              <span className="badge badge-gray">{noneCount} non disponibili</span>
            </div>
          </div>

          {/* Draft warning */}
          {hasDraftSelected && (
            <div className="alert alert-warn" style={{ marginBottom: 20 }}>
              <Icon name="warn" size={18} className="alert-icon" style={{ color: '#8B6B00' }} />
              <div className="alert-body">
                <strong>Normativa in bozza selezionata.</strong>
                I contenuti e gli obblighi potrebbero cambiare prima dell&apos;adozione definitiva. Il report rifletterà questa incertezza.
              </div>
            </div>
          )}

          {/* Load error */}
          {loadError && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              <Icon name="warn" size={18} className="alert-icon" style={{ color: 'var(--ntt-orange-100)' }} />
              <div className="alert-body"><strong>Errore caricamento</strong>{loadError}</div>
            </div>
          )}

          {/* Country grid */}
          {rows.length === 0 && !loadError ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ntt-gray-100)', fontSize: 14 }}>
              Caricamento paesi…
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 10 }}>
              {filtered.map((c) => {
                const isSel     = countries.includes(c.code);
                const isDisabled = c.status === 'none';
                return (
                  <div
                    key={c.code}
                    className={`country-card ${isSel ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && toggleCountry(c.code)}
                    role="checkbox"
                    aria-checked={isSel}
                    tabIndex={isDisabled ? -1 : 0}
                    onKeyDown={(e) => e.key === 'Enter' && !isDisabled && toggleCountry(c.code)}
                  >
                    <div className="country-card-check">
                      {isSel && <Icon name="check" size={11} color="white" />}
                    </div>
                    <div className="country-flag">{c.flag_emoji}</div>
                    <div className="country-name">{c.name}</div>
                    <div style={{ flex: 1 }} />
                    <StatusBadge status={c.status} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => router.push('/maturita')}>
              <Icon name="arrow-left" size={14} /> Indietro
            </button>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {compiled < 6 && (
                <span style={{ fontSize: 12, color: 'var(--ntt-orange-150)', fontWeight: 700 }}>
                  Compila almeno 6 aree di maturità (tornare allo step 2)
                </span>
              )}
              {countries.length === 0 && compiled >= 6 && (
                <span style={{ fontSize: 12, color: 'var(--ntt-gray-100)' }}>Seleziona almeno 1 paese</span>
              )}
              <button
                className="btn btn-primary btn-lg"
                disabled={!canGenerate || loading}
                onClick={generate}
              >
                {loading ? (
                  'Generazione in corso…'
                ) : (
                  <><Icon name="sparkle" size={15} /> Genera report</>
                )}
              </button>
            </div>
          </div>

          {genError && (
            <div className="alert alert-danger" style={{ marginTop: 20 }}>
              <Icon name="warn" size={18} className="alert-icon" style={{ color: 'var(--ntt-orange-100)' }} />
              <div className="alert-body"><strong>Errore generazione</strong>{genError}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
