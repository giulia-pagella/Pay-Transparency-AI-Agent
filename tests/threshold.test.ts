import { describe, expect, it } from 'vitest';

const canGenerate = (values: Array<number | null>) => values.filter((v) => v !== null).length >= 6;

describe('threshold', () => {
  it('5 aree -> bloccato', () => expect(canGenerate([1,1,1,1,1,null,null,null,null])).toBe(false));
  it('6 aree -> ok', () => expect(canGenerate([1,1,1,1,1,1,null,null,null])).toBe(true));
  it('9 aree -> ok', () => expect(canGenerate([1,1,1,1,1,1,1,1,1])).toBe(true));
});
