# GhostAPI — Updated Project Setup & Foundation Document

## Foundation Architecture

This document defines:

- repository structure
- frontend architecture
- backend architecture
- tooling
- infrastructure
- setup commands
- engineering conventions
- scalability rules
- development standards

The purpose is:

> create a production-grade developer tool from day one.

GhostAPI should feel:

- modern
- focused
- infrastructure-grade
- contributor-friendly
- open-source worthy
- technically clean

NOT:

- hackathon quality
- SaaS template sludge
- over-engineered enterprise software
- AI-generated chaos

---

# Core Philosophy

GhostAPI optimizes for:

- developer workflows
- speed
- low-friction UX
- architectural clarity
- future extensibility

The product should feel:

> like a serious developer tool made by developers.

---

# Primary Engineering Principles

# 1. Unified API Workspace

The API Workspace is the heart of the application.

GhostAPI intentionally merges:

- endpoint browsing
- request building
- response inspection
- mock behavior configuration

into a single experience.

DO NOT split these into:

- multiple dashboard pages
- separate endpoint editors
- disconnected playgrounds

The product workflow should remain:

```txt id="jlwmp1"
Request → Response
```

as much as possible.

---

# 2. Internal Normalized Endpoint Model

This is the most important architectural decision in the entire system.

OpenAPI schemas must first become:

```txt id="jlwmp2"
NormalizedEndpoint
```

Everything after that relies ONLY on the normalized model:

- API workspace
- runtime server
- request generation
- logs
- environments
- future protocol support

Frontend and runtime systems must NEVER directly depend on raw OpenAPI structures.

This abstraction layer is what later enables:

- GraphQL
- tRPC
- gRPC
- AI-assisted generation

without rewriting the application.

---

# 3. Developer Experience

The repository itself should impress developers.

A contributor should be able to run:

```bash id="jlwmp3"
docker compose up
```

and start developing immediately.

Setup should feel:

- clean
- predictable
- modern
- low-friction

---

# 4. Scalability

The architecture should comfortably support:

- thousands of endpoints
- multiple environments
- multiple projects
- future protocol support
- future collaboration features

without major rewrites.

---

# Frontend Architecture

GhostAPI intentionally uses:

## two separate frontend applications.

This is a deliberate architectural decision.

---

# Public Frontend — Next.js

The Next.js frontend handles:

- landing page
- docs
- about
- blog
- changelog
- marketing pages
- SEO-sensitive public routes

Purpose:

- SEO
- discoverability
- server-side rendering
- metadata optimization
- public indexing

The Next.js application is NOT responsible for:

- protected dashboard pages
- API workspace
- application runtime flows

---

# Protected Frontend — React SPA

The React frontend handles:

- login
- register
- projects
- API workspace
- logs
- settings
- environments
- all authenticated flows

Purpose:

- fast application runtime
- Electron compatibility
- long-running application state
- desktop packaging

This separation exists because:

> GhostAPI is planned to ship as an Electron desktop application later.

Trying to package the entire authenticated experience inside a full Next.js dashboard would create unnecessary complexity for Electron packaging and runtime behavior.

The React SPA keeps:

- desktop runtime
- Electron integration
- application state
- local runtime coordination

significantly cleaner.

---

# Recommended Stack

# Public Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui

---

# Protected Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- React Hook Form
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
- Docker Compose

---

# Tooling

- Turborepo
- pnpm
- ESLint
- Prettier
- Husky
- lint-staged
- Commitlint
- Vitest

---

# Why Turborepo?

GhostAPI is intentionally designed as:

## a scalable monorepo.

We want:

- isolated packages
- reusable runtime modules
- shared parser engine
- shared UI package
- future CLI package
- future SDK support

This structure prevents:

- circular dependencies
- giant application folders
- tightly coupled logic

---

# Repository Structure

```txt id="jlwmp4"
ghostapi/
├ apps/
│  ├ web/          → Next.js public frontend
│  ├ app/          → React protected frontend
│  └ server/       → Hono backend
│
├ packages/
│  ├ parser/
│  ├ runtime/
│  ├ mock-engine/
│  ├ ui/
│  ├ types/
│  ├ config/
│  └ eslint-config/
│
├ docker/
├ scripts/
├ .github/
│
├ turbo.json
├ pnpm-workspace.yaml
├ package.json
└ docker-compose.yml
```

