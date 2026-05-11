import { Prisma } from '@prisma/client';

import { prisma } from '../../db.js';
import {
  EMAIL_VERIFICATION_TTL_SECONDS,
  PASSWORD_RESET_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants.js';
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
  emailVerifiedAt: string | null;
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
}): Promise<RegisterResult> {
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);
  const verificationToken = createOpaqueToken();

  try {
    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: input.name?.trim() || null,
          passwordHash,
        },
      });
      await tx.emailVerification.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(verificationToken),
          expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_SECONDS * 1000),
        },
      });
      return user;
    });

    return { user: serializeUser(user), verificationToken };
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
  if (!user.emailVerifiedAt) {
    throw new AuthError(403, 'Verify your email before signing in');
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

export async function createEmailVerification(email: string): Promise<{
  email: string;
  name: string | null;
  verificationToken?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
  if (!user || user.emailVerifiedAt) {
    return { email: normalizeEmail(email), name: null };
  }

  const verificationToken = createOpaqueToken();
  await prisma.$transaction([
    prisma.emailVerification.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    }),
    prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(verificationToken),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_SECONDS * 1000),
      },
    }),
  ]);

  return {
    email: user.email,
    name: user.name,
    verificationToken,
  };
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

export async function createPasswordReset(email: string): Promise<{
  email: string;
  name: string | null;
  resetToken?: string;
}> {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user) return { email: normalizeEmail(email), name: null };

  const resetToken = createOpaqueToken();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000),
    },
  });
  return { email: user.email, name: user.name, resetToken };
}

export async function verifyEmail(token: string): Promise<void> {
  const verification = await prisma.emailVerification.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!verification || verification.usedAt || verification.expiresAt <= new Date()) {
    throw new AuthError(400, 'Invalid or expired verification link');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerification.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    }),
    prisma.emailVerification.updateMany({
      where: {
        userId: verification.userId,
        usedAt: null,
        id: { not: verification.id },
      },
      data: { usedAt: new Date() },
    }),
  ]);
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

type RegisterResult = {
  user: PublicUser;
  verificationToken: string;
};

async function toAuthResult(
  user: {
    id: string;
    email: string;
    name: string | null;
    emailVerifiedAt: Date | null;
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
  emailVerifiedAt: Date | null;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
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
