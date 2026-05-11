import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s, C } from '@/lib/pdf/utils/pdfStyles';
import { FinalMetadata, PageFooter } from '@/lib/pdf/components/PdfFooter';
import { SectionHeader } from '@/lib/pdf/components/PdfSectionTitle';
import { DISCLAIMER } from '@/lib/utils/validation';
import { formatPdfDate, getSourceScope, splitSourcesByStatus, type ReportSource } from '@/lib/pdf/utils/pdfDisplay';
import type { PdfSection } from '@/lib/pdf/utils/pdfSections';

interface Props {
  report: ReportJson;
  section: PdfSection;
}

function SourceGroup({ title, sources }: { title: string; sources: ReportSource[] }) {
  return (
    <View style={s.mb20}>
      <Text style={s.sourceGroupTitle}>{title}</Text>
      {sources.length > 0 ? (
        sources.map((src, i) => (
          <View
            key={`${src.country_code}-${src.document_title}-${i}`}
            style={[s.row, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.gray50, gap: 12, alignItems: 'flex-start' }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[s.body, { fontFamily: 'Helvetica-Bold', marginBottom: 2 }]}>{src.document_title}</Text>
              <Text style={s.muted}>{getSourceScope(src)} · {formatPdfDate(src.date)}</Text>
            </View>
            <Text style={src.status === 'draft' ? s.badgeYellow : s.badge}>
              {src.status === 'draft' ? 'Bozza' : 'Definitivo'}
            </Text>
          </View>
        ))
      ) : (
        <Text style={s.muted}>Nessuna fonte in questa categoria.</Text>
      )}
    </View>
  );
}

export function SourcesSection({ report: r, section }: Props) {
  const { definitive, draft } = splitSourcesByStatus(r.sources);

  return (
    <Page size="A4" style={[s.page, s.pagePadded]}>
      <PageFooter report={r} />
      <SectionHeader num={section.num} title={section.title} />

      <SourceGroup title="Fonti definitive" sources={definitive} />
      <SourceGroup title="Fonti in bozza" sources={draft} />

      <View style={[s.mt20, { borderTopWidth: 1, borderTopColor: C.gray50, paddingTop: 12 }]}>
        <Text style={s.muted}>{DISCLAIMER}</Text>
        <Text style={[s.muted, s.mt8]}>Documento generato automaticamente a supporto della valutazione. Non costituisce consulenza legale.</Text>
        <View style={s.mt8}>
          <FinalMetadata report={r} />
        </View>
      </View>
    </Page>
  );
}
