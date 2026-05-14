import { loadPublicEnv } from '@ghostapi/config';

const DEFAULT_API_URL = 'http://localhost:3001';
const DEFAULT_APP_URL = 'http://localhost:3002';

export const publicEnv = loadPublicEnv({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL,
});
