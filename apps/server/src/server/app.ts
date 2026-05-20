import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';

import { registerBackendOpenApi } from '../docs/openapi.js';
import { env } from '../env.js';
import { authRouter } from '../features/auth/index.js';
import { projectsRouter } from '../features/projects/index.js';
import { uploadsRouter } from '../features/uploads/uploads.routes.js';
import { logger } from '../logger.js';
import { healthRouter } from '../routes/health.js';
import { mockRouter } from '../routes/mock.js';
import { schemasRouter } from '../routes/schemas.js';
import type { AppEnv } from './types.js';

export function createApp() {
  const e = env();
  const app = new OpenAPIHono<AppEnv>();
  const allowedOrigins = parseOrigins(e.CORS_ORIGINS);
  const backendCors = cors({
    origin: (origin) => {
      if (!origin) return null;
      return allowedOrigins.includes(origin) ? origin : null;
    },
    credentials: true,
    allowHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
      'X-Device-Id',
      'X-API-Version',
    ],
    exposeHeaders: ['X-GhostAPI-Request-Log-Id'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  const mockCors = cors({
    origin: '*',
    allowHeaders: ['*'],
    exposeHeaders: ['X-GhostAPI-Request-Log-Id'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  });

  app.use('*', (c, next) =>
    c.req.path.startsWith('/mock/') ? mockCors(c, next) : backendCors(c, next),
  );

  app.use('*', async (c, next) => {
    const start = Date.now();
    await next();
    logger.info(
      {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs: Date.now() - start,
      },
      'request',
    );
  });

  app.route('/auth', authRouter);
  app.route('/uploads', uploadsRouter);
  app.route('/health', healthRouter);
  app.route('/projects', projectsRouter);
  app.route('/projects', schemasRouter);
  app.route('/mock', mockRouter);

  registerBackendOpenApi(app);

  app.openAPIRegistry.registerComponent('securitySchemes', 'accessCookie', {
    type: 'apiKey',
    in: 'cookie',
    name: 'ghostapi_access',
    description: 'Short-lived HttpOnly access-token cookie.',
  });
  app.openAPIRegistry.registerComponent('securitySchemes', 'refreshCookie', {
    type: 'apiKey',
    in: 'cookie',
    name: 'ghostapi_refresh',
    description: 'Rotating HttpOnly refresh-token cookie backed by the sessions table.',
  });
  app.openAPIRegistry.registerComponent('securitySchemes', 'csrfHeader', {
    type: 'apiKey',
    in: 'header',
    name: 'x-csrf-token',
    description: 'Double-submit CSRF token from GET /auth/csrf.',
  });

  app.doc31('/openapi.json', {
    openapi: '3.1.0',
    info: {
      title: 'GhostAPI Backend API',
      version: '0.1.0',
      description:
        'Cookie-based GhostAPI authentication and backend routes. Auth uses short-lived HttpOnly access cookies, rotating refresh cookies, database-backed sessions, and CSRF double-submit headers.',
    },
    servers: [{ url: `http://localhost:${e.PORT}`, description: 'Local development' }],
  });

  app.get(
    '/docs',
    apiReference({
      url: '/openapi.json',
      theme: 'deepSpace',
      pageTitle: 'GhostAPI API Reference',
    }),
  );

  app.notFound((c) => c.json({ error: 'Not found' }, 404));

  app.onError((err, c) => {
    logger.error({ err, path: c.req.path }, 'Unhandled error');
    return c.json({ error: 'Internal server error' }, 500);
  });

  return app;
}

function parseOrigins(origins: string): string[] {
  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
