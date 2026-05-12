# GhostAPI — Authentication Architecture & System Design

## Overview

This document defines:

- authentication architecture
- authorization strategy
- session management
- frontend auth flow
- backend auth flow
- protected routing
- Electron considerations
- security rules
- token lifecycle
- database structure
- auth APIs
- engineering conventions

The purpose is:

> build a secure, scalable, developer-grade authentication system from day one.

GhostAPI authentication should feel:

- invisible
- fast
- modern
- secure
- low-friction

NOT:

- enterprise SSO complexity
- session confusion
- token chaos
- auth-provider spaghetti

---

# Authentication Philosophy

GhostAPI authentication should prioritize:

- simplicity
- security
- developer experience
- maintainability
- Electron compatibility

The system should feel:

> lightweight but production-grade.

---

# Core Authentication Principles

# 1. Session-Based Authentication

GhostAPI should use:

## session authentication with HttpOnly cookies.

NOT:

- localStorage tokens
- sessionStorage tokens
- JWT-only frontend auth
- client-managed auth

Reason:

- safer
- cleaner
- easier for Electron
- easier for protected APIs
- avoids token leakage

---

# 2. Stateless Access + Stateful Session Control

The system should combine:

- short-lived access tokens
- refresh tokens
- database-backed session tracking

This allows:

- device management
- session revocation
- logout-all-devices
- future audit logging

---

# 3. Electron Compatibility

Authentication architecture MUST work for:

- browser
- desktop app
- future Electron runtime

This is extremely important.

Avoid:

- SSR auth complexity
- NextAuth
- browser-specific assumptions

---

# 4. Backend-Centric Security

Frontend should NEVER:

- decode tokens
- validate auth manually
- trust local auth state blindly

The backend is the source of truth.

---

# Recommended Authentication Stack

# Backend

- Hono
- JWT
- bcrypt
- Prisma
- Redis
- Zod

---

# Frontend

- React
- Zustand
- TanStack Query

---

# Session Storage

- PostgreSQL
- Redis cache layer optional later

---

# Authentication Model

GhostAPI uses:

## access token + refresh token architecture.

---

# Access Token

Short-lived:

```txt id="jlwm_auth_1"
15 minutes
```

Stored in:

```txt id="jlwm_auth_2"
HttpOnly cookie
```

Purpose:

- authenticated requests
- protected APIs

---

# Refresh Token

Long-lived:

```txt id="jlwm_auth_3"
30 days
```

Stored in:

```txt id="jlwm_auth_4"
HttpOnly cookie
```

Purpose:

- refresh sessions
- maintain login state

Refresh tokens MUST exist in database.

---

# Session Model

Every login creates:

## a session record.

This enables:

- session revocation
- device management
- logout everywhere
- future audit features

---

# Authentication Flow

# Login Flow

```txt id="jlwm_auth_5"
Email + Password
↓
Validate Credentials
↓
Create Session
↓
Generate Access Token
↓
Generate Refresh Token
↓
Store Refresh Session
↓
Set HttpOnly Cookies
↓
Authenticated
```

---

# Refresh Flow

```txt id="jlwm_auth_6"
Access Token Expires
↓
Frontend Calls /auth/refresh
↓
Validate Refresh Token
↓
Issue New Access Token
↓
Rotate Refresh Token
↓
Continue Session
```

---

# Logout Flow

```txt id="jlwm_auth_7"
User Logout
↓
Delete Session
↓
Clear Cookies
↓
Invalidate Refresh Token
```

---

# Frontend Authentication Architecture

# Public App (Next.js)

The public frontend:

- does NOT own authentication state
- does NOT manage protected routing

Its responsibility is:

- landing pages
- docs
- marketing
- redirecting to protected app

---

# Protected App (React SPA)

The React application owns:

- authenticated routing
- session fetching
- auth state
- workspace protection

This keeps Electron compatibility clean.

---

# Protected Frontend Flow

```txt id="jlwm_auth_8"
App Starts
↓
Fetch Current Session
↓
Hydrate User State
↓
Render Protected App
```

---

# Authentication Endpoints

# Register

```http id="jlwm_auth_9"
POST /auth/register
```

Creates:

- user
- initial session

---

# Login

```http id="jlwm_auth_10"
POST /auth/login
```

Creates:

- session
- access token
- refresh token

---

# Logout

```http id="jlwm_auth_11"
POST /auth/logout
```

Deletes:

- current session

---

# Logout All

```http id="jlwm_auth_12"
POST /auth/logout-all
```

Deletes:

- all sessions

---

