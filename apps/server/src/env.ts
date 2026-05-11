import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { config as loadDotenv } from 'dotenv';

import { loadServerEnv, type ServerEnv } from '@ghostapi/config';

let cached: ServerEnv | undefined;

const rootEnvPath = resolve(process.cwd(), '../../.env');
if (existsSync(rootEnvPath)) {
  loadDotenv({ path: rootEnvPath, quiet: true });
} else {
  loadDotenv({ quiet: true });
}

export function env(): ServerEnv {
  if (!cached) cached = loadServerEnv();
  return cached;
}
