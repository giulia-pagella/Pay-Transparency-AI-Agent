import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearSession } from '@/lib/session/store';

export async function POST() {
  const cookieStore = await cookies();
  const sid = cookieStore.get('session_id')?.value;
  clearSession(sid);
  const res = NextResponse.json({ ok: true });
  res.cookies.set('session_id', '', { maxAge: 0, path: '/' });
  return res;
}
