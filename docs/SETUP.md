
# GhostAPI — Updated Project Setup & Foundation Document

## Foundation Architecture

This document defines:

-   repository structure
-   application architecture
-   tooling
-   infrastructure
-   setup commands
-   engineering conventions
-   scalability rules
-   development standards

The purpose is:

> create a production-grade developer tool from day one.

GhostAPI should feel:

-   modern
-   focused
-   infrastructure-grade
-   contributor-friendly
-   open-source worthy
-   technically clean

NOT:

-   hackathon quality
-   SaaS template sludge
-   over-engineered enterprise software
-   AI-generated chaos

----------

# Core Philosophy

GhostAPI optimizes for:

-   developer workflows
-   speed
-   low-friction UX
-   architectural clarity
-   future extensibility

The product should feel:

> like a serious developer tool made by developers.

----------

# Primary Engineering Principles

# 1. Unified API Workspace

The API Workspace is the heart of the application.

GhostAPI intentionally merges:

-   endpoint browsing
-   request building
-   response inspection
-   mock behavior configuration

into a single experience.

DO NOT split these into:

-   multiple dashboard pages
-   separate endpoint editors
-   disconnected playgrounds

The product workflow should remain:

```
Request → Response
```

as much as possible.

----------

# 2. Internal Normalized Endpoint Model

This is the most important architectural decision in the entire system.

OpenAPI schemas must first become:

```
NormalizedEndpoint
```

Everything after that relies ONLY on the normalized model:

-   API workspace
-   runtime server
-   request generation
-   logs
-   environments
-   future protocol support

Frontend and runtime systems must NEVER directly depend on raw OpenAPI structures.

This abstraction layer is what later enables:

-   GraphQL
-   tRPC
-   gRPC
-   AI-assisted generation

without rewriting the application.

----------

# 3. Developer Experience

The repository itself should impress developers.

A contributor should be able to:

```
docker compose up
```

and start developing immediately.

Setup should feel:

-   clean
-   predictable
-   modern
-   low-friction

----------

# 4. Scalability

The architecture should comfortably support:

-   thousands of endpoints
-   multiple environments
-   multiple projects
-   future protocol support
-   future collaboration features

without major rewrites.

----------

# Recommended Stack

# Frontend

-   Next.js App Router
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Zustand
-   TanStack Query
-   React Hook Form
-   Monaco Editor

----------

# Backend

-   Hono
-   TypeScript
-   Zod
-   Prisma

----------

# Infrastructure

-   PostgreSQL
-   Redis
-   Docker
-   Docker Compose

----------

# Tooling

-   Turborepo
-   pnpm
-   ESLint
-   Prettier
-   Husky
-   lint-staged
-   Commitlint
-   Vitest

----------

# Why Turborepo?

GhostAPI is intentionally designed as:

## a scalable monorepo.

We want:

-   isolated packages
-   reusable runtime modules
-   shared parser engine
-   future CLI package
-   future SDK support

This structure prevents:

-   circular dependencies
-   giant application folders
-   tightly coupled logic

----------

# Repository Structure

