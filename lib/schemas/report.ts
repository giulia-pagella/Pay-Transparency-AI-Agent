import { z } from 'zod';

const att = z.enum(['alta', 'media', 'bassa']);
const targetAtt = z.enum(['Alta', 'Media', 'Bassa']);
const reportPriority = z.union([att, targetAtt]);
const temporalTag = z.enum(['Immediata', 'Entro 6 mesi', 'Entro 12 mesi']);
const directiveSubject = z.enum(['datore di lavoro', 'Stato membro', 'candidato', 'lavoratore']);
const maturityLevel = z.enum(['Iniziale', 'Parziale', 'Strutturato', 'Avanzato', 'Non valutata']);
const comparisonStatus = z.enum(['vigente', 'in_bozza', 'in_recepimento']);

const attentionBreakdownSchema = z.object({
  maturity: z.object({ value: z.number(), weight: z.literal(0.5), contribution: z.number() }),
  organization: z.object({ value: z.number(), weight: z.literal(0.25), contribution: z.number() }),
  timeToCompliance: z.object({ value: z.number(), weight: z.literal(0.15), contribution: z.number() }),
  sectorRisk: z.object({ value: z.number(), weight: z.literal(0.10), contribution: z.number() }),
});

const euObligationSchema = z.object({
  article: z.string(),
  title: z.string(),
  description: z.string(),
  subject: directiveSubject,
  source_tag: z.literal('FONTE UE').default('FONTE UE'),
  // Legacy fields still consumed by the current web/PDF renderers.
  article_reference: z.string().optional(),
  relevance: att.default('media'),
});

const comparisonRowSchema = z.object({
  topic: z.string(),
  cells: z.record(z.string(), z.string()),
});

const comparisonTimelineSchema = z.object({
  country_code: z.string(),
  country_name: z.string(),
  status: comparisonStatus,
  enforcement_date: z.string(),
  phase_label: z.string(),
});

const maturityAreaReportSchema = z.object({
  area_id: z.string(),
  area_name: z.string(),
  maturity_level: maturityLevel,
  attention: targetAtt.nullable(),
  directive_articles: z.array(z.string()),
  analysis: z.string(),
  // Legacy fields still consumed by the current web/PDF renderers.
  current_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).nullable(),
  current_level_label: z.string(),
  gap_description: z.string(),
  recommendation: z.string().optional(),
});

const recommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: reportPriority,
  temporal_tag: temporalTag,
  short_description: z.string(),
  concrete_actions: z.array(z.string()).min(2).max(3),
  directive_articles: z.array(z.string()).min(1),
  related_areas: z.array(z.string()).min(1),
  related_countries: z.array(z.string()).min(1),
  // Legacy field still consumed by the current web/PDF renderers.
  description: z.string(),
});

export const reportSchema = z.object({
  metadata: z.object({
    company_name: z.string(),
    sector: z.string(),
    employee_range: z.string(),
    organizational_model: z.string(),
    generated_at: z.string(),
    selected_countries: z.array(z.string()),
    completed_areas_count: z.number().min(6).max(9),
    has_draft_sources: z.boolean(),
    has_partial_data_flag: z.boolean(),
    tool_version: z.string(),
  }),
  executive_summary: z.object({
    overall_attention: att,
    attention_score: z.number().optional(),
    attention_breakdown: attentionBreakdownSchema.optional(),
    attention_triggers: z.array(z.string()).optional(),
    headline: z.string(),
    paragraph: z.string(),
    key_points: z.array(z.string()).min(4).max(4),
  }),
  perimeter: z.object({
    company_block: z.record(z.string(), z.any()),
    countries_analyzed: z.array(
      z.object({ code: z.string(), name: z.string(), status: z.enum(['definitive', 'draft']) }),
    ),
    excluded_scope: z.string(),
  }),
  eu_directive: z.object({
    overview: z.string(),
    key_obligations: z.array(euObligationSchema).min(3).max(4),
    timeline_summary: z.string(),
  }),
  country_analysis: z.array(
    z.object({
      country_code: z.string(),
      country_name: z.string(),
      status: z.enum(['definitive', 'draft']),
      national_framework_summary: z.string(),
      key_differences_vs_eu: z.array(z.string()),
      specific_obligations: z.array(
        z.object({ title: z.string(), description: z.string(), article_reference: z.string() }),
      ),
      implementation_notes: z.string(),
    }),
  ),
  countries_comparison: z.object({
    thesis: z.string().nullable(),
    timeline: z.array(comparisonTimelineSchema),
    table_rows: z.array(comparisonRowSchema),
    comparison_table: z.array(comparisonRowSchema).optional(),
    // Legacy narrative kept for the current renderers.
    narrative: z.string(),
  }),
  impacts_by_area: z.array(
    z.object({
      area_id: z.string(),
      area_name: z.string(),
      attention_level: att.nullable(),
      impact_description: z.string(),
      priority: att.nullable(),
      regulatory_reference: z.string(),
    }),
  ),
  maturity: z.array(maturityAreaReportSchema),
  recommendations: z.array(recommendationSchema).length(4),
  roadmap: z.object({
    roadmap_intro: z.string(),
    engagement_priorities: z.array(z.string()).min(3).max(4),
  }),
  limits: z.object({
    scope_limitations: z.string(),
    methodological_caveats: z.string(),
    draft_warning: z.string().nullable(),
    partial_data_warning: z.string().nullable(),
  }),
  sources: z.array(
    z.object({
      country_code: z.string(),
      document_title: z.string(),
      document_type: z.string(),
      status: z.enum(['definitive', 'draft']),
      version: z.string(),
      date: z.string(),
      pdf_link: z.string().nullable().optional(),
    }),
  ),
});

export type ReportJson = z.infer<typeof reportSchema>;
