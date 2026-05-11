import type { MiddlewareHandler } from 'hono';

import type { AppEnv } from '../../server/types.js';

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 10;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(name: string, limit = DEFAULT_LIMIT): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const now = Date.now();
    const key = `${name}:${clientIp(c.req.raw.headers)}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      await next();
      return;
    }

    if (current.count >= limit) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfter));
      return c.json({ success: false as const, error: { message: 'Too many requests' } }, 429);
    }

    current.count += 1;
    await next();
  };
}

export function clearRateLimitBuckets(): void {
  buckets.clear();
}

export function clientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return headers.get('cf-connecting-ip') ?? headers.get('x-real-ip') ?? forwardedFor ?? 'unknown';
}
