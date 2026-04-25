import { z } from 'zod';

export const regulationSectionSchema = z.object({
  topic: z.string(),
  title: z.string(),
  content: z.string(),
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
  sections: z.array(regulationSectionSchema),
});

export const countriesSchema = z.object({
  countries: z.array(
    z.object({ code: z.string().length(2), name: z.string(), flag_emoji: z.string() }),
  ),
});

export type Regulation = z.infer<typeof regulationSchema>;
