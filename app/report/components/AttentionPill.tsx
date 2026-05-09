import { normalizeAttentionLevel } from '../utils/reportDisplay';

type AttentionPillProps = {
  level: string | null | undefined;
  labelPrefix?: string;
};

export function AttentionPill({ level, labelPrefix = 'Attenzione' }: AttentionPillProps) {
  const normalized = normalizeAttentionLevel(level);

  if (!normalized) return <span className="attention attention-na">Non valutata</span>;

  const map: Record<string, string> = {
    alta: 'attention-alta',
    media: 'attention-media',
    bassa: 'attention-bassa',
  };
  const labels: Record<string, string> = {
    alta: `${labelPrefix} Alta`,
    media: `${labelPrefix} Media`,
    bassa: `${labelPrefix} Bassa`,
  };

  return <span className={`attention ${map[normalized]}`}>{labels[normalized]}</span>;
}
