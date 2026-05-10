import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './env.js';
import { logger } from './logger.js';
import { healthRouter } from './routes/health.js';
import { projectsRouter } from './routes/projects.js';
import { schemasRouter } from './routes/schemas.js';
import { mockRouter } from './routes/mock.js';

const e = env();
const app = new Hono();

app.use('*', cors({ origin: '*' }));

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

app.route('/health', healthRouter);
app.route('/projects', projectsRouter);
app.route('/projects', schemasRouter);
app.route('/mock', mockRouter);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  logger.error({ err, path: c.req.path }, 'Unhandled error');
  return c.json({ error: 'Internal server error' }, 500);
});

serve({ fetch: app.fetch, port: e.PORT }, ({ port }) => {
  logger.info({ port, env: e.NODE_ENV }, 'GhostAPI server listening');
});