---

# Architecture Breakdown

# apps/web

Next.js public-facing frontend.

Contains:

- landing page
- docs
- about
- marketing pages
- public documentation

The purpose of this application is:

- SEO
- indexing
- discoverability
- public branding

DO NOT place:

- API workspace logic
- authenticated dashboard logic
- runtime state management

inside this application.

---

# apps/app

Protected React SPA application.

Contains:

- authentication
- projects
- API workspace
- logs
- settings
- environments
- schema management

This application is optimized for:

- speed
- interactivity
- Electron compatibility
- desktop runtime behavior

The protected app should remain:

- thin
- API-first
- state-driven

DO NOT place:

- parser logic
- runtime logic
- OpenAPI transformation logic

inside the frontend.

---

# apps/server

Hono backend application.

Responsible for:

- API routes
- authentication
- database access
- runtime orchestration
- schema ingestion
- mock server coordination

NO frontend rendering.

---

# packages/parser

Dedicated OpenAPI parsing engine.

Responsibilities:

- schema validation
- endpoint extraction
- normalization
- schema traversal

Future support:

- GraphQL parser
- tRPC parser

must plug into the same normalized interface.

---

# packages/runtime

Dynamic mock runtime engine.

Responsible for:

- endpoint serving
- route mounting
- latency simulation
- auth simulation
- error simulation

This becomes one of the most important packages in the project.

---

# packages/mock-engine

Responsible for:

- fake data generation
- schema-aware response generation
- faker heuristics
- deterministic generation
- nested object generation

Must remain isolated from runtime logic.

---

# packages/types

Shared types only.

Contains:

- DTOs
- schemas
- enums
- normalized endpoint types

Avoid duplicated types across applications.

---

# packages/ui

Shared design system package.

Contains:

- shadcn/ui primitives
- layouts
- panels
- tables
- sidebar components
- request/response UI primitives
- GhostAPI-specific components

This package establishes:

- spacing rhythm
- typography
- visual consistency
- theme tokens
- design language

The UI package should be shared across:

- Next.js frontend
- React application
- future Electron client

---

# packages/config

Shared configuration:

- env validation
- tsconfig
- constants
- runtime configs

---

# Initial Setup

# 1. Create Repository

```bash id="jlwmp5"
mkdir ghostapi

cd ghostapi

git init
```

---

# 2. Initialize pnpm

```bash id="jlwmp6"
pnpm init
```

---

# 3. Install Turborepo

```bash id="jlwmp7"
pnpm add -D turbo
```

---

# 4. Create Workspace

Create:

```txt id="jlwmp8"
pnpm-workspace.yaml
```

Content:

```yaml id="jlwmp9"
packages:
  - apps/*
  - packages/*
```

---

# 5. Create Turbo Config

Create:

```txt id="jlwmp10"
turbo.json
```

Content:

```json id="jlwmp11"
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {},
    "test": {}
  }
}
```

---

# 6. Create Applications

```bash id="jlwmp12"
mkdir -p apps/web
mkdir -p apps/app
mkdir -p apps/server
```

---

# 7. Setup Next.js Public Frontend

```bash id="jlwmp13"
cd apps/web

pnpm create next-app . --ts --tailwind --app
```

IMPORTANT:

- use App Router
- use TypeScript
- DO NOT use `/src`

---

# 8. Setup React Protected Frontend

```bash id="jlwmp14"
cd ../app

pnpm create vite . --template react-ts
```

Install dependencies:

```bash id="jlwmp15"
pnpm add react-router-dom zustand @tanstack/react-query react-hook-form
```

---

# 9. Setup Hono Backend

```bash id="jlwmp16"
cd ../server

pnpm init

pnpm add hono zod prisma @prisma/client pino
pnpm add -D typescript tsx @types/node
```

---

# 10. Create Shared Packages

```bash id="jlwmp17"
mkdir -p packages/parser
mkdir -p packages/runtime
mkdir -p packages/mock-engine
mkdir -p packages/ui
mkdir -p packages/types
mkdir -p packages/config
mkdir -p packages/eslint-config
```

---

# Database Setup

# PostgreSQL

PostgreSQL must run inside Docker from day one.

DO NOT:

- require local Postgres installs
- rely on cloud databases for local development

---

# docker-compose.yml

