import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { runtimePrisma } from './runtime-context.js';

declare global {
  var __ghostapi_prisma__: PrismaClient | undefined;
}

function nodePrisma(): PrismaClient {
  const e = env();

  const client =
    globalThis.__ghostapi_prisma__ ??
    new PrismaClient({
      log: e.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

  if (e.NODE_ENV !== 'production') {
    globalThis.__ghostapi_prisma__ = client;
  }

  return client;
}

export function getPrisma(): PrismaClient {
  return runtimePrisma() ?? nodePrisma();
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, property, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
