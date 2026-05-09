import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s, C } from '@/lib/pdf/utils/pdfStyles';
import { PageFooter } from '@/lib/pdf/components/PdfFooter';
import { SectionHeader } from '@/lib/pdf/components/PdfSectionTitle';
import type { PdfSection } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
  section: PdfSection;
}

function attColor(level: string | null): string {
  return level === 'alta' ? C.orange : level === 'media' ? C.yellow : C.green;
}

export function ExecutiveSummarySection({ report: r, section }: Props) {
  const color = attColor(r.executive_summary.overall_attention);
  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title={section.title} />

      <View style={[s.navyBox, s.mb12]}>
        <View style={[s.row, { alignItems: 'flex-start', gap: 16 }]}>
          <View style={[s.attBox, { borderColor: color, minWidth: 90 }]}>
            <Text style={[s.attVal, { color }]}>{r.executive_summary.overall_attention}</Text>
            <Text style={[s.attLabel, { color: 'rgba(255,255,255,0.55)' }]}>Attenzione</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.navyQuote}>&quot;{r.executive_summary.headline}&quot;</Text>
            <Text style={s.navyBody}>{r.executive_summary.paragraph}</Text>
          </View>
        </View>
      </View>

      <View style={[s.row, s.gap8, s.mb16]}>
        <View style={[s.kpiCard, { borderTopColor: C.blue }]}>
          <Text style={s.kpiNum}>{r.metadata.selected_countries.length}</Text>
          <Text style={s.kpiLabel}>{r.metadata.selected_countries.length === 1 ? 'Paese' : 'Paesi'} analizzati</Text>
          <Text style={s.kpiSub}>{r.metadata.selected_countries.join(', ')}</Text>
        </View>
        <View style={[s.kpiCard, { borderTopColor: r.metadata.has_partial_data_flag ? C.yellow : C.greenDark }]}>
          <Text style={s.kpiNum}>{r.metadata.completed_areas_count}/9</Text>
          <Text style={s.kpiLabel}>Aree valutate</Text>
          <Text style={s.kpiSub}>{r.metadata.has_partial_data_flag ? 'Assessment parziale' : 'Assessment completo'}</Text>
        </View>
        <View style={[s.kpiCard, { borderTopColor: C.navy }]}>
          <Text style={s.kpiNum}>{r.recommendations.length}</Text>
          <Text style={s.kpiLabel}>Raccomandazioni</Text>
          <Text style={s.kpiSub}>Ordinate per priorità</Text>
        </View>
      </View>

      <Text style={[s.h4, s.mb8]}>Punti chiave</Text>
      {r.executive_summary.key_points.map((pt, i) => (
        <View key={i} style={s.bulletRow}>
          <View style={s.bulletDot} />
          <Text style={s.bulletText}>{pt}</Text>
        </View>
      ))}
    </Page>
  );
}
