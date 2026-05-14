import { Prisma } from '@prisma/client';
import type { RequestLogEntry } from '@ghostapi/runtime';

export const REDACTED_VALUE = '[redacted]';
export const REQUEST_LOG_RETENTION_DAYS = 30;

const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'proxy-authorization',
  'x-api-key',
  'x-auth-token',
  'x-csrf-token',
]);

const SENSITIVE_KEY_PATTERN =
  /authorization|cookie|token|secret|password|passwd|api[-_]?key|apikey|csrf|session/i;

export function sanitizeRequestLogEntry(entry: RequestLogEntry) {
  return {
    id: entry.id,
    endpointId: entry.endpointId,
    method: entry.method,
    path: entry.path,
    status: entry.status,
    durationMs: entry.durationMs,
    headers: redactHeaders(entry.requestHeaders) as Prisma.InputJsonValue,
    body: toPrismaJson(redactValue(entry.requestBody)),
    responseHeaders: redactHeaders(entry.responseHeaders) as Prisma.InputJsonValue,
    responseContentType: entry.responseContentType || null,
    responseBody: toPrismaJson(redactValue(entry.responseBody)),
  };
}

export function requestLogRetentionCutoff(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - REQUEST_LOG_RETENTION_DAYS);
  return cutoff;
}

function redactHeaders(headers: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      isSensitiveHeader(key) ? REDACTED_VALUE : value,
    ]),
  );
}

function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map(redactValue);
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      isSensitiveKey(key) ? REDACTED_VALUE : redactValue(item),
    ]),
  );
}

function isSensitiveHeader(key: string) {
  const normalized = key.trim().toLowerCase();
  return SENSITIVE_HEADER_NAMES.has(normalized) || SENSITIVE_KEY_PATTERN.test(normalized);
}

function isSensitiveKey(key: string) {
  return SENSITIVE_KEY_PATTERN.test(key.trim());
}

function toPrismaJson(value: unknown) {
  if (value === null || value === undefined) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
