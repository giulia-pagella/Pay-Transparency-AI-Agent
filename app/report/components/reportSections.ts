import type { ReportJson } from '@/lib/schemas/report';

export type ReportSectionId =
  | 'exec'
  | 'eu'
  | 'multi-country'
  | 'impacts'
  | 'maturity'
  | 'reco'
  | 'roadmap'
  | 'limits'
  | 'sources';

export type ReportSection = {
  id: ReportSectionId;
  num: string;
  title: string;
};

type ReportSectionConfig = ReportSection & {
  visibleWhen?: 'multi-country';
  render?: boolean;
};

export const REPORT_SECTIONS: ReportSectionConfig[] = [
  { id: 'exec', num: '01', title: 'Executive Summary' },
  { id: 'eu', num: '02', title: 'Direttiva UE 2023/970' },
  { id: 'multi-country', num: '03', title: 'Analisi multi-country', visibleWhen: 'multi-country' },
  { id: 'impacts', num: '04', title: 'Impatti per area HR' },
  { id: 'maturity', num: '05', title: 'Profilo di maturità' },
  { id: 'reco', num: '06', title: 'Raccomandazioni' },
  { id: 'roadmap', num: '07', title: 'Roadmap', render: false },
  { id: 'limits', num: '08', title: 'Limiti e caveat' },
  { id: 'sources', num: '09', title: 'Fonti normative' },
];

export function isMultiCountry(report: ReportJson): boolean {
  return report.metadata.selected_countries.length > 1;
}

export function getVisibleReportSections(report: ReportJson): ReportSection[] {
  return REPORT_SECTIONS.filter((section) => {
    if (section.render === false) return false;
    if (section.visibleWhen === 'multi-country') return isMultiCountry(report);
    return true;
  }).map(({ id, num, title }) => ({ id, num, title }));
}

export function getReportSectionById(sections: ReportSection[], id: ReportSectionId): ReportSection {
  const section = sections.find((item) => item.id === id);

  if (!section) {
    throw new Error(`Report section not available: ${id}`);
  }

  return section;
}
