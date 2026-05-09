import { describe, expect, it } from 'vitest';
import type { ReportJson } from '@/lib/schemas/report';
import {
  getSortedDirectiveObligations,
  groupRecommendationsByTemporalTag,
  splitSourcesByStatus,
} from '@/app/report/utils/reportDisplay';

type Obligation = ReportJson['eu_directive']['key_obligations'][number];
type Recommendation = ReportJson['recommendations'][number];
type Source = ReportJson['sources'][number];

describe('report display helpers', () => {
  it('ordina obblighi direttiva con shape nuova per numero articolo', () => {
    const obligations = [
      { article: 'Articolo 7', title: 'B', description: 'B', subject: 'datore di lavoro', source_tag: 'FONTE UE' },
      { article: 'Articolo 5', title: 'A', description: 'A', subject: 'datore di lavoro', source_tag: 'FONTE UE' },
      { article: 'Articolo 10', title: 'C', description: 'C', subject: 'Stato membro', source_tag: 'FONTE UE' },
    ] as Obligation[];

    expect(getSortedDirectiveObligations(obligations).map((item) => item.article)).toEqual([
      'Articolo 5',
      'Articolo 7',
      'Articolo 10',
    ]);
  });

  it('raggruppa roadmap per temporal_tag', () => {
    const recommendations = [
      { id: 'r1', title: 'Uno', temporal_tag: 'Immediata' },
      { id: 'r2', title: 'Due', temporal_tag: 'Entro 6 mesi' },
      { id: 'r3', title: 'Tre', temporal_tag: 'Entro 12 mesi' },
      { id: 'r4', title: 'Quattro', temporal_tag: 'Immediata' },
    ] as Recommendation[];

    const groups = groupRecommendationsByTemporalTag(recommendations);

    expect(groups.map((group) => group.temporalTag)).toEqual(['Immediata', 'Entro 6 mesi', 'Entro 12 mesi']);
    expect(groups[0].recommendations.map((recommendation) => recommendation.id)).toEqual(['r1', 'r4']);
    expect(groups[1].recommendations.map((recommendation) => recommendation.id)).toEqual(['r2']);
    expect(groups[2].recommendations.map((recommendation) => recommendation.id)).toEqual(['r3']);
  });

  it('divide fonti definitive e in bozza', () => {
    const sources = [
      { document_title: 'Direttiva UE', country_code: 'EU', status: 'definitive' },
      { document_title: 'Bozza nazionale', country_code: 'IT', status: 'draft' },
    ] as Source[];

    expect(splitSourcesByStatus(sources)).toMatchObject({
      definitive: [{ document_title: 'Direttiva UE' }],
      draft: [{ document_title: 'Bozza nazionale' }],
    });
  });
});
