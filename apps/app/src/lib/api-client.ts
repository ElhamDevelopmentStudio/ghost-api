import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponseHeaders } from 'axios';

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

type RequestOptions = Omit<AxiosRequestConfig, 'baseURL' | 'data' | 'url'> & {
  body?: unknown;
  /** Path relative to `VITE_API_URL`, leading slash required. */
  path: string;
};

/**
 * Shared Axios client for TanStack Query request functions.
 *
 * Authentication is cookie-based, so credentials are always included.
 */
export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Thin typed Axios wrapper that:
 *   - uses the configured `VITE_API_URL` base URL
 *   - JSON-encodes object bodies and sets the right Content-Type
 *   - returns response data (or null for 204)
 *   - throws `ApiError` for non-2xx responses
 *
 * Use this from TanStack Query `queryFn` / `mutationFn`.
 */
export async function apiRequest<T = unknown>({
  path,
  body,
  headers,
  ...config
}: RequestOptions): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      ...config,
      url: path,
      data: body,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
    });

    if (response.status === 204) return null as T;

    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;

    const response = error.response;
    if (!response) {
      throw new ApiError(0, error.message, null);
    }

    throw new ApiError(response.status, errorMessageFromAxios(error, response), response.data);
  }
}

function errorMessageFromAxios(
  error: AxiosError,
  response: {
    data: unknown;
    headers:
      | {
          [key: string]: unknown;
        }
      | AxiosResponseHeaders;
    statusText: string;
  },
): string {
  const parsed = maybeParseJson(response.data);
  const contentType = response.headers['content-type'];
  if (
    typeof parsed === 'string' &&
    typeof contentType === 'string' &&
    contentType.includes('text/html')
  ) {
    return response.statusText || error.message;
  }

  return extractErrorMessage(parsed) ?? response.statusText ?? error.message;
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

function maybeParseJson(data: unknown): unknown {
  if (typeof data !== 'string') return data;

  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
