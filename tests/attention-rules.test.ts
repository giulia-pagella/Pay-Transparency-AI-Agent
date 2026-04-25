import { describe, expect, it } from 'vitest';
import maturity from '@/data/maturity-assessment.json';
import { calculateAttention } from '@/lib/attention/rules';
import { maturityAssessmentSchema } from '@/lib/schemas/maturity';

describe('attention rules', () => {
  it('calcola alta su livello 1', () => {
    const parsed = maturityAssessmentSchema.parse(maturity);
    const out = calculateAttention(parsed, { talent_attraction: 1 }, false);
    expect(out.byArea.talent_attraction).toBe('alta');
  });

  it('applica amplificatore draft', () => {
    const parsed = maturityAssessmentSchema.parse(maturity);
    const out = calculateAttention(parsed, { performance: 4 }, true);
    expect(out.byArea.performance).toBe('media');
  });
});
