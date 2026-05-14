import type { HeaderDraft } from '../types';
import { normalizeSharedHeaders } from './shared-headers-storage';

export function visibleSharedHeaders(sharedHeaders: HeaderDraft[]) {
  return normalizeSharedHeaders(sharedHeaders).filter((header) => header.key.trim());
}

export function visibleRequestHeaders(headers: HeaderDraft[], sharedHeaders: HeaderDraft[]) {
  const sharedKeys = activeSharedHeaderKeys(sharedHeaders);
  return headers.filter((header) => !sharedKeys.has(headerKey(header.key)));
}

export function effectiveHeaders({
  requestHeaders,
  sharedHeaders,
}: {
  requestHeaders: HeaderDraft[];
  sharedHeaders: HeaderDraft[];
}) {
  const sharedKeys = activeSharedHeaderKeys(sharedHeaders);
  return [
    ...normalizeSharedHeaders(sharedHeaders).filter(
      (header) => header.enabled && header.key.trim(),
    ),
    ...requestHeaders.filter(
      (header) => header.enabled && header.key.trim() && !sharedKeys.has(headerKey(header.key)),
    ),
  ];
}

export function effectiveContentType({
  requestHeaders,
  sharedHeaders,
  fallback,
}: {
  requestHeaders: HeaderDraft[];
  sharedHeaders: HeaderDraft[];
  fallback?: string | null;
}) {
  const header = effectiveHeaders({ requestHeaders, sharedHeaders }).find(
    (item) => headerKey(item.key) === 'content-type',
  );
  return header?.value.trim() || fallback || 'application/json';
}

export function isJsonContentType(contentType: string): boolean {
  return /\bjson\b|\+json\b/i.test(contentType);
}

function activeSharedHeaderKeys(sharedHeaders: HeaderDraft[]) {
  return new Set(
    normalizeSharedHeaders(sharedHeaders)
      .filter((header) => header.enabled && header.key.trim())
      .map((header) => headerKey(header.key)),
  );
}

function headerKey(key: string) {
  return key.trim().toLowerCase();
}
