
# GhostAPI — Updated Phase 1 Product Synopsis

## Overview

GhostAPI is a developer-first platform for generating fully interactive mock REST APIs from OpenAPI schemas.

The product is designed to eliminate backend dependency during frontend development by allowing developers to instantly create realistic mock APIs, test requests, simulate failures, inspect logs, configure environments, and manage API behavior from a unified workspace.

GhostAPI is not intended to become:

-   a generic API management platform
-   a bloated enterprise dashboard
-   a Postman replacement
-   a monitoring platform

Instead, GhostAPI focuses on one core workflow:

```
Import OpenAPI↓Generate API Workspace↓Test & simulate APIs instantly
```

The entire product is optimized around:

-   frontend development
-   rapid prototyping
-   UI development
-   integration testing
-   demos
-   realistic API simulation

without waiting for backend completion.

----------

# Product Philosophy

GhostAPI should feel:

-   technical
-   operational
-   calm
-   focused
-   infrastructure-grade

NOT:

-   corporate SaaS
-   analytics-heavy
-   card-heavy
-   marketing-dashboard-like

The UI language should feel inspired by:

-   developer tools
-   terminal environments
-   API explorers
-   infrastructure dashboards

The product should prioritize:

-   clarity
-   speed
-   low-friction workflows
-   direct interaction

----------

# Core Product Flow

```
Authentication
↓
Projects
↓
Create Project
↓
Project Overview
↓
API Workspace
↓
Logs
↓
Settings
```

----------

# Scope

## Phase 1 Supports

-   OpenAPI 3.x
-   REST APIs
-   dynamic mock APIs
-   request playground
-   realistic fake data
-   response editing
-   request logging
-   environment management
-   schema management
-   mock behavior configuration

----------

## Phase 1 Does NOT Include

-   GraphQL
-   tRPC
-   AI generation
-   collaboration workspaces
-   billing
-   analytics platform
-   snapshot testing
-   realtime syncing
-   public API marketplace

----------

# Core Promise

A developer should be able to:

1.  Create project
2.  Upload OpenAPI schema
3.  Instantly generate mock API
4.  Explore endpoints
5.  Send requests
6.  Edit responses
7.  Simulate errors/auth/latency
8.  Inspect logs
9.  Share mock API URL

within:

> under 2 minutes.

----------

# Primary Product Areas

# 1. Projects

Projects are the top-level organizational unit.

A project contains:

-   environments
-   schemas
-   endpoints
-   logs
-   mock behavior
-   members
-   workspace configuration

Projects exist independently from schemas.

Schemas are attached to projects.

----------

# 2. API Workspace

## Core Product Area

The API Workspace is the heart of GhostAPI.

This replaces:

-   separate endpoint detail pages
-   separate playground pages

The API Workspace combines:

-   endpoint browsing
-   request building
-   response viewing
-   mock configuration
-   testing

into a single unified experience.

----------

## API Workspace Responsibilities

### Endpoint Navigation

Grouped endpoint explorer:

```
Authentication  POST /users/login  POST /users/signup
Products  GET /products  POST /products
```

----------

### Request Builder

Supports:

-   method selection
-   URL editing
-   query params
-   headers
-   auth
-   body editing

----------

### Response Viewer

Supports:

-   JSON response viewing
-   response headers
-   timing
-   status
-   cookies
-   response metadata

----------

### Inline Mock Controls

Mock behavior is configurable directly inside the workspace:

-   latency
-   auth
-   status code
-   error rate

This keeps:

```
Request → Response
```

as the core mental model.

----------

# 3. Request Logs

Logs provide operational visibility into mock API usage.

The logs page supports:

-   request history
-   filtering
-   request inspection
-   response inspection
-   headers
-   metadata
-   timing analysis

The logs experience should feel:

-   terminal-like
-   low-noise
-   operational

----------

# 4. Project Settings

Project settings are organized into structured tabs.

----------

## General

Project metadata:

-   name
-   description
-   slug
-   icon/logo

----------

## Environments

Environment management:

-   development
-   staging
-   production
-   local
-   QA

Each environment supports:

-   base URL
-   headers
-   auth
-   variables
-   CORS
-   environment-specific configuration

----------

## Mock Behavior

Global behavior rules:

-   latency defaults
-   error rates
-   auth defaults
-   faker behavior
-   cache behavior
-   response freshness
-   pagination defaults

----------

## Schema

Schema management:

-   current schema
-   schema metadata
-   schema validation
-   schema history
-   server definitions
-   replace schema

----------

## Members

Access control:

