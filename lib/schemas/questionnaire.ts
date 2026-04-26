import { z } from 'zod';

export const companySchema = z.object({
  company_name: z.string().min(1),
  sector: z.string().min(1),
  employee_range: z.string().min(1),
  organizational_model: z.string().min(1),
});

export const questionnaireSchema = z.object({
  company: companySchema,
  selected_countries: z.array(z.string().length(2)).min(1),
  maturity: z.record(z.number().int().min(1).max(4).nullable()),
});

export type QuestionnaireData = z.infer<typeof questionnaireSchema>;
