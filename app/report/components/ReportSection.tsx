'use client';

import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/icon';
import type { ReportSection as ReportSectionConfig } from './reportSections';

type ReportSectionHeadingProps = {
  section: ReportSectionConfig;
};

type ReportAccordionSectionProps = {
  section: ReportSectionConfig;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function ReportSectionHeading({ section }: ReportSectionHeadingProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
      <span className="accordion-num" style={{ margin: 0 }}>{section.num}</span>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--ntt-smart-navy)' }}>{section.title}</h2>
    </div>
  );
}

export function ReportAccordionSection({ section, children, defaultOpen = false }: ReportAccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div id={section.id} className={`accordion-item ${open ? 'open' : ''}`}>
      <div className="accordion-head" onClick={() => setOpen((value) => !value)}>
        <span className="accordion-num">{section.num}</span>
        <h3 className="accordion-title">{section.title}</h3>
        <Icon name="plus" size={20} className="accordion-toggle" />
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}
