import { z } from 'zod';

const att = z.enum(['alta', 'media', 'bassa']);

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
    synthesis_sentence: z.string(),
    key_points: z.array(z.string()).min(3).max(5),
    brief_context: z.string(),
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
    key_obligations: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        article_reference: z.string(),
        relevance: att,
      }),
    ),
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
    table_rows: z.array(
      z.object({ topic: z.string(), cells: z.record(z.string(), z.string()) }),
    ),
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
  maturity: z.array(
    z.object({
      area_id: z.string(),
      area_name: z.string(),
      current_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).nullable(),
      current_level_label: z.string(),
      gap_description: z.string(),
      recommendation: z.string(),
    }),
  ),
  recommendations: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      priority: att,
      description: z.string(),
      related_areas: z.array(z.string()),
      related_countries: z.array(z.string()),
    }),
  ).max(5),
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
