'use client';

import type { ReportJson } from '@/lib/schemas/report';
import { groupRecommendationsByTemporalTag } from '../utils/reportDisplay';

type RoadmapSectionProps = {
  roadmap: ReportJson['roadmap'];
  recommendations: ReportJson['recommendations'];
  onRecommendationClick: (recommendationId: string) => void;
  onHorizonHover: (recommendationIds: string[]) => void;
};

export function RoadmapSection({
  roadmap,
  recommendations,
  onRecommendationClick,
  onHorizonHover,
}: RoadmapSectionProps) {
  const groups = groupRecommendationsByTemporalTag(recommendations);
  const engagementPriorities = roadmap.engagement_priorities ?? [];

  return (
    <>
      <div className="prose">
        <p>{roadmap.roadmap_intro || 'Roadmap sintetica costruita dagli orizzonti temporali delle raccomandazioni.'}</p>
      </div>

      {engagementPriorities.length > 0 && (
        <div style={{ marginTop: 16, marginBottom: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>PRIORITÀ DI INGAGGIO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {engagementPriorities.map((priority, index) => (
              <div key={`${priority}-${index}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--ntt-text-gray)', lineHeight: 1.5 }}>
                <span className="serif" style={{ fontSize: 16, color: 'var(--ntt-gray-100)', lineHeight: 1, minWidth: 24 }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {groups.map((group, index) => {
          const recommendationIds = group.recommendations.map((recommendation) => recommendation.id);

          return (
            <div
              key={group.temporalTag}
              className="card"
              onMouseEnter={() => onHorizonHover(recommendationIds)}
              onMouseLeave={() => onHorizonHover([])}
              onFocus={() => onHorizonHover(recommendationIds)}
              onBlur={() => onHorizonHover([])}
              style={{ padding: 16, borderTop: '3px solid var(--ntt-future-blue)' }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 10 }}>
                <span className="serif" style={{ fontSize: 22, color: 'var(--ntt-gray-100)', lineHeight: 1 }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{group.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--ntt-gray-100)', marginTop: 2 }}>{group.label}</div>
                </div>
              </div>

              {group.recommendations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {group.recommendations.map((recommendation) => {
                    const recommendationIndex = recommendations.findIndex((item) => item.id === recommendation.id);

                    return (
                      <button
                        key={recommendation.id}
                        type="button"
                        onClick={() => onRecommendationClick(recommendation.id)}
                        style={{
                          background: '#F5F7F9',
                          border: '1px solid var(--ntt-gray-50)',
                          borderRadius: 2,
                          padding: '8px 9px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'var(--font-sans)',
                          color: 'var(--ntt-text-gray)',
                          fontSize: 12,
                          lineHeight: 1.45,
                        }}
                      >
                        <strong style={{ color: 'var(--ntt-smart-navy)' }}>
                          {String(recommendationIndex + 1).padStart(2, '0')}
                        </strong>{' '}
                        {recommendation.title}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ntt-gray-100)', lineHeight: 1.5 }}>
                  Nessuna raccomandazione in questo orizzonte.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
