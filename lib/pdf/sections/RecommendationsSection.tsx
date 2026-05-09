import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s, C } from '@/lib/pdf/utils/pdfStyles';
import { PageFooter } from '@/lib/pdf/components/PdfFooter';
import { SectionHeader } from '@/lib/pdf/components/PdfSectionTitle';
import { AttPill } from '@/lib/pdf/components/PdfTags';
import type { PdfSection } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
  section: PdfSection;
}

function recBorderColor(priority: string | null): string {
  return priority === 'alta' || priority === 'Alta' ? C.orange
    : priority === 'media' || priority === 'Media' ? C.yellow
    : C.green;
}

export function RecommendationsSection({ report: r, section }: Props) {
  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title={section.title} />

      <Text style={[s.body, s.mb16]}>
        {r.recommendations.length} raccomandazioni preliminari, ordinate per priorità e collegate alle aree HR di riferimento.
      </Text>

      {r.recommendations.map((rec, i) => (
        <View key={rec.id} style={[s.recCard, { borderLeftColor: recBorderColor(rec.priority) }]}>
          <View style={[s.row, { alignItems: 'flex-start', gap: 10 }]}>
            <Text style={[s.muted, { fontFamily: 'Helvetica-Bold', minWidth: 24, fontSize: 14, color: C.gray100 }]}>
              {String(i + 1).padStart(2, '0')}
            </Text>
            <View style={{ flex: 1 }}>
              <View style={[s.row, { gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }]}>
                <AttPill level={rec.priority} />
                {rec.related_areas.map((a) => (
                  <Text key={a} style={s.badgeGray}>{a}</Text>
                ))}
              </View>
              <Text style={s.recTitle}>{rec.title}</Text>
              <Text style={s.recBody}>{rec.description}</Text>
            </View>
          </View>
        </View>
      ))}
    </Page>
  );
}
