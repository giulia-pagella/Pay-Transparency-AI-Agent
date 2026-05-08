'use client';

import { useState, useRef } from 'react';
import type { ReportJson } from '@/lib/schemas/report';

type MaturityArea = ReportJson['maturity'][number];

// ── Palette: 4 shades of NTT blue (light → dark) ─────────────
const LEVEL_COLORS: Record<number, string> = {
  1: '#B3D9F5',
  2: '#4AABF0',
  3: '#0072BC',
  4: '#005B96',
};

const LEVEL_LABELS: Record<number, string> = {
  1: 'Iniziale',
  2: 'Parziale',
  3: 'Strutturato',
  4: 'Avanzato',
};

function levelColor(level: number | null): string {
  return level ? (LEVEL_COLORS[level] ?? '#E8E8E8') : '#E8E8E8';
}

// Split a label into at most 2 lines around the midpoint
function splitLabel(name: string, maxLen = 18): [string, string | null] {
  if (name.length <= maxLen) return [name, null];
  const mid = Math.floor(name.length / 2);
  let best = -1;
  for (let d = 0; d <= 10; d++) {
    if (mid + d < name.length && name[mid + d] === ' ') { best = mid + d; break; }
    if (mid - d >= 0 && name[mid - d] === ' ') { best = mid - d; break; }
  }
  if (best < 0) return [name, null];
  return [name.slice(0, best).trim(), name.slice(best).trim()];
}

// ── Radar geometry constants ──────────────────────────────────
const CX = 300;
const CY = 225;
const RADIUS = 130;
const LABEL_R = 172;

function gridPath(angles: number[], level: number): string {
  const r = (level / 4) * RADIUS;
  const pts = angles.map(
    (a) => `${(CX + r * Math.cos(a)).toFixed(1)},${(CY + r * Math.sin(a)).toFixed(1)}`
  );
  return `M${pts[0]}${pts.slice(1).map((p) => `L${p}`).join('')}Z`;
}

function dataPolygonPath(areas: MaturityArea[], angles: number[]): string {
  const pts = areas.map((area, i) => {
    const r = ((area.current_level ?? 0) / 4) * RADIUS;
    return `${(CX + r * Math.cos(angles[i])).toFixed(1)},${(CY + r * Math.sin(angles[i])).toFixed(1)}`;
  });
  return `M${pts[0]}${pts.slice(1).map((p) => `L${p}`).join('')}Z`;
}

