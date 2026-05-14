import { publicEnv } from '../../env';

export type AppLinks = {
  dashboard: string;
  login: string;
  register: string;
};

export const AUTH_COOKIE_NAMES = ['ghostapi_access', 'ghostapi_refresh'] as const;

export function getAppLinks(): AppLinks {
  return {
    dashboard: buildAppUrl('/projects'),
    login: buildAppUrl('/login'),
    register: buildAppUrl('/register'),
  };
}

function buildAppUrl(path: string): string {
  return new URL(path, withTrailingSlash(publicEnv.NEXT_PUBLIC_APP_URL)).toString();
}

function withTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}
