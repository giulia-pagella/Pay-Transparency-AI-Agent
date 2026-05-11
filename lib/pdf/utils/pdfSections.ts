import type { ReportJson } from '@/lib/schemas/report';

export type PdfSectionId =
  | 'exec'
  | 'directive'
  | 'multi-country'
  | 'maturity'
  | 'reco'
  | 'roadmap'
  | 'caveats'
  | 'sources';

export type PdfSection = {
  id: PdfSectionId;
  num: string;
  title: string;
};

type PdfSectionConfig = Omit<PdfSection, 'num'> & {
  visibleWhen?: 'multi-country';
};

export const PDF_SECTION_CONFIG: PdfSectionConfig[] = [
  { id: 'exec',          title: 'Executive Summary' },
  { id: 'directive',     title: 'Direttiva UE 2023/970' },
  { id: 'multi-country', title: 'Analisi multi-country', visibleWhen: 'multi-country' },
  { id: 'maturity',      title: 'Profilo di maturità' },
  { id: 'reco',          title: 'Raccomandazioni' },
  { id: 'roadmap',       title: 'Roadmap' },
  { id: 'caveats',       title: 'Limiti e caveat' },
  { id: 'sources',       title: 'Fonti normative' },
];

export function isMultiCountry(report: ReportJson): boolean {
  return report.metadata.selected_countries.length > 1;
}

/** Returns visible sections with sequential numbers (01, 02, …). */
export function getVisiblePdfSections(report: ReportJson): PdfSection[] {
  const visible = PDF_SECTION_CONFIG.filter((sec) => {
    if (sec.visibleWhen === 'multi-country') return isMultiCountry(report);
    return true;
  });
  return visible.map((sec, i) => ({
    id: sec.id,
    num: String(i + 1).padStart(2, '0'),
    title: sec.title,
  }));
}

export function getPdfSection(
  sections: PdfSection[],
  id: PdfSectionId,
): PdfSection | undefined {
  return sections.find((s) => s.id === id);
}
