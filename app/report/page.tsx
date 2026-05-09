'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionHeader } from '@/components/session-header';
import { Icon } from '@/components/icon';
import type { ReportJson } from '@/lib/schemas/report';
import { DirectiveSection } from './components/DirectiveSection';
import { ImpactAreasSection } from './components/ImpactAreasSection';
import { MaturityProfileSection } from './components/MaturityProfileSection';
import { MultiCountrySection } from './components/MultiCountrySection';
import { RecommendationsSection } from './components/RecommendationsSection';
import { ReportFooter } from './components/ReportFooter';
import { ReportHeader } from './components/ReportHeader';
import { ReportSidebar } from './components/ReportSidebar';
import { ReportAccordionSection, ReportSectionHeading } from './components/ReportSection';
import { RoadmapSection } from './components/RoadmapSection';
import { SourcesSection } from './components/SourcesSection';
import { getReportSectionById, getVisibleReportSections, isMultiCountry } from './components/reportSections';
import { useScrollSpy } from './hooks/useScrollSpy';
import { getDefaultMaturityAreaId } from './utils/reportDisplay';

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
  const [scoringOpen, setScoringOpen] = useState(false);
  const [selectedMaturityAreaId, setSelectedMaturityAreaId] = useState<string | null>(null);
  const [highlightedRecommendationId, setHighlightedRecommendationId] = useState<string | null>(null);
  const [roadmapRecommendationIds, setRoadmapRecommendationIds] = useState<string[]>([]);
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);
  const visibleSections = useMemo(() => (report ? getVisibleReportSections(report) : []), [report]);
  const visibleSectionIds = useMemo(() => visibleSections.map((section) => section.id), [visibleSections]);
  const activeSection = useScrollSpy(visibleSectionIds, mainRef, 'exec');

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
    if (!report || selectedMaturityAreaId) return;
    setSelectedMaturityAreaId(getDefaultMaturityAreaId(report.maturity));
  }, [report, selectedMaturityAreaId]);

  async function resetAssessment() {
    const ok = window.confirm('Ricominciando da capo verranno cancellati tutti i dati del questionario e il report attuale, ma la tua chiave API rimarrà attiva. Vuoi procedere?');
    if (!ok) return;
    await fetch('/api/reset', { method: 'POST' });
    router.push('/questionario');
  }

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function selectMaturityArea(areaId: string) {
    setSelectedMaturityAreaId(areaId);
    scrollTo('maturity');
  }

  function navigateToRecommendation(recommendationId: string) {
    setHighlightedRecommendationId(recommendationId);
    scrollTo('reco');
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
  const multiCountry = isMultiCountry(r);
  const execSection = getReportSectionById(visibleSections, 'exec');
  const euSection = getReportSectionById(visibleSections, 'eu');
  const multiCountrySection = multiCountry ? getReportSectionById(visibleSections, 'multi-country') : null;
  const impactsSection = getReportSectionById(visibleSections, 'impacts');
  const maturitySection = getReportSectionById(visibleSections, 'maturity');
  const recoSection = getReportSectionById(visibleSections, 'reco');
  const roadmapSection = getReportSectionById(visibleSections, 'roadmap');
  const limitsSection = getReportSectionById(visibleSections, 'limits');
  const sourcesSection = getReportSectionById(visibleSections, 'sources');
  const highlightedRecommendationIds = Array.from(new Set([
    ...roadmapRecommendationIds,
    ...(highlightedRecommendationId ? [highlightedRecommendationId] : []),
  ]));
  const attColor = { alta: 'var(--ntt-orange-100)', media: 'var(--ntt-yellow)', bassa: 'var(--ntt-green-150)' }[r.executive_summary.overall_attention] ?? 'var(--ntt-gray-100)';
  const attBg = { alta: 'rgba(228,38,0,.12)', media: 'rgba(255,196,0,.12)', bassa: 'rgba(0,203,93,.12)' }[r.executive_summary.overall_attention] ?? 'rgba(0,0,0,.06)';

  return (
    <div className="ptt-screen">
      <SessionHeader />

      <div className="report-layout">
        <ReportSidebar
          activeSection={activeSection}
          companyName={r.metadata.company_name}
          sections={visibleSections}
          onNavigate={scrollTo}
          onEditAssessment={() => router.push('/questionario')}
          onResetAssessment={resetAssessment}
        />

        <div className="report-main" ref={mainRef}>
          <ReportHeader report={r} />

          <div id={execSection.id} style={{ marginTop: 36 }}>
            <ReportSectionHeading section={execSection} />

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

          <div className="accordion" style={{ marginTop: 44 }}>
            <ReportAccordionSection section={euSection}>
              <DirectiveSection directive={r.eu_directive} />
            </ReportAccordionSection>

            {multiCountrySection && (
              <ReportAccordionSection section={multiCountrySection}>
                <MultiCountrySection report={r} />
              </ReportAccordionSection>
            )}

            <ReportAccordionSection section={impactsSection} defaultOpen>
              <ImpactAreasSection
                impacts={r.impacts_by_area}
                maturityAreas={r.maturity}
                onSelectArea={selectMaturityArea}
              />
            </ReportAccordionSection>

            <ReportAccordionSection section={maturitySection} defaultOpen>
              <MaturityProfileSection
                areas={r.maturity}
                recommendations={r.recommendations}
                selectedAreaId={selectedMaturityAreaId}
                onSelectArea={setSelectedMaturityAreaId}
                onRecommendationNavigate={navigateToRecommendation}
              />
            </ReportAccordionSection>

            <ReportAccordionSection section={recoSection} defaultOpen>
              <RecommendationsSection
                recommendations={r.recommendations}
                highlightedRecommendationIds={highlightedRecommendationIds}
              />
            </ReportAccordionSection>

            <ReportAccordionSection section={roadmapSection} defaultOpen>
              <RoadmapSection
                roadmap={r.roadmap}
                recommendations={r.recommendations}
                onRecommendationClick={navigateToRecommendation}
                onHorizonHover={setRoadmapRecommendationIds}
              />
            </ReportAccordionSection>

            <ReportAccordionSection section={limitsSection}>
              <div className="prose">
                <p>{r.limits.scope_limitations}</p>
                <p>{r.limits.methodological_caveats}</p>
                {r.limits.draft_warning && <p style={{ color: '#8B6B00' }}><strong>Fonte in bozza:</strong> {r.limits.draft_warning}</p>}
                {r.limits.partial_data_warning && <p style={{ color: 'var(--ntt-orange-150)' }}><strong>Dati parziali:</strong> {r.limits.partial_data_warning}</p>}
                <p>Per un piano operativo dettagliato è necessario un workshop di approfondimento con il team HR e Legal del cliente, che include la validazione delle priorità identificate, la definizione del project team multifunzione e la selezione dei paesi pilota.</p>
              </div>
            </ReportAccordionSection>

            <ReportAccordionSection section={sourcesSection}>
              <SourcesSection sources={r.sources} />
            </ReportAccordionSection>
          </div>

          <ReportFooter report={r} />
        </div>
      </div>
    </div>
  );
}
