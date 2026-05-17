import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { config as loadDotenv } from 'dotenv';

import { loadServerEnv, type ServerEnv } from '@ghostapi/config';

import { runtimeEnv } from './runtime-context.js';

let cached: ServerEnv | undefined;
let dotenvLoaded = false;

function loadDotenvOnce() {
  if (dotenvLoaded) return;
  dotenvLoaded = true;

  const rootEnvPath = resolve(process.cwd(), '../../.env');
  if (existsSync(rootEnvPath)) {
    loadDotenv({ path: rootEnvPath, quiet: true });
  } else {
    loadDotenv({ quiet: true });
  }
}

export function env(): ServerEnv {
  const requestEnv = runtimeEnv();
  if (requestEnv) return requestEnv;

  loadDotenvOnce();
  if (!cached) cached = loadServerEnv();
  return cached;
}
