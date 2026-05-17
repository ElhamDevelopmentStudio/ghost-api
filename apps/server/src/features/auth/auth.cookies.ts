import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

import { env } from '../../env.js';
import type { AppEnv } from '../../server/types.js';
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  CSRF_COOKIE,
  REFRESH_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants.js';
import { createCsrfToken } from './auth.crypto.js';

const COOKIE_PATH = '/';

export function readAccessCookie(c: Context<AppEnv>): string | undefined {
  return getCookie(c, ACCESS_COOKIE);
}

export function readRefreshCookie(c: Context<AppEnv>): string | undefined {
  return getCookie(c, REFRESH_COOKIE);
}

export function readCsrfCookie(c: Context<AppEnv>): string | undefined {
  return getCookie(c, CSRF_COOKIE);
}

export function setAuthCookies(
  c: Context<AppEnv>,
  input: { accessToken: string; refreshToken: string },
): void {
  setCookie(c, ACCESS_COOKIE, input.accessToken, {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  setCookie(c, REFRESH_COOKIE, input.refreshToken, {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearAuthCookies(c: Context<AppEnv>): void {
  deleteCookie(c, ACCESS_COOKIE, { path: COOKIE_PATH });
  deleteCookie(c, REFRESH_COOKIE, { path: COOKIE_PATH });
}

export function ensureCsrfCookie(c: Context<AppEnv>): string {
  const existing = readCsrfCookie(c);
  if (existing) return existing;

  const token = createCsrfToken();
  setCookie(c, CSRF_COOKIE, token, {
    ...baseCookieOptions(),
    httpOnly: false,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
  return token;
}

function baseCookieOptions() {
  const isProduction = env().NODE_ENV === 'production';

  return {
    path: COOKIE_PATH,
    sameSite: isProduction ? ('None' as const) : ('Lax' as const),
    secure: isProduction,
  };
}
