import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { DISCLAIMER } from '@/lib/utils/validation';

/* ── Palette (matches NTT DATA DS, no CSS vars in PDF) ──────── */
const C = {
  navy:       '#070F26',
  blue:       '#0072BC',
  blueDark:   '#005B96',
  blueLight:  '#E5F1F9',
  orange:     '#E42600',
  orangeLight:'#FDEDE7',
  orangeDark: '#B22000',
  yellow:     '#FFC400',
  yellowLight:'#FFF5D6',
  yellowDark: '#8B6B00',
  green:      '#00CB5D',
  greenDark:  '#068941',
  greenLight: '#E6F7ED',
  gray50:     '#E8E8E8',
  gray100:    '#949494',
  textGray:   '#2E404D',
  white:      '#FFFFFF',
  offWhite:   '#FAFBFC',
};

/* ── Styles ─────────────────────────────────────────────────── */
const s = StyleSheet.create({
  /* Page */
  page:        { fontFamily: 'Helvetica', fontSize: 10, color: C.textGray, backgroundColor: C.white },
  pagePadded:  { padding: '40 48 48 48' },

  /* Cover */
  cover:       { backgroundColor: C.navy, padding: '56 52', flex: 1, justifyContent: 'space-between' },
  coverEyebrow:{ fontSize: 8, color: 'rgba(255,255,255,0.55)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 16 },
  coverTitle:  { fontSize: 38, color: C.white, lineHeight: 1.1, letterSpacing: -0.5, marginBottom: 16, fontFamily: 'Helvetica' },
  coverSub:    { fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, maxWidth: 340 },
  coverMeta:   { flexDirection: 'row', gap: 36, marginTop: 20, alignItems: 'flex-end' },
  coverMetaLabel: { fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'Helvetica-Bold', marginBottom: 5 },
  coverMetaValue: { fontSize: 13, color: C.white },
  coverAttBox: { borderWidth: 2, borderColor: C.orange, padding: '6 12' },
  coverAttVal: { fontSize: 20, color: C.orange, fontFamily: 'Helvetica', textTransform: 'capitalize' },
  coverDisclaimer: { fontSize: 7.5, color: 'rgba(255,255,255,0.45)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 10, marginTop: 20 },

  /* Page header / footer */
  pageHeader:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.gray50 },
  pageHeaderText: { fontSize: 8, color: C.gray100, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase' },
  pageFooter:  { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.gray50, paddingTop: 8 },
  pageFooterText: { fontSize: 7.5, color: C.gray100 },

  /* Section headings */
  eyebrow:     { fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 2, textTransform: 'uppercase', color: C.blue, marginBottom: 10 },
  h1:          { fontSize: 24, fontFamily: 'Helvetica', color: C.navy, marginBottom: 10, lineHeight: 1.1, letterSpacing: -0.3 },
  h2:          { fontSize: 17, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 8 },
  h3:          { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 6 },
  h4:          { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 4 },

  /* Body text */
  body:        { fontSize: 10, color: C.textGray, lineHeight: 1.55 },
  bodySmall:   { fontSize: 9, color: C.textGray, lineHeight: 1.55 },
  muted:       { fontSize: 9, color: C.gray100 },

  /* Layouts */
  row:         { flexDirection: 'row' },
  col:         { flex: 1 },
  gap8:        { gap: 8 },
  gap10:       { gap: 10 },
  gap12:       { gap: 12 },
  mb4:         { marginBottom: 4 },
  mb8:         { marginBottom: 8 },
  mb12:        { marginBottom: 12 },
  mb16:        { marginBottom: 16 },
  mb20:        { marginBottom: 20 },
  mb24:        { marginBottom: 24 },
  mt8:         { marginTop: 8 },
  mt12:        { marginTop: 12 },
  mt16:        { marginTop: 16 },
  mt20:        { marginTop: 20 },

  /* Cards */
  card:        { backgroundColor: C.white, borderWidth: 1, borderColor: C.gray50, padding: 12, marginBottom: 8 },
  cardBlue:    { backgroundColor: C.blueLight, borderLeftWidth: 3, borderLeftColor: C.blue, padding: 12, marginBottom: 8 },

  /* Navy summary box */
  navyBox:     { backgroundColor: C.navy, padding: '16 20', marginBottom: 12 },
  navyQuote:   { fontSize: 13, color: C.white, lineHeight: 1.35, fontFamily: 'Helvetica', marginBottom: 10 },
  navyBody:    { fontSize: 9.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 },

  /* Attention level box */
  attBox:      { borderWidth: 2, padding: '8 14', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  attVal:      { fontSize: 17, fontFamily: 'Helvetica', lineHeight: 1, textTransform: 'capitalize' },
  attLabel:    { fontSize: 7.5, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginTop: 3 },

  /* KPI card */
  kpiCard:     { flex: 1, borderTopWidth: 3, padding: '10 10 8 10', backgroundColor: C.white, borderWidth: 1, borderColor: C.gray50 },
  kpiNum:      { fontSize: 22, fontFamily: 'Helvetica', color: C.navy, lineHeight: 1, marginBottom: 5 },
  kpiLabel:    { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.navy },
  kpiSub:      { fontSize: 8, color: C.gray100, marginTop: 2 },

  /* Table */
  table:       { marginBottom: 12 },
  tableHead:   { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: C.navy, paddingBottom: 5, marginBottom: 2 },
  tableHeadCell: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.navy, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow:    { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gray50, paddingVertical: 7 },
  tableCell:   { fontSize: 9.5, color: C.textGray },
  tableCellBold: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.navy },

  /* Attention pill */
  pillAlta:    { backgroundColor: C.orangeLight, color: C.orangeDark, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
  pillMedia:   { backgroundColor: C.yellowLight, color: C.yellowDark, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
  pillBassa:   { backgroundColor: C.greenLight, color: C.greenDark, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
  pillNa:      { backgroundColor: C.gray50, color: C.gray100, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },

  /* Badge */
  badge:       { backgroundColor: C.blueLight, color: C.blueDark, paddingHorizontal: 5, paddingVertical: 2, fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  badgeGray:   { backgroundColor: C.gray50, color: C.gray100, paddingHorizontal: 5, paddingVertical: 2, fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  badgeYellow: { backgroundColor: C.yellowLight, color: C.yellowDark, paddingHorizontal: 5, paddingVertical: 2, fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },

  /* TOC */
  tocRow:      { flexDirection: 'row', alignItems: 'baseline', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.gray50 },
  tocNum:      { fontSize: 10, color: C.blue, fontFamily: 'Helvetica', width: 22 },
  tocTitle:    { flex: 1, fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.navy },
  tocPage:     { fontSize: 9, color: C.gray100 },

  /* Bullet list */
  bulletRow:   { flexDirection: 'row', gap: 8, marginBottom: 5 },
  bulletDot:   { width: 4, height: 4, backgroundColor: C.blue, borderRadius: 2, marginTop: 4, flexShrink: 0 },
  bulletText:  { flex: 1, fontSize: 10, color: C.textGray, lineHeight: 1.55 },

  /* Maturity bar */
  barRow:      { flexDirection: 'row', gap: 2, marginTop: 4, marginBottom: 6 },
  barSegActive:{ flex: 1, height: 3, backgroundColor: C.blue },
  barSegEmpty: { flex: 1, height: 3, backgroundColor: C.gray50 },

  /* Rec card */
  recCard:     { borderLeftWidth: 3, padding: '10 12', marginBottom: 10, backgroundColor: C.white, borderWidth: 1, borderColor: C.gray50 },
  recTitle:    { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 4, lineHeight: 1.35 },
  recBody:     { fontSize: 9.5, color: C.textGray, lineHeight: 1.55 },
});

/* ── Helpers ─────────────────────────────────────────────────── */
function AttPill({ level }: { level: string | null }) {
  if (!level) return <Text style={s.pillNa}>—</Text>;
  const st = level === 'alta' ? s.pillAlta : level === 'media' ? s.pillMedia : level === 'bassa' ? s.pillBassa : s.pillNa;
  const label = level === 'alta' ? 'Alta' : level === 'media' ? 'Media' : level === 'bassa' ? 'Bassa' : '—';
  return <Text style={st}>{label}</Text>;
}

function SectionHeader({ num, title, pageNum }: { num: string; title: string; pageNum: number }) {
  return (
    <View style={s.pageHeader} fixed={false}>
      <Text style={s.pageHeaderText}>{num} · {title}</Text>
      <Text style={s.pageHeaderText}>Pay Transparency Assessment</Text>
    </View>
  );
}

function PageFooter({ report }: { report: ReportJson }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.pageFooterText}>{report.metadata.company_name}</Text>
      <Text style={s.pageFooterText} render={({ pageNumber, totalPages }) => `Pag. ${pageNumber} di ${totalPages}`} />
      <Text style={s.pageFooterText}>{report.metadata.generated_at}</Text>
    </View>
  );
}

function MaturityBar({ level }: { level: number | null }) {
  return (
    <View style={s.barRow}>
      {[1, 2, 3, 4].map((k) => (
        <View key={k} style={level && k <= level ? s.barSegActive : s.barSegEmpty} />
      ))}
    </View>
  );
}

/* ── Document ────────────────────────────────────────────────── */
export function ReportPdf({ report: r }: { report: ReportJson }) {
  const attColor = r.executive_summary.overall_attention === 'alta' ? C.orange
    : r.executive_summary.overall_attention === 'media' ? C.yellow : C.green;

  const toc = [
    ['01', 'Executive Summary'],
    ['02', "Perimetro dell'analisi"],
    ['03', 'Direttiva UE 2023/970'],
    ['04', 'Analisi per paese'],
    ['05', 'Confronto multi-country'],
    ['06', 'Impatti per area HR'],
    ['07', 'Profilo di maturità'],
    ['08', 'Raccomandazioni'],
    ['09', 'Limiti e caveat'],
    ['10', 'Fonti normative'],
  ];

  return (
    <Document title={`Pay Transparency Assessment — ${r.metadata.company_name}`} author="NTT DATA Italia" creator="Pay Transparency Assessment Tool">

      {/* ── PAGE 1: Cover ─────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          {/* Top */}
          <View>
            <Text style={s.coverEyebrow}>Pay Transparency Assessment Report</Text>
            <Text style={s.coverTitle}>{r.metadata.company_name}</Text>
            <Text style={s.coverSub}>
              Analisi degli impatti della Direttiva UE 2023/970 sulla trasparenza retributiva e piano delle raccomandazioni preliminari.
            </Text>
          </View>

          {/* Bottom meta row */}
          <View style={s.coverMeta}>
            <View>
              <Text style={s.coverMetaLabel}>Attenzione complessiva</Text>
              <View style={[s.coverAttBox, { borderColor: attColor }]}>
                <Text style={[s.coverAttVal, { color: attColor }]}>{r.executive_summary.overall_attention}</Text>
              </View>
            </View>
            <View>
              <Text style={s.coverMetaLabel}>Paesi analizzati</Text>
              <Text style={s.coverMetaValue}>{r.metadata.selected_countries.join(', ')}</Text>
              {r.metadata.has_draft_sources && <Text style={[s.muted, { color: 'rgba(255,255,255,0.5)', marginTop: 3 }]}>(include fonte in bozza)</Text>}
            </View>
            <View>
              <Text style={s.coverMetaLabel}>Generato</Text>
              <Text style={s.coverMetaValue}>{r.metadata.generated_at}</Text>
            </View>
          </View>

          <Text style={s.coverDisclaimer}>{DISCLAIMER}</Text>
        </View>
      </Page>

      {/* ── PAGE 2: TOC ───────────────────────────────────────── */}
      <Page size="A4" style={[s.page, s.pagePadded]}>
        <PageFooter report={r} />
        <View style={s.mb20}>
          <Text style={s.eyebrow}>Indice</Text>
          <Text style={s.h1}>Struttura del report</Text>
        </View>
        {toc.map(([num, title]) => (
          <View key={num} style={s.tocRow}>
            <Text style={s.tocNum}>{num}</Text>
            <Text style={s.tocTitle}>{title}</Text>
          </View>
        ))}
        {r.metadata.has_partial_data_flag && (
          <View style={[{ backgroundColor: C.yellowLight, borderLeftWidth: 3, borderLeftColor: C.yellow, padding: '10 12', marginTop: 20 }]}>
            <Text style={[s.bodySmall, { fontFamily: 'Helvetica-Bold', color: C.yellowDark, marginBottom: 3 }]}>Dati parziali</Text>
            <Text style={[s.bodySmall, { color: C.yellowDark }]}>Assessment completato al {Math.round((r.metadata.completed_areas_count / 9) * 100)}% ({r.metadata.completed_areas_count} aree su 9).</Text>
          </View>
        )}
      </Page>

      {/* ── PAGE 3: Executive Summary ─────────────────────────── */}
      <Page size="A4" style={[s.page, s.pagePadded]}>
        <PageFooter report={r} />
        <SectionHeader num="01" title="Executive Summary" pageNum={3} />

        {/* Attention + synthesis */}
        <View style={[s.navyBox, s.mb12]}>
          <View style={[s.row, { alignItems: 'flex-start', gap: 16 }]}>
            <View style={[s.attBox, { borderColor: attColor, minWidth: 90 }]}>
              <Text style={[s.attVal, { color: attColor }]}>{r.executive_summary.overall_attention}</Text>
              <Text style={[s.attLabel, { color: 'rgba(255,255,255,0.55)' }]}>Attenzione</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.navyQuote]}>"{r.executive_summary.headline}"</Text>
              <Text style={s.navyBody}>{r.executive_summary.paragraph}</Text>
            </View>
          </View>
        </View>

        {/* KPIs */}
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

        {/* Key points */}
        <Text style={[s.h4, s.mb8]}>Punti chiave</Text>
        {r.executive_summary.key_points.map((pt, i) => (
          <View key={i} style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>{pt}</Text>
          </View>
        ))}
      </Page>

      {/* ── PAGE 4: Perimeter + EU Directive ──────────────────── */}
      <Page size="A4" style={[s.page, s.pagePadded]}>
        <PageFooter report={r} />
        <SectionHeader num="02" title="Perimetro dell'analisi" pageNum={4} />

        <View style={s.mb16}>
          <View style={[s.card, s.mb8]}>
            <View style={[s.row, s.gap8]}>
              {[
                ['Settore', r.metadata.sector],
                ['Dipendenti', r.metadata.employee_range],
                ['Modello', r.metadata.organizational_model],
              ].map(([k, v]) => (
                <View key={k} style={s.col}>
                  <Text style={[s.muted, s.mb4]}>{k}</Text>
                  <Text style={[s.body, { fontFamily: 'Helvetica-Bold' }]}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={s.card}>
            <Text style={[s.muted, s.mb4]}>Paesi inclusi</Text>
            <Text style={s.body}>{r.perimeter.countries_analyzed.map((c) => `${c.name}${c.status === 'draft' ? ' (bozza)' : ''}`).join(' · ')}</Text>
            {r.perimeter.excluded_scope && (
              <Text style={[s.bodySmall, s.mt8, { color: C.gray100 }]}>Fuori perimetro: {r.perimeter.excluded_scope}</Text>
            )}
          </View>
        </View>

        <SectionHeader num="03" title="Direttiva UE 2023/970" pageNum={4} />
        <Text style={[s.body, s.mb12]}>{r.eu_directive.overview}</Text>
        <Text style={[s.bodySmall, { color: C.gray100, marginBottom: 12, fontStyle: 'italic' }]}>{r.eu_directive.timeline_summary}</Text>
        {r.eu_directive.key_obligations.slice(0, 3).map((ob, i) => (
          <View key={i} style={s.cardBlue}>
            <View style={[s.row, { justifyContent: 'space-between', marginBottom: 4, alignItems: 'flex-start' }]}>
              <Text style={[s.body, { fontFamily: 'Helvetica-Bold', flex: 1 }]}>{ob.title}</Text>
              <Text style={[s.badge, { marginLeft: 8 }]}>{ob.article_reference}</Text>
            </View>
            <Text style={s.bodySmall}>{ob.description}</Text>
          </View>
        ))}
      </Page>

      {/* ── PAGE 5: Country analysis ──────────────────────────── */}
      <Page size="A4" style={[s.page, s.pagePadded]}>
        <PageFooter report={r} />
        <SectionHeader num="04" title="Analisi per paese" pageNum={5} />
        {r.country_analysis.map((ca) => (
          <View key={ca.country_code} style={s.mb16}>
            <View style={[s.row, { alignItems: 'center', gap: 8, marginBottom: 6 }]}>
              <Text style={s.h3}>{ca.country_name}</Text>
              {ca.status === 'draft' && <Text style={s.badgeYellow}>Bozza</Text>}
            </View>
            <Text style={[s.body, s.mb8]}>{ca.national_framework_summary}</Text>
            {ca.key_differences_vs_eu.map((d, i) => (
              <View key={i} style={s.bulletRow}>
                <View style={s.bulletDot} />
                <Text style={s.bulletText}>{d}</Text>
              </View>
            ))}
            {ca.implementation_notes && (
              <Text style={[s.bodySmall, { color: C.gray100, fontStyle: 'italic', marginTop: 6 }]}>{ca.implementation_notes}</Text>
            )}
          </View>
        ))}

        {r.countries_comparison.table_rows.length > 0 && (
          <View>
            <SectionHeader num="05" title="Confronto multi-country" pageNum={5} />
            <Text style={[s.body, s.mb12]}>{r.countries_comparison.narrative}</Text>
            <View style={s.table}>
              <View style={s.tableHead}>
                <Text style={[s.tableHeadCell, { flex: 2 }]}>Tema</Text>
                {r.metadata.selected_countries.map((c) => (
                  <Text key={c} style={[s.tableHeadCell, { flex: 1 }]}>{c}</Text>
                ))}
              </View>
              {r.countries_comparison.table_rows.map((row, i) => (
                <View key={i} style={s.tableRow}>
                  <Text style={[s.tableCellBold, { flex: 2 }]}>{row.topic}</Text>
                  {r.metadata.selected_countries.map((c) => (
                    <Text key={c} style={[s.tableCell, { flex: 1 }]}>{row.cells[c] ?? '—'}</Text>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>

      {/* ── PAGE 6: Impacts by area ───────────────────────────── */}
      <Page size="A4" style={[s.page, s.pagePadded]}>
        <PageFooter report={r} />
        <SectionHeader num="06" title="Impatti per area HR" pageNum={6} />
        <Text style={[s.bodySmall, { color: C.gray100, marginBottom: 14, fontStyle: 'italic' }]}>
          Il livello di attenzione combina maturità dichiarata, obbligo diretto UE e amplificatore per fonti in bozza.
        </Text>
        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadCell, { flex: 3 }]}>Area</Text>
            <Text style={[s.tableHeadCell, { flex: 2 }]}>Impatto</Text>
            <Text style={[s.tableHeadCell, { width: 70 }]}>Attenzione</Text>
          </View>
          {r.impacts_by_area.map((area, i) => (
            <View key={i} style={s.tableRow}>
              <View style={{ flex: 3 }}>
                <Text style={s.tableCellBold}>{area.area_name}</Text>
                {area.regulatory_reference && <Text style={[s.muted, { marginTop: 1 }]}>{area.regulatory_reference}</Text>}
              </View>
              <Text style={[s.tableCell, { flex: 2 }]}>{area.impact_description}</Text>
              <View style={{ width: 70 }}>
                <AttPill level={area.attention_level} />
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* ── PAGE 7: Maturity ──────────────────────────────────── */}
      <Page size="A4" style={[s.page, s.pagePadded]}>
        <PageFooter report={r} />
        <SectionHeader num="07" title="Profilo di maturità" pageNum={7} />
        {r.maturity.map((area, i) => (
          <View key={i} style={[s.card, s.mb8]}>
            <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
              <Text style={[s.h4, { flex: 1, marginBottom: 0 }]}>{area.area_name}</Text>
              <Text style={s.badge}>{area.current_level_label}</Text>
            </View>
            {area.current_level !== null && <MaturityBar level={area.current_level} />}
            <Text style={[s.bodySmall, s.mb4]}>{area.gap_description}</Text>
            {area.recommendation && <Text style={[s.bodySmall, { color: C.blueDark, fontStyle: 'italic' }]}>{area.recommendation}</Text>}
          </View>
        ))}
      </Page>

      {/* ── PAGE 8: Recommendations ───────────────────────────── */}
      <Page size="A4" style={[s.page, s.pagePadded]}>
        <PageFooter report={r} />
        <SectionHeader num="08" title="Raccomandazioni" pageNum={8} />
        <Text style={[s.body, s.mb16]}>
          {r.recommendations.length} raccomandazioni preliminari, ordinate per priorità e collegate alle aree HR di riferimento.
        </Text>
        {r.recommendations.map((rec, i) => {
          const borderColor = rec.priority === 'alta' ? C.orange : rec.priority === 'media' ? C.yellow : C.green;
          return (
            <View key={rec.id} style={[s.recCard, { borderLeftColor: borderColor }]}>
              <View style={[s.row, { alignItems: 'flex-start', gap: 10 }]}>
                <Text style={[s.muted, { fontFamily: 'Helvetica-Bold', minWidth: 24, fontSize: 14, color: C.gray100 }]}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <View style={{ flex: 1 }}>
                  <View style={[s.row, { gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }]}>
                    <AttPill level={rec.priority} />
                    {rec.related_areas.map((a) => <Text key={a} style={s.badgeGray}>{a}</Text>)}
                  </View>
                  <Text style={s.recTitle}>{rec.title}</Text>
                  <Text style={s.recBody}>{rec.description}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </Page>

      {/* ── PAGE 9: Limits + Sources ──────────────────────────── */}
      <Page size="A4" style={[s.page, s.pagePadded]}>
        <PageFooter report={r} />
        <SectionHeader num="09" title="Limiti e caveat" pageNum={9} />
        <Text style={[s.body, s.mb8]}>{r.limits.scope_limitations}</Text>
        <Text style={[s.body, s.mb8]}>{r.limits.methodological_caveats}</Text>
        {r.limits.draft_warning && <Text style={[s.bodySmall, { color: C.yellowDark, marginBottom: 6 }]}>Fonte in bozza: {r.limits.draft_warning}</Text>}
        {r.limits.partial_data_warning && <Text style={[s.bodySmall, { color: C.orangeDark, marginBottom: 6 }]}>Dati parziali: {r.limits.partial_data_warning}</Text>}

        <View style={s.mt20}>
          <SectionHeader num="10" title="Fonti normative" pageNum={9} />
          {r.sources.map((src, i) => (
            <View key={i} style={[s.row, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.gray50, gap: 12, alignItems: 'flex-start' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.body, { fontFamily: 'Helvetica-Bold', marginBottom: 2 }]}>{src.document_title}</Text>
                <Text style={s.muted}>{src.document_type} · v{src.version} · {src.date}</Text>
              </View>
              <Text style={src.status === 'draft' ? s.badgeYellow : s.badge}>{src.status === 'draft' ? 'Bozza' : 'Definitivo'}</Text>
            </View>
          ))}
        </View>

        <View style={[s.mt20, { borderTopWidth: 1, borderTopColor: C.gray50, paddingTop: 12 }]}>
          <Text style={s.muted}>{DISCLAIMER}</Text>
          <Text style={[s.muted, s.mt8]}>Report v{r.metadata.tool_version} · {r.metadata.generated_at} · Pay Transparency Assessment Tool · NTT DATA Italia</Text>
        </View>
      </Page>

    </Document>
  );
}
