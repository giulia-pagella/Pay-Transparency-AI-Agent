'use client';

import type { ReportJson } from '@/lib/schemas/report';
import { AttentionPill } from './AttentionPill';
import { getImpactArticleReference, getImpactSummary } from '../utils/reportDisplay';

type ImpactAreasSectionProps = {
  impacts: ReportJson['impacts_by_area'];
  maturityAreas: ReportJson['maturity'];
  onSelectArea: (areaId: string) => void;
};

export function ImpactAreasSection({ impacts, maturityAreas, onSelectArea }: ImpactAreasSectionProps) {
  return (
    <>
      <p style={{ fontSize: 13, color: 'var(--ntt-text-gray)', marginBottom: 16, maxWidth: 700 }}>
        Overview delle aree HR più rilevanti ai fini della Direttiva e del profilo di maturità corrente.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {impacts.map((area) => {
          const articleReference = getImpactArticleReference(area, maturityAreas);

          return (
            <button
              key={area.area_id}
              type="button"
              onClick={() => onSelectArea(area.area_id)}
              className="card"
              style={{
                padding: 14,
                border: '1px solid var(--ntt-gray-50)',
                borderLeft: area.attention_level ? '3px solid var(--ntt-future-blue)' : '1px solid var(--ntt-gray-50)',
                background: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{area.area_name}</div>
                  {articleReference && <div style={{ fontSize: 11, color: 'var(--ntt-gray-100)', marginTop: 2 }}>{articleReference}</div>}
                </div>
                <AttentionPill level={area.attention_level} />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ntt-text-gray)', lineHeight: 1.5 }}>{getImpactSummary(area, maturityAreas)}</p>
            </button>
          );
        })}
      </div>
    </>
  );
}
