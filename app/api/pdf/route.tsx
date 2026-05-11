import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { renderToBuffer } from '@react-pdf/renderer';
import { getSession } from '@/lib/session/store';
import { ReportPdf } from '@/lib/pdf/document';
import { sanitizeFilename } from '@/lib/utils/validation';

export async function GET() {
  const sid = (await cookies()).get('session_id')?.value;
  const session = getSession(sid);
  if (!session?.reportJson) return NextResponse.json({ error: 'Report non disponibile' }, { status: 400 });

  const report = session.reportJson;
  const fileName = `PayTransparency_Assessment_${sanitizeFilename(report.metadata.company_name)}_${new Date().toISOString().slice(0, 10)}.pdf`;
  const buffer = await renderToBuffer(<ReportPdf report={report} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${fileName}"`,
    },
  });
}