# Refresh

```http id="

```

# GhostAPI — Authentication Architecture & System Design

## Overview

This document defines:

- authentication architecture
- authorization strategy
- session management
- frontend auth flow
- backend auth flow
- protected routing
- Electron considerations
- security rules
- token lifecycle
- database structure
- auth APIs
- engineering conventions

The purpose is:

> build a secure, scalable, developer-grade authentication system from day one.

GhostAPI authentication should feel:

- invisible
- fast
- modern
- secure
- low-friction

NOT:

- enterprise SSO complexity
- session confusion
- token chaos
- auth-provider spaghetti

---

# Authentication Philosophy

GhostAPI authentication should prioritize:

- simplicity
- security
- developer experience
- maintainability
- Electron compatibility

The system should feel:

> lightweight but production-grade.

---

# Core Authentication Principles

# 1. Session-Based Authentication

GhostAPI should use:

## session authentication with HttpOnly cookies.

NOT:

- localStorage tokens
- sessionStorage tokens
- JWT-only frontend auth
- client-managed auth

Reason:

- safer
- cleaner
- easier for Electron
- easier for protected APIs
- avoids token leakage

---

# 2. Stateless Access + Stateful Session Control

The system should combine:

- short-lived access tokens
- refresh tokens
- database-backed session tracking

This allows:

- device management
- session revocation
- logout-all-devices
- future audit logging

---

# 3. Electron Compatibility

Authentication architecture MUST work for:

- browser
- desktop app
- future Electron runtime

This is extremely important.

Avoid:

- SSR auth complexity
- NextAuth
- browser-specific assumptions

---

# 4. Backend-Centric Security

Frontend should NEVER:

- decode tokens
- validate auth manually
- trust local auth state blindly

The backend is the source of truth.

---

# Recommended Authentication Stack

# Backend

- Hono
- JWT
- bcrypt
- Prisma
- Redis
- Zod

---

# Frontend

- React
- Zustand
- TanStack Query

---

# Session Storage

- PostgreSQL
- Redis cache layer optional later

---

# Authentication Model

GhostAPI uses:

## access token + refresh token architecture.

---

# Access Token

Short-lived:

```txt id="auth_1"
15 minutes
```

Stored in:

```txt id="auth_2"
HttpOnly cookie
```

Purpose:

- authenticated requests
- protected APIs

---

# Refresh Token

Long-lived:

```txt id="auth_3"
30 days
```

Stored in:

```txt id="auth_4"
HttpOnly cookie
```

Purpose:

- refresh sessions
- maintain login state

Refresh tokens MUST exist in database.

---

# Session Model

Every login creates:

## a session record.

This enables:

- session revocation
- device management
- logout everywhere
- future audit features

---

# Authentication Flow

# Login Flow

```txt id="auth_5"
Email + Password
↓
Validate Credentials
↓
Create Session
↓
Generate Access Token
↓
Generate Refresh Token
↓
Store Refresh Session
↓
Set HttpOnly Cookies
↓
Authenticated
```

---

# Refresh Flow

```txt id="auth_6"
Access Token Expires
↓
Frontend Calls /auth/refresh
↓
Validate Refresh Token
↓
Issue New Access Token
↓
Rotate Refresh Token
↓
Continue Session
```

---

# Logout Flow

```txt id="auth_7"
User Logout
↓
Delete Session
↓
Clear Cookies
↓
Invalidate Refresh Token
```

---

# Frontend Authentication Architecture

# Public App (Next.js)

The public frontend:

- does NOT own authentication state
- does NOT manage protected routing

Its responsibility is:

- landing pages
- docs
- marketing
- redirecting to protected app

---

# Protected App (React SPA)

The React application owns:

- authenticated routing
- session fetching
- auth state
- workspace protection

This keeps Electron compatibility clean.

---

# Protected Frontend Flow

```txt id="auth_8"
App Starts
↓
Fetch Current Session
↓
Hydrate User State
↓
Render Protected App
```

---

# Authentication Endpoints

# Register

```http id="auth_9"
POST /auth/register
```

Creates:

- user
- initial session

---

# Login

```http id="auth_10"
POST /auth/login
```

Creates:

- session
- access token
- refresh token

---

# Logout

```http id="auth_11"
POST /auth/logout
```

Deletes:

- current session

---

# Logout All

```http id="auth_12"
POST /auth/logout-all
```

Deletes:

- all sessions

---

# Refresh

```http id="auth_13"
POST /auth/refresh
```

Refreshes:

- access token
- refresh token

---

# Current Session

