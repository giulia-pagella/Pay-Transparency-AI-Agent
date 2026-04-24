import { describe, expect, it } from 'vitest';
import countries from '@/data/regulations/countries.json';
import maturity from '@/data/maturity-assessment.json';
import { countriesSchema, regulationSchema } from '@/lib/schemas/regulations';
import { maturityAssessmentSchema } from '@/lib/schemas/maturity';

describe('schemas', () => {
  it('countries valid', () => {
    expect(() => countriesSchema.parse(countries)).not.toThrow();
  });

  it('maturity valid', () => {
    expect(() => maturityAssessmentSchema.parse(maturity)).not.toThrow();
  });

  it('regulation invalid sample', () => {
    expect(() => regulationSchema.parse({ country_code: 'IT' })).toThrow();
  });
});
