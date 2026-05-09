import { Icon } from '@/components/icon';
import type { ReportJson } from '@/lib/schemas/report';
import { formatDateIT } from '@/lib/utils/date';
import { getSourceScope, splitSourcesByStatus, type ReportSource } from '../utils/reportDisplay';

type SourcesSectionProps = {
  sources: ReportJson['sources'];
};

function SourceGroup({ title, sources }: { title: string; sources: ReportSource[] }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{title}</div>
      {sources.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sources.map((source, index) => (
            <div key={`${source.country_code}-${source.document_title}-${index}`} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--ntt-gray-50)' }}>
              <Icon name="document" size={16} style={{ color: 'var(--ntt-future-blue)', flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{source.document_title}</div>
                <div style={{ fontSize: 11, color: 'var(--ntt-gray-100)', marginTop: 2 }}>
                  {getSourceScope(source)} · {formatDateIT(source.date)}
                </div>
              </div>
              {source.status === 'draft'
                ? <span className="badge badge-yellow"><span className="badge-dot" />Bozza</span>
                : <span className="badge badge-green"><span className="badge-dot" />Definitivo</span>}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ntt-gray-100)' }}>Nessuna fonte in questa categoria.</p>
      )}
    </div>
  );
}

export function SourcesSection({ sources }: SourcesSectionProps) {
  const { definitive, draft } = splitSourcesByStatus(sources);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <SourceGroup title="Fonti definitive" sources={definitive} />
      <SourceGroup title="Fonti in bozza" sources={draft} />
    </div>
  );
}