// ── Component ─────────────────────────────────────────────────
export function ProfiloMaturitaRadar({ areas }: { areas: MaturityArea[] }) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const listItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  function handleAreaClick(areaId: string) {
    setSelectedArea((prev) => (prev === areaId ? null : areaId));
  }

  const selected = selectedArea ? (areas.find((a) => a.area_id === selectedArea) ?? null) : null;
  const selectedIndex = selected ? areas.findIndex((a) => a.area_id === selected.area_id) : -1;

  const N = areas.length;
  const angles = areas.map((_, i) => (Math.PI * 2 * i) / N - Math.PI / 2);
  const dataPath = dataPolygonPath(areas, angles);

  return (
    <>
      {/* Scoped styles */}
      <style>{`
        @keyframes pmr-fadein {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pmr-grid {
          display: grid;
          grid-template-columns: minmax(0, 45%) minmax(0, 55%);
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 767px) {
          .pmr-grid { grid-template-columns: 1fr; }
        }
        .pmr-list-item:focus-visible {
          outline: 2px solid #0072BC;
          outline-offset: -2px;
        }
        .pmr-radar-hit:focus-visible {
          outline: 2px solid #0072BC;
          border-radius: 50%;
        }
      `}</style>

      <div className="pmr-grid">

        {/* ── Left column: Radar SVG ── */}
        <div>
          <svg
            viewBox="0 0 600 450"
            width="100%"
            style={{ display: 'block', overflow: 'visible' }}
            aria-label="Radar del profilo di maturità nelle 9 aree HR"
            role="img"
          >
            {/* Grid rings */}
            {[1, 2, 3, 4].map((level) => (
              <path key={level} d={gridPath(angles, level)} fill="none" stroke="#E8E8E8" strokeWidth={0.8} />
            ))}

            {/* Level index labels near top axis */}
            {[1, 2, 3, 4].map((level) => {
              const r = (level / 4) * RADIUS;
              return (
                <text key={level} x={CX + 4} y={CY - r + 3} fontSize={8} fill="#BBBBBB"
                  fontFamily="Noto Sans, Arial, sans-serif" style={{ userSelect: 'none' }}>
                  {level}
                </text>
              );
            })}

            {/* Axis lines */}
            {angles.map((angle, i) => (
              <line
                key={i}
                x1={CX} y1={CY}
                x2={(CX + RADIUS * Math.cos(angle)).toFixed(1)}
                y2={(CY + RADIUS * Math.sin(angle)).toFixed(1)}
                stroke="#E8E8E8"
                strokeWidth={0.8}
              />
            ))}

            {/* Data polygon */}
            <path
              d={dataPath}
              fill="#0072BC"
              fillOpacity={0.15}
              stroke="#0072BC"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />

            {/* Points (visual dot + hit area) */}
            {areas.map((area, i) => {
              const r = ((area.current_level ?? 0) / 4) * RADIUS;
              const px = CX + r * Math.cos(angles[i]);
              const py = CY + r * Math.sin(angles[i]);
              const isHov = hoveredArea === area.area_id;
              const isSel = selectedArea === area.area_id;
              const pointR = isHov || isSel ? 8 : 5.5;
              const col = levelColor(area.current_level);

              return (
                <g key={area.area_id}>
                  {/* Visual dot */}
                  <circle cx={px} cy={py} r={pointR} fill={col} style={{ pointerEvents: 'none' }} />
                  {/* Selection ring */}
                  {isSel && (
                    <circle cx={px} cy={py} r={13} fill="none" stroke={col} strokeWidth={1.5}
                      style={{ pointerEvents: 'none' }} />
                  )}
                  {/* Hit area (transparent, larger) */}
                  <circle
                    cx={px} cy={py} r={15}
                    fill="transparent"
                    className="pmr-radar-hit"
                    tabIndex={0}
                    role="button"
                    aria-label={`${area.area_name}: ${area.current_level_label ?? 'non valutato'}`}
                    aria-pressed={isSel}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredArea(area.area_id)}
                    onMouseLeave={() => setHoveredArea(null)}
                    onClick={() => handleAreaClick(area.area_id)}
                    onFocus={() => setHoveredArea(area.area_id)}
                    onBlur={() => setHoveredArea(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAreaClick(area.area_id);
                      }
                    }}
                  />
                </g>
              );
            })}

            {/* Axis labels (always visible, never truncated) */}
            {areas.map((area, i) => {
              const angle = angles[i];
              const lx = CX + LABEL_R * Math.cos(angle);
              const ly = CY + LABEL_R * Math.sin(angle);
              const anchor =
                lx < CX - 10 ? 'end' :
                lx > CX + 10 ? 'start' : 'middle';
              const isActive = hoveredArea === area.area_id || selectedArea === area.area_id;
              const [line1, line2] = splitLabel(area.area_name, 18);
              const yStart = line2 ? ly - 7 : ly + 4;

              return (
                <text
                  key={area.area_id}
                  x={lx}
                  y={yStart}
                  textAnchor={anchor}
                  fontSize={11}
                  fill={isActive ? '#0072BC' : '#2E404D'}
                  fontFamily="Noto Sans, Arial, sans-serif"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {line1}
                  {line2 && <tspan x={lx} dy={15}>{line2}</tspan>}
                </text>
              );
            })}
          </svg>
        </div>

        {/* ── Right column: List only ── */}
        <div>

          {/* Compact list */}
          <div
            role="listbox"
            aria-label="Aree di maturità — seleziona per i dettagli"
            style={{ border: '1px solid #E8E8E8', borderRadius: 4, overflow: 'hidden' }}
          >
            {areas.map((area, i) => {
              const isHov = hoveredArea === area.area_id;
              const isSel = selectedArea === area.area_id;
              return (
                <div
                  key={area.area_id}
                  ref={(el) => { listItemRefs.current[i] = el; }}
                  role="option"
                  aria-selected={isSel}
                  tabIndex={0}
                  className="pmr-list-item"
                  onClick={() => handleAreaClick(area.area_id)}
                  onMouseEnter={() => setHoveredArea(area.area_id)}
                  onMouseLeave={() => setHoveredArea(null)}
                  onFocus={() => setHoveredArea(area.area_id)}
                  onBlur={() => setHoveredArea(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleAreaClick(area.area_id);
                    } else if (e.key === 'ArrowDown' && i < areas.length - 1) {
                      e.preventDefault();
                      listItemRefs.current[i + 1]?.focus();
                    } else if (e.key === 'ArrowUp' && i > 0) {
                      e.preventDefault();
                      listItemRefs.current[i - 1]?.focus();
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    cursor: 'pointer',
                    background: isSel ? '#E5F1F9' : isHov ? '#F5F7F9' : 'transparent',
                    borderLeft: isSel ? '3px solid #0072BC' : '3px solid transparent',
                    borderBottom: i < areas.length - 1 ? '1px solid #F0F0F0' : 'none',
                    transition: 'background 0.1s ease',
                    outline: 'none',
                  }}
                >
                  <span style={{
                    fontSize: 12,
                    color: '#949494',
                    minWidth: 22,
                    fontFamily: 'Noto Serif, Georgia, serif',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#070F26',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {area.area_name}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#949494', marginTop: 2 }}>
                      Stato: {area.current_level_label ?? 'Non valutato'}
                    </div>
                  </div>
                  {/* Level color dot (no text, no badge) */}
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: levelColor(area.current_level),
                    flexShrink: 0,
                  }} />
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── Detail panel: full width, below both columns ── */}
      <div style={{ border: '1px solid #E8E8E8', borderRadius: 4, minHeight: 130, marginTop: 14 }}>
        {!selected ? (
          <div style={{
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <p style={{
              fontSize: 13,
              color: '#AAAAAA',
              textAlign: 'center',
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 300,
            }}>
              Seleziona un&apos;area dal grafico o dalla lista per visualizzare l&apos;analisi dettagliata e le raccomandazioni
            </p>
          </div>
        ) : (
          <div
            key={selected.area_id}
            style={{ padding: '16px 18px', animation: 'pmr-fadein 0.2s ease' }}
          >
            {/* Header: number + name + dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 12,
                color: '#949494',
                fontFamily: 'Noto Serif, Georgia, serif',
                lineHeight: 1,
                minWidth: 22,
                flexShrink: 0,
              }}>
                {String(selectedIndex + 1).padStart(2, '0')}
              </span>
              <span style={{
                fontSize: 14.5,
                fontWeight: 700,
                color: '#070F26',
                flex: 1,
                lineHeight: 1.3,
              }}>
                {selected.area_name}
              </span>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: levelColor(selected.current_level),
                flexShrink: 0,
              }} />
            </div>

            {/* Current level label */}
            <div style={{ fontSize: 12, color: '#949494', marginBottom: 14 }}>
              Stato attuale:{' '}
              <strong style={{ color: '#070F26' }}>
                {selected.current_level_label}
              </strong>
            </div>

            {/* Gap analysis */}
            <div style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: '#AAAAAA',
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                marginBottom: 5,
              }}>
                Analisi
              </div>
              <p style={{ fontSize: 13, color: '#2E404D', lineHeight: 1.6, margin: 0 }}>
                {selected.gap_description}
              </p>
            </div>

            {/* Recommendation */}
            {selected.recommendation && (
              <div>
                <div style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: '#AAAAAA',
                  textTransform: 'uppercase',
                  letterSpacing: '0.09em',
                  marginBottom: 5,
                }}>
                  Raccomandazione
                </div>
                <p style={{
                  fontSize: 13,
                  color: '#005B96',
                  lineHeight: 1.6,
                  margin: 0,
                  fontStyle: 'italic',
                }}>
                  {selected.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 14,
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        fontSize: 11,
        color: '#949494',
      }}>
        {([1, 2, 3, 4] as const).map((lvl) => (
          <span key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: LEVEL_COLORS[lvl],
              display: 'inline-block',
              flexShrink: 0,
            }} />
            <span>{lvl} — {LEVEL_LABELS[lvl]}</span>
          </span>
        ))}
      </div>
    </>
  );
}
