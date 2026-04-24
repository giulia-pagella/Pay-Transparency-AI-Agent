import { z } from 'zod';

export const maturityAreaSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  has_direct_obligation: z.boolean(),
  levels: z.array(
    z.object({
      value: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      label: z.string(),
      bullet: z.string(),
    }),
  ),
});

export const maturityAssessmentSchema = z.object({
  areas: z.array(maturityAreaSchema).length(9),
});

export type MaturityAssessment = z.infer<typeof maturityAssessmentSchema>;
