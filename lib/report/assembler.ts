import type { AttentionLevelBreakdown } from '@/lib/attention/rules';
import type { MaturityAssessment } from '@/lib/schemas/maturity';
import type { Regulation } from '@/lib/schemas/regulations';
import type { ReportJson } from '@/lib/schemas/report';

type Attention = 'alta' | 'media' | 'bassa';
type TargetAttention = 'Alta' | 'Media' | 'Bassa';
type DirectiveSubject = 'datore di lavoro' | 'Stato membro' | 'candidato' | 'lavoratore';
type TemporalTag = 'Immediata' | 'Entro 6 mesi' | 'Entro 12 mesi';
type ComparisonStatus = 'vigente' | 'in_bozza' | 'in_recepimento';
type MaturityLevel = ReportJson['maturity'][number]['maturity_level'];
type JsonRecord = Record<string, unknown>;
type ComparisonRow = ReportJson['countries_comparison']['table_rows'][number];
type ComparisonTimelineItem = ReportJson['countries_comparison']['timeline'][number];

const EMPTY_RECORD: JsonRecord = {};

const TARGET_ATTENTION: Record<Attention, TargetAttention> = {
  alta: 'Alta',
  media: 'Media',
  bassa: 'Bassa',
};

const DIRECTIVE_SUBJECTS: DirectiveSubject[] = [
  'datore di lavoro',
  'Stato membro',
  'candidato',
  'lavoratore',
];

const TEMPORAL_TAGS: TemporalTag[] = ['Immediata', 'Entro 6 mesi', 'Entro 12 mesi'];

const str = (v: unknown, fallback = '') =>
  typeof v === 'string' && v.trim() ? v.trim() : fallback;

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? v : []);

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : EMPTY_RECORD;
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function stringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function nonEmptyStrings(v: unknown, max?: number): string[] {
  const items = arr<unknown>(v).filter(isNonEmptyString).map((x) => x.trim());
  return typeof max === 'number' ? items.slice(0, max) : items;
}

function minText(v: unknown, fallback: string): string {
  return isNonEmptyString(v) ? v.trim() : fallback;
}

function asAtt(value: unknown, fallback: Attention): Attention {
  if (value === 'Alta') return 'alta';
  if (value === 'Media') return 'media';
  if (value === 'Bassa') return 'bassa';
  return value === 'alta' || value === 'media' || value === 'bassa' ? value : fallback;
}

function asTargetAttention(value: unknown, fallback: TargetAttention | null): TargetAttention | null {
  if (value === 'Alta' || value === 'Media' || value === 'Bassa') return value;
  if (value === 'alta' || value === 'media' || value === 'bassa') return TARGET_ATTENTION[value];
  return fallback;
}

function asSubject(value: unknown): DirectiveSubject {
  return DIRECTIVE_SUBJECTS.includes(value as DirectiveSubject)
    ? (value as DirectiveSubject)
    : 'datore di lavoro';
}

function asTemporalTag(value: unknown, fallback: TemporalTag): TemporalTag {
  return TEMPORAL_TAGS.includes(value as TemporalTag) ? (value as TemporalTag) : fallback;
}

function asComparisonStatus(value: unknown): ComparisonStatus {
  if (value === 'vigente' || value === 'in_bozza' || value === 'in_recepimento') {
    return value;
  }
  if (value === 'definitive') return 'vigente';
  if (value === 'draft') return 'in_bozza';
  return 'in_recepimento';
}

function normalizeLevelLabel(
  area: MaturityAssessment['areas'][number],
  current: number | null,
): MaturityLevel {
  if (!current) return 'Non valutata';
  const label = area.levels.find((l) => l.value === current)?.label;
  return normalizeMaturityLevel(label, 'Non valutata');
}

function normalizeMaturityLevel(value: unknown, fallback: MaturityLevel): MaturityLevel {
  const level = str(value, fallback);
  return ['Iniziale', 'Parziale', 'Strutturato', 'Avanzato', 'Non valutata'].includes(level)
    ? (level as MaturityLevel)
    : fallback;
}

function normalizeComparisonRows(value: unknown): ComparisonRow[] {
  return records(value).map((row) => ({
    topic: str(row.topic, 'Tema'),
    cells: stringRecord(row.cells),
  }));
}

function normalizeTimeline(value: unknown): ComparisonTimelineItem[] {
  return records(value)
    .map((item) => ({
      country_code: str(item.country_code),
      country_name: str(item.country_name),
      status: asComparisonStatus(item.status),
      enforcement_date: str(item.enforcement_date, 'Data non disponibile'),
      phase_label: str(item.phase_label, 'Fase non specificata'),
    }))
    .filter((item) => item.country_code && item.country_name);
}

