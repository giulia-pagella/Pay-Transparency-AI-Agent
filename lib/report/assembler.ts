import type { MaturityAssessment } from '@/lib/schemas/maturity';
import type { Regulation } from '@/lib/schemas/regulations';
import type { ReportJson } from '@/lib/schemas/report';

type Attention = 'alta' | 'media' | 'bassa';
type Status = 'definitive' | 'draft';

function asAtt(value: any, fallback: Attention): Attention {
  return value === 'alta' || value === 'media' || value === 'bassa' ? value : fallback;
}

function asStatus(value: any, fallback: Status): Status {
  return value === 'definitive' || value === 'draft' ? value : fallback;
}

const str = (v: any, fallback = '') => (typeof v === 'string' && v.trim() ? v : fallback);
const arr = <T>(v: any): T[] => (Array.isArray(v) ? v : []);

export function buildReportSkeleton(args: {
  company: {
    company_name: string;
    sector: string;
    employee_range: string;
    organizational_model: string;
  };
  selectedCountries: string[];
  completedAreasCount: number;
  hasDraftSources: boolean;
  hasPartialDataFlag: boolean;
  selectedRegulations: Regulation[];
  euRegulation: Regulation;
  maturityConfig: MaturityAssessment;
  maturityValues: Record<string, number | null>;
  attentionByArea: Record<string, Attention | null>;
  overallAttention: Attention;
}): ReportJson {
  const countryRows = args.selectedRegulations.map((r) => ({
    code: r.country_code,
    name: r.country_name,
    status: r.status,
  }));

  const impacts = args.maturityConfig.areas.map((a) => ({
    area_id: a.id,
    area_name: a.name,
    attention_level: args.attentionByArea[a.id],
    impact_description: args.attentionByArea[a.id]
      ? `Impatto da approfondire per ${a.name} sulla base delle fonti disponibili.`
      : 'Area non valutata.',
    priority: args.attentionByArea[a.id],
    regulatory_reference: 'Fonti normative integrate nel sistema',
  }));

  const maturity = args.maturityConfig.areas.map((a) => {
    const current = args.maturityValues[a.id] ?? null;
    const label = current
      ? a.levels.find((l) => l.value === current)?.label ?? 'Non valutata'
      : 'Non valutata';
    return {
      area_id: a.id,
      area_name: a.name,
      current_level: current as 1 | 2 | 3 | 4 | null,
      current_level_label: label,
      gap_description: current
        ? 'Gap da definire in base all’assetto organizzativo corrente.'
        : 'Area non valutata.',
      recommendation: current
        ? 'Definire azioni progressive coerenti con le fonti normative disponibili.'
        : 'Completare prima la valutazione dell’area.',
    };
  });

  return {
    metadata: {
      company_name: args.company.company_name,
      sector: args.company.sector,
      employee_range: args.company.employee_range,
      organizational_model: args.company.organizational_model,
      generated_at: new Date().toISOString(),
      selected_countries: args.selectedCountries,
      completed_areas_count: args.completedAreasCount,
      has_draft_sources: args.hasDraftSources,
      has_partial_data_flag: args.hasPartialDataFlag,
      tool_version: '1.0.0',
    },
    executive_summary: {
      overall_attention: args.overallAttention,
      synthesis_sentence: 'Sintesi preliminare generata con fallback strutturale.',
      key_points: [
        'Le fonti normative selezionate sono state considerate nel perimetro.',
        'Il livello di attenzione deriva da regole deterministiche lato backend.',
        'Le raccomandazioni richiedono validazione umana prima dell’uso operativo.',
      ],
      brief_context:
        'Questo report è stato completato con struttura di fallback per garantire validità dello schema anche in presenza di output AI parziale.',
    },
    perimeter: {
      company_block: {
        company_name: args.company.company_name,
        sector: args.company.sector,
        employee_range: args.company.employee_range,
        organizational_model: args.company.organizational_model,
      },
      countries_analyzed: countryRows,
      excluded_scope:
        'Il report non include consulenza legale vincolante né analisi automatica di documenti aziendali.',
    },
    eu_directive: {
      overview: 'Sintesi Direttiva UE disponibile nelle fonti integrate.',
      key_obligations: [
        {
          title: 'Trasparenza retributiva',
          description: 'Obblighi sintetizzati dalle fonti integrate disponibili.',
          article_reference: 'Fonte UE integrata',
          relevance: 'alta',
        },
      ],
      timeline_summary: 'Timeline da verificare sulle fonti ufficiali più aggiornate.',
    },
    country_analysis: args.selectedRegulations.map((r) => ({
      country_code: r.country_code,
      country_name: r.country_name,
      status: r.status,
      national_framework_summary: 'Quadro nazionale sintetizzato dalle fonti integrate.',
      key_differences_vs_eu: ['Differenze da approfondire sulle sezioni tematiche.'],
      specific_obligations: [
        {
          title: 'Obblighi specifici',
          description: 'Dettagli da confermare nelle fonti nazionali disponibili.',
          article_reference: 'Fonte nazionale integrata',
        },
      ],
      implementation_notes:
        'Le indicazioni nazionali sono preliminari e richiedono verifica umana, soprattutto per fonti in bozza.',
    })),
    countries_comparison: {
      table_rows: [
        {
          topic: 'Stato normativa',
          cells: Object.fromEntries(args.selectedRegulations.map((r) => [r.country_code, r.status])),
        },
      ],
      narrative:
        'Confronto sintetico disponibile; espandere con ulteriori fonti nazionali quando presenti.',
    },
    impacts_by_area: impacts,
    maturity,
    recommendations: [],
    limits: {
      scope_limitations:
        'Output preliminare basato su dati utente e fonti integrate; non sostituisce consulenza legale.',
      methodological_caveats:
        'Il modello AI può produrre output parziali; il sistema applica fallback strutturale per preservare coerenza.',
      draft_warning: args.hasDraftSources
        ? 'Sono presenti fonti in bozza: i contenuti potrebbero cambiare in fase di adozione definitiva.'
        : null,
      partial_data_warning: args.hasPartialDataFlag
        ? 'Assessment parziale: alcune aree non sono state valutate.'
        : null,
    },
    sources: [args.euRegulation, ...args.selectedRegulations].map((r) => ({
      country_code: r.country_code,
      document_title: r.document_title,
      document_type: r.document_type,
      status: r.status,
      version: r.version,
      date: r.date,
      pdf_link: null,
    })),
  };
}

