import type { MaturityAssessment } from '@/lib/schemas/maturity';

type Attention = 'alta' | 'media' | 'bassa';

const matrix: Record<number, { direct: Attention; indirect: Attention }> = {
  1: { direct: 'alta', indirect: 'alta' },
  2: { direct: 'alta', indirect: 'media' },
  3: { direct: 'media', indirect: 'media' },
  4: { direct: 'bassa', indirect: 'bassa' },
};

const up = (a: Attention): Attention => (a === 'bassa' ? 'media' : a === 'media' ? 'alta' : 'alta');

export function calculateAttention(
  maturityAssessment: MaturityAssessment,
  selectedValues: Record<string, number | null>,
  hasDraftSource: boolean,
) {
  const byArea: Record<string, Attention | null> = {};

  for (const area of maturityAssessment.areas) {
    const value = selectedValues[area.id];
    if (!value) {
      byArea[area.id] = null;
      continue;
    }
    const base = area.has_direct_obligation ? matrix[value].direct : matrix[value].indirect;
    byArea[area.id] = hasDraftSource ? up(base) : base;
  }

  const present = Object.values(byArea).filter(Boolean) as Attention[];
  const overall: Attention = present.includes('alta') ? 'alta' : present.includes('media') ? 'media' : 'bassa';

  return { byArea, overall };
}
