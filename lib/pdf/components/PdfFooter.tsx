import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s } from '@/lib/pdf/utils/pdfStyles';

export function PageFooter({ report }: { report: ReportJson }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.pageFooterText}>{report.metadata.company_name}</Text>
      <Text
        style={s.pageFooterText}
        render={({ pageNumber, totalPages }) => `Pag. ${pageNumber} di ${totalPages}`}
      />
      <Text style={s.pageFooterText}>{report.metadata.generated_at}</Text>
    </View>
  );
}