export function repairReportFromAi(aiDraft: any, skeleton: ReportJson): ReportJson {
  const ai = aiDraft && typeof aiDraft === 'object' ? aiDraft : {};

  const skeletonCountries = skeleton.country_analysis;
  const aiCountries = arr<any>(ai.country_analysis);

  const aiImpacts = new Map(arr<any>(ai.impacts_by_area).map((x) => [x?.area_id, x]));
  const aiMaturity = new Map(arr<any>(ai.maturity).map((x) => [x?.area_id, x]));

  const recs = arr<any>(ai.recommendations)
    .slice(0, 5)
    .map((r, idx) => ({
      id: str(r?.id, `R${idx + 1}`),
      title: str(r?.title, `Raccomandazione ${idx + 1}`),
      priority: asAtt(r?.priority, 'media'),
      description: str(r?.description, 'Raccomandazione da validare.'),
      related_areas: arr<string>(r?.related_areas).filter((x) => typeof x === 'string'),
      related_countries: arr<string>(r?.related_countries).filter((x) => typeof x === 'string'),
    }));

  const keyPoints = arr<string>(ai?.executive_summary?.key_points).filter(
    (x) => typeof x === 'string' && x.trim(),
  );

  return {
    metadata: {
      ...skeleton.metadata,
      ...(ai.metadata ?? {}),
      completed_areas_count: [6, 7, 8, 9].includes(ai?.metadata?.completed_areas_count)
        ? ai.metadata.completed_areas_count
        : skeleton.metadata.completed_areas_count,
      selected_countries:
        arr<string>(ai?.metadata?.selected_countries).filter((x) => typeof x === 'string').length > 0
          ? arr<string>(ai.metadata.selected_countries).filter((x) => typeof x === 'string')
          : skeleton.metadata.selected_countries,
    },
    executive_summary: {
      ...skeleton.executive_summary,
      ...(ai.executive_summary ?? {}),
      overall_attention: asAtt(
        ai?.executive_summary?.overall_attention,
        skeleton.executive_summary.overall_attention,
      ),
      synthesis_sentence: str(
        ai?.executive_summary?.synthesis_sentence,
        skeleton.executive_summary.synthesis_sentence,
      ),
      key_points:
        keyPoints.length >= 3 ? keyPoints.slice(0, 5) : skeleton.executive_summary.key_points,
      brief_context: str(ai?.executive_summary?.brief_context, skeleton.executive_summary.brief_context),
    },
    perimeter: {
      ...skeleton.perimeter,
      ...(ai.perimeter ?? {}),
      countries_analyzed:
        arr<any>(ai?.perimeter?.countries_analyzed).length > 0
          ? arr<any>(ai.perimeter.countries_analyzed).map((c) => ({
              code: str(c?.code, 'NA'),
              name: str(c?.name, 'N/A'),
              status: asStatus(c?.status, 'draft'),
            }))
          : skeleton.perimeter.countries_analyzed,
    },
    eu_directive: {
      ...skeleton.eu_directive,
      ...(ai.eu_directive ?? {}),
      key_obligations:
        arr<any>(ai?.eu_directive?.key_obligations).length > 0
          ? arr<any>(ai.eu_directive.key_obligations).map((o) => ({
              title: str(o?.title, 'Obbligo'),
              description: str(o?.description, 'Descrizione non disponibile.'),
              article_reference: str(o?.article_reference, 'Fonte UE'),
              relevance: asAtt(o?.relevance, 'media'),
            }))
          : skeleton.eu_directive.key_obligations,
    },
    country_analysis: skeletonCountries.map((base) => {
      const found = aiCountries.find((x) => x?.country_code === base.country_code) ?? {};
      return {
        country_code: str(found.country_code, base.country_code),
        country_name: str(found.country_name, base.country_name),
        status: asStatus(found.status, base.status),
        national_framework_summary: str(found.national_framework_summary, base.national_framework_summary),
        key_differences_vs_eu:
          arr<string>(found.key_differences_vs_eu).filter((x) => typeof x === 'string').length > 0
            ? arr<string>(found.key_differences_vs_eu).filter((x) => typeof x === 'string')
            : base.key_differences_vs_eu,
        specific_obligations:
          arr<any>(found.specific_obligations).length > 0
            ? arr<any>(found.specific_obligations).map((o) => ({
                title: str(o?.title, 'Obbligo specifico'),
                description: str(o?.description, 'Descrizione non disponibile.'),
                article_reference: str(o?.article_reference, 'Fonte nazionale'),
              }))
            : base.specific_obligations,
        implementation_notes: str(found.implementation_notes, base.implementation_notes),
      };
    }),
    countries_comparison: {
      ...skeleton.countries_comparison,
      ...(ai.countries_comparison ?? {}),
      table_rows:
        arr<any>(ai?.countries_comparison?.table_rows).length > 0
          ? arr<any>(ai.countries_comparison.table_rows).map((r) => ({
              topic: str(r?.topic, 'Topic'),
              cells: typeof r?.cells === 'object' && r?.cells ? r.cells : {},
            }))
          : skeleton.countries_comparison.table_rows,
      narrative: str(ai?.countries_comparison?.narrative, skeleton.countries_comparison.narrative),
    },
    impacts_by_area: skeleton.impacts_by_area.map((base) => {
      const found = aiImpacts.get(base.area_id) ?? {};
      return {
        area_id: str(found.area_id, base.area_id),
        area_name: str(found.area_name, base.area_name),
        attention_level: found.attention_level ? asAtt(found.attention_level, 'media') : base.attention_level,
        impact_description: str(found.impact_description, base.impact_description),
        priority: found.priority ? asAtt(found.priority, 'media') : base.priority,
        regulatory_reference: str(found.regulatory_reference, base.regulatory_reference),
      };
    }),
    maturity: skeleton.maturity.map((base) => {
      const found = aiMaturity.get(base.area_id) ?? {};
      const lvl = [1, 2, 3, 4].includes(found.current_level) ? found.current_level : base.current_level;
      return {
        area_id: str(found.area_id, base.area_id),
        area_name: str(found.area_name, base.area_name),
        current_level: lvl,
        current_level_label: str(found.current_level_label, base.current_level_label),
        gap_description: str(found.gap_description, base.gap_description),
        recommendation: str(found.recommendation, base.recommendation),
      };
    }),
    recommendations: recs.length > 0 ? recs : skeleton.recommendations,
    limits: {
      ...skeleton.limits,
      ...(ai.limits ?? {}),
      scope_limitations: str(ai?.limits?.scope_limitations, skeleton.limits.scope_limitations),
      methodological_caveats: str(ai?.limits?.methodological_caveats, skeleton.limits.methodological_caveats),
      draft_warning:
        ai?.limits?.draft_warning === null
          ? null
          : str(ai?.limits?.draft_warning, skeleton.limits.draft_warning ?? ''),
      partial_data_warning:
        ai?.limits?.partial_data_warning === null
          ? null
          : str(ai?.limits?.partial_data_warning, skeleton.limits.partial_data_warning ?? ''),
    },
    sources:
      arr<any>(ai.sources).length > 0
        ? arr<any>(ai.sources).map((s, idx) => ({
            country_code: str(s?.country_code, skeleton.sources[idx]?.country_code ?? 'NA'),
            document_title: str(s?.document_title, skeleton.sources[idx]?.document_title ?? 'Fonte'),
            document_type: str(s?.document_type, skeleton.sources[idx]?.document_type ?? 'documento'),
            status: asStatus(s?.status, skeleton.sources[idx]?.status ?? 'draft'),
            version: str(s?.version, skeleton.sources[idx]?.version ?? 'n/a'),
            date: str(s?.date, skeleton.sources[idx]?.date ?? new Date().toISOString().slice(0, 10)),
            pdf_link: s?.pdf_link === null ? null : str(s?.pdf_link, ''),
          }))
        : skeleton.sources,
  };
}
