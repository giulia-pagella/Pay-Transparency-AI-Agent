import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s, C } from '@/lib/pdf/utils/pdfStyles';
import { PageFooter } from '@/lib/pdf/components/PdfFooter';
import { SectionHeader } from '@/lib/pdf/components/PdfSectionTitle';
import { formatPdfDate } from '@/lib/pdf/utils/pdfDisplay';
import type { PdfSection } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
  section: PdfSection;
}

export function MultiCountrySection({ report: r, section }: Props) {
  const comp = r.countries_comparison;
  const countries = r.metadata.selected_countries;
  const timeline = comp.timeline ?? [];
  const tableRows = comp.table_rows ?? [];
  const intro = comp.thesis || 'Analisi multi-country non disponibile in forma completa per i dati correnti.';

  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title={section.title} />

      <Text style={[s.body, s.mb12]}>{intro}</Text>

      <View style={[s.card, s.mb16]}>
        <View style={[s.row, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }]}>
          <Text style={s.h4}>Timeline recepimento</Text>
          <Text style={s.badgeGray}>Deadline UE: 7 giugno 2026</Text>
        </View>
        {timeline.length > 0 ? (
          <View style={[s.row, { gap: 8, alignItems: 'stretch' }]}>
            {timeline.map((item) => {
              const color = item.status === 'vigente'
                ? C.greenDark
                : item.status === 'in_bozza'
                  ? C.yellowDark
                  : C.blue;
              const label = item.status === 'vigente'
                ? 'Vigente'
                : item.status === 'in_bozza'
                  ? 'In bozza'
                  : 'In recepimento';

              return (
                <View key={`${item.country_code}-${item.phase_label}`} style={{ flex: 1, borderTopWidth: 3, borderTopColor: color, paddingTop: 7 }}>
                  <Text style={[s.bodySmall, { fontFamily: 'Helvetica-Bold', color: C.navy }]}>{item.country_name}</Text>
                  <Text style={[s.muted, { marginTop: 2 }]}>{label}</Text>
                  <Text style={[s.bodySmall, { marginTop: 5 }]}>{item.phase_label}</Text>
                  <Text style={[s.muted, { marginTop: 4 }]}>{formatPdfDate(item.enforcement_date)}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={s.bodySmall}>Timeline non disponibile per i dati correnti.</Text>
        )}
      </View>

      {tableRows.length > 0 ? (
        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadCell, { flex: 2 }]}>Tema</Text>
            {countries.map((country) => (
              <Text key={country} style={[s.tableHeadCell, { flex: 1 }]}>{country}</Text>
            ))}
          </View>
          {tableRows.map((row, index) => (
            <View key={`${row.topic}-${index}`} style={s.tableRow}>
              <Text style={[s.tableCellBold, { flex: 2 }]}>{row.topic}</Text>
              {countries.map((country) => (
                <Text key={country} style={[s.tableCell, { flex: 1 }]}>{row.cells?.[country] ?? '-'}</Text>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <Text style={s.bodySmall}>Tabella comparativa non disponibile per i dati correnti.</Text>
      )}
    </Page>
  );
}