```yaml id="jlwmp18"
version: '3.9'

services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: ghostapi
      POSTGRES_PASSWORD: ghostapi
      POSTGRES_DB: ghostapi
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    restart: unless-stopped
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

---

# Why Redis Exists Already

Even in Phase 1 Redis is useful for:

- request caching
- runtime coordination
- rate limiting
- environment state
- future realtime support
- future queues

Adding it now avoids future infrastructure migration pain.

---

# Prisma Setup

Inside:

```txt id="jlwmp19"
apps/server
```

Run:

```bash id="jlwmp20"
pnpm prisma init
```

---

# Prisma Rules

# NEVER

Place business logic inside Prisma models.

Prisma is:

> persistence only.

---

# ALWAYS

Use:

```txt id="jlwmp21"
snake_case
```

for database columns.

---

# ALWAYS INCLUDE

```txt id="jlwmp22"
created_at
updated_at
```

timestamps.

---

# ALWAYS USE

UUIDs.

Never incremental IDs.

---

# Environment Variables

Create:

```txt id="jlwmp23"
.env.example
```

Must contain:

```env id="jlwmp24"
DATABASE_URL=
REDIS_URL=

NEXT_PUBLIC_API_URL=

JWT_SECRET=
```

---

# Environment Validation

Use:

## Zod

Create:

```txt id="jlwmp25"
packages/config/env.ts
```

Application startup must fail loudly if env values are invalid or missing.

Never trust env blindly.

---

# TypeScript Standards

# MUST ENABLE

```json id="jlwmp26"
"strict": true
```

No exceptions.

---

# NEVER USE

```txt id="jlwmp27"
any
```

unless absolutely unavoidable.

---

# ALWAYS PREFER

- explicit types
- DTO schemas
- Zod validation
- typed API responses

---

# Logging

Use:

## Pino

DO NOT:

- spam console.log
- log random strings

Use structured logs only.

---

# Frontend Design Philosophy

GhostAPI should feel:

- technical
- sharp
- operational
- minimal
- terminal-inspired

NOT:

- bubbly SaaS
- analytics-heavy
- marketing-dashboard-like

---

# Design Rules

# MUST

- use monospace strategically
- use sharp spacing
- use minimal colors
- use dark-first design
- use structured layouts
- prioritize readability

---

# MUST NOT

- overuse cards
- use giant gradients
- use excessive animations
- use generic SaaS layouts
- create cluttered dashboards

---

# State Management

# Use Zustand For

- UI state
- request builder state
- editor state
- temporary workspace state

---

# Use TanStack Query For

- server state
- endpoint fetching
- request logs
- mutations
- schema fetching

DO NOT mix responsibilities.

---

# Testing

Install:

```bash id="jlwmp28"
pnpm add -D vitest
```

---

# Critical Areas To Test

# Parser Engine

Parser tests are mandatory.

---

# Mock Generation

Generated data must remain predictable and valid.

---

# Runtime Server

Dynamic endpoint serving must be tested thoroughly.

---

# GitHub Optimization

GhostAPI is intentionally designed as:

> a GitHub-visible developer tool.

Presentation matters massively.

---

# README Requirements

# MUST INCLUDE

## Hero Section

Clear one-line value proposition.

Example:

```txt id="jlwmp29"
Turn OpenAPI into a working mock backend in seconds.
```

---

## GIF Demo

Required.

GitHub stars depend heavily on:

- immediate understanding
- visual clarity

---

## One-command Setup

```bash id="jlwmp30"
docker compose up
```

---

## Architecture Diagram

Developers love infrastructure clarity.

---

# Git Hooks

Install:

```bash id="jlwmp31"
pnpm add -D husky lint-staged
```

---

# Pre-commit Checks

Must run:

- lint
- typecheck
- tests

before commit.

---

# CI/CD

Use:

```txt id="jlwmp32"
.github/workflows
```

---

# CI Must Run

On every PR:

- lint
- typecheck
- tests
- build

---

# Security Rules

# NEVER

- eval uploaded schemas
- execute uploaded JavaScript
- trust request payloads blindly

---

# Uploaded OpenAPI Schemas Must

- validate safely
- sanitize safely
- parse safely

before processing.

---

# Final Engineering Philosophy

GhostAPI should feel:

- infrastructure-grade
- operational
- contributor-friendly
- technically mature

The repository itself should communicate:

> “serious engineering and intentional design.”
