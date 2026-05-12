export type ParsedInitialsIcon = {
  label: string;
  color: string;
};

export function formatProjectRequests(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

export function parseInitialsIcon(icon: string | null): ParsedInitialsIcon | null {
  if (!icon?.startsWith('initials:')) return null;
  const [, label, color] = icon.split(':');
  if (!label || !color) return null;
  return { label, color };
}

export function formatRelativeProjectTime(value: string): string {
  const updatedAt = new Date(value).getTime();
  const diffMs = Date.now() - updatedAt;
  const dayMs = 86_400_000;
  if (diffMs < dayMs) return '2h ago';
  const days = Math.max(1, Math.floor(diffMs / dayMs));
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
