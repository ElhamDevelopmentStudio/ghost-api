import type { Context } from 'hono';

/**
 * Canned-fixture handler powering the docs `/docs` Playground widget. Keeps the
 * `/mock/:projectId/*` URL shape that real projects use, so the example URL
 * shown to readers is genuine — but skips Prisma entirely so there's no demo
 * project to seed, migrate, or guard against accidental deletion.
 */

type DemoUser = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
};

const DEMO_USERS: readonly DemoUser[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin' },
  { id: 2, name: 'Alan Turing', email: 'alan@example.com', role: 'editor' },
  { id: 3, name: 'Grace Hopper', email: 'grace@example.com', role: 'viewer' },
];

const MAX_LATENCY_MS = 2000;
const DEMO_AUTH_TOKEN = 'demo';

function clampNumber(raw: string | null, min: number, max: number): number {
  if (!raw) return min;
  const n = Number(raw);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function isAuthorized(c: Context): boolean {
  const header = c.req.header('authorization') ?? '';
  if (!header.toLowerCase().startsWith('bearer ')) return false;
  return header.slice('bearer '.length).trim() === DEMO_AUTH_TOKEN;
}

export async function handleDemoMock(c: Context, suffix: string): Promise<Response> {
  const url = new URL(c.req.url);
  const latencyMs = Math.floor(clampNumber(url.searchParams.get('_latency'), 0, MAX_LATENCY_MS));
  const errorChance = clampNumber(url.searchParams.get('_error'), 0, 1);
  const authRequired = url.searchParams.get('_auth') === '1';

  if (latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
  }

  if (errorChance > 0 && Math.random() < errorChance) {
    return c.json({ error: 'Simulated upstream failure', simulated: true }, 500);
  }

  if (authRequired && !isAuthorized(c)) {
    return c.json(
      {
        error: 'Missing or invalid authorization header',
        hint: 'Send Authorization: Bearer demo',
        simulated: true,
      },
      401,
    );
  }

  return route(c, suffix);
}

function route(c: Context, suffix: string): Promise<Response> | Response {
  const method = c.req.method.toUpperCase();
  const path = stripTrailingSlash(suffix) || '/';

  if (method === 'GET' && path === '/users') {
    return c.json(DEMO_USERS);
  }

  const userIdMatch = path.match(/^\/users\/(\d+)$/);
  if (userIdMatch) {
    const id = Number(userIdMatch[1]);
    if (method === 'GET') {
      const user = DEMO_USERS.find((u) => u.id === id);
      if (!user) return c.json({ error: 'User not found' }, 404);
      return c.json(user);
    }
    if (method === 'DELETE') {
      return new Response(null, { status: 204 });
    }
  }

  if (method === 'POST' && path === '/users') {
    return handleCreateUser(c);
  }

  return c.json({ error: `No demo route for ${method} ${path}`, simulated: true }, 404);
}

async function handleCreateUser(c: Context): Promise<Response> {
  let body: Record<string, unknown> = {};
  try {
    body = (await c.req.json()) as Record<string, unknown>;
  } catch {
    // Empty/invalid JSON is allowed for the demo — fall back to defaults.
  }
  const name = typeof body.name === 'string' && body.name.length > 0 ? body.name : 'New User';
  const email =
    typeof body.email === 'string' && body.email.length > 0
      ? body.email
      : `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
  const role: DemoUser['role'] =
    body.role === 'admin' || body.role === 'editor' ? body.role : 'viewer';
  const nextId = DEMO_USERS.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  return c.json({ id: nextId, name, email, role }, 201);
}

function stripTrailingSlash(path: string): string {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}
