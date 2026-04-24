import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateGeminiKey } from '@/lib/ai/gemini';
import { createSession } from '@/lib/session/store';
import { GEMINI_API_KEY_REGEX } from '@/lib/utils/validation';

const bodySchema = z.object({ api_key: z.string().min(1) });

export async function POST(req: Request) {
  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'Input non valido.' }, { status: 400 });

  if (!GEMINI_API_KEY_REGEX.test(body.data.api_key)) {
    return NextResponse.json({ error: 'La chiave API inserita non è valida o è stata revocata. Verifica la chiave su Google AI Studio e reinseriscila. I dati del questionario sono conservati.' }, { status: 400 });
  }

  try {
    await validateGeminiKey(body.data.api_key);
    const sessionId = createSession(body.data.api_key);
    const res = NextResponse.json({ ok: true });
    res.cookies.set('session_id', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 4,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'La chiave API inserita non è valida o è stata revocata. Verifica la chiave su Google AI Studio e reinseriscila. I dati del questionario sono conservati.' }, { status: 400 });
  }
}
