import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s } from '@/lib/pdf/utils/pdfStyles';
import { PageFooter } from '@/lib/pdf/components/PdfFooter';
import { SectionHeader } from '@/lib/pdf/components/PdfSectionTitle';
import type { PdfSection } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
  section: PdfSection;
}

export function RoadmapSection({ report: r, section }: Props) {
  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title={section.title} />

      <Text style={[s.body, s.mb16]}>{r.roadmap.roadmap_intro}</Text>

      <Text style={[s.h4, s.mb8]}>Priorità di ingaggio</Text>
      {r.roadmap.engagement_priorities.map((item, i) => (
        <View key={i} style={s.roadmapCard}>
          <Text style={s.roadmapText}>{item}</Text>
        </View>
      ))}
    </Page>
  );
}
