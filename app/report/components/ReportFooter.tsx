import type { ReportJson } from '@/lib/schemas/report';
import { formatDateIT } from '@/lib/utils/date';

type ReportFooterProps = {
  report: ReportJson;
};

export function ReportFooter({ report }: ReportFooterProps) {
  return (
    <div style={{ marginTop: 44, paddingTop: 20, borderTop: '1px solid var(--ntt-gray-50)', fontSize: 11, color: 'var(--ntt-gray-100)', lineHeight: 1.6 }}>
      Report v{report.metadata.tool_version} · {formatDateIT(report.metadata.generated_at)} · Pay Transparency Assessment Tool · NTT DATA Italia · <strong>Documento AI, non costituisce consulenza legale.</strong>
    </div>
  );
}
