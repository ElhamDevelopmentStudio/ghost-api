import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  REDIS_URL: z.string().url().startsWith('redis://'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3002'),
  APP_URL: z.string().url().default('http://localhost:3002'),
  MAIL_USERNAME: z.string().default('resend'),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().email().default('noreply@elhamullah.dev'),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1).default('ghostapi'),
  R2_REGION: z.string().min(1).default('auto'),
  R2_ENDPOINT_URL: z.string().url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function loadServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid server environment:\n${issues}`);
  }

  return parsed.data;
}

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function loadPublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const parsed = publicEnvSchema.safeParse(source);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid public environment:\n${issues}`);
  }

  return parsed.data;
}

/* ---- Vite (apps/app protected SPA) public env ----------------------- */

const vitePublicEnvSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_NAME: z.string().default('GhostAPI'),
});

export type VitePublicEnv = z.infer<typeof vitePublicEnvSchema>;

/**
 * Validate Vite's `import.meta.env` for the protected React SPA.
 *
 * Call once at boot (main.tsx) so a missing/invalid `VITE_API_URL` fails
 * loudly during startup instead of producing confusing runtime errors when
 * the app tries to reach the backend.
 */
export function loadVitePublicEnv(source: Record<string, unknown>): VitePublicEnv {
  const parsed = vitePublicEnvSchema.safeParse(source);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid Vite public environment:\n${issues}`);
  }

  return parsed.data;
}
