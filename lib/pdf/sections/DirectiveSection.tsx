import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s } from '@/lib/pdf/utils/pdfStyles';
import { PageFooter } from '@/lib/pdf/components/PdfFooter';
import { SectionHeader } from '@/lib/pdf/components/PdfSectionTitle';
import { getArticleLabel, getSortedDirectiveObligations } from '@/lib/pdf/utils/pdfDisplay';
import type { PdfSection } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
  section: PdfSection;
}

export function DirectiveSection({ report: r, section }: Props) {
  const obligations = getSortedDirectiveObligations(r.eu_directive.key_obligations ?? []).slice(0, 4);

  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title={section.title} />

      <Text style={[s.body, s.mb12]}>{r.eu_directive.overview}</Text>
      <Text style={[s.bodySmall, { fontStyle: 'italic', marginBottom: 12 }]}>
        {r.eu_directive.timeline_summary}
      </Text>

      {obligations.map((ob, i) => (
        <View key={i} style={s.cardBlue}>
          <View style={[s.row, { gap: 5, flexWrap: 'wrap', marginBottom: 6 }]}>
            <Text style={s.badge}>{getArticleLabel(ob)}</Text>
            <Text style={s.badgeGray}>{ob.source_tag || 'FONTE UE'}</Text>
            <Text style={s.badgeGray}>Soggetto: {ob.subject}</Text>
          </View>
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 4, alignItems: 'flex-start' }]}>
            <Text style={[s.body, { fontFamily: 'Helvetica-Bold', flex: 1 }]}>{ob.title}</Text>
          </View>
          <Text style={s.bodySmall}>{ob.description}</Text>
        </View>
      ))}
    </Page>
  );
}
