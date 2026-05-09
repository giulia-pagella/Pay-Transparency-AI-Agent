'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/icon';
import type { ReportJson } from '@/lib/schemas/report';
import {
  getDirectiveDetailRows,
  getObligationArticleLabel,
  getSortedDirectiveObligations,
} from '../utils/reportDisplay';

type DirectiveSectionProps = {
  directive: ReportJson['eu_directive'];
};

export function DirectiveSection({ directive }: DirectiveSectionProps) {
  const obligations = useMemo(
    () => getSortedDirectiveObligations(directive.key_obligations ?? []).slice(0, 4),
    [directive.key_obligations],
  );
  const [openObligation, setOpenObligation] = useState<string | null>(null);

  return (
    <>
      <div className="prose">
        <p>{directive.overview}</p>
        <p>{directive.timeline_summary}</p>
      </div>

      {obligations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {obligations.map((obligation, index) => {
            const articleLabel = getObligationArticleLabel(obligation);
            const sourceTag = obligation.source_tag || 'FONTE UE';
            const detailRows = getDirectiveDetailRows(obligation);
            const key = `${articleLabel}-${index}`;
            const open = openObligation === key;

            return (
              <div key={key} className="card" style={{ padding: 0, borderLeft: '3px solid var(--ntt-future-blue)', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setOpenObligation(open ? null : key)}
                  aria-expanded={open}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: 16,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                        <span className="badge badge-blue">{articleLabel}</span>
                        <span className="badge badge-gray">{sourceTag}</span>
                        <span className="badge badge-gray">Soggetto: {obligation.subject}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ntt-smart-navy)', lineHeight: 1.35 }}>
                        {obligation.title}
                      </div>
                    </div>
                    <Icon name="chevron-down" size={18} style={{ color: 'var(--ntt-gray-100)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease', flexShrink: 0 }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--ntt-text-gray)', lineHeight: 1.55 }}>
                    {obligation.description}
                  </p>
                </button>

                {open && detailRows.length > 0 && (
                  <div style={{ padding: '0 16px 16px' }}>
                    <div style={{ borderTop: '1px solid var(--ntt-gray-50)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {detailRows.map((row) => (
                        <div key={row.label}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ntt-gray-100)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                            {row.label}
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--ntt-text-gray)', lineHeight: 1.55 }}>
                            {row.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
