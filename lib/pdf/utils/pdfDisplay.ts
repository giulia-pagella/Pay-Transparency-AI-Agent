import type { ReportJson } from '@/lib/schemas/report';
import { formatDateIT } from '@/lib/utils/date';

export type DirectiveObligation = ReportJson['eu_directive']['key_obligations'][number];
export type Recommendation = ReportJson['recommendations'][number];
export type ReportSource = ReportJson['sources'][number];

export const ROADMAP_HORIZONS = [
  { temporalTag: 'Immediata', title: 'Quick Wins', range: '0-3 mesi' },
  { temporalTag: 'Entro 6 mesi', title: 'Consolidamento', range: '3-9 mesi' },
  { temporalTag: 'Entro 12 mesi', title: 'Trasformazione', range: '9-18 mesi' },
] as const;

function firstArticleNumber(value: string | undefined): number {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

function optionalText(value: unknown): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

export function formatPdfDate(input: string | null | undefined): string {
  if (!input) return 'Data non disponibile';
  return formatDateIT(input);
}

export function getGeneratedDate(report: ReportJson): string {
  return formatPdfDate(report.metadata.generated_at);
}

export function getArticleLabel(obligation: DirectiveObligation): string {
  return obligation.article || obligation.article_reference || 'Articolo non specificato';
}

export function getSortedDirectiveObligations(obligations: DirectiveObligation[]): DirectiveObligation[] {
  return [...obligations].sort((a, b) => {
    const articleDiff = firstArticleNumber(getArticleLabel(a)) - firstArticleNumber(getArticleLabel(b));
    if (articleDiff !== 0) return articleDiff;
    return getArticleLabel(a).localeCompare(getArticleLabel(b), 'it');
  });
}

export function getRecommendationSummary(rec: Recommendation): string {
  return rec.short_description || rec.description || 'Descrizione non disponibile.';
}

export function getRecommendationActions(rec: Recommendation): string[] {
  const raw = rec as Recommendation & Record<string, unknown>;
  if (rec.concrete_actions?.length) return rec.concrete_actions;
  if (Array.isArray(raw.actions)) {
    return raw.actions.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  return rec.description ? [rec.description] : [];
}

export function groupRecommendationsByTemporalTag(recommendations: Recommendation[]) {
  return ROADMAP_HORIZONS.map((horizon) => ({
    ...horizon,
    recommendations: recommendations.filter((rec) => rec.temporal_tag === horizon.temporalTag),
  }));
}

export function splitSourcesByStatus(sources: ReportSource[]) {
  const sorted = [...sources].sort((a, b) => {
    const scope = getSourceScope(a).localeCompare(getSourceScope(b), 'it');
    if (scope !== 0) return scope;
    return formatPdfDate(a.date).localeCompare(formatPdfDate(b.date), 'it');
  });

  return {
    definitive: sorted.filter((source) => source.status === 'definitive'),
    draft: sorted.filter((source) => source.status === 'draft'),
  };
}

export function getSourceScope(source: ReportSource): string {
  if (source.country_code === 'EU') return 'Unione Europea';
  return optionalText(source.country_code) || 'Scope non disponibile';
}

export function getMaturityAnalysis(area: ReportJson['maturity'][number]): string {
  return area.analysis || area.gap_description || 'Analisi non disponibile.';
}

export function getMaturityArticleReferences(area: ReportJson['maturity'][number]): string {
  return area.directive_articles?.length ? area.directive_articles.join(', ') : '';
}

export function getReportVersion(report: ReportJson): string {
  return report.metadata.tool_version || '1.0.0';
}
