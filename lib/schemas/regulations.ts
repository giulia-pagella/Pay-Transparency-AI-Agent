import { z } from 'zod';

/**
 * Topic standard delle sezioni normative.
 * Ogni sezione di un JSON normativo deve usare uno di questi valori.
 * Mappa con le aree di maturità in lib/report/topic-area-mapping.ts.
 */
export const TOPIC_ENUM = z.enum([
  'ambito_applicazione',
  'definizioni',
  'trasparenza_preassunzione',
  'divieto_salary_history',
  'categorie_lavoratori_comparabili',
  'diritto_informazione',
  'obblighi_reporting',
  'joint_pay_assessment',
  'divieto_clausole_confidenzialita',
  'sanzioni',
  'tutele_lavoratori',
  'altro',
]);

export const regulationSectionSchema = z.object({
  topic: TOPIC_ENUM,
  title: z.string().min(3),
  content: z.string().min(50),
  article_references: z.array(z.string()).default([]),
  needs_review: z.boolean().optional(),
});

export const regulationSchema = z.object({
  country_code: z.string(),
  country_name: z.string(),
  document_type: z.string(),
  document_title: z.string(),
  status: z.enum(['definitive', 'draft']),
  version: z.string(),
  date: z.string(),
  source_pdf_filename: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  sections: z.array(regulationSectionSchema).min(1),
});

export const countriesSchema = z.object({
  countries: z.array(
    z.object({ code: z.string().length(2), name: z.string(), flag_emoji: z.string() }),
  ),
});

export type Regulation = z.infer<typeof regulationSchema>;