```http id="auth_14"
GET /auth/me
```

Returns:

- authenticated user
- active session

---

# Forgot Password

```http id="auth_15"
POST /auth/forgot-password
```

---

# Reset Password

```http id="auth_16"
POST /auth/reset-password
```

---

# Database Design

# User Table

```txt id="auth_17"
id
email
username
password_hash
avatar
created_at
updated_at
```

---

# Session Table

```txt id="auth_18"
id
user_id
refresh_token_hash
ip_address
user_agent
expires_at
created_at
last_used_at
```

---

# Password Reset Table

```txt id="auth_19"
id
user_id
token_hash
expires_at
used_at
created_at
```

---

# Security Rules

# Password Hashing

Use:

## bcrypt

Minimum:

```txt id="auth_20"
12 rounds
```

Never store plaintext passwords.

---

# Refresh Token Storage

Refresh tokens MUST:

- be hashed before storage
- never stored raw

---

# Cookies

Cookies MUST be:

```txt id="auth_21"
HttpOnly
Secure
SameSite=Lax
```

Production MUST use:

```txt id="auth_22"
Secure=true
```

---

# JWT Rules

Access tokens should contain:

- user id
- session id
- expiration

DO NOT:

- store permissions
- store large payloads
- store sensitive information

inside JWTs.

---

# CSRF Protection

Since GhostAPI uses cookies:

## CSRF protection is required.

Recommended:

- CSRF token header
- double-submit cookie pattern

---

# Rate Limiting

Apply rate limits to:

- login
- register
- forgot password
- refresh

Recommended:

```txt id="auth_23"
5-10 attempts per minute
```

---

# Protected Routing

# Public Routes

```txt id="auth_24"
/login
/register
/forgot-password
```

---

# Protected Routes

```txt id="auth_25"
/projects
/workspace
/logs
/settings
```

---

# Frontend Auth State

# Zustand Store

The frontend auth store should contain:

- user
- loading state
- authenticated state

DO NOT:

- store JWTs manually
- decode tokens in frontend
- persist auth manually

Cookies already manage sessions.

---

# Session Fetching

On app startup:

```txt id="auth_26"
GET /auth/me
```

hydrates the authenticated state.

---

# TanStack Query Usage

Use React Query for:

- current session
- auth mutations
- session refresh
- logout mutations

DO NOT:

- manually synchronize auth state everywhere

---

# Middleware

# Backend Middleware

Must include:

- auth middleware
- session validation
- role validation
- CSRF validation
- rate limiting

---

# Frontend Middleware

React route guards should:

- redirect unauthenticated users
- block protected pages
- handle expired sessions gracefully

---

# Electron Considerations

GhostAPI is planned to support:

## Electron desktop packaging.

Authentication MUST remain:

- browser-compatible
- Electron-compatible
- cookie-compatible

Avoid:

- NextAuth
- SSR auth coupling
- browser-only assumptions

---

# Recommended Electron Strategy

Electron should:

- run the React protected app
- use secure cookie storage
- communicate with backend normally

The authentication flow should remain identical between:

- web
- desktop

---

# OAuth Support

Phase 1 should support:

- email/password only

Later phases may add:

- GitHub OAuth
- Google OAuth

DO NOT:

- overbuild OAuth early

---

# Roles & Permissions

# Initial Roles

```txt id="auth_27"
OWNER
ADMIN
EDITOR
VIEWER
```

---

# Permissions

# OWNER

Full control.

---

# ADMIN

Manage project and members.

---

# EDITOR

Modify APIs and settings.

---

# VIEWER

Read-only access.

---

# Authorization Rules

Authorization MUST happen:

## server-side only.

Frontend visibility checks are:

- UX only
- NOT security

---

# Error Handling

# Standard Auth Errors

```json id="auth_28"
{
  "success": false,
  "error": {
    "message": "Unauthorized"
  }
}
```

---

# Frontend Handling

Frontend should:

- redirect on 401
- retry refresh automatically
- gracefully recover sessions

---

# Logout Behavior

Logout must:

- clear cookies
- revoke session
- invalidate refresh token
- reset frontend state

---

# Future Authentication Features

NOT Phase 1.

Future possible additions:

- OAuth providers
- 2FA
- magic links
- device approval
- session history
- login alerts

DO NOT implement these early.

---

# Engineering Philosophy

GhostAPI authentication should feel:

- invisible
- reliable
- secure
- predictable

The auth system should never become:

- a product by itself
- over-engineered
- dependency-heavy
- difficult to reason about

The best authentication system is:

> the one users barely notice.
