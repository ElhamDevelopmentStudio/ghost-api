# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status

Pre-implementation. The repo currently contains only planning documents (`README.md`, `docs/SYNOPSIS.md`, `docs/SETUP.md`) and the banner asset — no source code, no `package.json`, no `docker-compose.yml`, no scaffolding yet. Treat the docs as the spec; when scaffolding the project, follow them rather than improvising structure.

## Product

GhostAPI turns OpenAPI 3.x schemas into runnable mock REST APIs with editable responses, latency/error/auth simulation, request logs, and an in-app playground. Target user: frontend devs unblocked from waiting on a backend. Phase 1 explicitly excludes GraphQL, tRPC, AI generation, collaboration, billing, analytics, and realtime — see `docs/SYNOPSIS.md` for the full out-of-scope list before adding anything.

## Architecture (planned)

The single most important architectural rule: **everything downstream of parsing depends only on a `NormalizedEndpoint` model, never on raw OpenAPI structures.** This abstraction is what enables future GraphQL/tRPC/gRPC parsers to plug in without rewriting the workspace, runtime, logs, or generators. Frontend code and the runtime server must not import OpenAPI types directly.

Pipeline:

```
OpenAPI Upload → packages/parser → NormalizedEndpoint
                                 → packages/mock-engine (fake data)
                                 → packages/runtime (dynamic route mounting, latency/auth/error sim)
                                 → apps/server (Hono) ←→ apps/app (React SPA workspace)
                                                     ←→ apps/web (Next.js public site)
```

Planned monorepo layout (Turborepo + pnpm workspaces):

- `apps/web` — **Public** Next.js App Router site (port 3000). Landing, docs, blog, marketing, SEO-sensitive pages. **Does NOT contain auth, login/register, dashboard logic, the API workspace, or any protected flow.** Lives here purely for SSR/SEO.
- `apps/app` — **Protected** React + Vite SPA (port 3002). Login, register, projects, the unified API workspace, logs, settings — every authenticated flow. Built as an SPA so it can be packaged into Electron later. Stack: React 19, Vite 6, React Router v7 (data router), TanStack Query (server state), Zustand (UI/editor state — do not mix the two), React Hook Form, Tailwind v4 via `@tailwindcss/vite`, consumes `@ghostapi/ui`. Env validated via `loadVitePublicEnv` from `@ghostapi/config` against `import.meta.env` (must be `VITE_*`-prefixed).
- `apps/server` — Hono backend (port 3001). API routes, auth, DB, runtime orchestration, schema ingestion. **No frontend rendering.** Serves both web and app over the same API surface.
- `packages/parser` — OpenAPI validation, extraction, normalization. Future protocol parsers must produce the same `NormalizedEndpoint` shape.
- `packages/runtime` — Dynamic mock runtime: route mounting, latency/auth/error simulation. Kept isolated from data generation.
- `packages/mock-engine` — Schema-aware fake data generation (Faker.js-based). Isolated from runtime logic.
- `packages/types` — Shared DTOs, enums, normalized endpoint types. Avoid duplicating types across apps.
- `packages/ui` — Shared design system. shadcn/ui is initialized here (`components.json` lives in this package). Layout: `components/` for shadcn primitives, `layouts/` for shells, `blocks/` for GhostAPI-specific composed UI (endpoint sidebar, request builder, log viewer, etc.), `lib/utils.ts` for `cn`, `styles/globals.css` for theme tokens. **Theme tokens, colors, spacing, and typography live ONLY here** — apps/web's `globals.css` just `@import`s this file. Add primitives via `cd packages/ui && pnpm dlx shadcn@latest add <name>` — but expect to customize the generated file to match the GhostAPI variants (e.g. Button uses `primary | secondary | tertiary | destructive`, not the shadcn defaults). Storybook lives in `.storybook/` here; stories colocate with components as `<name>.stories.tsx`. Run with `pnpm --filter @ghostapi/ui storybook`.
- `packages/config` — Zod env validation, tsconfig, runtime configs. Startup must fail loudly on invalid env.

## Product Surface — Unified API Workspace

The API Workspace is the heart of the product. It deliberately merges endpoint browsing, request building, response viewing, and mock behavior configuration into one screen. **Do not split these into separate dashboard pages, separate endpoint editors, or a disconnected playground** — that splits the `Request → Response` mental model the product is built around.

## Stack (planned)

Public frontend (`apps/web`): Next.js App Router, TypeScript, Tailwind, shadcn/ui (consumed from `@ghostapi/ui`).

Protected frontend (`apps/app`): React 19, Vite 6, TypeScript, Tailwind v4, shadcn/ui (consumed from `@ghostapi/ui`), React Router v7 data router, TanStack Query (server state), Zustand (UI/editor/builder state — do not mix the two), React Hook Form, Monaco Editor (when the request body editor lands). The SPA exists in addition to the Next site so it can be packaged into Electron later.

Backend: Hono, TypeScript, Zod, Prisma, Pino (structured logs only — no `console.log`).

Infra: PostgreSQL (in Docker from day one — no local installs, no cloud DBs for dev), Redis (added in Phase 1 even though uses are minimal, to avoid migration pain later), Docker Compose, Turborepo, pnpm.

## Planned Commands

Per `README.md` and `docs/SETUP.md`. None of these work yet — they're the contract for scaffolding.

```bash
pnpm install                                  # install workspace deps
docker compose up -d                          # start postgres + redis
cd apps/server && pnpm prisma migrate dev     # run migrations
pnpm dev                                      # turbo dev across apps (web :3000, app :3002, server :3001)

# Single-app dev:
pnpm --filter @ghostapi/app dev               # Vite dev server for the protected SPA
pnpm --filter @ghostapi/web dev               # Next.js dev server for the public site
pnpm --filter @ghostapi/server dev            # Hono backend
```

`turbo.json` defines `build`, `dev` (uncached), `lint`, `test`, `build-storybook`, and `storybook` (uncached, persistent). Pre-commit (Husky + lint-staged) and CI must run lint, typecheck, tests, and build. Storybook is run on demand: `pnpm --filter @ghostapi/ui storybook` for local review, `pnpm --filter @ghostapi/ui build-storybook` to produce a static bundle.

## Conventions

- TypeScript `"strict": true` everywhere. Avoid `any`. Prefer Zod-validated DTOs at boundaries.
- Prisma is **persistence only** — no business logic in models. Columns are `snake_case`. Every table has `created_at` / `updated_at`. **UUIDs only**, never incrementing IDs.
- Env vars validated via Zod in `packages/config/env.ts`. Never read `process.env` directly elsewhere. The package exposes three loaders: `loadServerEnv` (Hono backend), `loadPublicEnv` (Next public site, `NEXT_PUBLIC_*`), `loadVitePublicEnv` (React SPA, `VITE_*`).
- Uploaded OpenAPI schemas must be validated, sanitized, and parsed safely. **Never `eval` uploaded schemas or execute uploaded JavaScript.**
- Design language: dark-first, terminal-inspired, sharp spacing, monospace where it earns its place. Avoid SaaS-style cards, gradients, marketing-dashboard layouts.
- Test priorities: parser engine, mock generation determinism, runtime endpoint serving (Vitest).

## Docs to Read First

- `docs/SYNOPSIS.md` — product scope, phases, database tables, what's explicitly out of scope.
- `docs/SETUP.md` — repo structure, stack rationale, engineering rules, scaffolding steps.
