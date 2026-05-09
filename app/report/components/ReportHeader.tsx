import { Icon } from '@/components/icon';
import type { ReportJson } from '@/lib/schemas/report';
import { formatDateIT } from '@/lib/utils/date';

type ReportHeaderProps = {
  report: ReportJson;
};

export function ReportHeader({ report }: ReportHeaderProps) {
  return (
    <>
      {report.metadata.has_partial_data_flag && (
        <div className="alert alert-warn" style={{ marginBottom: 24 }}>
          <Icon name="info" size={18} className="alert-icon" style={{ color: '#8B6B00' }} />
          <div className="alert-body">
            <strong>Dati parziali — assessment completato al {Math.round((report.metadata.completed_areas_count / 9) * 100)}%</strong>
            Sono state valutate {report.metadata.completed_areas_count} aree di maturità su 9. Per un&apos;analisi più completa torna al questionario.
          </div>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>PAY TRANSPARENCY ASSESSMENT REPORT</div>
        <h1 className="serif" style={{ fontSize: 44, lineHeight: 1.1, margin: '0 0 10px', color: 'var(--ntt-smart-navy)', letterSpacing: '-0.015em' }}>
          {report.metadata.company_name}
        </h1>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: 'var(--ntt-gray-100)' }}>
          <span>{report.metadata.sector} · {report.metadata.employee_range} · {report.metadata.organizational_model}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ntt-gray-100)', display: 'inline-block' }} />
          <span>Generato il {formatDateIT(report.metadata.generated_at)}</span>
          {report.metadata.has_partial_data_flag && <span className="badge badge-yellow"><span className="badge-dot" />Dati parziali</span>}
          {report.metadata.has_draft_sources && <span className="badge badge-yellow"><span className="badge-dot" />Fonte in bozza</span>}
        </div>
      </div>
    </>
  );
}
