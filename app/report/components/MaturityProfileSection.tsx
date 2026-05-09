'use client';

import { useMemo, useRef, useState } from 'react';
import type { ReportJson } from '@/lib/schemas/report';
import { AttentionPill } from './AttentionPill';
import {
  findRecommendationForArea,
  getDefaultMaturityAreaId,
  getMaturityAnalysis,
  type MaturityArea,
} from '../utils/reportDisplay';

type MaturityProfileSectionProps = {
  areas: ReportJson['maturity'];
  recommendations: ReportJson['recommendations'];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
  onRecommendationNavigate: (recommendationId: string) => void;
};

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

const CX = 300;
const CY = 225;
const RADIUS = 130;
const LABEL_R = 172;

function levelColor(level: number | null): string {
  return level ? (LEVEL_COLORS[level] ?? '#E8E8E8') : '#E8E8E8';
}

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

function gridPath(angles: number[], level: number): string {
  const r = (level / 4) * RADIUS;
  const pts = angles.map(
    (angle) => `${(CX + r * Math.cos(angle)).toFixed(1)},${(CY + r * Math.sin(angle)).toFixed(1)}`,
  );
  return `M${pts[0]}${pts.slice(1).map((point) => `L${point}`).join('')}Z`;
}

function dataPolygonPath(areas: MaturityArea[], angles: number[]): string {
  const pts = areas.map((area, index) => {
    const r = ((area.current_level ?? 0) / 4) * RADIUS;
    return `${(CX + r * Math.cos(angles[index])).toFixed(1)},${(CY + r * Math.sin(angles[index])).toFixed(1)}`;
  });
  return `M${pts[0]}${pts.slice(1).map((point) => `L${point}`).join('')}Z`;
}

