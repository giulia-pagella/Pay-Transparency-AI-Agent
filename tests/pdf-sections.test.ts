import { describe, expect, it } from 'vitest';
import type { ReportJson } from '@/lib/schemas/report';
import {
  PDF_SECTION_CONFIG,
  getVisiblePdfSections,
  isMultiCountry,
} from '@/lib/pdf/utils/pdfSections';
import {
  formatPdfDate,
  groupRecommendationsByTemporalTag,
  splitSourcesByStatus,
} from '@/lib/pdf/utils/pdfDisplay';

function reportWithCountries(selectedCountries: string[]): ReportJson {
  return {
    metadata: { selected_countries: selectedCountries },
  } as ReportJson;
}

describe('PDF sezioni - configurazione', () => {
  it('non include Perimetro, Analisi per paese, Impatti per area HR', () => {
    const ids = PDF_SECTION_CONFIG.map((s) => s.id);
    expect(ids).not.toContain('perimeter');
    expect(ids).not.toContain('country-analysis');
    expect(ids).not.toContain('impacts');
  });

  it('include tutte le sezioni target', () => {
    const ids = PDF_SECTION_CONFIG.map((s) => s.id);
    expect(ids).toEqual([
      'exec',
      'directive',
      'multi-country',
      'maturity',
      'reco',
      'roadmap',
      'caveats',
      'sources',
    ]);
  });
});

describe('PDF sezioni - single-country gating', () => {
  it('isMultiCountry restituisce false con un solo paese', () => {
    expect(isMultiCountry(reportWithCountries(['IT']))).toBe(false);
  });

  it('isMultiCountry restituisce true con piu paesi', () => {
    expect(isMultiCountry(reportWithCountries(['IT', 'FR']))).toBe(true);
  });

  it('Analisi multi-country e nascosta in single-country', () => {
    const sections = getVisiblePdfSections(reportWithCountries(['IT']));
    expect(sections.map((s) => s.id)).not.toContain('multi-country');
  });

  it('Analisi multi-country e visibile con piu paesi', () => {
    const sections = getVisiblePdfSections(reportWithCountries(['IT', 'FR']));
    expect(sections.map((s) => s.id)).toContain('multi-country');
  });
});

describe('PDF sezioni - numerazione dinamica', () => {
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

  it('roadmap e tra raccomandazioni e limiti', () => {
    const sections = getVisiblePdfSections(reportWithCountries(['IT']));
    const ids = sections.map((s) => s.id);
    expect(ids.indexOf('roadmap')).toBeGreaterThan(ids.indexOf('reco'));
    expect(ids.indexOf('roadmap')).toBeLessThan(ids.indexOf('caveats'));
  });
});

describe('PDF display helpers - Fase 3B', () => {
  it('raggruppa la roadmap per temporal_tag', () => {
    const recommendations = [
      { id: 'r1', title: 'Uno', temporal_tag: 'Immediata' },
      { id: 'r2', title: 'Due', temporal_tag: 'Entro 6 mesi' },
      { id: 'r3', title: 'Tre', temporal_tag: 'Entro 12 mesi' },
      { id: 'r4', title: 'Quattro', temporal_tag: 'Immediata' },
    ] as ReportJson['recommendations'];

    const groups = groupRecommendationsByTemporalTag(recommendations);

    expect(groups.map((group) => group.temporalTag)).toEqual(['Immediata', 'Entro 6 mesi', 'Entro 12 mesi']);
    expect(groups[0].recommendations.map((rec) => rec.id)).toEqual(['r1', 'r4']);
  });

  it('divide fonti definitive e in bozza', () => {
    const sources = [
      { document_title: 'Bozza Italia', country_code: 'IT', status: 'draft', date: '2026-01-01' },
      { document_title: 'Direttiva UE', country_code: 'EU', status: 'definitive', date: '2023-05-10' },
    ] as ReportJson['sources'];

    const split = splitSourcesByStatus(sources);

    expect(split.definitive.map((source) => source.document_title)).toEqual(['Direttiva UE']);
    expect(split.draft.map((source) => source.document_title)).toEqual(['Bozza Italia']);
  });

  it('mostra fallback per date non disponibili o non parseabili', () => {
    expect(formatPdfDate(undefined)).toBe('Data non disponibile');
    expect(formatPdfDate('non-una-data')).toBe('Data non disponibile');
  });
});
