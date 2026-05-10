import { describe, expect, it } from 'vitest';
import type { FieldSchema } from '@ghostapi/types';
import { generateMockValue } from './index.js';

describe('generateMockValue', () => {
  it('produces email-shaped strings for `email` fields', () => {
    const schema: FieldSchema = {
      type: 'object',
      properties: { email: { type: 'string' } },
    };
    const value = generateMockValue(schema, { seed: 1 }) as { email: string };
    expect(value.email).toMatch(/@/);
  });

  it('uses provided example over generation', () => {
    const value = generateMockValue({ type: 'string', example: 'fixed' });
    expect(value).toBe('fixed');
  });

  it('produces deterministic output for the same seed', () => {
    const schema: FieldSchema = {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
      },
    };
    const a = generateMockValue(schema, { seed: 'demo' });
    const b = generateMockValue(schema, { seed: 'demo' });
    expect(a).toEqual(b);
  });

  it('respects array structure', () => {
    const schema: FieldSchema = {
      type: 'array',
      items: { type: 'integer' },
    };
    const value = generateMockValue(schema, { seed: 2, defaultArrayLength: 4 }) as number[];
    expect(value).toHaveLength(4);
    expect(value.every((n) => Number.isInteger(n))).toBe(true);
  });

  it('picks from enum', () => {
    const value = generateMockValue({ type: 'string', enum: ['a', 'b', 'c'] }, { seed: 0 });
    expect(['a', 'b', 'c']).toContain(value);
  });
});