export function MaturityProfileSection({
  areas,
  recommendations,
  selectedAreaId,
  onSelectArea,
  onRecommendationNavigate,
}: MaturityProfileSectionProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const listItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const defaultAreaId = useMemo(() => getDefaultMaturityAreaId(areas), [areas]);
  const selectedId = selectedAreaId ?? defaultAreaId;
  const selected = selectedId ? (areas.find((area) => area.area_id === selectedId) ?? null) : null;
  const selectedIndex = selected ? areas.findIndex((area) => area.area_id === selected.area_id) : -1;
  const linkedRecommendation = selected ? findRecommendationForArea(selected, recommendations) : null;

  if (areas.length === 0) {
    return <p style={{ margin: 0, fontSize: 13, color: 'var(--ntt-gray-100)' }}>Profilo di maturità non disponibile.</p>;
  }

  const angles = areas.map((_, index) => (Math.PI * 2 * index) / areas.length - Math.PI / 2);
  const dataPath = dataPolygonPath(areas, angles);

  function handleAreaClick(areaId: string) {
    onSelectArea(selectedAreaId === areaId ? null : areaId);
  }

  return (
    <>
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
        <div>
          <svg
            viewBox="0 0 600 450"
            width="100%"
            style={{ display: 'block', overflow: 'visible' }}
            aria-label="Radar del profilo di maturità nelle 9 aree HR"
            role="img"
          >
            {[1, 2, 3, 4].map((level) => (
              <path key={level} d={gridPath(angles, level)} fill="none" stroke="#E8E8E8" strokeWidth={0.8} />
            ))}

            {[1, 2, 3, 4].map((level) => {
              const r = (level / 4) * RADIUS;
              return (
                <text key={level} x={CX + 4} y={CY - r + 3} fontSize={8} fill="#BBBBBB"
                  fontFamily="Noto Sans, Arial, sans-serif" style={{ userSelect: 'none' }}>
                  {level}
                </text>
              );
            })}

            {angles.map((angle, index) => (
              <line
                key={index}
                x1={CX} y1={CY}
                x2={(CX + RADIUS * Math.cos(angle)).toFixed(1)}
                y2={(CY + RADIUS * Math.sin(angle)).toFixed(1)}
                stroke="#E8E8E8"
                strokeWidth={0.8}
              />
            ))}

            <path
              d={dataPath}
              fill="#0072BC"
              fillOpacity={0.15}
              stroke="#0072BC"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />

            {areas.map((area, index) => {
              const r = ((area.current_level ?? 0) / 4) * RADIUS;
              const px = CX + r * Math.cos(angles[index]);
              const py = CY + r * Math.sin(angles[index]);
              const isHov = hoveredArea === area.area_id;
              const isSel = selected?.area_id === area.area_id;
              const pointR = isHov || isSel ? 8 : 5.5;
              const col = levelColor(area.current_level);

              return (
                <g key={area.area_id}>
                  <circle cx={px} cy={py} r={pointR} fill={col} style={{ pointerEvents: 'none' }} />
                  {isSel && (
                    <circle cx={px} cy={py} r={13} fill="none" stroke={col} strokeWidth={1.5}
                      style={{ pointerEvents: 'none' }} />
                  )}
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
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleAreaClick(area.area_id);
                      }
                    }}
                  />
                </g>
              );
            })}

            {areas.map((area, index) => {
              const angle = angles[index];
              const lx = CX + LABEL_R * Math.cos(angle);
              const ly = CY + LABEL_R * Math.sin(angle);
              const anchor = lx < CX - 10 ? 'end' : lx > CX + 10 ? 'start' : 'middle';
              const isActive = hoveredArea === area.area_id || selected?.area_id === area.area_id;
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

        <div>
          <div
            role="listbox"
            aria-label="Aree di maturità — seleziona per i dettagli"
            style={{ border: '1px solid #E8E8E8', borderRadius: 4, overflow: 'hidden' }}
          >
            {areas.map((area, index) => {
              const isHov = hoveredArea === area.area_id;
              const isSel = selected?.area_id === area.area_id;
              return (
                <div
                  key={area.area_id}
                  ref={(el) => { listItemRefs.current[index] = el; }}
                  role="option"
                  aria-selected={isSel}
                  tabIndex={0}
                  className="pmr-list-item"
                  onClick={() => handleAreaClick(area.area_id)}
                  onMouseEnter={() => setHoveredArea(area.area_id)}
                  onMouseLeave={() => setHoveredArea(null)}
                  onFocus={() => setHoveredArea(area.area_id)}
                  onBlur={() => setHoveredArea(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleAreaClick(area.area_id);
                    } else if (event.key === 'ArrowDown' && index < areas.length - 1) {
                      event.preventDefault();
                      listItemRefs.current[index + 1]?.focus();
                    } else if (event.key === 'ArrowUp' && index > 0) {
                      event.preventDefault();
                      listItemRefs.current[index - 1]?.focus();
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
                    borderBottom: index < areas.length - 1 ? '1px solid #F0F0F0' : 'none',
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
                    {String(index + 1).padStart(2, '0')}
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
                  <AttentionPill level={area.attention} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #E8E8E8', borderRadius: 4, minHeight: 130, marginTop: 14 }}>
        {!selected ? (
          <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 13, color: '#AAAAAA', textAlign: 'center', lineHeight: 1.55, margin: 0, maxWidth: 300 }}>
              Seleziona un&apos;area dal grafico o dalla lista per visualizzare l&apos;analisi dettagliata
            </p>
          </div>
        ) : (
          <div key={selected.area_id} style={{ padding: '16px 18px', animation: 'pmr-fadein 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#949494', fontFamily: 'Noto Serif, Georgia, serif', lineHeight: 1, minWidth: 22, flexShrink: 0 }}>
                {String(selectedIndex + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#070F26', flex: 1, lineHeight: 1.3 }}>
                {selected.area_name}
              </span>
              <AttentionPill level={selected.attention} />
            </div>

            <div style={{ fontSize: 12, color: '#949494', marginBottom: 14 }}>
              Stato attuale:{' '}
              <strong style={{ color: '#070F26' }}>
                {selected.current_level_label}
              </strong>
            </div>

            <div style={{ marginBottom: linkedRecommendation ? 14 : 0 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 5 }}>
                Analisi
              </div>
              <p style={{ fontSize: 13, color: '#2E404D', lineHeight: 1.6, margin: 0 }}>
                {getMaturityAnalysis(selected)}
              </p>
            </div>

            {linkedRecommendation && (
              <button
                type="button"
                onClick={() => onRecommendationNavigate(linkedRecommendation.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ntt-future-blue-150)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  padding: 0,
                }}
              >
                Vai alla raccomandazione collegata →
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: '#949494' }}>
        {([1, 2, 3, 4] as const).map((level) => (
          <span key={level} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: LEVEL_COLORS[level], display: 'inline-block', flexShrink: 0 }} />
            <span>{level} — {LEVEL_LABELS[level]}</span>
          </span>
        ))}
      </div>
    </>
  );
}
