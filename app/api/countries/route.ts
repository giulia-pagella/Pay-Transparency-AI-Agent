import { NextResponse } from 'next/server';
import { getCountries, readProcessedRegulations } from '@/lib/report/data';

export async function GET() {
  const countries = getCountries();
  const regs = await readProcessedRegulations();

  const byCode = new Map(regs.map((r) => [r.country_code, r.status]));
  const out = countries.map((c) => ({
    ...c,
    status: byCode.get(c.code) ?? 'none',
  }));

  return NextResponse.json({ countries: out });
}
