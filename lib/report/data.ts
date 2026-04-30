import fs from 'node:fs/promises';
import path from 'node:path';
import countriesData from '@/data/regulations/countries.json';
import maturityData from '@/data/maturity-assessment.json';
import { countriesSchema, regulationSchema, type Regulation } from '@/lib/schemas/regulations';
import { ZodError } from 'zod';
import { maturityAssessmentSchema } from '@/lib/schemas/maturity';

export async function readProcessedRegulations() {
  const dir = path.join(process.cwd(), 'data/regulations/processed');
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  const regs: Regulation[] = [];

  for (const filename of files.filter((n) => n.endsWith('.json'))) {
    const filePath = path.join(dir, filename);

    try {
      const content = await fs.readFile(filePath, 'utf8');
      regs.push(regulationSchema.parse(JSON.parse(content)));
    } catch (error) {
      const reason =
        error instanceof ZodError
          ? error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`).join('; ')
          : error instanceof Error
            ? error.message
            : String(error);

      console.error(`[readProcessedRegulations] Skipping invalid regulation file: ${filename}. Reason: ${reason}`);
    }
  }

  return regs;
}

export function getCountries() {
  return countriesSchema.parse(countriesData).countries;
}

export function getMaturityConfig() {
  return maturityAssessmentSchema.parse(maturityData);
}