-   owner
-   admin
-   editor
-   viewer

----------

## Danger Zone

Destructive actions:

-   replace schema
-   clear logs
-   reset mock data
-   archive project
-   delete project

Danger Zone actions should feel:

-   serious
-   operational
-   explicit
-   irreversible

----------

# 5. Schema Engine

## Responsibility

Convert uploaded OpenAPI schemas into normalized internal models.

----------

## Supported Input

-   JSON
-   YAML
-   OpenAPI 3.x

----------

## Internal Endpoint Model

All product systems rely on a normalized internal endpoint model.

Everything depends on:

```
Normalized Endpoint Model
```

NOT directly on OpenAPI structure.

This abstraction powers:

-   API workspace
-   mock runtime
-   request generation
-   logs
-   environments
-   future protocol support

----------

# 6. Mock Data Generation

GhostAPI generates realistic mock data automatically.

----------

## Smart Field Mapping

Examples:

```
email → realistic email
name → human name
avatar → image URL
price → decimal
uuid → valid uuid
phone → formatted phone
```

----------

## Requirements

Generated responses must:

-   look believable
-   support arrays
-   support nesting
-   optionally support deterministic generation

----------

# 7. Runtime Mock Server

GhostAPI dynamically generates real mock APIs.

Generated endpoints must:

-   support path params
-   support query params
-   support auth
-   support editable responses
-   support latency simulation
-   support error simulation

----------

## Example

```
GET /users/:id
```

Config:

```
Latency: 1200ms
Auth: Enabled
Error Chance: 15%
```

----------

# 8. Shareable Mock APIs

Each project receives a public mock base URL:

```
https://ghostapi.dev/mock/project-id
```

Example:

```
GET /mock/project-id/users
```

----------

# Recommended Stack

# Frontend

-   Next.js App Router
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Zustand
-   TanStack Query
-   Monaco Editor
-   React Hook Form

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
-   Turborepo

----------

# Parsing & Validation

-   Swagger Parser
-   OpenAPI Types
-   Zod

----------

# Fake Data

-   Faker.js

----------

# Architecture

```
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

----------

# Database Design

# Core Tables

## Project

```
id
name
slug
description
icon
createdAt
```

----------

## Environment

```
id
project
Id
name
baseUrl
variables
headers
authConfig
```

----------

## Schema

```
id
projectId
version
content
metadata
uploadedAt
```

----------

## Endpoint

```
id
projectId
method
path
group
requestSchema
responseSchema
```

----------

## EndpointConfig

```
endpointId
latency
statusCode
authRequired
errorChance
```

----------

## EndpointResponse

```
endpointId
body
```

----------

## RequestLog

```
endpointId
method
status
duration
headers
body
createdAt
```

----------

# Design Direction

GhostAPI uses:

-   dark-first UI
-   low-noise layouts
-   sharp spacing
-   terminal-inspired visuals
-   minimal gradients
-   thin separators
-   structured hierarchy

The product should avoid:

-   excessive cards
-   giant analytics dashboards
-   marketing fluff
-   oversized charts
-   cluttered admin layouts

----------

# UI Philosophy

The product should feel:

> like a serious developer tool made by developers.

Not:

> another generic SaaS template.

----------

# Most Important Product Decision

## Unified API Workspace

The biggest architectural and UX decision is:

> combining endpoint browsing, request testing, response viewing, and mock configuration into one unified workspace.

This removes:

-   unnecessary navigation
-   context switching
-   duplicated pages

and creates a much cleaner developer workflow.

----------

# Development Phases

# Phase A — Foundation

-   monorepo setup
-   auth
-   Docker
-   Prisma
-   Hono backend
-   Next.js frontend

----------

# Phase B — Parser Engine

-   schema upload
-   validation
-   endpoint extraction
-   normalization

----------

# Phase C — Mock Generation

-   fake data generation
-   nested objects
-   arrays
-   persistence

----------

# Phase D — Runtime Server

-   dynamic route mounting
-   latency middleware
-   auth simulation
-   error simulation

----------

# Phase E — API Workspace

-   endpoint explorer
-   request builder
-   response viewer
-   inline mock controls

----------

# Phase F — Logs

-   request history
-   filters
-   request inspection
-   response inspection

----------

# Phase G — Settings

-   environments
-   schema management
-   mock behavior
-   permissions
-   danger zone

----------

# Biggest MVP Rule

DO NOT:

-   overbuild collaboration
-   overbuild analytics
-   build billing
-   build enterprise features
-   build AI features too early

The MVP wins ONLY if:

> create project → upload schema → test APIs instantly.