function firstNonEmptyStrings(values: unknown[], fallback: string[], max?: number) {
  for (const value of values) {
    const items = nonEmptyStrings(value, max);
    if (items.length > 0) return items;
  }
  return typeof max === 'number' ? fallback.slice(0, max) : fallback;
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
      thesis: null,
      timeline: [],
      table_rows: [],
      comparison_table: [],
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

    maturity: args.maturityConfig.areas.map((a) => {
      const current = (args.maturityValues[a.id] ?? null) as 1 | 2 | 3 | 4 | null;
      const label = normalizeLevelLabel(a, current);
      return {
        area_id: a.id,
        area_name: a.name,
        maturity_level: label,
        attention: asTargetAttention(args.attentionByArea[a.id], null),
        directive_articles: [],
        analysis: '',
        current_level: current,
        current_level_label: label,
        gap_description: '',
        recommendation: '',
      };
    }),

    recommendations: [],

    roadmap: {
      roadmap_intro: '',
      engagement_priorities: [],
    },

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

export function repairReportFromAi(aiDraft: unknown, skeleton: ReportJson): ReportJson {
  const ai = toRecord(aiDraft);
  const executiveSummary = toRecord(ai.executive_summary);
  const perimeter = toRecord(ai.perimeter);
  const euDirective = toRecord(ai.eu_directive);
  const countriesComparison = toRecord(ai.countries_comparison);
  const limits = toRecord(ai.limits);
  const roadmap = toRecord(ai.roadmap);
  const aiCountries = new Map(
    records(ai.country_analysis)
      .map((country) => [str(country.country_code), country] as const)
      .filter(([countryCode]) => countryCode),
  );
  const aiImpacts = new Map(
    records(ai.impacts_by_area)
      .map((impact) => [str(impact.area_id), impact] as const)
      .filter(([areaId]) => areaId),
  );
  const aiMaturity = new Map(
    records(ai.maturity)
      .map((area) => [str(area.area_id), area] as const)
      .filter(([areaId]) => areaId),
  );

  const recommendations = records(ai.recommendations)
    .slice(0, 4)
    .map((r, idx) => {
      const shortDescription = minText(
        r.short_description ?? r.shortDescription ?? r.description,
        'Sintesi operativa da completare.',
      );
      return {
        id: str(r.id, `R${idx + 1}`),
        title: str(r.title, `Raccomandazione ${idx + 1}`),
        priority: asAtt(r.priority, 'media'),
        temporal_tag: asTemporalTag(
          r.temporal_tag ?? r.temporalTag,
          idx === 0 ? 'Immediata' : idx === 1 ? 'Entro 6 mesi' : 'Entro 12 mesi',
        ),
        short_description: shortDescription,
        concrete_actions: firstNonEmptyStrings(
          [r.concrete_actions, r.concreteActions],
          ['Definire il perimetro operativo', 'Documentare owner e scadenze'],
          3,
        ),
        directive_articles: firstNonEmptyStrings(
          [r.directive_articles, r.directiveArticles],
          ['Direttiva UE 2023/970'],
          6,
        ),
        description: minText(r.description, shortDescription),
        related_areas: firstNonEmptyStrings(
          [r.related_areas],
          skeleton.maturity.slice(0, 1).map((m) => m.area_id),
          5,
        ),
        related_countries: firstNonEmptyStrings(
          [r.related_countries],
          skeleton.metadata.selected_countries,
          5,
        ),
      };
    });

  while (recommendations.length < 4) {
    const idx = recommendations.length;
    recommendations.push({
      id: `R${idx + 1}`,
      title: `Raccomandazione ${idx + 1}`,
      priority: skeleton.executive_summary.overall_attention,
      temporal_tag: idx === 0 ? 'Immediata' : idx === 1 ? 'Entro 6 mesi' : 'Entro 12 mesi',
      short_description: 'Contenuto da rigenerare.',
      concrete_actions: ['Rigenerare il report con dati completi', 'Verificare i riferimenti normativi'],
      directive_articles: ['Direttiva UE 2023/970'],
      description: 'Raccomandazione da rigenerare per completare il report secondo il contratto dati.',
      related_areas: skeleton.maturity.slice(0, 1).map((m) => m.area_id),
      related_countries: skeleton.metadata.selected_countries,
    });
  }

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
      overall_attention: skeleton.executive_summary.overall_attention,
      attention_score: skeleton.executive_summary.attention_score,
      attention_breakdown: skeleton.executive_summary.attention_breakdown,
      attention_triggers: skeleton.executive_summary.attention_triggers,
      headline: minText(executiveSummary.headline, 'Headline non generata in modo completo.'),
      key_points: (() => {
        const pts = nonEmptyStrings(executiveSummary.key_points, 4);
        while (pts.length < 4) pts.push('Punto chiave da completare.');
        return pts;
      })(),
      paragraph: minText(
        executiveSummary.paragraph,
        'Paragrafo descrittivo non generato in modo completo.',
      ),
    },

    perimeter: {
      company_block: skeleton.perimeter.company_block,
      countries_analyzed: skeleton.perimeter.countries_analyzed,
      excluded_scope: minText(
        perimeter.excluded_scope,
        'Il report non costituisce consulenza legale vincolante.',
      ),
    },

    eu_directive: {
      overview: minText(
        euDirective.overview,
        'Sintesi della direttiva non generata in modo completo.',
      ),
      key_obligations: records(euDirective.key_obligations)
        .slice(0, 4)
        .map((o) => {
          const article = str(o.article ?? o.article_reference, 'Fonte UE');
          return {
            article,
            title: str(o.title, 'Obbligo'),
            description: minText(o.description, 'Descrizione non disponibile.'),
            subject: asSubject(o.subject),
            source_tag: 'FONTE UE' as const,
            article_reference: article,
            relevance: asAtt(o.relevance, 'media'),
          };
        }),
      timeline_summary: minText(euDirective.timeline_summary, 'Timeline non generata in modo completo.'),
    },

    country_analysis: skeleton.country_analysis.map((base) => {
      const found = aiCountries.get(base.country_code) ?? EMPTY_RECORD;
      return {
        country_code: base.country_code,
        country_name: base.country_name,
        status: base.status,
        national_framework_summary: minText(
          found.national_framework_summary,
          'Analisi nazionale non generata in modo completo.',
        ),
        key_differences_vs_eu: nonEmptyStrings(found.key_differences_vs_eu, 6),
        specific_obligations: records(found.specific_obligations)
          .slice(0, 8)
          .map((o) => ({
            title: str(o.title, 'Obbligo specifico'),
            description: minText(o.description, 'Descrizione non disponibile.'),
            article_reference: str(o.article_reference, 'Fonte nazionale'),
          })),
        implementation_notes: minText(
          found.implementation_notes,
          'Indicazioni implementative non generate in modo completo.',
        ),
      };
    }),

    countries_comparison: {
      thesis: str(countriesComparison.thesis) || null,
      timeline: normalizeTimeline(countriesComparison.timeline),
      table_rows: normalizeComparisonRows(
        countriesComparison.table_rows ?? countriesComparison.comparison_table,
      ),
      comparison_table: normalizeComparisonRows(
        countriesComparison.comparison_table ?? countriesComparison.table_rows,
      ),
      narrative: minText(countriesComparison.narrative, 'Confronto non generato in modo completo.'),
    },

    impacts_by_area: skeleton.impacts_by_area.map((base) => {
      const found = aiImpacts.get(base.area_id) ?? EMPTY_RECORD;
      return {
        area_id: base.area_id,
        area_name: base.area_name,
        attention_level: asAtt(found.attention_level, base.attention_level ?? 'media'),
        impact_description: minText(
          found.impact_description,
          'Impatto da approfondire sulla base di input e fonti.',
        ),
        priority: asAtt(found.priority, base.priority ?? 'media'),
        regulatory_reference: minText(found.regulatory_reference, 'Fonte normativa integrata.'),
      };
    }),

    maturity: skeleton.maturity.map((base) => {
      const found = aiMaturity.get(base.area_id) ?? EMPTY_RECORD;
      const analysis = minText(
        found.analysis,
        str(found.gap_description, 'Analisi diagnostica da completare.'),
      );
      return {
        area_id: base.area_id,
        area_name: base.area_name,
        maturity_level: normalizeMaturityLevel(
          found.maturity_level ?? found.current_level_label,
          base.maturity_level,
        ),
        attention: asTargetAttention(found.attention, base.attention),
        directive_articles: firstNonEmptyStrings(
          [found.directive_articles, found.directiveArticles],
          base.directive_articles,
          6,
        ),
        analysis,
        current_level: base.current_level,
        current_level_label: base.current_level_label,
        gap_description: minText(
          found.gap_description,
          base.current_level === null
            ? 'Area non valutata.'
            : 'Gap da definire in relazione ai requisiti normativi applicabili.',
        ),
        recommendation: minText(
          found.recommendation,
          base.current_level === null
            ? 'Completare la valutazione dell area.'
            : 'Definire azioni sulla base del gap rilevato.',
        ),
      };
    }),

    recommendations,

    limits: {
      scope_limitations: minText(
        limits.scope_limitations,
        'Output preliminare basato su dati utente e fonti integrate.',
      ),
      methodological_caveats: minText(
        limits.methodological_caveats,
        'Il contenuto AI richiede validazione umana prima dell uso operativo.',
      ),
      draft_warning: skeleton.metadata.has_draft_sources
        ? minText(limits.draft_warning, 'Sono presenti fonti in bozza.')
        : null,
      partial_data_warning: skeleton.metadata.has_partial_data_flag
        ? minText(limits.partial_data_warning, 'Assessment parziale: alcune aree non sono state valutate.')
        : null,
    },

    sources: skeleton.sources,
    roadmap: {
      roadmap_intro: minText(
        ai.roadmap_intro ?? roadmap.roadmap_intro ?? roadmap.intro,
        'La roadmap proposta organizza le raccomandazioni in tre orizzonti temporali.',
      ),
      engagement_priorities: firstNonEmptyStrings(
        [ai.engagement_priorities, roadmap.engagement_priorities, roadmap.engagementPriorities],
        [
          'Consolidare il presidio HR sulle aree prioritarie.',
          'Sequenziare gli interventi in base agli obblighi applicabili.',
          'Preparare evidenze documentali per il reporting.',
        ],
        4,
      ),
    },
  };
}
