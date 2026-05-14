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
