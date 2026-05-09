import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s, C } from '@/lib/pdf/utils/pdfStyles';
import { PageFooter } from '@/lib/pdf/components/PdfFooter';
import { SectionHeader } from '@/lib/pdf/components/PdfSectionTitle';
import { DISCLAIMER } from '@/lib/utils/validation';
import type { PdfSection } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
  section: PdfSection;
}

export function SourcesSection({ report: r, section }: Props) {
  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title={section.title} />

      {r.sources.map((src, i) => (
        <View
          key={i}
          style={[s.row, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.gray50, gap: 12, alignItems: 'flex-start' }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[s.body, { fontFamily: 'Helvetica-Bold', marginBottom: 2 }]}>{src.document_title}</Text>
            <Text style={s.muted}>{src.document_type} · v{src.version} · {src.date}</Text>
          </View>
          <Text style={src.status === 'draft' ? s.badgeYellow : s.badge}>
            {src.status === 'draft' ? 'Bozza' : 'Definitivo'}
          </Text>
        </View>
      ))}

      <View style={[s.mt20, { borderTopWidth: 1, borderTopColor: C.gray50, paddingTop: 12 }]}>
        <Text style={s.muted}>{DISCLAIMER}</Text>
        <Text style={[s.muted, s.mt8]}>
          Report v{r.metadata.tool_version} · {r.metadata.generated_at} · Pay Transparency Assessment Tool · NTT DATA Italia
        </Text>
      </View>
    </Page>
  );
}
