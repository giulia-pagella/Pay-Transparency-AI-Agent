import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session/store';

export async function GET() {
  const sessionId = (await cookies()).get('session_id')?.value;
  const session = getSession(sessionId);
  if (!session) return NextResponse.json({ session_active: false });
  return NextResponse.json({
    session_active: true,
    has_report: Boolean(session.reportJson || session.partialReportJson),
    report_json: session.reportJson,
    partial_report_json: session.partialReportJson,
  });
}
