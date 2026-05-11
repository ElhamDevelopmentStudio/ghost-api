import { env } from './env';

/** Thrown for any non-2xx response. Carries the parsed body when available. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /** Path relative to `VITE_API_URL`, leading slash required. */
  path: string;
};

/**
 * Thin typed `fetch` wrapper that:
 *   - prepends `VITE_API_URL`
 *   - JSON-encodes the body and sets the right Content-Type
 *   - parses JSON responses (or returns null for 204)
 *   - throws `ApiError` for non-2xx responses
 *
 * Use this from TanStack Query `queryFn` / `mutationFn`. Authentication is
 * cookie-based, so the wrapper always includes credentials.
 */
export async function apiRequest<T = unknown>({
  path,
  body,
  headers,
  ...init
}: RequestOptions): Promise<T> {
  const response = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (response.status === 204) return null as T;

  const text = await response.text();
  const parsed = text.length > 0 ? safeJson(text) : null;

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? response.statusText;
    throw new ApiError(response.status, message, parsed);
  }

  return parsed as T;
}

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;

  if ('message' in body && typeof body.message === 'string') {
    return body.message;
  }

  if ('error' in body) {
    const error = body.error;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
  }

  return null;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
