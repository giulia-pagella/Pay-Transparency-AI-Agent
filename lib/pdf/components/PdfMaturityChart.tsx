import React from 'react';
import { View, Text, Svg, Path, Line, Circle, G } from '@react-pdf/renderer';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SvgText = Text as any; // react-pdf Text doubles as SVG Text inside <Svg>
import type { ReportJson } from '@/lib/schemas/report';
import { s, C } from '@/lib/pdf/utils/pdfStyles';

type MaturityArea = ReportJson['maturity'][number];

export const M_LEVEL_COLORS: Record<number, string> = {
  1: '#B3D9F5',
  2: '#4AABF0',
  3: '#0072BC',
  4: '#005B96',
};

export const M_LEVEL_LABELS: Record<number, string> = {
  1: 'Iniziale',
  2: 'Parziale',
  3: 'Strutturato',
  4: 'Avanzato',
};

export function mLevelColor(level: number | null): string {
  return level ? (M_LEVEL_COLORS[level] ?? C.gray50) : C.gray50;
}

function pdfSplitLabel(name: string, maxLen = 16): [string, string | null] {
  if (name.length <= maxLen) return [name, null];
  const mid = Math.floor(name.length / 2);
  let best = -1;
  for (let d = 0; d <= 10; d++) {
    if (mid + d < name.length && name[mid + d] === ' ') { best = mid + d; break; }
    if (mid - d >= 0 && name[mid - d] === ' ')          { best = mid - d; break; }
  }
  if (best < 0) return [name, null];
  return [name.slice(0, best).trim(), name.slice(best).trim()];
}

export function PdfMaturityRadar({ areas }: { areas: MaturityArea[] }) {
  const W = 499, H = 330;
  const CX = 249, CY = 178, RADIUS = 108, LABEL_R = 140;
  const N = areas.length;
  const angles = areas.map((_, i) => (Math.PI * 2 * i) / N - Math.PI / 2);

  function gridPath(level: number): string {
    const r = (level / 4) * RADIUS;
    const pts = angles.map(
      (a) => `${(CX + r * Math.cos(a)).toFixed(1)},${(CY + r * Math.sin(a)).toFixed(1)}`,
    );
    return `M${pts[0]}${pts.slice(1).map((p) => `L${p}`).join('')}Z`;
  }

  const dataPath = (() => {
    const pts = areas.map((area, i) => {
      const r = ((area.current_level ?? 0) / 4) * RADIUS;
      return `${(CX + r * Math.cos(angles[i])).toFixed(1)},${(CY + r * Math.sin(angles[i])).toFixed(1)}`;
    });
    return `M${pts[0]}${pts.slice(1).map((p) => `L${p}`).join('')}Z`;
  })();

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {[1, 2, 3, 4].map((level) => (
        <Path key={level} d={gridPath(level)} fill="none" stroke={C.gray50} strokeWidth={0.5} />
      ))}
      {[1, 2, 3, 4].map((level) => {
        const r = (level / 4) * RADIUS;
        return (
          <SvgText key={level} x={CX + 3} y={CY - r + 2} fontSize={6} fill={C.gray100} fontFamily="Helvetica">
            {String(level)}
          </SvgText>
        );
      })}
      {angles.map((angle, i) => (
        <Line
          key={i}
          x1={CX} y1={CY}
          x2={(CX + RADIUS * Math.cos(angle)).toFixed(1)}
          y2={(CY + RADIUS * Math.sin(angle)).toFixed(1)}
          stroke={C.gray50}
          strokeWidth={0.5}
        />
      ))}
      <Path d={dataPath} fill={C.blue} fillOpacity={0.15} stroke={C.blue} strokeWidth={1.5} />
      {areas.map((area, i) => {
        const r = ((area.current_level ?? 0) / 4) * RADIUS;
        const px = CX + r * Math.cos(angles[i]);
        const py = CY + r * Math.sin(angles[i]);
        return (
          <Circle key={area.area_id} cx={px} cy={py} r={4} fill={mLevelColor(area.current_level)} />
        );
      })}
      {areas.map((area, i) => {
        const angle = angles[i];
        const lx = CX + LABEL_R * Math.cos(angle);
        const ly = CY + LABEL_R * Math.sin(angle);
        const anchor = lx < CX - 8 ? 'end' : lx > CX + 8 ? 'start' : 'middle';
        const [line1, line2] = pdfSplitLabel(area.area_name, 16);
        const yStart = line2 ? ly - 5 : ly + 2;
        return (
          <G key={area.area_id}>
            <SvgText x={lx} y={yStart} fontSize={6.5} fill={C.textGray} fontFamily="Helvetica" textAnchor={anchor}>
              {line1}
            </SvgText>
            {line2 && (
              <SvgText x={lx} y={yStart + 9} fontSize={6.5} fill={C.textGray} fontFamily="Helvetica" textAnchor={anchor}>
                {line2}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

export function PdfMaturityDetailCard({ area, num }: { area: MaturityArea; num: number }) {
  return (
    <View wrap={false} style={[s.card, s.mb12]}>
      <View style={[s.row, { gap: 8, alignItems: 'center', marginBottom: 6 }]}>
        <Text style={[s.muted, { minWidth: 20 }]}>{String(num).padStart(2, '0')}</Text>
        <Text style={[s.h4, { flex: 1, marginBottom: 0 }]}>{area.area_name}</Text>
        <Text style={[s.bodySmall, { color: C.blueDark, marginRight: 6 }]}>
          {area.current_level_label ?? '—'}
        </Text>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mLevelColor(area.current_level) }} />
      </View>
      <View style={{ height: 1, backgroundColor: C.gray50, marginBottom: 8 }} />
      <View style={[s.row, { gap: 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[s.muted, { fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>Analisi</Text>
          <Text style={s.bodySmall}>{area.gap_description}</Text>
        </View>
        <View style={{ width: 1, backgroundColor: C.gray50 }} />
        <View style={{ flex: 1 }}>
          <Text style={[s.muted, { fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>Raccomandazione</Text>
          <Text style={[s.bodySmall, { color: C.blueDark, fontStyle: 'italic' }]}>
            {area.recommendation ?? '—'}
          </Text>
        </View>
      </View>
    </View>
  );
}
