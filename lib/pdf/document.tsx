import React from 'react';
import { Document, Font } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { getVisiblePdfSections, getPdfSection, isMultiCountry } from '@/lib/pdf/utils/pdfSections';

import { CoverSection }            from '@/lib/pdf/sections/CoverSection';
import { TOCSection }              from '@/lib/pdf/sections/TOCSection';
import { ExecutiveSummarySection } from '@/lib/pdf/sections/ExecutiveSummarySection';
import { DirectiveSection }        from '@/lib/pdf/sections/DirectiveSection';
import { MultiCountrySection }     from '@/lib/pdf/sections/MultiCountrySection';
import { MaturitySection }         from '@/lib/pdf/sections/MaturitySection';
import { RecommendationsSection }  from '@/lib/pdf/sections/RecommendationsSection';
import { RoadmapSection }          from '@/lib/pdf/sections/RoadmapSection';
import { CaveatsSection }          from '@/lib/pdf/sections/CaveatsSection';
import { SourcesSection }          from '@/lib/pdf/sections/SourcesSection';

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: 'public/fonts/NotoSans-Regular.ttf', fontWeight: 400 },
    { src: 'public/fonts/NotoSans-Bold.ttf', fontWeight: 700 },
  ],
});

Font.register({
  family: 'NotoSerif',
  fonts: [
    { src: 'public/fonts/NotoSerif-Regular.ttf', fontWeight: 400 },
    { src: 'public/fonts/NotoSerif-Bold.ttf', fontWeight: 700 },
  ],
});

export function ReportPdf({ report: r }: { report: ReportJson }) {
  const sections = getVisiblePdfSections(r);

  const sec = (id: Parameters<typeof getPdfSection>[1]) => getPdfSection(sections, id);

  return (
    <Document
      title={`Pay Transparency Assessment — ${r.metadata.company_name}`}
      author="NTT DATA Italia"
      creator="Pay Transparency Assessment Tool"
    >
      <CoverSection report={r} />
      <TOCSection report={r} />

      {sec('exec')      && <ExecutiveSummarySection report={r} section={sec('exec')!}      />}
      {sec('directive') && <DirectiveSection        report={r} section={sec('directive')!} />}
      {isMultiCountry(r) && sec('multi-country') && (
        <MultiCountrySection report={r} section={sec('multi-country')!} />
      )}
      {sec('maturity')  && <MaturitySection         report={r} section={sec('maturity')!}  />}
      {sec('reco')      && <RecommendationsSection  report={r} section={sec('reco')!}      />}
      {sec('roadmap')   && <RoadmapSection          report={r} section={sec('roadmap')!}   />}
      {sec('caveats')   && <CaveatsSection          report={r} section={sec('caveats')!}   />}
      {sec('sources')   && <SourcesSection          report={r} section={sec('sources')!}   />}
    </Document>
  );
}
