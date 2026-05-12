# GhostAPI — Projects Module Architecture & Implementation Plan

## Overview

This document defines:

- project module architecture
- backend structure
- frontend structure
- onboarding flow
- API workspace flow
- logs flow
- settings flow
- environments flow
- schema flow
- mock behavior flow
- members flow
- overview flow
- reusable architecture rules
- implementation phases
- task breakdown
- backend/frontend coordination rules

The purpose is:

> build the entire Projects module as a clean, scalable, maintainable system.

This document is intentionally detailed because AI agents tend to:

- create duplicated logic
- create inconsistent structures
- ignore existing abstractions
- create isolated one-off components
- introduce architectural drift

The implementation must remain:

- scalable
- modular
- reusable
- maintainable
- contributor-friendly
- production-grade

NOT:

- quick hacks
- giant files
- duplicated logic
- copy-pasted UI
- random utilities everywhere
- spaghetti routes

---

# Core Product Philosophy

The Projects module is the heart of GhostAPI.

The entire user experience revolves around:

```txt
Projects
↓
Open Project
↓
API Workspace
↓
Test APIs
↓
Inspect Logs
↓
Configure Behavior
```

The module should feel:

- fast
- low-noise
- technical
- operational
- predictable

NOT:

- enterprise admin dashboard
- analytics-heavy SaaS
- overcomplicated platform UI

---

# Most Important UX Decision

# Unified API Workspace

GhostAPI intentionally merges:

- endpoint explorer
- request playground
- response viewer
- mock behavior controls

into:

```txt
Single API Workspace
```

DO NOT:

- create separate endpoint detail pages
- create disconnected playground pages
- split testing from configuration

The user should remain inside one workspace as much as possible.

---

# Core Projects Module Areas

# 1. Projects Listing

Route:

```txt
/projects
```

Purpose:

- list projects
- search projects
- create projects
- open projects

The page should remain:

- minimal
- table/list focused
- uncluttered

DO NOT:

- create giant cards
- create analytics dashboards
- create fake metrics

---

# 2. Create Project

Route:

```txt
/projects/new
```

Purpose:

- create new project
- select icon/logo
- configure initial environment

Current backend implementation already exists.

The frontend should integrate directly with:

```ts
POST / projects;
```

Current backend already supports:

- name
- slug
- description
- icon
- imageAttachmentId
- baseUrl
- environment

---

# 3. Project Onboarding

VERY IMPORTANT.

If a project has:

```txt
0 schemas
```

OR:

```txt
0 endpoints
```

then opening the project should redirect into:

```txt
Project Onboarding Flow
```

instead of the normal overview/workspace.

---

# Project Onboarding Purpose

The onboarding exists to:

- upload OpenAPI schema
- validate schema
- preview extracted endpoints
- generate workspace

The onboarding should feel:

- simple
- intelligent
- confidence-building

NOT:

- wizard-heavy
- multi-step SaaS onboarding
- cluttered setup process

---

# Onboarding Flow

```txt
Open Empty Project
↓
Upload OpenAPI
↓
Validate Schema
↓
Preview Endpoints
↓
Generate Workspace
↓
Open API Workspace
```

---

# Schema Upload Responsibilities

Backend must:

- validate OpenAPI safely
- sanitize input
- parse YAML/JSON
- normalize endpoints
- persist schema metadata
- generate endpoint records

Frontend must:

- upload schema
- display validation state
- display extracted endpoint preview
- display errors clearly
- redirect into workspace after generation

---

# 4. Project Overview

Route:

```txt
/projects/:id
```

Purpose:

- operational summary
- project health overview
- environment status
- request activity
- quick access into workspace

The overview should remain:

- calm
- lightweight
- readable

NOT:

- giant analytics dashboard
- card explosion
- marketing-style charts

---

# Overview Sections

The page should contain:

## Project Header

- name
- description
- icon
- status
- OpenAPI version
- updated time
- owner

---

## Request Activity

- request trend chart
- request count
- success rate
- average response time

---

## Environment Status

- environments
- base URLs
- health state
- request volume

---

## Quick Start

- copyable example request
- example curl command

---

## Explore More

Quick links:

- API Workspace
- Docs
- Settings

---

# 5. API Workspace

Route:

```txt
/projects/:id/workspace
```

This is the most important page in the product.

The API Workspace combines:

- endpoint explorer
- request playground
- response viewer
- auth configuration
- mock behavior configuration

into a single unified workflow.

---

# API Workspace Layout

## Left Sidebar

Contains:

- grouped endpoints
- endpoint search
- environments selector

Grouped example:

```txt
Authentication
  POST /users/login
  POST /users/signup

Products
  GET /products
  POST /products
```

---

## Main Workspace

Split horizontally.

### Left Side

Request builder.

### Right Side

Response viewer.

---

# Request Builder Features

Supports:

- method selector
- URL
- query params
- headers
- auth
- body editor
- environment switching

