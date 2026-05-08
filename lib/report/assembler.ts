import type { MaturityAssessment } from '@/lib/schemas/maturity';
import type { Regulation } from '@/lib/schemas/regulations';
import type { ReportJson } from '@/lib/schemas/report';
import type { AttentionLevelBreakdown } from '@/lib/attention/rules';

type Attention = 'alta' | 'media' | 'bassa';
type Status = 'definitive' | 'draft';

function asAtt(value: any, fallback: Attention): Attention {
  return value === 'alta' || value === 'media' || value === 'bassa' ? value : fallback;
}

function asStatus(value: any, fallback: Status): Status {
  return value === 'definitive' || value === 'draft' ? value : fallback;
}

const str = (v: any, fallback = '') => (typeof v === 'string' && v.trim() ? v.trim() : fallback);
const arr = <T>(v: any): T[] => (Array.isArray(v) ? v : []);

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function nonEmptyStrings(v: unknown, max?: number): string[] {
  const items = arr<unknown>(v)
    .filter(isNonEmptyString)
    .map((x) => x.trim());

  return typeof max === 'number' ? items.slice(0, max) : items;
}

function minText(v: unknown, fallback: string): string {
  return isNonEmptyString(v) ? v.trim() : fallback;
}

function normalizeLevelLabel(
  area: MaturityAssessment['areas'][number],
  current: number | null,
): string {
  if (!current) return 'Non valutata';
  return area.levels.find((l) => l.value === current)?.label ?? 'Non valutata';
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
  attentionScore?: number;
  attentionBreakdown?: AttentionLevelBreakdown;
  attentionTriggers?: string[];
}): ReportJson {
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
      attention_score: args.attentionScore,
      attention_breakdown: args.attentionBreakdown,
      attention_triggers: args.attentionTriggers,
      headline: '',
      paragraph: '',
      key_points: [],
    },

    perimeter: {
      company_block: {
        company_name: args.company.company_name,
        sector: args.company.sector,
        employee_range: args.company.employee_range,
        organizational_model: args.company.organizational_model,
      },
      countries_analyzed: args.selectedRegulations.map((r) => ({
        code: r.country_code,
        name: r.country_name,
        status: r.status,
      })),
      excluded_scope: '',
    },

    eu_directive: {
      overview: '',
      key_obligations: [],
      timeline_summary: '',
    },

    country_analysis: args.selectedRegulations.map((r) => ({
      country_code: r.country_code,
      country_name: r.country_name,
      status: r.status,
      national_framework_summary: '',
      key_differences_vs_eu: [],
      specific_obligations: [],
      implementation_notes: '',
    })),

    countries_comparison: {
      table_rows: [],
      narrative: '',
    },

    impacts_by_area: args.maturityConfig.areas.map((a) => ({
      area_id: a.id,
      area_name: a.name,
      attention_level: args.attentionByArea[a.id],
      impact_description: '',
      priority: args.attentionByArea[a.id],
      regulatory_reference: '',
    })),

    maturity: args.maturityConfig.areas.map((a) => ({
      area_id: a.id,
      area_name: a.name,
      current_level: (args.maturityValues[a.id] ?? null) as 1 | 2 | 3 | 4 | null,
      current_level_label: normalizeLevelLabel(a, args.maturityValues[a.id] ?? null),
      gap_description: '',
      recommendation: '',
    })),

    recommendations: [],

    limits: {
      scope_limitations: '',
      methodological_caveats: '',
      draft_warning: args.hasDraftSources ? '' : null,
      partial_data_warning: args.hasPartialDataFlag ? '' : null,
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

  const aiCountries = new Map(arr<any>(ai.country_analysis).map((c) => [c?.country_code, c]));
  const aiImpacts = new Map(arr<any>(ai.impacts_by_area).map((x) => [x?.area_id, x]));
  const aiMaturity = new Map(arr<any>(ai.maturity).map((x) => [x?.area_id, x]));

  const recommendations = arr<any>(ai.recommendations)
    .slice(0, 5)
    .map((r, idx) => ({
      id: str(r?.id, `R${idx + 1}`),
      title: str(r?.title, `Raccomandazione ${idx + 1}`),
      priority: asAtt(r?.priority, 'media'),
      description: minText(
        r?.description,
        'Da completare in base agli input e alle fonti disponibili.',
      ),
      related_areas: nonEmptyStrings(r?.related_areas, 5),
      related_countries: nonEmptyStrings(r?.related_countries, 5),
    }));

  return {
    metadata: {
      company_name: skeleton.metadata.company_name,
      sector: skeleton.metadata.sector,
      employee_range: skeleton.metadata.employee_range,
      organizational_model: skeleton.metadata.organizational_model,
      generated_at: skeleton.metadata.generated_at,
      selected_countries: skeleton.metadata.selected_countries,
      completed_areas_count: skeleton.metadata.completed_areas_count,
      has_draft_sources: skeleton.metadata.has_draft_sources,
      has_partial_data_flag: skeleton.metadata.has_partial_data_flag,
      tool_version: skeleton.metadata.tool_version,
    },

    executive_summary: {
      // overall_attention is always deterministic — never let AI override it
      overall_attention: skeleton.executive_summary.overall_attention,
      // scoring fields come from deterministic calculation, not AI
      attention_score: skeleton.executive_summary.attention_score,
      attention_breakdown: skeleton.executive_summary.attention_breakdown,
      attention_triggers: skeleton.executive_summary.attention_triggers,
      headline: minText(
        ai?.executive_summary?.headline,
        'Headline non generata in modo completo.',
      ),
      key_points: (() => {
        const pts = nonEmptyStrings(ai?.executive_summary?.key_points, 4);
        if (pts.length === 4) return pts;
        // Pad to exactly 4 if AI returned fewer
        while (pts.length < 4) pts.push('Punto chiave da completare.');
        return pts;
      })(),
      paragraph: minText(
        ai?.executive_summary?.paragraph,
        'Paragrafo descrittivo non generato in modo completo.',
      ),
    },

    perimeter: {
      company_block: skeleton.perimeter.company_block,
      countries_analyzed: skeleton.perimeter.countries_analyzed,
      excluded_scope: minText(
        ai?.perimeter?.excluded_scope,
        'Il report non costituisce consulenza legale vincolante.',
      ),
    },

    eu_directive: {
      overview: minText(
        ai?.eu_directive?.overview,
        'Sintesi della direttiva non generata in modo completo.',
      ),
      key_obligations:
        arr<any>(ai?.eu_directive?.key_obligations).length > 0
          ? arr<any>(ai.eu_directive.key_obligations).slice(0, 8).map((o) => ({
              title: str(o?.title, 'Obbligo'),
              description: minText(o?.description, 'Descrizione non disponibile.'),
              article_reference: str(o?.article_reference, 'Fonte UE'),
              relevance: asAtt(o?.relevance, 'media'),
            }))
          : [],
      timeline_summary: minText(
        ai?.eu_directive?.timeline_summary,
        'Timeline non generata in modo completo.',
      ),
    },

    country_analysis: skeleton.country_analysis.map((base) => {
      const found = aiCountries.get(base.country_code) ?? {};
      return {
        country_code: base.country_code,
        country_name: base.country_name,
        status: base.status,
        national_framework_summary: minText(
          found?.national_framework_summary,
          'Analisi nazionale non generata in modo completo.',
        ),
        key_differences_vs_eu: nonEmptyStrings(found?.key_differences_vs_eu, 6),
        specific_obligations: arr<any>(found?.specific_obligations)
          .slice(0, 8)
          .map((o) => ({
            title: str(o?.title, 'Obbligo specifico'),
            description: minText(o?.description, 'Descrizione non disponibile.'),
            article_reference: str(o?.article_reference, 'Fonte nazionale'),
          })),
        implementation_notes: minText(
          found?.implementation_notes,
          'Indicazioni implementative non generate in modo completo.',
        ),
      };
    }),

    countries_comparison: {
      table_rows: arr<any>(ai?.countries_comparison?.table_rows).map((row) => ({
        topic: str(row?.topic, 'Tema'),
        cells: row?.cells && typeof row.cells === 'object' ? row.cells : {},
      })),
      narrative: minText(
        ai?.countries_comparison?.narrative,
        'Confronto non generato in modo completo.',
      ),
    },

    impacts_by_area: skeleton.impacts_by_area.map((base) => {
      const found = aiImpacts.get(base.area_id) ?? {};
      return {
        area_id: base.area_id,
        area_name: base.area_name,
        attention_level: asAtt(found?.attention_level, base.attention_level ?? 'media'),
        impact_description: minText(
          found?.impact_description,
          'Impatto da approfondire sulla base di input e fonti.',
        ),
        priority: asAtt(found?.priority, base.priority ?? 'media'),
        regulatory_reference: minText(
          found?.regulatory_reference,
          'Fonte normativa integrata.',
        ),
      };
    }),

    maturity: skeleton.maturity.map((base) => {
      const found = aiMaturity.get(base.area_id) ?? {};
      return {
        area_id: base.area_id,
        area_name: base.area_name,
        current_level: base.current_level,
        current_level_label: base.current_level_label,
        gap_description: minText(
          found?.gap_description,
          base.current_level === null
            ? 'Area non valutata.'
            : 'Gap da definire in relazione ai requisiti normativi applicabili.',
        ),
        recommendation: minText(
          found?.recommendation,
          base.current_level === null
            ? 'Completare la valutazione dell’area.'
            : 'Definire azioni sulla base del gap rilevato.',
        ),
      };
    }),

    recommendations:
      recommendations.length > 0
        ? recommendations
        : [
            {
              id: 'R1',
              title: 'Completare l’analisi dei gap',
              priority: skeleton.executive_summary.overall_attention,
              description:
                'Il contenuto generato non è risultato sufficientemente completo. È necessario rieseguire la generazione del report.',
              related_areas: [],
              related_countries: skeleton.metadata.selected_countries,
            },
          ],

    limits: {
      scope_limitations: minText(
        ai?.limits?.scope_limitations,
        'Output preliminare basato su dati utente e fonti integrate.',
      ),
      methodological_caveats: minText(
        ai?.limits?.methodological_caveats,
        'Il contenuto AI richiede validazione umana prima dell’uso operativo.',
      ),
      draft_warning: skeleton.metadata.has_draft_sources
        ? minText(ai?.limits?.draft_warning, 'Sono presenti fonti in bozza.')
        : null,
      partial_data_warning: skeleton.metadata.has_partial_data_flag
        ? minText(
            ai?.limits?.partial_data_warning,
            'Assessment parziale: alcune aree non sono state valutate.',
          )
        : null,
    },

    sources: skeleton.sources,
  };
}
