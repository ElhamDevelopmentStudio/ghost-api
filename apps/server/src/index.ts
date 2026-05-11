import { serve } from '@hono/node-server';
import { env } from './env.js';
import { logger } from './logger.js';
import { createApp } from './server/app.js';

const e = env();
const app = createApp();

serve({ fetch: app.fetch, port: e.PORT }, ({ port }) => {
  logger.info({ port, env: e.NODE_ENV }, 'GhostAPI server listening');
});
