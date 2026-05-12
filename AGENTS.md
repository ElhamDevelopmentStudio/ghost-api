# AGENTS.md

This file is the first-stop context for Codex sessions in this repository. Keep it short,
accurate, and grounded in files that exist.

## Current Repository State

GhostAPI is an implemented pnpm/Turborepo workspace, not a planning-only repo. It currently
contains app/package scaffolding, source code, tests, Storybook config, Docker Compose, Prisma
schema, env examples, CI, Husky hooks, and generated local outputs from previous runs.

Before changing code, inspect the relevant package and manifest rather than relying only on
older planning language in `docs/`.

## Product

GhostAPI turns OpenAPI 3.x schemas into runnable mock REST APIs with editable responses,
latency/error/auth simulation, request logs, and an in-app playground. The target user is a
frontend developer who needs to keep building while the backend is incomplete.

Phase 1 is REST/OpenAPI-focused. Do not add GraphQL, tRPC, AI generation, collaboration,
billing, analytics, snapshot testing, realtime sync, or marketplace behavior unless the task
explicitly changes scope. See `docs/SYNOPSIS.md` for product scope.

## Load-Bearing Architecture Rule

Everything downstream of parsing depends on `NormalizedEndpoint` / `NormalizedSchema` from
`packages/types`, never on raw OpenAPI structures.

Allowed OpenAPI-specific code belongs in `packages/parser` and OpenAPI documentation helpers.
Runtime, mock generation, app workspace UI, logs, and server route consumers should use the
normalized model. This is what keeps future protocol parsers from forcing rewrites.

Pipeline:

```txt
OpenAPI upload -> packages/parser -> NormalizedSchema/NormalizedEndpoint
                                      -> packages/mock-engine
                                      -> packages/runtime
                                      -> apps/server (Hono API + Prisma)
                                      -> apps/app (protected SPA)
                                      -> apps/web (public Next.js site)
```

## Workspace Map

- `apps/web` — public Next.js App Router site on port `3000`. Landing, docs, SEO-sensitive
  public pages. Do not put auth flows, protected dashboard logic, or the API workspace here.
- `apps/app` — protected React/Vite SPA on port `3002`. Login/register, projects, workspace,
  logs, settings, and future Electron-friendly authenticated flows.
- `apps/server` — Hono backend on port `3001`. API routes, auth, Prisma, schema ingestion,
  OpenAPI/Scalar docs, and runtime orchestration. No frontend rendering.
- `apps/server/src/features/auth` — full auth feature module. Keep auth internals behind its
  `index.ts` public surface where practical.
- `packages/parser` — OpenAPI validation, loading, dereferencing, and normalization.
- `packages/runtime` — dynamic route mounting and mock-serving behavior. Keep data generation
  out of this package.
- `packages/mock-engine` — schema-aware fake response generation. Keep runtime concerns out.
- `packages/types` — shared DTOs, Zod schemas, and normalized endpoint types.
- `packages/ui` — shared UI package, design tokens, shadcn primitives, blocks, layouts,
  Storybook stories, and `styles/globals.css`.
- `packages/config` — Zod env loaders and shared tsconfig presets. App code should use these
  loaders instead of direct env parsing.
- `packages/eslint-config` — shared ESLint configs.

## Commands

Use commands from `package.json`, package manifests, and `.github/workflows/ci.yml`.

```bash
pnpm install
docker compose up -d
pnpm --filter @ghostapi/server prisma:generate
pnpm --filter @ghostapi/server prisma:migrate
pnpm dev
```

