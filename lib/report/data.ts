import fs from 'node:fs/promises';
import path from 'node:path';
import countriesData from '@/data/regulations/countries.json';
import maturityData from '@/data/maturity-assessment.json';
import { countriesSchema, regulationSchema, type Regulation } from '@/lib/schemas/regulations';
import { maturityAssessmentSchema } from '@/lib/schemas/maturity';

export async function readProcessedRegulations() {
  const dir = path.join(process.cwd(), 'data/regulations/processed');
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  const regs: Regulation[] = [];
  for (const f of files.filter((n) => n.endsWith('.json'))) {
    const content = await fs.readFile(path.join(dir, f), 'utf8');
    regs.push(regulationSchema.parse(JSON.parse(content)));
  }
  return regs;
}

export function getCountries() {
  return countriesSchema.parse(countriesData).countries;
}

export function getMaturityConfig() {
  return maturityAssessmentSchema.parse(maturityData);
}
