import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session/store';

export async function POST() {
  const sid = (await cookies()).get('session_id')?.value;
  const session = getSession(sid);
  if (!session) return NextResponse.json({ error: 'Sessione non attiva' }, { status: 401 });
  session.questionnaireData = null;
  session.reportJson = null;
  session.partialReportJson = null;
  return NextResponse.json({ ok: true });
}