---

# Response Viewer Features

Supports:

- JSON viewer
- response headers
- cookies
- status
- latency
- response metadata

---

# Inline Mock Controls

The API Workspace should also contain:

- latency controls
- auth controls
- error rate controls
- status override controls

DO NOT:

- move these into separate endpoint pages.

---

# Workspace UX Rules

The user should instantly understand:

```txt
Request → Response
```

That mental model must remain obvious.

---

# 6. Request Logs

Route:

```txt
/projects/:id/logs
```

Purpose:

- inspect requests
- inspect responses
- debug APIs
- inspect headers
- inspect metadata

The logs page should feel:

- operational
- terminal-inspired
- low-noise

NOT:

- analytics-heavy
- chart-heavy

---

# Logs Features

Supports:

- request history
- filtering
- request detail panel
- response detail panel
- timing inspection
- request metadata
- request body
- response body

---

# Log Detail Panel

Should support:

- request headers
- request payload
- response preview
- request metadata
- status
- latency

---

# 7. Project Settings

Route:

```txt
/projects/:id/settings
```

Settings are divided into:

- General
- Environments
- Mock Behavior
- Schema
- Members
- Danger Zone

---

# General Settings

Contains:

- project name
- slug
- description
- project icon/logo

Supports:

- updating metadata
- replacing icon
- visibility configuration later

---

# Environments Settings

Contains:

- environments list
- environment detail panel

Each environment supports:

- base URL
- variables
- headers
- auth
- CORS
- icon/color
- status

---

# Mock Behavior Settings

Contains:

- default latency
- default error rate
- faker configuration
- cache behavior
- auth defaults
- pagination defaults
- response freshness

These values become:

- project defaults
- endpoint override fallbacks

---

# Schema Settings

Contains:

- current schema
- schema history
- validation status
- schema metadata
- servers
- replace schema

Replacing schema should:

- reparse endpoints
- update normalized model
- preserve compatible overrides when possible

---

# Members Settings

Contains:

- project members
- invite system
- role management

Roles:

- OWNER
- ADMIN
- EDITOR
- VIEWER

---

# Danger Zone

Contains:

- replace schema
- reset mock data
- clear logs
- archive project
- delete project

Danger actions should feel:

- explicit
- serious
- operational
- irreversible

DO NOT:

- overdesign this page
- add cute warning UX

---

# Backend Architecture

# Shared Contract Direction

The Projects module must follow the repository-wide contract direction:

```txt
packages/types
  ↓
apps/server validation + serialization
  ↓
apps/app API clients + UI types
```

Shared request bodies, response DTOs, enums, constants, and Zod schemas belong in:

```txt
packages/types/src/
```

Server and frontend code should consume these shared contracts instead of redefining local
copies.

Current examples:

- auth contracts live in `packages/types/src/auth.ts`
- project contracts live in `packages/types/src/projects.ts`
- upload contracts live in `packages/types/src/uploads.ts`

For new Projects work:

- add API-facing schemas/types to `packages/types` first
- use shared schemas in server `zValidator(...)`
- serialize server responses to match shared DTOs exactly
- import shared DTOs in frontend API clients
- avoid page/component-local copies of API response types

DO NOT:

- create duplicate frontend-only DTOs for API responses
- create duplicate backend-only Zod schemas for API request bodies
- return raw Prisma models directly when the shared DTO expects serialized strings
- let OpenAPI docs define a different shape from runtime responses

Feature-local schemas are still allowed only for:

- internal service inputs
- UI-only form state
- non-public helper validation
- server-only persistence details

---

# Recommended Folder Structure

The codebase should TRY to follow this structure where possible.

DO NOT:

- blindly restructure existing modules if it breaks architecture
- create unnecessary migrations

BUT:

- prefer modular structure
- merge isolated single-use files into modules when appropriate
- remove unnecessary abstractions
- avoid lonely utility files

---

# Recommended Backend Structure

```txt
apps/server/src/

features/
  auth/
  projects/
    routes/
    services/
    schemas/
    repositories/
    serializers/
    permissions/
    utils/

  environments/
  schemas/
  endpoints/
  logs/
  workspace/

lib/

middlewares/

shared/
```

---

# Important Backend Rules

# 1. Service Layer

Complex business logic should live in:

```txt
services/
```

NOT directly inside route files.

---

# 2. Repository Layer

Database queries should eventually move into:

```txt
repositories/
```

especially once queries become large.

---

# 3. Serializer Layer

Frontend response shaping should happen in:

```txt
serializers/
```

NOT inline inside routes.

---

# 4. Shared Validation

API-facing Zod schemas should live inside:

```txt
packages/types/src/
```

Feature `schemas/` folders are for internal validation only. If a schema defines an HTTP
request body, response body, public enum, or frontend-consumed DTO, centralize it in
`packages/types` and import it from there.

