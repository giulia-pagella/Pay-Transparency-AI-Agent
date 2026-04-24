import { describe, expect, it } from 'vitest';
import { sanitizeFilename } from '@/lib/utils/validation';

describe('sanitize filename', () => {
  it('rimuove caratteri speciali e accenti', () => {
    expect(sanitizeFilename('Azienda Èlite S.p.A.')).toBe('Azienda_Elite_SpA');
  });
});
