const DEFAULT_APP_URL = 'http://localhost:3002';

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
  return new URL(path, withTrailingSlash(baseUrl)).toString();
}

function withTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}