DO NOT inline giant validators or duplicate shared API schemas.

---

# Frontend Architecture

# Recommended Frontend Structure

```txt
apps/app/src/

modules/
  projects/
    pages/
    components/
    hooks/
    api/
    stores/
    schemas/
    utils/

  workspace/
  logs/
  settings/

components/
shared/
layouts/
lib/
```

---

# Frontend Rules

# 1. Reusable Components

Before creating anything new:

CHECK:

- existing components
- existing layouts
- existing tables
- existing forms
- existing dialogs

If something already exists:

```txt
REUSE IT
```

DO NOT duplicate components.

---

# 2. Shared UI Components

If something will be reused:

- create it as reusable
- move it into shared/ui/modules
- avoid duplication

Examples:

- table rows
- status badges
- request viewers
- code panels
- environment cards
- sidebar items

---

# 3. Keep Components Small

Avoid:

- 1000-line components
- giant page files
- mixed logic/components/hooks

Separate:

- UI
- logic
- API calls
- stores

---

# 4. API Calls

All API requests should live inside:

```txt
api/
```

DO NOT scatter fetch logic across components.

API clients should import request/response types from:

```txt
@ghostapi/types
```

DO NOT redefine backend response shapes inside frontend API files unless the shape is strictly
UI-local and not returned by the server.

---

# 5. State Rules

Use Zustand for:

- UI state
- workspace state
- temporary editor state

Use React Query for:

- server state
- API fetching
- mutations
- caching

DO NOT mix responsibilities.

---

# Existing Backend Status

The following already exists:

- project creation
- projects listing
- project detail fetching
- project backend module under `apps/server/src/features/projects`
- shared project DTOs and create-project validation in `packages/types`
- auth middleware
- csrf middleware
- project slug generation
- project icon handling
- shared upload purpose/attachment contracts in `packages/types`

DO NOT rewrite existing working logic unnecessarily.

Instead:

- extend it
- modularize it
- improve structure gradually

---

# Existing Backend Improvement Direction

The Projects backend now lives in a feature module. Keep growing it there instead of adding more
logic to generic `routes/` files.

Over time:

The agent should:

- extract services
- extract serializers
- move API-facing schemas/contracts into `packages/types`
- reduce route complexity
- isolate reusable logic

WITHOUT:

- breaking architecture
- introducing unnecessary abstractions
- drifting away from shared DTO contracts

---

# Task Execution Rules

VERY IMPORTANT.

The agent should NOT attempt:

- entire projects module at once
- giant frontend implementations
- full backend completion in one pass

Instead:

The module should be implemented incrementally.

---

# Implementation Phases

# Phase 1 — Project Listing

Goal:

- projects page
- project listing API integration
- search
- navigation

Tasks:

- connect GET /projects
- build projects table
- add search/filter
- add navigation to detail page

AFTER COMPLETION:

The agent MUST specify:

```txt
Next Task:
Project Onboarding
```

so the design screenshot can be provided.

---

# Phase 2 — Project Onboarding

Goal:

- empty project detection
- schema upload
- validation
- endpoint preview
- workspace generation

Tasks:

- onboarding redirect
- upload flow
- validation state
- endpoint extraction preview
- generation flow

AFTER COMPLETION:

The agent MUST specify:

```txt
Next Task:
Project Overview
```

---

# Phase 3 — Project Overview

Goal:

- operational overview page
- request chart
- environments summary
- quick actions

Tasks:

- overview API
- request metrics
- environment summary
- quick start section

AFTER COMPLETION:

The agent MUST specify:

```txt
Next Task:
API Workspace
```

---

# Phase 4 — API Workspace

Goal:

- unified workspace
- endpoint explorer
- request builder
- response viewer

Tasks:

- grouped endpoints
- request builder
- response panel
- environment switching
- inline mock controls

AFTER COMPLETION:

The agent MUST specify:

```txt
Next Task:
Request Logs
```

---

# Phase 5 — Request Logs

Goal:

- logs page
- filtering
- request detail inspection

Tasks:

- logs API
- logs table
- detail side panel
- response preview

AFTER COMPLETION:

The agent MUST specify:

```txt
Next Task:
Project Settings
```

---

# Phase 6 — Settings

Goal:

- settings tabs
- environments
- schema settings
- members
- mock behavior
- danger zone

Tasks should be split PER TAB.

DO NOT implement all settings at once.

---

# Code Quality Rules

# MUST

- use reusable abstractions
- keep code modular
- keep naming consistent
- use strict typing
- use shared utilities
- keep components small

---

# MUST NOT

- duplicate logic
- duplicate UI
- create giant files
- create random utility folders
- create one-off abstractions
- create inconsistent APIs

---

# Final Engineering Philosophy

The Projects module should feel:

- fast
- intentional
- maintainable
- infrastructure-grade
- developer-native

The implementation should communicate:

> serious engineering with extremely clean workflows.
