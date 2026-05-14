export function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function uniqueNumbers(values: number[]) {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

export function countMatches(value: string, query: string) {
  return value.toLowerCase().split(query.toLowerCase()).length - 1;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
