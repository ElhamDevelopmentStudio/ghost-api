import type { MiddlewareHandler } from 'hono';

import { prisma } from '../../db.js';
import type { AppEnv, AuthContext } from '../../server/types.js';
import { CSRF_HEADER } from './auth.constants.js';
import { readAccessCookie, readCsrfCookie } from './auth.cookies.js';
import { secureCompare, verifyAccessToken } from './auth.crypto.js';

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = readAccessCookie(c);
  if (!token) return unauthorized(c);

  let auth: AuthContext;
  try {
    auth = await verifyAccessToken(token);
  } catch {
    return unauthorized(c);
  }

  const session = await prisma.session.findFirst({
    where: {
      id: auth.sessionId,
      userId: auth.userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });
  if (!session) return unauthorized(c);

  c.set('auth', auth);
  await next();
};

export const requireCsrf: MiddlewareHandler<AppEnv> = async (c, next) => {
  const cookieToken = readCsrfCookie(c);
  const headerToken = c.req.header(CSRF_HEADER);

  if (!cookieToken || !headerToken || !secureCompare(cookieToken, headerToken)) {
    return c.json({ success: false as const, error: { message: 'Invalid CSRF token' } }, 403);
  }

  await next();
};

export function authContext(c: { get: (key: 'auth') => AuthContext | undefined }): AuthContext {
  const auth = c.get('auth');
  if (!auth) throw new Error('Missing auth context');
  return auth;
}

function unauthorized(c: Parameters<MiddlewareHandler<AppEnv>>[0]) {
  return c.json({ success: false as const, error: { message: 'Unauthorized' } }, 401);
}
