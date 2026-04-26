import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { DISCLAIMER } from '@/lib/utils/validation';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  h1: { fontSize: 18, marginBottom: 8 },
  h2: { fontSize: 13, marginTop: 12, marginBottom: 6 },
  box: { border: '1 solid #ddd', padding: 8, marginBottom: 8 },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, fontSize: 8 },
});

export function ReportPdf({ report }: { report: ReportJson }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Pay Transparency Assessment Report</Text>
        <Text>{report.metadata.company_name}</Text>
        <Text>{report.metadata.generated_at}</Text>
        <Text style={styles.h2}>Executive Summary</Text>
        <View style={styles.box}>
          <Text>Attenzione complessiva: {report.executive_summary.overall_attention}</Text>
          <Text>{report.executive_summary.synthesis_sentence}</Text>
        </View>
        <Text style={styles.h2}>Raccomandazioni</Text>
        {report.recommendations.map((r) => (
          <View key={r.id} style={styles.box}>
            <Text>{r.title}</Text>
            <Text>{r.description}</Text>
          </View>
        ))}
        <Text style={styles.footer}>{DISCLAIMER}</Text>
      </Page>
    </Document>
  );
}
