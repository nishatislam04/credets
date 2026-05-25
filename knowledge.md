# Project knowledge

This file gives Codebuff context about your project: goals, commands, conventions, and gotchas.

## Quickstart

- **Setup:** `bun i` at root (installs all workspaces via root, backend, frontend, packages)
- **Dev (both):** `bun run dev` — runs backend (port 8000) & frontend (port 3000) concurrently
- **Dev (backend only):** `bun run dev:backend`
- **Dev (frontend only):** `bun run dev:frontend`
- **DB:** `make db-up` (Docker Compose — PostgreSQL 18), `make db-down`
- **Seed:** `bun run seed`
- **Build:** `bun run build`
- **Format/Lint (frontend):** `bun run lint` / `bun run check` (Biome)
- **Type-check (backend):** `bun run type-check` (in apps/backend)
- **Test (frontend):** `bun test` (vitest)

## Architecture

- **Monorepo** — `bun` workspaces: `apps/*`, `packages/*`
- **Backend** (`apps/backend/`) — Bun HTTP server, raw PostgreSQL via `sql` tagged template literals, custom CSRF, encrypt/decrypt utilities
- **Frontend** (`apps/frontend/`) — TanStack Router + React 19 + TanStack Form + shadcn/ui + Tailwind CSS v4 + Framer Motion
- **Shared packages:**
  - `@credets/shared-schema` — Zod validation schemas (catalog: zod ^4)
  - `@credets/shared-types` — TypeScript types (zod-inferred)
  - `@credets/shared-utils` — shared utility functions
- **DB** — PostgreSQL 18 in Docker, 1 user, sessions, types, credentials, credential_images tables

## Conventions

- **Formatting:** Biome — tabs, 80 line width, double quotes, organize imports on save
- **Forms:** Always use `FormData` (not JSON) for form submissions; TanStack Form with `<Field>` component; server validation via `onSubmitAsync` returning `{ fields: data.errors }`
- **Auth:** Single-user system with "special password" (static + dynamic date part, encrypted with `ENC_KEY`)
- **CSRF:** Custom implementation — generate, attach, validate, expire handled manually
- **Pagination:** Offset-based via query params (`page`, `limit`); response includes pagination metadata + HATEOAS links
- **Imports:** Frontend uses `#/*` path alias (e.g. `#/components/ui/button`)
- **Validation:** Zod v4 via catalog; backend has `apps/backend/validation/` dir
- **UI:** shadcn components in `apps/frontend/src/components/ui/`

## Gotchas

- No `.env` template exists — you must create `.env` manually with `ENC_KEY`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- ENC_KEY generated via `openssl rand -hex 32` and must be copied to `apps/backend/`
- Backend uses `bun --watch` for dev; frontend uses Vite on port 3000
- DB inspect via `dblab --config .dblab.yaml` (config at root)
- Reset DB: `docker compose down -v && docker compose up`
- `onSubmitAsync` must **always return something** (even if unused) for TanStack Form to work
- Type-check is only configured for backend (`tsc --noEmit`); frontend relies on Vite/build-time checking
