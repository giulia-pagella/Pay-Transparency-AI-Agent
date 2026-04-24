import { randomUUID } from 'node:crypto';
import type { QuestionnaireData } from '@/lib/schemas/questionnaire';
import type { ReportJson } from '@/lib/schemas/report';

const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

export type SessionData = {
  apiKey: string;
  questionnaireData: QuestionnaireData | null;
  reportJson: ReportJson | null;
  partialReportJson: Partial<ReportJson> | null;
  lastActivity: number;
  rateLimitCounter: {
    callsThisMinute: number;
    minuteWindowStart: number;
    callsLast24h: number;
    dayWindowStart: number;
  };
};

const store = new Map<string, SessionData>();

function purgeExpired() {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (now - v.lastActivity > SESSION_TTL_MS) store.delete(k);
  }
}

export function createSession(apiKey: string) {
  purgeExpired();
  const sessionId = randomUUID();
  store.set(sessionId, {
    apiKey,
    questionnaireData: null,
    reportJson: null,
    partialReportJson: null,
    lastActivity: Date.now(),
    rateLimitCounter: { callsThisMinute: 0, minuteWindowStart: Date.now(), callsLast24h: 0, dayWindowStart: Date.now() },
  });
  return sessionId;
}

export function getSession(sessionId: string | undefined) {
  if (!sessionId) return null;
  purgeExpired();
  const s = store.get(sessionId);
  if (!s) return null;
  s.lastActivity = Date.now();
  return s;
}

export function clearSession(sessionId: string | undefined) {
  if (!sessionId) return;
  store.delete(sessionId);
}

export function checkRateLimit(session: SessionData) {
  const now = Date.now();
  if (now - session.rateLimitCounter.minuteWindowStart >= 60_000) {
    session.rateLimitCounter.minuteWindowStart = now;
    session.rateLimitCounter.callsThisMinute = 0;
  }
  if (now - session.rateLimitCounter.dayWindowStart >= 24 * 60 * 60 * 1000) {
    session.rateLimitCounter.dayWindowStart = now;
    session.rateLimitCounter.callsLast24h = 0;
  }

  if (session.rateLimitCounter.callsThisMinute >= 5) {
    const remainingSeconds = Math.ceil((60_000 - (now - session.rateLimitCounter.minuteWindowStart)) / 1000);
    return { ok: false as const, type: 'minute', remainingSeconds };
  }
  if (session.rateLimitCounter.callsLast24h >= 20) {
    return { ok: false as const, type: 'day' };
  }
  return { ok: true as const };
}

export function increaseRate(session: SessionData) {
  session.rateLimitCounter.callsThisMinute += 1;
  session.rateLimitCounter.callsLast24h += 1;
}
