import { loadServerEnv, type ServerEnv } from '@ghostapi/config';

let cached: ServerEnv | undefined;

export function env(): ServerEnv {
  if (!cached) cached = loadServerEnv();
  return cached;
}
