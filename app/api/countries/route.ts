import { NextResponse } from 'next/server';
import { getCountries, readProcessedRegulations } from '@/lib/report/data';

export async function GET() {
  const countries = getCountries();

  try {
    const regs = await readProcessedRegulations();
    const byCode = new Map(regs.map((r) => [r.country_code, r.status]));
    const out = countries.map((c) => ({
      ...c,
      status: byCode.get(c.code) ?? 'none',
    }));

    return NextResponse.json({ countries: out });
  } catch (err) {
    console.error('[/api/countries] Unable to load regulations, returning fallback statuses', err);

    const fallback = countries.map((c) => ({
      ...c,
      status: 'none' as const,
    }));

    return NextResponse.json({
      countries: fallback,
      warning: 'Regulation data unavailable; all country statuses set to none.',
    });
  }
}
