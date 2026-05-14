import type { HeaderDraft } from '../types';
import { makeId } from './ids';

const storagePrefix = 'ghostapi:playground:shared-headers:';

export function loadSharedHeaders(projectId: string): HeaderDraft[] {
  const raw = window.localStorage.getItem(storageKey(projectId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return normalizeSharedHeaders(
      parsed.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const value = item as Partial<HeaderDraft>;
        if (typeof value.key !== 'string' || typeof value.value !== 'string') return [];
        return [
          {
            id: typeof value.id === 'string' ? value.id : makeId(),
            key: value.key,
            value: value.value,
            enabled: typeof value.enabled === 'boolean' ? value.enabled : true,
          },
        ];
      }),
    );
  } catch {
    return [];
  }
}

export function saveSharedHeaders(projectId: string, headers: HeaderDraft[]) {
  window.localStorage.setItem(
    storageKey(projectId),
    JSON.stringify(normalizeSharedHeaders(headers)),
  );
}

export function normalizeSharedHeaders(headers: HeaderDraft[]) {
  const byKey = new Map<string, HeaderDraft>();
  const order: string[] = [];

  for (const header of headers) {
    const key = header.key.trim();
    const normalizedKey = key.toLowerCase();
    if (!normalizedKey) {
      const idKey = `:${header.id}`;
      byKey.set(idKey, header);
      order.push(idKey);
      continue;
    }

    const normalizedHeader = { ...header, key: canonicalHeaderKey(key) };
    const existing = byKey.get(normalizedKey);
    if (!existing) {
      byKey.set(normalizedKey, normalizedHeader);
      order.push(normalizedKey);
      continue;
    }

    if (shouldReplaceHeader(existing, normalizedHeader)) {
      byKey.set(normalizedKey, { ...normalizedHeader, id: existing.id });
    }
  }

  return order
    .map((key) => byKey.get(key))
    .filter((header): header is HeaderDraft => Boolean(header));
}

function storageKey(projectId: string) {
  return `${storagePrefix}${projectId}`;
}

function canonicalHeaderKey(key: string) {
  return key.toLowerCase() === 'authorization' ? 'Authorization' : key;
}

function shouldReplaceHeader(existing: HeaderDraft, next: HeaderDraft) {
  if (!existing.value.trim() && next.value.trim()) return true;
  if (existing.value.trim() && !next.value.trim()) return false;
  if (!existing.enabled && next.enabled) return true;
  return true;
}
