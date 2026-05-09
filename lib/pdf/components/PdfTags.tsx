import React from 'react';
import { Text } from '@react-pdf/renderer';
import { s } from '@/lib/pdf/utils/pdfStyles';

export function AttPill({ level }: { level: string | null }) {
  if (!level) return <Text style={s.pillNa}>—</Text>;
  const lvl = level.toLowerCase();
  const style =
    lvl === 'alta'  ? s.pillAlta  :
    lvl === 'media' ? s.pillMedia :
    lvl === 'bassa' ? s.pillBassa : s.pillNa;
  const label =
    lvl === 'alta'  ? 'Alta'  :
    lvl === 'media' ? 'Media' :
    lvl === 'bassa' ? 'Bassa' : '—';
  return <Text style={style}>{label}</Text>;
}
