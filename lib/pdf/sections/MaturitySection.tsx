import React from 'react';
import { Page } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s } from '@/lib/pdf/utils/pdfStyles';
import { PageFooter } from '@/lib/pdf/components/PdfFooter';
import { SectionHeader } from '@/lib/pdf/components/PdfSectionTitle';
import { PdfMaturityRadar, PdfMaturityDetailCard } from '@/lib/pdf/components/PdfMaturityChart';
import type { PdfSection } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
  section: PdfSection;
}

export function MaturitySection({ report: r, section }: Props) {
  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title={section.title} />
      <PdfMaturityRadar areas={r.maturity} />
      {r.maturity.map((area, i) => (
        <PdfMaturityDetailCard key={area.area_id} area={area} num={i + 1} />
      ))}
    </Page>
  );
}
