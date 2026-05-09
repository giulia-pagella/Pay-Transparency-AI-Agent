import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s, C } from '@/lib/pdf/utils/pdfStyles';
import { PageFooter } from '@/lib/pdf/components/PdfFooter';
import { getVisiblePdfSections } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
}

// Page numbers are estimates; they will be refined in Phase 3B.
const ESTIMATED_PAGE: Partial<Record<string, number>> = {
  exec:           3,
  directive:      4,
  'multi-country':5,
  maturity:       6,
  reco:           7,
  roadmap:        8,
  caveats:        9,
  sources:        9,
};

export function TOCSection({ report: r }: Props) {
  const sections = getVisiblePdfSections(r);
  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <View style={s.mb20}>
        <Text style={s.eyebrow}>Indice</Text>
        <Text style={s.h1}>Struttura del report</Text>
      </View>

      {sections.map((sec) => (
        <View key={sec.id} style={s.tocRow}>
          <Text style={s.tocNum}>{sec.num}</Text>
          <Text style={s.tocTitle}>{sec.title}</Text>
          <Text style={s.tocPage}>
            {/* Estimated page numbers — will be replaced with dynamic values in Phase 3B */}
            {ESTIMATED_PAGE[sec.id] ?? '—'}
          </Text>
        </View>
      ))}

      {r.metadata.has_partial_data_flag && (
        <View style={{ backgroundColor: C.yellowLight, borderLeftWidth: 3, borderLeftColor: C.yellow, padding: '10 12', marginTop: 20 }}>
          <Text style={[s.bodySmall, { fontFamily: 'Helvetica-Bold', color: C.yellowDark, marginBottom: 3 }]}>
            Dati parziali
          </Text>
          <Text style={[s.bodySmall, { color: C.yellowDark }]}>
            Assessment completato al {Math.round((r.metadata.completed_areas_count / 9) * 100)}% ({r.metadata.completed_areas_count} aree su 9).
          </Text>
        </View>
      )}
    </Page>
  );
}
