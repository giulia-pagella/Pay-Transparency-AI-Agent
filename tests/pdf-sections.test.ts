import { describe, expect, it } from 'vitest';
import type { ReportJson } from '@/lib/schemas/report';
import {
  PDF_SECTION_CONFIG,
  getVisiblePdfSections,
  isMultiCountry,
} from '@/lib/pdf/utils/pdfSections';

function reportWithCountries(selectedCountries: string[]): ReportJson {
  return {
    metadata: { selected_countries: selectedCountries },
  } as ReportJson;
}

describe('PDF sezioni — configurazione', () => {
  it('non include Perimetro, Analisi per paese, Impatti per area HR', () => {
    const ids = PDF_SECTION_CONFIG.map((s) => s.id);
    expect(ids).not.toContain('perimeter');
    expect(ids).not.toContain('country-analysis');
    expect(ids).not.toContain('impacts');
  });

  it('include tutte le sezioni target della Fase 3A', () => {
    const ids = PDF_SECTION_CONFIG.map((s) => s.id);
    expect(ids).toContain('exec');
    expect(ids).toContain('directive');
    expect(ids).toContain('multi-country');
    expect(ids).toContain('maturity');
    expect(ids).toContain('reco');
    expect(ids).toContain('roadmap');
    expect(ids).toContain('caveats');
    expect(ids).toContain('sources');
  });
});

describe('PDF sezioni — single-country gating', () => {
  it('isMultiCountry restituisce false con un solo paese', () => {
    expect(isMultiCountry(reportWithCountries(['IT']))).toBe(false);
  });

  it('isMultiCountry restituisce true con più paesi', () => {
    expect(isMultiCountry(reportWithCountries(['IT', 'FR']))).toBe(true);
  });

  it('Analisi multi-country è nascosta in single-country', () => {
    const sections = getVisiblePdfSections(reportWithCountries(['IT']));
    expect(sections.map((s) => s.id)).not.toContain('multi-country');
  });

  it('Analisi multi-country è visibile con più paesi', () => {
    const sections = getVisiblePdfSections(reportWithCountries(['IT', 'FR']));
    expect(sections.map((s) => s.id)).toContain('multi-country');
  });
});

describe('PDF sezioni — numerazione dinamica', () => {
  it('i numeri partono da 01 e sono consecutivi in single-country', () => {
    const sections = getVisiblePdfSections(reportWithCountries(['IT']));
    sections.forEach((sec, i) => {
      expect(sec.num).toBe(String(i + 1).padStart(2, '0'));
    });
  });

  it('i numeri partono da 01 e sono consecutivi in multi-country', () => {
    const sections = getVisiblePdfSections(reportWithCountries(['IT', 'FR']));
    sections.forEach((sec, i) => {
      expect(sec.num).toBe(String(i + 1).padStart(2, '0'));
    });
  });

  it('multi-country è immediatamente dopo directive nella numerazione', () => {
    const sections = getVisiblePdfSections(reportWithCountries(['IT', 'FR']));
    const idxDirective = sections.findIndex((s) => s.id === 'directive');
    const idxMulti    = sections.findIndex((s) => s.id === 'multi-country');
    expect(idxMulti).toBe(idxDirective + 1);
  });

  it('roadmap è tra raccomandazioni e limiti', () => {
    const sections = getVisiblePdfSections(reportWithCountries(['IT']));
    const ids = sections.map((s) => s.id);
    expect(ids.indexOf('roadmap')).toBeGreaterThan(ids.indexOf('reco'));
    expect(ids.indexOf('roadmap')).toBeLessThan(ids.indexOf('caveats'));
  });
});
