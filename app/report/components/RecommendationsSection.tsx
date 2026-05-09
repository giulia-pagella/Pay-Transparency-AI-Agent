import type { ReportJson } from '@/lib/schemas/report';
import { AttentionPill } from './AttentionPill';
import { getRecommendationActions, getRecommendationSummary } from '../utils/reportDisplay';

type RecommendationsSectionProps = {
  recommendations: ReportJson['recommendations'];
  highlightedRecommendationIds: string[];
};

export function RecommendationsSection({ recommendations, highlightedRecommendationIds }: RecommendationsSectionProps) {
  return (
    <>
      <p style={{ fontSize: 13, color: 'var(--ntt-text-gray)', marginBottom: 16, maxWidth: 700 }}>
        Raccomandazioni preliminari ordinate per priorità, collegate alle aree HR e alle fonti normative.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {recommendations.map((recommendation, index) => {
          const highlighted = highlightedRecommendationIds.includes(recommendation.id);
          const actions = getRecommendationActions(recommendation).slice(0, 3);
          const directiveArticles = recommendation.directive_articles ?? [];
          const relatedAreas = recommendation.related_areas ?? [];
          const relatedCountries = recommendation.related_countries ?? [];
          const borderColor = recommendation.priority === 'alta' || recommendation.priority === 'Alta'
            ? 'var(--ntt-orange-100)'
            : recommendation.priority === 'media' || recommendation.priority === 'Media'
              ? 'var(--ntt-yellow)'
              : 'var(--ntt-green-150)';

          return (
            <div
              key={recommendation.id}
              id={`recommendation-${recommendation.id}`}
              className="card"
              style={{
                padding: 18,
                borderLeft: `3px solid ${borderColor}`,
                boxShadow: highlighted ? '0 0 0 2px rgba(0,114,188,.22)' : undefined,
                background: highlighted ? '#F5FAFD' : 'white',
                transition: 'background .15s ease, box-shadow .15s ease',
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span className="serif" style={{ fontSize: 22, color: 'var(--ntt-gray-100)', lineHeight: 1, minWidth: 28 }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 7 }}>
                    <AttentionPill level={recommendation.priority} labelPrefix="Priorità" />
                    <span className="badge badge-blue">{recommendation.temporal_tag}</span>
                    {relatedAreas.map((area) => <span key={area} className="badge badge-gray">{area}</span>)}
                    {relatedCountries.map((country) => <span key={country} className="badge badge-blue">{country}</span>)}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ntt-smart-navy)', marginBottom: 6, lineHeight: 1.35 }}>
                    {recommendation.title}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--ntt-text-gray)', lineHeight: 1.6 }}>
                    {getRecommendationSummary(recommendation)}
                  </p>

                  {actions.length > 0 && (
                    <ul style={{ margin: '10px 0 0', padding: '0 0 0 18px', color: 'var(--ntt-text-gray)', fontSize: 12, lineHeight: 1.55 }}>
                      {actions.map((action, actionIndex) => (
                        <li key={`${recommendation.id}-action-${actionIndex}`}>{action}</li>
                      ))}
                    </ul>
                  )}

                  {directiveArticles.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--ntt-gray-50)', fontSize: 11, color: 'var(--ntt-gray-100)' }}>
                      Articoli Direttiva: {directiveArticles.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
