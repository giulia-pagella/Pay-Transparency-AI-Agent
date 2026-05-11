import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s } from '@/lib/pdf/utils/pdfStyles';
import { getGeneratedDate, getReportVersion } from '@/lib/pdf/utils/pdfDisplay';

export function PageFooter({ report }: { report: ReportJson }) {
  const generatedDate = getGeneratedDate(report);

  return (
    <View style={s.pageFooter} fixed>
      <Text
        style={s.pageFooterText}
        render={({ pageNumber, totalPages }) => `Pag. ${pageNumber} di ${totalPages} · ${report.metadata.company_name} · ${generatedDate}`}
      />
    </View>
  );
}

export function FinalMetadata({ report }: { report: ReportJson }) {
  return (
    <Text style={s.finalMeta}>
      Report v{getReportVersion(report)} · {getGeneratedDate(report)} · Pay Transparency Assessment Tool · NTT DATA Italia · Documento AI, non costituisce consulenza legale
    </Text>
  );
}
