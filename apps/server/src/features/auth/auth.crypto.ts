import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { compare, hash } from 'bcryptjs';

import { env } from '../../env.js';
import { ACCESS_TOKEN_TTL_SECONDS } from './auth.constants.js';

const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

export function createCsrfToken(): string {
  return randomBytes(24).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function secureCompare(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function signAccessToken(input: {
  userId: string;
  sessionId: string;
}): Promise<string> {
  return new SignJWT({ sid: input.sessionId })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(jwtSecret());
}

export async function verifyAccessToken(token: string): Promise<{
  userId: string;
  sessionId: string;
}> {
  const { payload } = await jwtVerify(token, jwtSecret());
  if (!payload.sub || typeof payload.sid !== 'string') {
    throw new Error('Invalid access token payload');
  }
  return { userId: payload.sub, sessionId: payload.sid };
}

function jwtSecret(): Uint8Array {
  return new TextEncoder().encode(env().JWT_SECRET);
}