```
ghostapi/
├ apps/
│  ├ web/
│  └ server/
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

----------

# Architecture Breakdown

# apps/web

Next.js frontend application.

Contains:

-   authentication pages
-   projects
-   API workspace
-   logs
-   settings
-   environments
-   schema management

The frontend must remain:

-   thin
-   state-driven
-   API-first

DO NOT place:

-   parser logic
-   runtime logic
-   OpenAPI transformation logic

inside the frontend.

----------

# apps/server

Hono backend application.

Responsible for:

-   API routes
-   authentication
-   database access
-   runtime orchestration
-   schema ingestion
-   mock server coordination

NO frontend rendering.

----------

# packages/parser

Dedicated OpenAPI parsing engine.

Responsibilities:

-   schema validation
-   endpoint extraction
-   normalization
-   schema traversal

Future support:

-   GraphQL parser
-   tRPC parser

must plug into the same normalized interface.

----------

# packages/runtime

Dynamic mock runtime engine.

Responsible for:

-   endpoint serving
-   route mounting
-   latency simulation
-   auth simulation
-   error simulation

This becomes one of the most important packages in the entire project.

----------

# packages/mock-engine

Responsible for:

-   fake data generation
-   schema-aware response generation
-   faker heuristics
-   deterministic generation
-   nested object generation

Must remain isolated from runtime logic.

----------

# packages/types

Shared types only.

Contains:

-   DTOs
-   schemas
-   enums
-   normalized endpoint types

Avoid duplicated types across applications.

----------

# packages/ui

Reusable UI system.

Contains:

-   layouts
-   panels
-   tables
-   sidebar components
-   request/response UI primitives

The UI package should establish:

-   spacing rhythm
-   typography
-   visual consistency

----------

# packages/config

Shared configuration:

-   env validation
-   tsconfig
-   constants
-   runtime configs

----------

# Initial Setup

# 1. Create Repository

```
mkdir ghostapi
cd ghostapi
git init
```

----------

# 2. Initialize pnpm

```
pnpm init
```

----------

# 3. Install Turborepo

```
pnpm add -D turbo
```

----------

# 4. Create Workspace

Create:

```
pnpm-workspace.yaml
```

Content:

```
packages:
  - apps/*
  - packages/*
```

----------

# 5. Create Turbo Config

Create:

```
turbo.json
```

Content:

```
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

----------

# 6. Create Applications

```
mkdir -p apps/webmkdir -p apps/server
```

----------

# 7. Setup Next.js

```
cd apps/webpnpm create next-app . --ts --tailwind --app
```

IMPORTANT:

-   use App Router
-   use TypeScript
-   DO NOT use `/src`

----------

# 8. Setup Hono Backend

```
cd ../server

pnpm init

pnpm add hono zod prisma @prisma/client pino
pnpm add -D typescript tsx @types/node
```

----------

# 9. Create Shared Packages

```
mkdir -p packages/parser
mkdir -p packages/runtime
mkdir -p packages/mock-engine
mkdir -p packages/ui
mkdir -p packages/types
mkdir -p packages/config
mkdir -p packages/eslint-config
```

----------

# Database Setup

# PostgreSQL

PostgreSQL must run inside Docker from day one.

DO NOT:

-   require local Postgres installs
-   rely on cloud databases for local development

----------

# docker-compose.yml

```
version: "3.9"

services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    ports:
      - "5432:5432"
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
      - "6379:6379"

volumes:
  postgres_data:
```

----------

# Why Redis Exists Already

Even in Phase 1 Redis is useful for:

-   request caching
-   runtime coordination
-   rate limiting
-   environment state
-   future realtime support
-   future queues

Adding it now avoids future infrastructure migration pain.

----------

# Prisma Setup

Inside:

```
apps/server
```

Run:

```
pnpm prisma init
```

----------

# Prisma Rules

# NEVER

Place business logic inside Prisma models.

Prisma is:

> persistence only.

----------

# ALWAYS

Use:

```
snake_case
```

for database columns.

----------

# ALWAYS INCLUDE

```
created_at
updated_at
```

timestamps.

----------

# ALWAYS USE

UUIDs.

Never incremental IDs.

----------

# Environment Variables

Create:

```
.env.example
```

Must contain:

```
DATABASE_URL=
REDIS_URL=

NEXT_PUBLIC_API_URL=

JWT_SECRET=
```

----------

# Environment Validation

Use:

## Zod

Create:

```
packages/config/env.ts
```

Application startup must fail loudly if env values are invalid or missing.

Never trust env blindly.

----------

# TypeScript Standards

# MUST ENABLE

```
"strict": true
```

No exceptions.

----------

# NEVER USE

```
any
```

unless absolutely unavoidable.

----------

# ALWAYS PREFER

-   explicit types
-   DTO schemas
-   Zod validation
-   typed API responses

----------

# Logging

Use:

## Pino

DO NOT:

-   spam console.log
-   log random strings

Use structured logs only.

----------

# Frontend Design Philosophy

GhostAPI should feel:

-   technical
-   sharp
-   operational
-   minimal
-   terminal-inspired

NOT:

-   bubbly SaaS
-   analytics-heavy
-   marketing-dashboard-like

----------

# Design Rules

# MUST

-   use monospace strategically
-   use sharp spacing
-   use minimal colors
-   use dark-first design
-   use structured layouts
-   prioritize readability

----------

# MUST NOT

-   overuse cards
-   use giant gradients
-   use excessive animations
-   use generic SaaS layouts
-   create cluttered dashboards

----------

# State Management

# Use Zustand For

-   UI state
-   request builder state
-   editor state
-   temporary workspace state

----------

# Use TanStack Query For

-   server state
-   endpoint fetching
-   request logs
-   mutations
-   schema fetching

DO NOT mix responsibilities.

----------

# Testing

Install:

```
pnpm add -D vitest
```

----------

# Critical Areas To Test

# Parser Engine

Parser tests are mandatory.

----------

# Mock Generation

Generated data must remain predictable and valid.

----------

# Runtime Server

Dynamic endpoint serving must be tested thoroughly.

----------

# GitHub Optimization

GhostAPI is intentionally designed as:

> a GitHub-visible developer tool.

Presentation matters massively.

----------

# README Requirements

# MUST INCLUDE

## Hero Section

Clear one-line value proposition.

Example:

```
Turn OpenAPI into a working mock backend in seconds.
```

----------

## GIF Demo

Required.

GitHub stars depend heavily on:

-   immediate understanding
-   visual clarity

----------

## One-command Setup

```
docker compose up
```

----------

## Architecture Diagram

Developers love infrastructure clarity.

----------

# Git Hooks

Install:

```
pnpm add -D husky lint-staged
```

----------

# Pre-commit Checks

Must run:

-   lint
-   typecheck
-   tests

before commit.

----------

# CI/CD

Use:

```
.github/workflows
```

----------

# CI Must Run

On every PR:

-   lint
-   typecheck
-   tests
-   build

----------

# Security Rules

# NEVER

-   eval uploaded schemas
-   execute uploaded JavaScript
-   trust request payloads blindly

----------

# Uploaded OpenAPI Schemas Must

-   validate safely
-   sanitize safely
-   parse safely

before processing.

----------

# Final Engineering Philosophy

GhostAPI should feel:

-   infrastructure-grade
-   operational
-   contributor-friendly
-   technically mature

The repository itself should communicate:

> “serious engineering and intentional design.”
