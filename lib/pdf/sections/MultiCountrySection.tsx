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

/**
 * Rendered only when selected_countries.length > 1.
 * The caller (document.tsx) is responsible for the isMultiCountry guard.
 */
export function MultiCountrySection({ report: r, section }: Props) {
  const comp = r.countries_comparison;
  const countries = r.metadata.selected_countries;

  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title={section.title} />

      {comp.thesis && (
        <Text style={[s.body, s.mb12]}>{comp.thesis}</Text>
      )}
      {!comp.thesis && comp.narrative && (
        <Text style={[s.body, s.mb12]}>{comp.narrative}</Text>
      )}

      {comp.table_rows.length > 0 && (
        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadCell, { flex: 2 }]}>Tema</Text>
            {countries.map((c) => (
              <Text key={c} style={[s.tableHeadCell, { flex: 1 }]}>{c}</Text>
            ))}
          </View>
          {comp.table_rows.map((row, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={[s.tableCellBold, { flex: 2 }]}>{row.topic}</Text>
              {countries.map((c) => (
                <Text key={c} style={[s.tableCell, { flex: 1 }]}>{row.cells[c] ?? '—'}</Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </Page>
  );
}
