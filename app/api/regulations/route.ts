import { NextResponse } from 'next/server';
import { readProcessedRegulations } from '@/lib/report/data';

export async function GET() {
  const regs = await readProcessedRegulations();
  return NextResponse.json({ regulations: regs });
}
