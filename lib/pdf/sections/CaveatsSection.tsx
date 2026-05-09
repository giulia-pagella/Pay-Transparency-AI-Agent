import React from 'react';
import { Page, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s, C } from '@/lib/pdf/utils/pdfStyles';
import { PageFooter } from '@/lib/pdf/components/PdfFooter';
import { SectionHeader } from '@/lib/pdf/components/PdfSectionTitle';
import type { PdfSection } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
  section: PdfSection;
}

export function CaveatsSection({ report: r, section }: Props) {
  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title={section.title} />

      <Text style={[s.body, s.mb8]}>{r.limits.scope_limitations}</Text>
      <Text style={[s.body, s.mb8]}>{r.limits.methodological_caveats}</Text>
      {r.limits.draft_warning && (
        <Text style={[s.bodySmall, { color: C.yellowDark, marginBottom: 6 }]}>
          Fonte in bozza: {r.limits.draft_warning}
        </Text>
      )}
      {r.limits.partial_data_warning && (
        <Text style={[s.bodySmall, { color: C.orangeDark, marginBottom: 6 }]}>
          Dati parziali: {r.limits.partial_data_warning}
        </Text>
      )}
    </Page>
  );
}
