import { loadVitePublicEnv, type VitePublicEnv } from '@ghostapi/config';

/** Validated, frozen public env. Throws at boot if anything is missing. */
export const env: Readonly<VitePublicEnv> = Object.freeze(
  loadVitePublicEnv(import.meta.env as unknown as Record<string, unknown>),
);
