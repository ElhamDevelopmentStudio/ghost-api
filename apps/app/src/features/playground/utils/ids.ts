export function makeId() {
  return window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}
