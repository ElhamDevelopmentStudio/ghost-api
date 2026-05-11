import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { config as loadDotenv } from 'dotenv';

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('Usage: node scripts/with-root-env.mjs <command> [...args]');
  process.exit(1);
}

const rootEnvPath = resolve(process.cwd(), '../../.env');
loadDotenv({ path: existsSync(rootEnvPath) ? rootEnvPath : undefined, quiet: true });

const result = spawnSync(command, args, {
  env: process.env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
