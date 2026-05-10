# GhostAPI

![GhostAPI banner](assets/banner.png)

Turn OpenAPI schemas into interactive mock API workspaces in seconds.

GhostAPI is a developer-first platform for generating realistic mock REST APIs from OpenAPI schemas. Create a project, import your schema, and instantly get a fully interactive API workspace with request testing, response simulation, request logs, environments, mock behavior controls, and realistic fake data generation.

Built for:
- frontend developers
- UI engineers
- indie hackers
- integration testing
- product demos
- backend-independent development

---

# Why GhostAPI?

Frontend development constantly gets blocked by:
- unfinished backends
- unstable APIs
- changing contracts
- missing environments
- fake JSON files
- unrealistic mocks

Most existing solutions either:
- feel bloated
- require too much setup
- look outdated
- separate testing from configuration
- become difficult to maintain

GhostAPI fixes this by turning your OpenAPI schema into a complete API simulation workspace instantly.

You can:
- explore endpoints
- send requests
- inspect responses
- simulate failures
- configure auth
- test loading states
- inspect logs
- manage environments

without writing backend code.

---

# Core Workflow

```txt
Create Project
↓
Upload OpenAPI Schema
↓
Generate API Workspace
↓
Test APIs Instantly
```

---

# Features

# Unified API Workspace

GhostAPI combines:
- endpoint browsing
- request building
- response inspection
- mock configuration

into a single workspace.

No separate endpoint editor.
No disconnected playground.
No unnecessary dashboard hopping.

Everything happens in one flow:

```txt
Request → Response
```

---

# OpenAPI Import

Supports:
- `.json`
- `.yaml`

OpenAPI 3.x schemas.

GhostAPI automatically:
- validates schemas
- extracts endpoints
- groups routes
- generates mock behavior
- creates realistic responses

---

# Endpoint Explorer

Endpoints are automatically grouped by tags and categories.

Example:

```txt
Authentication
  POST /users/login
  POST /users/signup

Products
  GET /products
  POST /products

Orders
  GET /orders
  POST /orders
```

---

# Request Playground

Test requests directly inside the API Workspace.

Supports:
- headers
- query params
- auth
- request body
- environments
- JSON editing

Inspired by tools like:
- Scalar
- Postman
- Insomnia

but intentionally more focused and minimal.

---

# Realistic Mock Data

GhostAPI generates believable responses automatically.

Examples:
- real names
- emails
- avatars
- UUIDs
- prices
- nested objects
- arrays

Example:

```json
{
  "id": "usr_91b2",
  "name": "Sarah Johnson",
  "email": "sarah@example.com"
}
```

---

# Mock Behavior Controls

Configure API behavior globally or per endpoint.

Supports:
- latency simulation
- error rates
- auth simulation
- response modes
- pagination behavior
- cache behavior

Example:

```txt
Latency: 1200ms
Error Chance: 15%
Auth: Required
```

---

# Environment Management

Manage multiple environments:
- development
- staging
- production
- local
- QA

Each environment supports:
- base URLs
- variables
- headers
- auth settings
- CORS configuration

---

# Request Logs

Inspect incoming requests in real time.

Supports:
- request history
- response inspection
- headers
- timing
- status codes
- request metadata

The logs experience is designed to feel:
- operational
- technical
- low-noise

instead of analytics-heavy.

---

# Schema Management

Manage schemas directly inside projects.

Supports:
- schema replacement
- version history
- validation
- schema metadata
- server definitions

---

# Project Management

Projects contain:
- schemas
- environments
- logs
- mock behavior
- members
- API workspaces

Projects exist independently from schemas.

Schemas are attached to projects.

---

# Tech Stack

# Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- Monaco Editor

---

# Backend

- Hono
- TypeScript
- Zod
- Prisma

---

# Infrastructure

- PostgreSQL
- Redis
- Docker
- Turborepo

---

# Architecture

```txt
OpenAPI Upload
↓
Parser Engine
↓
Normalized Endpoint Model
↓
Mock Generator
↓
Runtime Server
↓
API Workspace
```

---

# Repository Structure

```txt
apps/
  web/        → Next.js frontend
  server/     → Hono backend

packages/
  parser/     → OpenAPI parser
  runtime/    → dynamic runtime engine
  mock-engine/→ fake data generation
  types/      → shared types
  ui/         → shared UI components
  config/     → shared config
```

---

# Getting Started

# Requirements

- Node.js 20+
- pnpm
- Docker

---

# Clone Repository

```bash
git clone https://github.com/yourname/ghostapi.git

cd ghostapi
```

---

# Install Dependencies

```bash
pnpm install
```

---

# Setup Environment

Create:

```txt
.env
```

Example:

```env
DATABASE_URL=postgresql://ghostapi:ghostapi@localhost:5432/ghostapi
REDIS_URL=redis://localhost:6379

NEXT_PUBLIC_API_URL=http://localhost:3000

JWT_SECRET=super-secret
```

---

# Start Infrastructure

```bash
docker compose up -d
```

---

# Run Database Migrations

```bash
cd apps/server

pnpm prisma migrate dev
```

---

# Start Development

```bash
pnpm dev
```

---

# Design Philosophy

GhostAPI is intentionally designed to feel:
- technical
- focused
- operational
- infrastructure-grade

The product avoids:
- bloated SaaS dashboards
- analytics spam
- excessive cards
- cluttered layouts
- over-designed marketing UI

The UI language is inspired by:
- terminal environments
- developer tools
- infrastructure software
- API explorers

---

# Development Philosophy

GhostAPI prioritizes:
- clean architecture
- strict typing
- isolated packages
- contributor friendliness
- long-term maintainability

This is not meant to become:
- a generic API management platform
- a corporate monitoring suite
- an enterprise analytics dashboard

The focus remains:
> fast API simulation for frontend developers.

---

# Roadmap

# Phase 1

- OpenAPI support
- REST mock APIs
- unified API workspace
- environments
- request logs
- mock behavior controls
- schema management

---

# Phase 2

- GraphQL support
- persistent mock states
- advanced schema handling
- realtime request streaming

---

# Phase 3

- tRPC support
- AI-assisted edge cases
- snapshot testing
- contract testing
- collaboration

---

# Security

GhostAPI never executes uploaded schemas as code.

Uploaded files are:
- validated
- sanitized
- parsed safely

before processing.

---

# Contributing

Contributions are welcome.

Before opening a PR:
- run tests
- follow lint rules
- keep types strict
- avoid unnecessary abstractions
- avoid introducing `any`

---

# Vision

GhostAPI aims to become:
> the fastest way to simulate APIs during frontend development.

No fake JSON files.
No waiting on backend teams.
No boilerplate mock servers.

Just:

```txt
Create project
↓
Import schema
↓
Start building
```

---

# License

MIT License.
