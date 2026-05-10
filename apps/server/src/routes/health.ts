import { Hono } from 'hono';
import { prisma } from '../db.js';

export const healthRouter = new Hono();

healthRouter.get('/', async (c) => {
  const checks: Record<string, 'ok' | string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (err) {
    checks.database = err instanceof Error ? err.message : 'failed';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');
  return c.json({ status: allOk ? 'ok' : 'degraded', checks }, allOk ? 200 : 503);
});
