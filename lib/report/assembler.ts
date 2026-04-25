import type { MaturityAssessment } from '@/lib/schemas/maturity';
import type { Regulation } from '@/lib/schemas/regulations';
import type { ReportJson } from '@/lib/schemas/report';

type Attention = 'alta' | 'media' | 'bassa';

function asAtt(value: any, fallback: Attention): Attention {
  return value === 'alta' || value === 'media' || value === 'bassa' ? value : fallback;
}

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
    const label = current ? a.levels.find((l) => l.value === current)?.label ?? 'Non valutata' : 'Non valutata';
    return {
      area_id: a.id,
      area_name: a.name,
      current_level: current as 1 | 2 | 3 | 4 | null,
      current_level_label: label,
      gap_description: current ? 'Gap da definire in base all’assetto organizzativo corrente.' : 'Area non valutata.',
      recommendation: current ? 'Definire azioni progressive coerenti con le fonti normative disponibili.' : 'Completare prima la valutazione dell’area.',
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
      narrative: 'Confronto sintetico disponibile; espandere con ulteriori fonti nazionali quando presenti.',
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

  return {
    ...skeleton,
    metadata: { ...skeleton.metadata, ...(ai.metadata ?? {}) },
    executive_summary: {
      ...skeleton.executive_summary,
      ...(ai.executive_summary ?? {}),
      overall_attention: asAtt(ai?.executive_summary?.overall_attention, skeleton.executive_summary.overall_attention),
      key_points:
        Array.isArray(ai?.executive_summary?.key_points) && ai.executive_summary.key_points.length >= 3
          ? ai.executive_summary.key_points.slice(0, 5)
          : skeleton.executive_summary.key_points,
    },
    perimeter: { ...skeleton.perimeter, ...(ai.perimeter ?? {}) },
    eu_directive: { ...skeleton.eu_directive, ...(ai.eu_directive ?? {}) },
    country_analysis:
      Array.isArray(ai.country_analysis) && ai.country_analysis.length > 0
        ? ai.country_analysis
        : skeleton.country_analysis,
    countries_comparison: {
      ...skeleton.countries_comparison,
      ...(ai.countries_comparison ?? {}),
    },
    impacts_by_area:
      Array.isArray(ai.impacts_by_area) && ai.impacts_by_area.length > 0
        ? ai.impacts_by_area
        : skeleton.impacts_by_area,
    maturity: Array.isArray(ai.maturity) && ai.maturity.length > 0 ? ai.maturity : skeleton.maturity,
    recommendations:
      Array.isArray(ai.recommendations) && ai.recommendations.length > 0
        ? ai.recommendations.slice(0, 5)
        : skeleton.recommendations,
    limits: { ...skeleton.limits, ...(ai.limits ?? {}) },
    sources: Array.isArray(ai.sources) && ai.sources.length > 0 ? ai.sources : skeleton.sources,
  };
}
