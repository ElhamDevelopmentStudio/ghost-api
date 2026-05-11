import { Prisma } from '@prisma/client';

import { prisma } from '../../db.js';
import { PASSWORD_RESET_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from './auth.constants.js';
import {
  createOpaqueToken,
  hashPassword,
  hashToken,
  signAccessToken,
  verifyPassword,
} from './auth.crypto.js';

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

export type PublicSession = {
  id: string;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string;
};

export class AuthError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export async function register(input: {
  email: string;
  name?: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);
  const refreshToken = createOpaqueToken();
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = refreshExpiry();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: input.name?.trim() || null,
          passwordHash,
        },
      });
      const session = await tx.session.create({
        data: {
          userId: user.id,
          refreshTokenHash,
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
          expiresAt,
        },
      });
      return { user, session };
    });

    return toAuthResult(result.user, result.session, refreshToken);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AuthError(409, 'Email is already registered');
    }
    throw err;
  }
}

export async function login(input: {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(input.email) },
  });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AuthError(401, 'Invalid email or password');
  }

  const refreshToken = createOpaqueToken();
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      expiresAt: refreshExpiry(),
    },
  });

  return toAuthResult(user, session, refreshToken);
}

export async function refreshSession(refreshToken: string): Promise<AuthResult> {
  const session = await prisma.session.findUnique({
    where: { refreshTokenHash: hashToken(refreshToken) },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    throw new AuthError(401, 'Invalid session');
  }

  const nextRefreshToken = createOpaqueToken();
  const updated = await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: hashToken(nextRefreshToken),
      lastUsedAt: new Date(),
      expiresAt: refreshExpiry(),
    },
  });

  return toAuthResult(session.user, updated, nextRefreshToken);
}

export async function currentSession(input: {
  userId: string;
  sessionId: string;
}): Promise<{ user: PublicUser; session: PublicSession }> {
  const session = await prisma.session.findFirst({
    where: {
      id: input.sessionId,
      userId: input.userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) throw new AuthError(401, 'Unauthorized');
  return { user: serializeUser(session.user), session: serializeSession(session) };
}

export async function revokeSession(input: { userId: string; sessionId: string }): Promise<void> {
  await prisma.session.updateMany({
    where: { id: input.sessionId, userId: input.userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllSessions(userId: string): Promise<number> {
  const result = await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}

export async function createPasswordReset(email: string): Promise<{ resetToken?: string }> {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user) return {};

  const resetToken = createOpaqueToken();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000),
    },
  });
  return { resetToken };
}

export async function resetPassword(input: { token: string; password: string }): Promise<void> {
  const reset = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashToken(input.token) },
  });
  if (!reset || reset.usedAt || reset.expiresAt <= new Date()) {
    throw new AuthError(400, 'Invalid or expired reset token');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash: await hashPassword(input.password) },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.updateMany({
      where: { userId: reset.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

type AuthResult = {
  user: PublicUser;
  session: PublicSession;
  accessToken: string;
  refreshToken: string;
};

async function toAuthResult(
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
  },
  session: {
    id: string;
    expiresAt: Date;
    createdAt: Date;
    lastUsedAt: Date;
  },
  refreshToken: string,
): Promise<AuthResult> {
  return {
    user: serializeUser(user),
    session: serializeSession(session),
    accessToken: await signAccessToken({ userId: user.id, sessionId: session.id }),
    refreshToken,
  };
}

function serializeUser(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

function serializeSession(session: {
  id: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
}): PublicSession {
  return {
    id: session.id,
    expiresAt: session.expiresAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
    lastUsedAt: session.lastUsedAt.toISOString(),
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function refreshExpiry(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
}
