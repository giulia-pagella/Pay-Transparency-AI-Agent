import { describe, expect, it } from 'vitest';
import type { ReportJson } from '@/lib/schemas/report';
import { getVisibleReportSections, isMultiCountry, REPORT_SECTIONS } from '@/app/report/components/reportSections';

function reportWithCountries(selectedCountries: string[]): ReportJson {
  return {
    metadata: {
      selected_countries: selectedCountries,
    },
  } as ReportJson;
}

describe('report sections', () => {
  it('nasconde analisi multi-country nel frontend single-country', () => {
    const sections = getVisibleReportSections(reportWithCountries(['IT']));

    expect(isMultiCountry(reportWithCountries(['IT']))).toBe(false);
    expect(sections.map((section) => section.id)).not.toContain('multi-country');
    expect(sections.map((section) => section.id)).toContain('roadmap');
  });

  it('mostra analisi multi-country nella posizione target per report multi-country', () => {
    const sections = getVisibleReportSections(reportWithCountries(['IT', 'FR']));

    expect(isMultiCountry(reportWithCountries(['IT', 'FR']))).toBe(true);
    expect(sections.map((section) => section.id)).toEqual([
      'exec',
      'eu',
      'multi-country',
      'impacts',
      'maturity',
      'reco',
      'roadmap',
      'limits',
      'sources',
    ]);
  });

  it('renderizza roadmap tra raccomandazioni e limiti in Fase 2B', () => {
    const ids = REPORT_SECTIONS.map((section) => section.id);

    expect(ids.indexOf('roadmap')).toBeGreaterThan(ids.indexOf('reco'));
    expect(ids.indexOf('roadmap')).toBeLessThan(ids.indexOf('limits'));
  });
});
