import { describe, expect, it } from 'vitest';
import { loadServerEnv } from './env.js';

const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'a'.repeat(32),
} as NodeJS.ProcessEnv;

describe('loadServerEnv', () => {
  it('parses a valid env', () => {
    const env = loadServerEnv(validEnv);
    expect(env.PORT).toBe(3001);
    expect(env.NODE_ENV).toBe('development');
  });

  it('throws when JWT_SECRET is too short', () => {
    expect(() => loadServerEnv({ ...validEnv, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
  });

  it('throws when DATABASE_URL is missing', () => {
    const { DATABASE_URL: _, ...rest } = validEnv;
    expect(() => loadServerEnv(rest)).toThrow(/DATABASE_URL/);
  });
});
