import type { ReportJson } from '@/lib/schemas/report';

export type DirectiveObligation = ReportJson['eu_directive']['key_obligations'][number];
export type Recommendation = ReportJson['recommendations'][number];
export type MaturityArea = ReportJson['maturity'][number];
export type ImpactArea = ReportJson['impacts_by_area'][number];
export type ReportSource = ReportJson['sources'][number];

export const ROADMAP_HORIZONS = [
  { temporalTag: 'Immediata', title: 'Quick Wins', label: 'Immediata' },
  { temporalTag: 'Entro 6 mesi', title: 'Consolidamento', label: 'Entro 6 mesi' },
  { temporalTag: 'Entro 12 mesi', title: 'Trasformazione', label: 'Entro 12 mesi' },
] as const;

type RoadmapTemporalTag = (typeof ROADMAP_HORIZONS)[number]['temporalTag'];

const attentionRank: Record<string, number> = {
  alta: 3,
  media: 2,
  bassa: 1,
};

const maturityLevelRank: Record<string, number> = {
  Iniziale: 1,
  Parziale: 2,
  Strutturato: 3,
  Avanzato: 4,
  'Non valutata': 5,
};

function normalized(value: string): string {
  return value.trim().toLowerCase();
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function getArticleNumber(value: string | undefined): number {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

export function getObligationArticleLabel(obligation: DirectiveObligation): string {
  return obligation.article || obligation.article_reference || 'Articolo non specificato';
}

export function getSortedDirectiveObligations(obligations: DirectiveObligation[]): DirectiveObligation[] {
  return [...obligations].sort((a, b) => {
    const byArticle = getArticleNumber(getObligationArticleLabel(a)) - getArticleNumber(getObligationArticleLabel(b));
    if (byArticle !== 0) return byArticle;
    return getObligationArticleLabel(a).localeCompare(getObligationArticleLabel(b), 'it');
  });
}

export function getDirectiveDetailRows(obligation: DirectiveObligation): Array<{ label: string; value: string }> {
  const raw = obligation as DirectiveObligation & Record<string, unknown>;
  const articleText = optionalString(raw.article_text) ?? optionalString(raw.full_text) ?? optionalString(raw.text);
  const scopeDetails = optionalString(raw.scope_details) ?? optionalString(raw.scope);
  const source = Array.isArray(raw.sources)
    ? raw.sources.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).join(', ')
    : optionalString(raw.sources) ?? optionalString(raw.source);

  return [
    articleText ? { label: 'Testo articolo', value: articleText } : null,
    scopeDetails ? { label: 'Dettagli scope', value: scopeDetails } : null,
    source ? { label: 'Fonti', value: source } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
}

export function groupRecommendationsByTemporalTag(recommendations: Recommendation[]) {
  return ROADMAP_HORIZONS.map((horizon) => ({
    ...horizon,
    recommendations: recommendations.filter((recommendation) => recommendation.temporal_tag === horizon.temporalTag),
  }));
}

export function getRecommendationIdsByTemporalTag(recommendations: Recommendation[], temporalTag: RoadmapTemporalTag): string[] {
  return recommendations
    .filter((recommendation) => recommendation.temporal_tag === temporalTag)
    .map((recommendation) => recommendation.id);
}

export function splitSourcesByStatus(sources: ReportSource[]) {
  return {
    definitive: sources.filter((source) => source.status === 'definitive'),
    draft: sources.filter((source) => source.status === 'draft'),
  };
}

export function getSourceScope(source: ReportSource): string {
  if (source.country_code === 'EU') return 'Unione Europea';
  return source.country_code || 'Scope non disponibile';
}

export function normalizeAttentionLevel(level: string | null | undefined): 'alta' | 'media' | 'bassa' | null {
  if (!level) return null;
  const value = normalized(level);
  if (value === 'alta' || value === 'media' || value === 'bassa') return value;
  return null;
}

export function getAttentionRank(level: string | null | undefined): number {
  const normalizedLevel = normalizeAttentionLevel(level);
  return normalizedLevel ? attentionRank[normalizedLevel] : 0;
}

export function getDefaultMaturityAreaId(areas: MaturityArea[]): string | null {
  const [area] = [...areas].sort((a, b) => {
    const byAttention = getAttentionRank(b.attention) - getAttentionRank(a.attention);
    if (byAttention !== 0) return byAttention;

    const aLevel = a.current_level ?? maturityLevelRank[a.maturity_level] ?? 5;
    const bLevel = b.current_level ?? maturityLevelRank[b.maturity_level] ?? 5;
    return aLevel - bLevel;
  });

  return area?.area_id ?? null;
}

export function getMaturityAnalysis(area: MaturityArea): string {
  return area.analysis || area.gap_description || 'Analisi non disponibile.';
}

export function getImpactSummary(area: ImpactArea, maturityAreas: MaturityArea[]): string {
  const maturityArea = maturityAreas.find((item) => item.area_id === area.area_id);
  const sourceText = maturityArea?.analysis || maturityArea?.gap_description || area.impact_description;
  return sourceText.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
}

export function getImpactArticleReference(area: ImpactArea, maturityAreas: MaturityArea[]): string {
  const maturityArea = maturityAreas.find((item) => item.area_id === area.area_id);
  if (area.regulatory_reference) return area.regulatory_reference;
  return maturityArea?.directive_articles.join(', ') ?? '';
}

export function findRecommendationForArea(area: MaturityArea, recommendations: Recommendation[]): Recommendation | null {
  const areaKeys = [area.area_id, area.area_name].map(normalized);

  return recommendations.find((recommendation) => (
    (recommendation.related_areas ?? []).some((relatedArea) => areaKeys.includes(normalized(relatedArea)))
  )) ?? null;
}

export function getRecommendationSummary(recommendation: Recommendation): string {
  return recommendation.short_description || recommendation.description || 'Descrizione non disponibile.';
}

export function getRecommendationActions(recommendation: Recommendation): string[] {
  const raw = recommendation as Recommendation & Record<string, unknown>;

  if (recommendation.concrete_actions?.length) return recommendation.concrete_actions;
  if (Array.isArray(raw.actions)) {
    return raw.actions.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  return recommendation.description ? [recommendation.description] : [];
}
