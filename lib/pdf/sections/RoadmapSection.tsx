import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s, C } from '@/lib/pdf/utils/pdfStyles';
import { PageFooter } from '@/lib/pdf/components/PdfFooter';
import { SectionHeader } from '@/lib/pdf/components/PdfSectionTitle';
import { groupRecommendationsByTemporalTag } from '@/lib/pdf/utils/pdfDisplay';
import type { PdfSection } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
  section: PdfSection;
}

export function RoadmapSection({ report: r, section }: Props) {
  const groups = groupRecommendationsByTemporalTag(r.recommendations);

  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title="Prossimi passi · Roadmap di implementazione" />

      <Text style={[s.body, s.mb16]}>
        {r.roadmap.roadmap_intro || 'Roadmap sintetica costruita dagli orizzonti temporali delle raccomandazioni.'}
      </Text>

      <View style={[s.row, { gap: 8, marginBottom: 18 }]}>
        {groups.map((group, index) => (
          <View key={group.temporalTag} style={s.roadmapHorizon}>
            <Text style={[s.muted, { fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>
              {String(index + 1).padStart(2, '0')} · {group.temporalTag}
            </Text>
            <Text style={[s.h4, { marginBottom: 2 }]}>{group.title}</Text>
            <Text style={[s.muted, { marginBottom: 8 }]}>{group.range}</Text>
            {group.recommendations.length > 0 ? (
              group.recommendations.map((rec) => {
                const recIndex = r.recommendations.findIndex((item) => item.id === rec.id);
                return (
                  <Text key={rec.id} style={[s.bodySmall, { marginBottom: 5 }]}>
                    {String(recIndex + 1).padStart(2, '0')} · {rec.title}
                  </Text>
                );
              })
            ) : (
              <Text style={s.muted}>Nessuna raccomandazione in questo orizzonte.</Text>
            )}
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: C.blueLight, borderLeftWidth: 3, borderLeftColor: C.blue, padding: 12 }}>
        <Text style={[s.h4, s.mb8]}>Priorità di ingaggio</Text>
        {(r.roadmap.engagement_priorities ?? []).map((item, index) => (
          <View key={`${item}-${index}`} style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
}
