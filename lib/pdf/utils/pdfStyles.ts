import { StyleSheet } from '@react-pdf/renderer';

export const C = {
  navy:        '#070F26',
  blue:        '#0072BC',
  blueDark:    '#005B96',
  blueLight:   '#E5F1F9',
  orange:      '#E42600',
  orangeLight: '#FDEDE7',
  orangeDark:  '#B22000',
  yellow:      '#FFC400',
  yellowLight: '#FFF5D6',
  yellowDark:  '#8B6B00',
  green:       '#00CB5D',
  greenDark:   '#068941',
  greenLight:  '#E6F7ED',
  gray50:      '#E8E8E8',
  gray100:     '#949494',
  textGray:    '#2E404D',
  white:       '#FFFFFF',
  offWhite:    '#FAFBFC',
};

export const s = StyleSheet.create({
  /* Page */
  page:       { fontFamily: 'NotoSans', fontSize: 10, color: C.textGray, backgroundColor: C.white },
  pagePadded: { padding: '40 48 48 48' },

  /* Cover */
  cover:            { backgroundColor: C.navy, padding: '42 52 48 52', flex: 1, justifyContent: 'space-between', position: 'relative' },
  coverLogo:        { width: 112, height: 28, objectFit: 'contain', marginBottom: 58 },
  coverLogoFallback:{ fontSize: 15, color: C.white, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, marginBottom: 58 },
  coverCurve:       { position: 'absolute', right: 0, bottom: 0, width: 280, height: 210, opacity: 0.16 },
  coverEyebrow:     { fontSize: 8, color: 'rgba(255,255,255,0.55)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 16 },
  coverTitle:       { fontSize: 38, color: C.white, lineHeight: 1.1, letterSpacing: -0.5, marginBottom: 16, fontFamily: 'NotoSerif' },
  coverSub:         { fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, maxWidth: 340 },
  coverScope:       { fontSize: 9, color: 'rgba(255,255,255,0.62)', lineHeight: 1.45, marginTop: 14 },
  coverMeta:        { flexDirection: 'row', gap: 28, marginTop: 20, alignItems: 'flex-end', position: 'relative', zIndex: 2 },
  coverMetaLabel:   { fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'Helvetica-Bold', marginBottom: 5 },
  coverMetaValue:   { fontSize: 13, color: C.white },
  coverAttBox:      { borderWidth: 2, borderColor: C.orange, padding: '6 12' },
  coverAttVal:      { fontSize: 20, color: C.orange, fontFamily: 'Helvetica', textTransform: 'capitalize' },
  coverDisclaimer:  { fontSize: 7.5, color: 'rgba(255,255,255,0.45)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 10, marginTop: 20 },

  /* Page header / footer */
  pageHeader:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.gray50 },
  pageHeaderText: { fontSize: 8, color: C.gray100, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase' },
  pageFooter:     { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.gray50, paddingTop: 8 },
  pageFooterText: { fontSize: 7.5, color: C.gray100 },
  finalMeta:      { fontSize: 7.5, color: C.gray100, lineHeight: 1.45 },

  /* Section headings */
  eyebrow: { fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 2, textTransform: 'uppercase', color: C.blue, marginBottom: 10 },
  h1:      { fontSize: 24, fontFamily: 'Helvetica', color: C.navy, marginBottom: 10, lineHeight: 1.1, letterSpacing: -0.3 },
  h2:      { fontSize: 17, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 8 },
  h3:      { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 6 },
  h4:      { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 4 },

  /* Body text */
  body:      { fontSize: 10, color: C.textGray, lineHeight: 1.55 },
  bodySmall: { fontSize: 9, color: C.textGray, lineHeight: 1.55 },
  muted:     { fontSize: 9, color: C.gray100 },

  /* Layouts */
  row:  { flexDirection: 'row' },
  col:  { flex: 1 },
  gap8: { gap: 8 },
  gap10:{ gap: 10 },
  gap12:{ gap: 12 },
  mb4:  { marginBottom: 4 },
  mb8:  { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },
  mb24: { marginBottom: 24 },
  mt8:  { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt20: { marginTop: 20 },

  /* Cards */
  card:    { backgroundColor: C.white, borderWidth: 1, borderColor: C.gray50, padding: 12, marginBottom: 8 },
  cardBlue:{ backgroundColor: C.blueLight, borderLeftWidth: 3, borderLeftColor: C.blue, padding: 12, marginBottom: 8 },

  /* Navy summary box */
  navyBox:  { backgroundColor: C.navy, padding: '16 20', marginBottom: 12 },
  navyQuote:{ fontSize: 13, color: C.white, lineHeight: 1.35, fontFamily: 'Helvetica', marginBottom: 10 },
  navyBody: { fontSize: 9.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 },

  /* Attention level box */
  attBox:  { borderWidth: 2, padding: '8 14', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  attVal:  { fontSize: 17, fontFamily: 'Helvetica', lineHeight: 1, textTransform: 'capitalize' },
  attLabel:{ fontSize: 7.5, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginTop: 3 },

  /* KPI card */
  kpiCard: { flex: 1, borderTopWidth: 3, padding: '10 10 8 10', backgroundColor: C.white, borderWidth: 1, borderColor: C.gray50 },
  kpiNum:  { fontSize: 22, fontFamily: 'Helvetica', color: C.navy, lineHeight: 1, marginBottom: 5 },
  kpiLabel:{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.navy },
  kpiSub:  { fontSize: 8, color: C.gray100, marginTop: 2 },

  /* Table */
  table:        { marginBottom: 12 },
  tableHead:    { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: C.navy, paddingBottom: 5, marginBottom: 2 },
  tableHeadCell:{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.navy, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gray50, paddingVertical: 7 },
  tableCell:    { fontSize: 9.5, color: C.textGray },
  tableCellBold:{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.navy },

  /* Attention pill */
  pillAlta: { backgroundColor: C.orangeLight, color: C.orangeDark, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
  pillMedia:{ backgroundColor: C.yellowLight, color: C.yellowDark, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
  pillBassa:{ backgroundColor: C.greenLight,  color: C.greenDark,  paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
  pillNa:   { backgroundColor: C.gray50,      color: C.gray100,    paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },

  /* Badge */
  badge:      { backgroundColor: C.blueLight,  color: C.blueDark,  paddingHorizontal: 5, paddingVertical: 2, fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  badgeGray:  { backgroundColor: C.gray50,     color: C.gray100,   paddingHorizontal: 5, paddingVertical: 2, fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  badgeYellow:{ backgroundColor: C.yellowLight, color: C.yellowDark,paddingHorizontal: 5, paddingVertical: 2, fontSize: 7.5, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },

  /* TOC */
  tocRow:  { flexDirection: 'row', alignItems: 'baseline', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.gray50 },
  tocNum:  { fontSize: 10, color: C.blue, fontFamily: 'Helvetica', width: 22 },
  tocTitle:{ flex: 1, fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.navy },
  tocPage: { fontSize: 9, color: C.gray100 },

  /* Bullet list */
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 5 },
  bulletDot: { width: 4, height: 4, backgroundColor: C.blue, borderRadius: 2, marginTop: 4, flexShrink: 0 },
  bulletText:{ flex: 1, fontSize: 10, color: C.textGray, lineHeight: 1.55 },

  /* Rec card */
  recCard: { borderLeftWidth: 3, padding: '10 12', marginBottom: 10, backgroundColor: C.white, borderWidth: 1, borderColor: C.gray50 },
  recTitle:{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 4, lineHeight: 1.35 },
  recBody: { fontSize: 9.5, color: C.textGray, lineHeight: 1.55 },

  /* Roadmap */
  roadmapCard:{ borderLeftWidth: 3, borderLeftColor: C.blue, padding: '10 12', marginBottom: 8, backgroundColor: C.blueLight },
  roadmapText:{ fontSize: 9.5, color: C.textGray, lineHeight: 1.55 },
  roadmapHorizon:{ flex: 1, borderTopWidth: 3, borderTopColor: C.blue, padding: 10, backgroundColor: C.white, borderWidth: 1, borderColor: C.gray50 },
  sourceGroupTitle:{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.navy, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
});
