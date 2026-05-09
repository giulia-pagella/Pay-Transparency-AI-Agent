'use client';

import { useState } from 'react';
import { Icon } from '@/components/icon';
import type { ReportJson } from '@/lib/schemas/report';
import { formatDateIT } from '@/lib/utils/date';

type MultiCountrySectionProps = {
  report: ReportJson;
};

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    vigente: 'Vigente',
    in_bozza: 'In bozza',
    in_recepimento: 'In recepimento',
  };
  return labels[status] ?? status;
}

export function MultiCountrySection({ report }: MultiCountrySectionProps) {
  const [showCountryDetails, setShowCountryDetails] = useState(false);
  const comparison = report.countries_comparison;
  const timeline = comparison.timeline ?? [];
  const tableRows = comparison.table_rows ?? [];
  const countryAnalysis = report.country_analysis ?? [];
  const intro = comparison.thesis || comparison.narrative || 'Analisi multi-country non disponibile per i dati correnti.';
  const hasTimeline = timeline.length > 0;
  const hasTable = tableRows.length > 0;

  return (
    <>
      <div className="prose">
        <p>{intro}</p>
      </div>

      <div style={{ marginTop: 18, marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>TIMELINE DI RECEPIMENTO</div>
        {hasTimeline ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {timeline.map((item) => (
              <div key={`${item.country_code}-${item.phase_label}`} className="card" style={{ padding: 14, borderTop: '3px solid var(--ntt-future-blue)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ntt-smart-navy)', marginBottom: 4 }}>
                  {item.country_name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ntt-gray-100)', marginBottom: 8 }}>
                  {statusLabel(item.status)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ntt-text-gray)', lineHeight: 1.45 }}>
                  {item.phase_label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ntt-gray-100)', marginTop: 8 }}>
                  {formatDateIT(item.enforcement_date)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ntt-gray-100)' }}>
            Timeline non disponibile per i dati correnti.
          </p>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>TABELLA COMPARATIVA</div>
        {hasTable ? (
          <div style={{ overflowX: 'auto', marginTop: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--ntt-smart-navy)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'var(--ntt-smart-navy)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Tema</th>
                  {report.metadata.selected_countries.map((country) => (
                    <th key={country} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'var(--ntt-smart-navy)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{country}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={`${row.topic}-${i}`} style={{ borderBottom: '1px solid var(--ntt-gray-50)' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 700, color: 'var(--ntt-smart-navy)', fontSize: 13 }}>{row.topic}</td>
                    {report.metadata.selected_countries.map((country) => (
                      <td key={country} style={{ padding: '9px 10px', color: 'var(--ntt-text-gray)', fontSize: 13 }}>{row.cells?.[country] ?? '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ntt-gray-100)' }}>
            Tabella comparativa non disponibile per i dati correnti.
          </p>
        )}
      </div>

      {countryAnalysis.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowCountryDetails((value) => !value)}
            style={{
              background: 'transparent',
              color: 'var(--ntt-future-blue-150)',
              border: '1px solid var(--ntt-gray-50)',
              padding: '8px 10px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              borderRadius: 2,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name="chevron-down" size={14} style={{ transform: showCountryDetails ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' }} />
            Vedi analisi paese per paese
          </button>

          {showCountryDetails && (
            <div style={{ marginTop: 16 }}>
              {countryAnalysis.map((country) => (
                <div key={country.country_code} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{country.country_name}</h4>
                    {country.status === 'draft' && <span className="badge badge-yellow"><span className="badge-dot" />Bozza</span>}
                  </div>
                  <div className="prose">
                    <p>{country.national_framework_summary}</p>
                    {(country.key_differences_vs_eu ?? []).length > 0 && (
                      <ul>{(country.key_differences_vs_eu ?? []).map((difference, i) => <li key={i}>{difference}</li>)}</ul>
                    )}
                    {country.implementation_notes && <p style={{ fontStyle: 'italic', color: 'var(--ntt-gray-100)', fontSize: 13 }}>{country.implementation_notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
