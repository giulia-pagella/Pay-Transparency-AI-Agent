import React from 'react';
import { Image, Page, View, Text } from '@react-pdf/renderer';
import type { ReportJson } from '@/lib/schemas/report';
import { s, C } from '@/lib/pdf/utils/pdfStyles';
import { DISCLAIMER } from '@/lib/utils/validation';
import { getGeneratedDate } from '@/lib/pdf/utils/pdfDisplay';

interface Props {
  report: ReportJson;
}

function attColor(level: string | null): string {
  return level === 'alta' ? C.orange : level === 'media' ? C.yellow : C.green;
}

export function CoverSection({ report: r }: Props) {
  const color = attColor(r.executive_summary.overall_attention);
  const generatedDate = getGeneratedDate(r);
  return (
    <Page size="A4" style={s.page}>
      <View style={s.cover}>
        <Image src="public/assets/innovation-curve-twothirds-white.svg" style={s.coverCurve} alt="" />
        <View>
          <Image src="public/assets/logo-nttdata-white.svg" style={s.coverLogo} alt="NTT DATA" />
          <Text style={s.coverEyebrow}>PAY TRANSPARENCY ASSESSMENT REPORT</Text>
          <Text style={s.coverTitle}>{r.metadata.company_name}</Text>
          <Text style={s.coverSub}>
            Analisi degli impatti della Direttiva UE 2023/970 sulla trasparenza retributiva e piano delle raccomandazioni preliminari.
          </Text>
          <Text style={s.coverScope}>
            Settore: {r.metadata.sector} · Dipendenti: {r.metadata.employee_range} · Modello: {r.metadata.organizational_model}
          </Text>
        </View>

        <View style={s.coverMeta}>
          <View>
            <Text style={s.coverMetaLabel}>Attenzione complessiva</Text>
            <View style={[s.coverAttBox, { borderColor: color }]}>
              <Text style={[s.coverAttVal, { color }]}>{r.executive_summary.overall_attention}</Text>
            </View>
          </View>
          <View>
            <Text style={s.coverMetaLabel}>Paesi analizzati</Text>
            <Text style={s.coverMetaValue}>{r.metadata.selected_countries.join(', ')}</Text>
            {r.metadata.has_draft_sources && (
              <Text style={[s.muted, { color: 'rgba(255,255,255,0.5)', marginTop: 3 }]}>
                (include fonte in bozza)
              </Text>
            )}
          </View>
          <View>
            <Text style={s.coverMetaLabel}>Generato</Text>
            <Text style={s.coverMetaValue}>{generatedDate}</Text>
          </View>
        </View>

        <Text style={s.coverDisclaimer}>{DISCLAIMER}</Text>
      </View>
    </Page>
  );
}
