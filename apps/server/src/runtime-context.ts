import { AsyncLocalStorage } from 'node:async_hooks';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { loadServerEnv, type ServerEnv } from '@ghostapi/config';

export type WorkerBindings = Record<string, unknown> & {
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  CORS_ORIGINS?: string;
  APP_URL?: string;
  LOG_LEVEL?: string;
  MAIL_USERNAME?: string;
  MAIL_PASSWORD?: string;
  MAIL_FROM?: string;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET?: string;
  R2_REGION?: string;
  R2_ENDPOINT_URL: string;
};

type RuntimeContext = {
  env: ServerEnv;
  prisma?: PrismaClient;
};

const runtimeContext = new AsyncLocalStorage<RuntimeContext>();

export function runWithRuntimeContext<T>(context: RuntimeContext, callback: () => T): T {
  return runtimeContext.run(context, callback);
}

export function runtimeEnv(): ServerEnv | undefined {
  return runtimeContext.getStore()?.env;
}

export function runtimePrisma(): PrismaClient | undefined {
  return runtimeContext.getStore()?.prisma;
}

export function serverEnvFromBindings(bindings: WorkerBindings): ServerEnv {
  return loadServerEnv(bindings as NodeJS.ProcessEnv);
}

export function createWorkerPrisma(databaseUrl: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter, log: ['error'] });
}
