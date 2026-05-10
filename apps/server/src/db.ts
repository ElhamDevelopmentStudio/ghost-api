import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

declare global {
  var __ghostapi_prisma__: PrismaClient | undefined;
}

const e = env();

/**
 * Singleton PrismaClient. We re-use one instance per process; in dev we also
 * stash it on `globalThis` so tsx watch mode doesn't leak connections on reload.
 */
export const prisma: PrismaClient =
  globalThis.__ghostapi_prisma__ ??
  new PrismaClient({
    log: e.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (e.NODE_ENV !== 'production') {
  globalThis.__ghostapi_prisma__ = prisma;
}
