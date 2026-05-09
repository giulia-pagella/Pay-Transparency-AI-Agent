import { Icon } from '@/components/icon';
import type { ReportSection } from './reportSections';

type ReportSidebarProps = {
  activeSection: string;
  companyName: string;
  sections: ReportSection[];
  onNavigate: (id: string) => void;
  onEditAssessment: () => void;
  onResetAssessment: () => void;
};

export function ReportSidebar({
  activeSection,
  companyName,
  sections,
  onNavigate,
  onEditAssessment,
  onResetAssessment,
}: ReportSidebarProps) {
  return (
    <nav className="report-sidebar">
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700, marginBottom: 6 }}>Report</div>
      <div className="serif" style={{ fontSize: 16, color: 'white', lineHeight: 1.25, marginBottom: 20 }}>
        {companyName}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 22 }}>
        {sections.map((section) => (
          <button
            key={section.id}
            className={`anchor-link ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onNavigate(section.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)' }}
          >
            <span><span className="anchor-num">{section.num}</span>{section.title}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <a href="/api/pdf" className="btn btn-primary btn-sm" style={{ justifyContent: 'flex-start' }}>
          <Icon name="download" size={13} /> Scarica PDF
        </a>
        <button onClick={onEditAssessment} style={{ background: 'transparent', color: 'rgba(255,255,255,.75)', border: '1px solid rgba(255,255,255,.2)', padding: '7px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)', borderRadius: 2, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="edit" size={12} /> Modifica assessment
        </button>
        <button onClick={onResetAssessment} style={{ background: 'transparent', color: 'rgba(255,255,255,.5)', border: 'none', padding: '5px 0', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Icon name="refresh" size={11} /> Ricomincia da capo
        </button>
      </div>
    </nav>
  );
}