Root scripts:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format
pnpm format:check
```

Useful package scripts:

```bash
pnpm --filter @ghostapi/web dev          # Next.js, port 3000
pnpm --filter @ghostapi/server dev       # Hono, port 3001
pnpm --filter @ghostapi/app dev          # Vite SPA, port 3002
pnpm --filter @ghostapi/ui storybook     # Storybook, port 6006
pnpm --filter @ghostapi/ui build-storybook
pnpm --filter @ghostapi/server prisma:studio
```

CI runs install, Prisma generate, lint, typecheck, tests, and build with Postgres and Redis
services. For code changes, prefer the smallest targeted test first, then broader root checks
when the blast radius warrants it.

## Environment

- Root `.env.example` mirrors Docker defaults for Postgres and Redis plus public URLs.
- `apps/app/.env.example` documents Vite-exposed env.
- `packages/config/src/env.ts` exposes `loadServerEnv`, `loadPublicEnv`, and
  `loadVitePublicEnv`.
- Do not read `process.env` directly outside env loader boundaries, config glue, or tests.
- `JWT_SECRET` must be at least 32 characters.
- `VITE_*` values are browser-visible in `apps/app`; `NEXT_PUBLIC_*` values are browser-visible
  in `apps/web`.

## Conventions

- TypeScript is strict everywhere. Avoid `any`; prefer Zod-validated DTOs at boundaries.
- Prisma is persistence only. Business logic belongs in services, routes, runtime, parser, or
  package modules, not Prisma models.
- Database columns are `snake_case` via `@map` / `@@map`; IDs are UUIDs; tables include
  `created_at` / `updated_at` unless the schema intentionally documents otherwise.
- Backend logging uses Pino structured logs. Do not add stray `console.log`.
- Uploaded schemas must be validated and parsed safely. Never `eval` uploaded schemas or execute
  uploaded JavaScript.
- In `apps/app`, use TanStack Query for server state and Zustand for UI/editor/workspace state.
  Do not mix those responsibilities.
- Shared theme tokens, typography, spacing, and component styling live in `packages/ui`.
  App-level CSS should import or compose from the UI package rather than redefining the system.
- The visual style is dark-first, technical, terminal-inspired, and low-noise. Avoid generic
  SaaS dashboards, excessive cards, oversized gradients, and analytics-heavy layouts.
- UI consistency is a hard requirement. Reuse existing `packages/ui` primitives, layouts,
  spacing, typography, icon treatment, badges, tables, pagination, dialogs, and page patterns
  before creating new one-off UI. If a genuinely new pattern is needed, add it once as a shared
  component and reuse it.
- Browser-facing work must ship with real loading, empty, error, and disabled states. Use
  `Skeleton` for loading, clear muted empty states, accessible focus states, and destructive
  confirmation dialogs for irreversible actions. Do not leave placeholder buttons, dead actions,
  TODO stubs, or blank states in admin-visible flows.
- Favor task-focused product UX over generic SaaS decoration: dense but readable layouts,
  obvious primary actions, URL-shareable state, keyboard-aware controls where expected, and
  microcopy that explains what happened or what the user can do next.
- In `apps/app`, URL-relevant state such as selected project, workspace view, filters,
  pagination, search, sort, active tabs, and deep-linkable panels should live in React Router
  params/search params instead of hidden component state.
- App feature modules should keep API calls in `features/*/api`, reusable feature UI in
  `features/*/components`, and feature-local state/types near the feature. Page files should
  compose these pieces rather than accumulating request logic, data shaping, and large UI
  primitives inline.
- Icons should come from the repo's existing icon set, currently `@remixicon/react`. Do not mix
  in another icon library unless the task explicitly adds or migrates the icon system.
- Commit messages are currently checked by Commitlint conventional config, despite the broader
  OMX lore protocol in higher-level instructions.

## Generated And Local Files

Avoid editing generated or machine-local outputs unless the task explicitly targets them:

- `node_modules/`
- `.next/`
- `.turbo/`
- `dist/`
- `coverage/`
- `storybook-static/`
- `*.tsbuildinfo`
- `.env` and `.env.*` except tracked examples
- `.omx/` runtime state and logs
- `pnpm-lock.yaml` unless dependencies or workspace resolution actually change

The worktree may contain user changes. At the time this guidance was updated, an untracked
`assets/screens/landing-hero.png` existed. Do not remove or overwrite unrelated assets.

## Docs To Read First

- `README.md` — product overview and current setup/verification quick start.
- `docs/SETUP.md` — architecture, tooling, commands, and engineering rules.
- `docs/SYNOPSIS.md` — product phases, explicit out-of-scope items, and data model direction.
- `docs/AUTHENTICATION.md` — auth architecture and security constraints.
- `apps/server/src/README.md` — backend source layout and auth module boundaries.

## Done When

For future Codex tasks, completion means:

- The requested behavior or documentation change is implemented and scoped to the request.
- Relevant tests, lint, typecheck, format check, build, or smoke checks were run.
- If a check cannot run, the blocker is stated explicitly with the next-best evidence.
- Generated/local files are not edited accidentally.
- Product constraints above are still respected.
- The final response lists changed files, verification commands and results, known blockers or
  unknowns, and any useful follow-up.
