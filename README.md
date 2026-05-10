# GhostAPI

![GhostAPI banner](assets/banner.png)

Turn OpenAPI schemas into working mock backends in seconds.

GhostAPI helps frontend developers keep building even when the backend is not ready yet. Upload an OpenAPI schema and instantly get a working mock REST API with realistic data, configurable responses, latency simulation, auth handling, and a built in API playground.

Built for:

-   frontend developers
-   UI engineers
-   indie hackers
-   product demos
-   integration testing
-   backend independent development

----------

# Why GhostAPI?

Most frontend work gets blocked because:

-   the backend is incomplete
-   endpoints keep changing
-   the API is unstable
-   there is no mock environment
-   fake JSON files become impossible to maintain

GhostAPI fixes that.

Instead of manually writing mock endpoints or maintaining huge fake datasets, you upload your OpenAPI file and GhostAPI creates a working backend for you instantly.

You can then:

-   test your frontend
-   simulate failures
-   test loading states
-   share mock APIs with teammates
-   demo products before the real backend exists

----------

# Features

## OpenAPI Import

Supports:

-   `.json`
-   `.yaml`

OpenAPI 3.x specifications.

----------

## Instant Mock API Generation

Generate working REST endpoints immediately.

Example:

```
GET /usersPOST /auth/loginGET /products/:id
```

----------

## Realistic Mock Data

GhostAPI generates believable responses automatically.

Examples:

-   real looking names
-   valid emails
-   avatars
-   UUIDs
-   prices
-   nested objects
-   arrays

----------

## Editable Responses

Every generated response can be edited directly from the dashboard.

You are not locked into generated data.

----------

## Latency Simulation

Test slow API behavior easily.

Examples:

```
200ms1200ms5000ms
```

Useful for:

-   loading states
-   skeleton UIs
-   optimistic updates

----------

## Auth Simulation

Protect endpoints with simple bearer token auth.

Useful for:

-   protected pages
-   auth flows
-   permission handling

----------

## Error Simulation

Force endpoints to randomly return:

-   400
-   401
-   403
-   429
-   500

Useful for testing frontend edge cases properly.

----------

## Built in Playground

Test endpoints directly inside the app without opening another tool.

----------

## Request Logs

Inspect incoming requests and responses in realtime.

----------

# Example Workflow

## 1. Upload OpenAPI Schema

```
paths:  /users:    get:      responses:        "200":          description: User list
```

----------

## 2. GhostAPI Generates

```
GET /users
```

----------

## 3. Call Mock Endpoint

```
curl https://ghostapi.dev/mock/demo/users
```

----------

## 4. Receive Realistic Response

```
[  {    "id": "usr_1",    "name": "Sarah Johnson",    "email": "sarah@example.com"  }]
```

----------

# Tech Stack

## Frontend

-   Next.js
-   TypeScript
-   Tailwind
-   shadcn/ui
-   Zustand
-   TanStack Query
-   Monaco Editor

----------

## Backend

-   Hono
-   TypeScript
-   Zod
-   Prisma

----------

## Infrastructure

-   PostgreSQL
-   Redis
-   Docker
-   Turborepo

----------

# Architecture

```
OpenAPI Upload       ↓Parser Engine       ↓Normalized Endpoint Model       ↓Mock Generator       ↓Dynamic Runtime Server       ↓Dashboard + Playground
```

----------

# Repository Structure

```
apps/  web/        → Next.js frontend  server/     → Hono backendpackages/  parser/     → OpenAPI parser  runtime/    → dynamic endpoint runtime  mock-engine/→ fake response generation  types/      → shared types  ui/         → shared UI components
```

----------

# Getting Started

# Requirements

-   Node.js 20+
-   pnpm
-   Docker

----------

# Installation

## Clone Repository

```
git clone https://github.com/yourname/ghostapi.gitcd ghostapi
```

----------

## Install Dependencies

```
pnpm install
```

----------

## Setup Environment

Create:

```
.env
```

Example:

```
DATABASE_URL=postgresql://ghostapi:ghostapi@localhost:5432/ghostapiREDIS_URL=redis://localhost:6379NEXT_PUBLIC_API_URL=http://localhost:3001JWT_SECRET=super-secret
```

----------

## Start Infrastructure

```
docker compose up -d
```

----------

## Run Database Migrations

```
cd apps/serverpnpm prisma migrate dev
```

----------

## Start Development

```
pnpm dev
```

----------

# Development Philosophy

GhostAPI is meant to feel like a real developer tool from the start.

The project focuses on:

-   clean architecture
-   strict typing
-   isolated packages
-   long term maintainability
-   contributor friendliness

This is not meant to become another bloated API platform.

The goal is simple:

> upload schema → get working backend

----------

# Roadmap

## Phase 1

-   OpenAPI support
-   REST mock generation
-   editable responses
-   latency simulation
-   auth simulation
-   playground

----------

## Phase 2

-   GraphQL support
-   persistent mock states
-   advanced schema handling
-   realtime request streams

----------

## Phase 3

-   tRPC support
-   AI generated edge cases
-   contract testing
-   snapshot testing
-   collaboration

----------

# Security

GhostAPI never executes uploaded schemas as code.

Uploaded files are:

-   validated
-   sanitized
-   parsed safely

before processing.

----------

# Contributing

Contributions are welcome.

Before opening a PR:

-   run tests
-   follow lint rules
-   keep types strict
-   avoid unnecessary abstractions
-   avoid introducing `any`

----------

# Vision

GhostAPI aims to become the easiest way to simulate APIs for frontend development.

No fake JSON files.  
No waiting on backend teams.  
No boilerplate mock servers.

Just upload your schema and start building.

----------

# License

MIT License.