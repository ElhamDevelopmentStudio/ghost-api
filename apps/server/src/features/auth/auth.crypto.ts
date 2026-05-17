import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { compare } from 'bcryptjs';

import { env } from '../../env.js';
import { ACCESS_TOKEN_TTL_SECONDS } from './auth.constants.js';

const PBKDF2_ALGORITHM = 'PBKDF2-SHA256';
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH_BITS = 256;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await derivePbkdf2Key(password, salt);

  return [
    PBKDF2_ALGORITHM,
    PBKDF2_ITERATIONS,
    encodeBase64Url(salt),
    encodeBase64Url(new Uint8Array(key)),
  ].join('$');
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (passwordHash.startsWith(`${PBKDF2_ALGORITHM}$`)) {
    return verifyPbkdf2Password(password, passwordHash);
  }

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

async function verifyPbkdf2Password(password: string, passwordHash: string): Promise<boolean> {
  const [, iterationsText, saltText, hashText] = passwordHash.split('$');
  const iterations = Number.parseInt(iterationsText ?? '', 10);
  if (!Number.isInteger(iterations) || iterations <= 0 || !saltText || !hashText) return false;

  const salt = decodeBase64Url(saltText);
  const expected = decodeBase64Url(hashText);
  const actual = new Uint8Array(await derivePbkdf2Key(password, salt, iterations));

  return (
    actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  );
}

async function derivePbkdf2Key(
  password: string,
  salt: Uint8Array,
  iterations = PBKDF2_ITERATIONS,
): Promise<ArrayBuffer> {
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltBuffer,
      iterations,
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH_BITS,
  );
}

function encodeBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

function decodeBase64Url(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64url'));
}
