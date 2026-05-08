'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionHeader } from '@/components/session-header';
import { Icon } from '@/components/icon';
import type { ReportJson } from '@/lib/schemas/report';

function ScoringPanel({ report }: { report: ReportJson }) {
  const es = report.executive_summary;
  const breakdown = es.attention_breakdown;
  const score = es.attention_score;
  const triggers = es.attention_triggers ?? [];

  if (!breakdown || score === undefined) return null;

  const rows = [
    { label: 'Maturità nelle 9 aree', weight: '50%', value: breakdown.maturity.value, contribution: breakdown.maturity.contribution },
    { label: 'Dimensione e complessità organizzativa', weight: '25%', value: breakdown.organization.value, contribution: breakdown.organization.contribution },
    { label: 'Urgenza normativa (time-to-compliance)', weight: '15%', value: breakdown.timeToCompliance.value, contribution: breakdown.timeToCompliance.contribution },
    { label: 'Visibilità settore e rischio sanzioni', weight: '10%', value: breakdown.sectorRisk.value, contribution: breakdown.sectorRisk.contribution },
  ];

  return (
    <div style={{ marginTop: 14, padding: 16, background: 'rgba(255,255,255,.07)', borderRadius: 4, border: '1px solid rgba(255,255,255,.12)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
        Dettagli scoring
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'white', fontFamily: 'var(--font-serif)' }}>{score}</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>/100</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,.12)' }}>
            {['Fattore', 'Peso', 'Valore', 'Contributo'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '4px 6px', color: 'rgba(255,255,255,.45)', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', fontSize: 10 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <td style={{ padding: '5px 6px', color: 'rgba(255,255,255,.75)' }}>{r.label}</td>
              <td style={{ padding: '5px 6px', color: 'rgba(255,255,255,.45)' }}>{r.weight}</td>
              <td style={{ padding: '5px 6px', color: 'rgba(255,255,255,.75)' }}>{r.value}/100</td>
              <td style={{ padding: '5px 6px', color: 'white', fontWeight: 600 }}>{r.contribution}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {triggers.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Fattori rilevanti</div>
          <ul style={{ margin: 0, padding: '0 0 0 14px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {triggers.map((t, i) => (
              <li key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', lineHeight: 1.5 }}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 8 }}>
        Il livello di attenzione è calcolato pesando maturità organizzativa (50%), dimensione e complessità (25%), urgenza normativa (15%) e rischio settoriale (10%).
      </div>
    </div>
  );
}

type Section = { id: string; num: string; title: string };

const SECTIONS: Section[] = [
  { id: 'exec',     num: '01', title: 'Executive Summary' },
  { id: 'perimeter', num: '02', title: 'Perimetro dell\'analisi' },
  { id: 'eu',       num: '03', title: 'Direttiva UE 2023/970' },
  { id: 'countries', num: '04', title: 'Analisi per paese' },
  { id: 'compare',  num: '05', title: 'Confronto multi-country' },
  { id: 'impacts',  num: '06', title: 'Impatti per area HR' },
  { id: 'maturity', num: '07', title: 'Profilo di maturità' },
  { id: 'reco',     num: '08', title: 'Raccomandazioni' },
  { id: 'limits',   num: '09', title: 'Limiti e caveat' },
  { id: 'sources',  num: '10', title: 'Fonti normative' },
];

function AttentionPill({ level }: { level: string | null }) {
  if (!level) return <span className="attention attention-na">Non valutata</span>;
  const map: Record<string, string> = { alta: 'attention-alta', media: 'attention-media', bassa: 'attention-bassa' };
  const labels: Record<string, string> = { alta: 'Attenzione Alta', media: 'Attenzione Media', bassa: 'Attenzione Bassa' };
  return <span className={`attention ${map[level] ?? 'attention-na'}`}>{labels[level] ?? level}</span>;
}

function AccordionItem({ section, children, defaultOpen = false }: { section: Section; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={section.id} className={`accordion-item ${open ? 'open' : ''}`}>
      <div className="accordion-head" onClick={() => setOpen((v) => !v)}>
        <span className="accordion-num">{section.num}</span>
        <h3 className="accordion-title">{section.title}</h3>
        <Icon name="plus" size={20} className="accordion-toggle" />
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="ptt-screen">
      <SessionHeader />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFBFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--ntt-gray-100)' }}>Caricamento report…</div>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [report, setReport] = useState<ReportJson | null>(null);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('exec');
  const [scoringOpen, setScoringOpen] = useState(false);
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/ai/session/status')
      .then((r) => r.json())
      .then((d) => {
        if (!d.session_active) return setError('Sessione non attiva. Torna alla configurazione.');
        if (!d.has_report) return setError('Nessun report presente in sessione. Completa il questionario prima.');
        setReport(d.report_json ?? d.partial_report_json);
      })
      .catch(() => setError('Errore di rete durante il caricamento del report.'));
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const handler = () => {
      for (const s of SECTIONS.slice().reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) { setActiveSection(s.id); break; }
      }
    };
    main.addEventListener('scroll', handler, { passive: true });
    return () => main.removeEventListener('scroll', handler);
  }, []);

  async function resetAssessment() {
    const ok = window.confirm('Ricominciando da capo verranno cancellati tutti i dati del questionario e il report attuale, ma la tua chiave API rimarrà attiva. Vuoi procedere?');
    if (!ok) return;
    await fetch('/api/reset', { method: 'POST' });
    router.push('/questionario');
  }

  function scrollTo(id: string) {
    const el = mainRef.current?.querySelector(`#${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (error) return (
    <div className="ptt-screen">
      <SessionHeader />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFBFC' }}>
        <div className="card" style={{ padding: 32, maxWidth: 480, textAlign: 'center' }}>
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <Icon name="warn" size={18} className="alert-icon" style={{ color: 'var(--ntt-orange-100)' }} />
            <div className="alert-body"><strong>Errore</strong>{error}</div>
          </div>
          <button className="btn btn-secondary" onClick={() => router.push('/configurazione')}>Torna alla configurazione</button>
        </div>
      </div>
    </div>
  );

  if (!report) return <LoadingShell />;

  const r = report;
  const attColor = { alta: 'var(--ntt-orange-100)', media: 'var(--ntt-yellow)', bassa: 'var(--ntt-green-150)' }[r.executive_summary.overall_attention] ?? 'var(--ntt-gray-100)';
  const attBg    = { alta: 'rgba(228,38,0,.12)', media: 'rgba(255,196,0,.12)', bassa: 'rgba(0,203,93,.12)' }[r.executive_summary.overall_attention] ?? 'rgba(0,0,0,.06)';

  return (
    <div className="ptt-screen">
      <SessionHeader />

      <div className="report-layout">
        {/* Sidebar */}
        <nav className="report-sidebar">
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700, marginBottom: 6 }}>Report</div>
          <div className="serif" style={{ fontSize: 16, color: 'white', lineHeight: 1.25, marginBottom: 20 }}>
            {r.metadata.company_name}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 22 }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                className={`anchor-link ${activeSection === s.id ? 'active' : ''}`}
                onClick={() => scrollTo(s.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)' }}
              >
                <span><span className="anchor-num">{s.num}</span>{s.title}</span>
              </button>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{ padding: 12, background: 'rgba(255,255,255,.06)', borderLeft: '2px solid var(--ntt-yellow)', borderRadius: 2, fontSize: 10, lineHeight: 1.55, color: 'rgba(255,255,255,.65)', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>⚠ Disclaimer</div>
            Documento generato da AI, non costituisce consulenza legale né dichiarazione di conformità normativa.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <a href="/api/pdf" className="btn btn-primary btn-sm" style={{ justifyContent: 'flex-start' }}>
              <Icon name="download" size={13} /> Scarica PDF
            </a>
            <button onClick={() => router.push('/questionario')} style={{ background: 'transparent', color: 'rgba(255,255,255,.75)', border: '1px solid rgba(255,255,255,.2)', padding: '7px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)', borderRadius: 2, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="edit" size={12} /> Modifica assessment
            </button>
            <button onClick={resetAssessment} style={{ background: 'transparent', color: 'rgba(255,255,255,.5)', border: 'none', padding: '5px 0', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icon name="refresh" size={11} /> Ricomincia da capo
            </button>
          </div>
        </nav>

        {/* Main */}
        <div className="report-main" ref={mainRef}>
          {/* Partial data banner */}
          {r.metadata.has_partial_data_flag && (
            <div className="alert alert-warn" style={{ marginBottom: 24 }}>
              <Icon name="info" size={18} className="alert-icon" style={{ color: '#8B6B00' }} />
              <div className="alert-body">
                <strong>Dati parziali — assessment completato al {Math.round((r.metadata.completed_areas_count / 9) * 100)}%</strong>
                Sono state valutate {r.metadata.completed_areas_count} aree di maturità su 9. Per un&apos;analisi più completa torna al questionario.
              </div>
            </div>
          )}

          {/* Title block */}
          <div style={{ marginBottom: 8 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>PAY TRANSPARENCY ASSESSMENT REPORT</div>
            <h1 className="serif" style={{ fontSize: 44, lineHeight: 1.1, margin: '0 0 10px', color: 'var(--ntt-smart-navy)', letterSpacing: '-0.015em' }}>
              {r.metadata.company_name}
            </h1>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: 'var(--ntt-gray-100)' }}>
              <span>{r.metadata.sector} · {r.metadata.employee_range} · {r.metadata.organizational_model}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ntt-gray-100)', display: 'inline-block' }} />
              <span>Generato il {r.metadata.generated_at}</span>
              {r.metadata.has_partial_data_flag && <span className="badge badge-yellow"><span className="badge-dot" />Dati parziali</span>}
              {r.metadata.has_draft_sources && <span className="badge badge-yellow"><span className="badge-dot" />Fonte in bozza</span>}
            </div>
          </div>

          {/* ── 01 Executive Summary ── */}
          <div id="exec" style={{ marginTop: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <span className="accordion-num" style={{ margin: 0 }}>01</span>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>Executive Summary</h2>
            </div>

            {/* Navy card */}
            <div style={{ background: 'var(--ntt-smart-navy)', color: 'white', padding: 28, borderRadius: 4, position: 'relative', overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, backgroundImage: "url('/assets/innovation-curve-twothirds-white.svg')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', opacity: .08 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Livello complessivo</div>
                  <div style={{ width: 120, height: 120, border: `2px solid ${attColor}`, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: attBg }}>
                    <div className="serif" style={{ fontSize: 30, color: attColor, lineHeight: 1, textTransform: 'capitalize' }}>{r.executive_summary.overall_attention}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)', marginTop: 5, letterSpacing: '.08em' }}>ATTENZIONE</div>
                  </div>
                  {r.executive_summary.attention_score !== undefined && (
                    <button
                      onClick={() => setScoringOpen((v) => !v)}
                      style={{ marginTop: 10, background: 'none', border: '1px solid rgba(255,255,255,.2)', borderRadius: 2, color: 'rgba(255,255,255,.55)', fontSize: 10, padding: '4px 8px', cursor: 'pointer', fontFamily: 'var(--font-sans)', letterSpacing: '.04em' }}
                    >
                      {scoringOpen ? 'Nascondi dettagli' : 'Mostra dettagli scoring'}
                    </button>
                  )}
                </div>
                <div>
                  <p className="serif" style={{ fontSize: 20, lineHeight: 1.35, color: 'white', margin: '0 0 16px', fontWeight: 400 }}>
                    &ldquo;{r.executive_summary.headline}&rdquo;
                  </p>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,.7)', margin: 0, maxWidth: 560 }}>
                    {r.executive_summary.paragraph}
                  </p>
                </div>
              </div>
              {scoringOpen && <ScoringPanel report={r} />}
            </div>

            {/* KPI grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { n: String(r.metadata.selected_countries.length), l: r.metadata.selected_countries.length === 1 ? 'Paese analizzato' : 'Paesi analizzati', s: r.metadata.selected_countries.join(', '), c: 'var(--ntt-future-blue)' },
                { n: `${r.metadata.completed_areas_count}/9`, l: 'Aree valutate', s: r.metadata.has_partial_data_flag ? 'Assessment parziale' : 'Assessment completo', c: r.metadata.has_partial_data_flag ? 'var(--ntt-yellow)' : 'var(--ntt-green-150)' },
                { n: String(r.recommendations.length), l: 'Raccomandazioni', s: 'Ordinate per priorità', c: 'var(--ntt-smart-navy)' },
              ].map((k) => (
                <div key={k.l} className="card" style={{ padding: 16, borderTop: `3px solid ${k.c}` }}>
                  <div className="serif" style={{ fontSize: 28, lineHeight: 1, color: 'var(--ntt-smart-navy)' }}>{k.n}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ntt-smart-navy)', marginTop: 8 }}>{k.l}</div>
                  <div style={{ fontSize: 11, color: 'var(--ntt-gray-100)', marginTop: 3 }}>{k.s}</div>
                </div>
              ))}
            </div>

            {/* Key points */}
            <div className="card" style={{ padding: 22 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>PUNTI CHIAVE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {r.executive_summary.key_points.map((pt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 2, background: '#E5F1F9', color: 'var(--ntt-future-blue-150)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Icon name="target" size={13} />
                    </div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--ntt-text-gray)' }}>{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Accordion sections ── */}
          <div className="accordion" style={{ marginTop: 44 }}>

            <AccordionItem section={SECTIONS[1]!}>
              <div className="prose">
                <p><strong>Settore:</strong> {r.perimeter.company_block['sector'] ?? r.metadata.sector} · <strong>Dipendenti:</strong> {r.metadata.employee_range} · <strong>Modello:</strong> {r.metadata.organizational_model}</p>
                <p><strong>Paesi inclusi nell&apos;analisi:</strong>{' '}
                  {r.perimeter.countries_analyzed.map((c) => `${c.name}${c.status === 'draft' ? ' (bozza)' : ''}`).join(', ')}
                </p>
                {r.perimeter.excluded_scope && <p><strong>Fuori perimetro:</strong> {r.perimeter.excluded_scope}</p>}
              </div>
            </AccordionItem>

            <AccordionItem section={SECTIONS[2]!}>
              <div className="prose">
                <p>{r.eu_directive.overview}</p>
                <p>{r.eu_directive.timeline_summary}</p>
              </div>
              {r.eu_directive.key_obligations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  {r.eu_directive.key_obligations.map((ob, i) => (
                    <div key={i} className="card" style={{ padding: 16, borderLeft: '3px solid var(--ntt-future-blue)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{ob.title}</div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <AttentionPill level={ob.relevance} />
                          <span className="badge badge-blue">{ob.article_reference}</span>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--ntt-text-gray)', lineHeight: 1.55 }}>{ob.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </AccordionItem>

            <AccordionItem section={SECTIONS[3]!}>
              {r.country_analysis.map((ca) => (
                <div key={ca.country_code} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{ca.country_name}</h4>
                    {ca.status === 'draft' && <span className="badge badge-yellow"><span className="badge-dot" />Bozza</span>}
                  </div>
                  <div className="prose">
                    <p>{ca.national_framework_summary}</p>
                    {ca.key_differences_vs_eu.length > 0 && (
                      <ul>{ca.key_differences_vs_eu.map((d, i) => <li key={i}>{d}</li>)}</ul>
                    )}
                    {ca.implementation_notes && <p style={{ fontStyle: 'italic', color: 'var(--ntt-gray-100)', fontSize: 13 }}>{ca.implementation_notes}</p>}
                  </div>
                </div>
              ))}
            </AccordionItem>

            <AccordionItem section={SECTIONS[4]!}>
              <div className="prose"><p>{r.countries_comparison.narrative}</p></div>
              {r.countries_comparison.table_rows.length > 0 && (
                <div style={{ overflowX: 'auto', marginTop: 14 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--ntt-smart-navy)' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'var(--ntt-smart-navy)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Tema</th>
                        {r.metadata.selected_countries.map((c) => (
                          <th key={c} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'var(--ntt-smart-navy)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {r.countries_comparison.table_rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--ntt-gray-50)' }}>
                          <td style={{ padding: '9px 10px', fontWeight: 700, color: 'var(--ntt-smart-navy)', fontSize: 13 }}>{row.topic}</td>
                          {r.metadata.selected_countries.map((c) => (
                            <td key={c} style={{ padding: '9px 10px', color: 'var(--ntt-text-gray)', fontSize: 13 }}>{row.cells[c] ?? '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AccordionItem>

            <AccordionItem section={SECTIONS[5]!} defaultOpen>
              <p style={{ fontSize: 13, color: 'var(--ntt-text-gray)', marginBottom: 16, maxWidth: 700 }}>
                Livello di attenzione per area, calcolato combinando maturità dichiarata e obbligo diretto della Direttiva.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {r.impacts_by_area.map((area) => (
                  <div key={area.area_id} className="card" style={{ padding: 14, borderLeft: area.attention_level ? '3px solid var(--ntt-future-blue)' : '1px solid var(--ntt-gray-50)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{area.area_name}</div>
                        {area.regulatory_reference && <div style={{ fontSize: 11, color: 'var(--ntt-gray-100)', marginTop: 2 }}>{area.regulatory_reference}</div>}
                      </div>
                      <AttentionPill level={area.attention_level} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--ntt-text-gray)', lineHeight: 1.5 }}>{area.impact_description}</p>
                  </div>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem section={SECTIONS[6]!}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {r.maturity.map((area) => (
                  <div key={area.area_id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{area.area_name}</span>
                      <span className="badge badge-blue">{area.current_level_label}</span>
                    </div>
                    {area.current_level !== null && (
                      <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
                        {[1, 2, 3, 4].map((k) => (
                          <div key={k} style={{ flex: 1, height: 4, borderRadius: 1, background: area.current_level && k <= area.current_level ? 'var(--ntt-future-blue)' : 'var(--ntt-gray-50)' }} />
                        ))}
                      </div>
                    )}
                    <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--ntt-text-gray)', lineHeight: 1.5 }}>{area.gap_description}</p>
                    {area.recommendation && <p style={{ margin: 0, fontSize: 12, color: 'var(--ntt-future-blue-150)', lineHeight: 1.5, fontStyle: 'italic' }}>{area.recommendation}</p>}
                  </div>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem section={SECTIONS[7]!} defaultOpen>
              <p style={{ fontSize: 13, color: 'var(--ntt-text-gray)', marginBottom: 16, maxWidth: 700 }}>
                Raccomandazioni preliminari ordinate per priorità, collegate alle aree HR e alle fonti normative.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {r.recommendations.map((rec, i) => {
                  const borderColor = rec.priority === 'alta' ? 'var(--ntt-orange-100)' : rec.priority === 'media' ? 'var(--ntt-yellow)' : 'var(--ntt-green-150)';
                  return (
                    <div key={rec.id} className="card" style={{ padding: 18, borderLeft: `3px solid ${borderColor}` }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <span className="serif" style={{ fontSize: 22, color: 'var(--ntt-gray-100)', lineHeight: 1, minWidth: 28 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 7 }}>
                            <AttentionPill level={rec.priority} />
                            {rec.related_areas.map((a) => <span key={a} className="badge badge-gray">{a}</span>)}
                            {rec.related_countries.map((c) => <span key={c} className="badge badge-blue">{c}</span>)}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ntt-smart-navy)', marginBottom: 6, lineHeight: 1.35 }}>{rec.title}</div>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--ntt-text-gray)', lineHeight: 1.6 }}>{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionItem>

            <AccordionItem section={SECTIONS[8]!}>
              <div className="prose">
                <p>{r.limits.scope_limitations}</p>
                <p>{r.limits.methodological_caveats}</p>
                {r.limits.draft_warning && <p style={{ color: '#8B6B00' }}><strong>Fonte in bozza:</strong> {r.limits.draft_warning}</p>}
                {r.limits.partial_data_warning && <p style={{ color: 'var(--ntt-orange-150)' }}><strong>Dati parziali:</strong> {r.limits.partial_data_warning}</p>}
              </div>
            </AccordionItem>

            <AccordionItem section={SECTIONS[9]!}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {r.sources.map((src, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--ntt-gray-50)' }}>
                    <Icon name="document" size={16} style={{ color: 'var(--ntt-future-blue)', flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{src.document_title}</div>
                      <div style={{ fontSize: 11, color: 'var(--ntt-gray-100)', marginTop: 2 }}>{src.document_type} · v{src.version} · {src.date}</div>
                    </div>
                    {src.status === 'draft' ? <span className="badge badge-yellow"><span className="badge-dot" />Bozza</span> : <span className="badge badge-green"><span className="badge-dot" />Definitivo</span>}
                  </div>
                ))}
              </div>
            </AccordionItem>

          </div>

          {/* Footer */}
          <div style={{ marginTop: 44, paddingTop: 20, borderTop: '1px solid var(--ntt-gray-50)', fontSize: 11, color: 'var(--ntt-gray-100)', lineHeight: 1.6 }}>
            Report v{r.metadata.tool_version} · Generato il {r.metadata.generated_at} · Pay Transparency Assessment Tool · NTT DATA Italia · Powered by Google Gemini 2.5 Flash · <strong>Documento AI, non costituisce consulenza legale.</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
