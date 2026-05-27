# Project knowledge

This file gives Codebuff context about your project: goals, commands, conventions, and gotchas.

## Quickstart

- **Setup:** `bun i` at root (installs all workspaces via root, backend, frontend, packages)
- **Dev (both):** `bun run dev` — runs backend (port 8000) & frontend (port 3000) concurrently
- **Dev (backend only):** `bun run dev:backend`
- **Dev (frontend only):** `bun run dev:frontend`
- **DB:** `make db-up` (Docker Compose — PostgreSQL 18), `make db-down`
- **Seed:** `bun run seed` (creates 1 user, 6 types, 500 credentials across all types)
- **Build:** `bun run build`
- **Format/Lint (frontend):** `bun run lint` / `bun run check` (Biome)
- **Type-check (backend):** `bun run type-check` (in apps/backend)
- **Test (frontend):** `bun test` (vitest)

## Architecture

- **Monorepo** — `bun` workspaces: `apps/*`, `packages/*`
- **Backend** (`apps/backend/`) — Bun HTTP server, raw PostgreSQL via `sql` tagged template literals
- **Frontend** (`apps/frontend/`) — TanStack Router + React 19 + TanStack Form + shadcn/ui + Tailwind CSS v4 + Framer Motion
- **Shared packages:**
  - `@credets/shared-schema` — Zod validation schemas (catalog: zod ^4)
  - `@credets/shared-types` — TypeScript types (zod-inferred)
  - `@credets/shared-utils` — shared utility functions
- **DB** — PostgreSQL 18 in Docker, tables: users, session, types, credentials, credential_images

## Conventions

- **Formatting:** Biome — tabs, 80 line width (root) / 100 (frontend), double quotes, organize imports on save
- **Forms:** Always use `FormData` (not JSON) for form submissions; TanStack Form with `<Field>` component; server validation via `onSubmitAsync` returning `{ fields: data.errors }`
- **Auth:** Single-user system designed (not wired into route guards) — "special password" (static + dynamic date part), session cookies
- **CSRF:** Custom implementation using `Bun.CSRF.generate()` / `Bun.CSRF.verify()` with 30-minute expiry
- **Pagination:** Cursor-based via base64-encoded `{ createdAt, id }` composite cursor; frontend uses IntersectionObserver for infinite scroll
- **Imports:** Frontend uses `#/*` path alias (e.g. `#/components/ui/button`), backend uses `@backend/*`, `@db/*`, `@credets/*`
- **Validation:** Zod v4; backend has `apps/backend/validation/` dir for dedicated validation endpoints
- **UI:** shadcn components in `apps/frontend/src/components/ui/`, built on Base UI (not Radix)
- **TanStack Query:** `gcTime: 0`, `staleTime: 0` — no client caching; fresh data on every mount
- **TanStack Router:** File-based routing with `createFileRoute()`, `defaultPreload: 'intent'`, `scrollRestoration: true`
- **Image upload:** All images converted to WebP; thumbnail max 800px width/quality 50, gallery images max 1400px/quality 75
- **File naming:** Route files follow TanStack Router convention; private components use `-components`, `-actions`, `-utils` prefix folders

## Gotchas

- No `.env` template exists — you must create `.env` manually with `ENC_KEY`, `CSRF_SECRET_KEY`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `FRONTEND_APP`, `VITE_BACKEND_APP`
- `ENC_KEY` generated via `openssl rand -hex 32` and must be copied to `apps/backend/`
- Backend uses `bun --watch` for dev; frontend uses Vite on port 3000
- DB inspect via `dblab --config .dblab.yaml` (config at root)
- Reset DB: `docker compose down -v && docker compose up`
- `onSubmitAsync` must **always return something** (even if unused) for TanStack Form to work
- Type-check is only configured for backend (`tsc --noEmit`); frontend relies on Vite/build-time checking
- `routeTree.gen.ts` is auto-generated — never edit manually
- Tags are stored as JSONB array but submitted as comma-separated string from the form
- `@base-ui/react` package exports via `exports` field — only use entries defined in its `package.json` (e.g. `@base-ui/react/alert-dialog`, not subpaths like `index.parts`)
- Base UI uses `render` prop for composition, **not** Radix's `asChild` pattern

## Current Feature Status

| Feature | Status | Details |
|---------|--------|---------|

| Credentials listing | ✅ Done | Cursor-based pagination, infinite scroll, type color badges |
| Create credential | ✅ Done | Full form with validation, image upload, data blocks |
| View credential detail | ✅ Done | Image lightbox, data block renderer, copy-to-clipboard on ID |
| Update credential | ✅ Done | Pre-populated form, image management (add/remove existing), thumbnail replace |
| Delete credential | ✅ Done | AlertDialog confirmation, gooeyToast feedback, navigation back to listings |
| Image upload | ✅ Done | Thumbnail + gallery images, WebP conversion, lightbox preview |
| Auth system | 🚧 Designed | Single-user, special password logic designed but not wired into routes |
| Search/filter | ❌ Not started | |
| Bulk export | ❌ Not started | |

## Data Block System

Credentials store flexible data in a JSONB `data` column with three discriminated union types:

1. **`single_label`** — `{ type: "single_label", value: string }` — single text value (e.g. password, API key)
2. **`key_value`** — `{ type: "key_value", key: string, value: string }` — key-value pair (e.g. username → value)
3. **`information`** — `{ type: "information", value: string }` — long text/multiline content

**Schema:** `packages/shared-schema/src/credentials/create.ts` → `z.discriminatedUnion("type", [...])`
**Frontend create form:** `DataBlock` component in `routes/credentials/create/-components/Datablock.tsx`
**Frontend detail renderer:** `CredentialDataRenderer` in `routes/credentials/$credentialId/-components/credential-data.tsx`

- `CopyDisplay` — click-to-copy with checkmark animation, optional secret reveal toggle
- `MultiLineDisplay` — for information blocks
- Type-based accent colors per credential type

## Backend API Endpoints

Defined in `apps/backend/index.ts` using Bun's `routes` object pattern. The backend uses a custom `ResponseFactory` class for uniform success/error responses.

| Method | Path | Handler | Status | Notes |
|--------|------|---------|--------|-------|

| GET | `/` | Static HTML | ✅ | |
| GET | `/get-csrf` | `generateCSRF()` | ✅ | Returns token with 30-min expiry |
| GET | `/credentials` | `credentialListings()` | ✅ | Cursor-based, composite (created_at, id); params: `cursor`, `limit` |
| GET | `/credentials/:credentialId` | `credentialPage()` | ✅ | Full detail w/ images; serialises BYTEA → base64 |
| POST | `/credentials/create` | `credentialCreate()` | ✅ | FormData, CSRF, Zod validation, image processing |
| POST | `/credentials/create/validation` | `createCredentialValidation()` | ✅ | Server-side form validation |
| POST | `/credentials/:credentialId/update` | `credentialUpdate()` | ✅ | Full update with image management |
| DELETE | `/credentials/:credentialId/delete` | `credentialDelete()` | ✅ | CSRF verification, cascade deletes images |
| GET | `/types/listings` | `typesListings()` | ✅ | Returns all credential types |

**Response format (success):** `{ success: true, data, message, timestamp, path, status }`
**Response format (error):** `{ success: false, error, message, timestamp, details, data, path, status }`

## Frontend Routes

File-based routing via `@tanstack/router-plugin/vite` with `autoCodeSplitting: true`.

| Path | File | Component | Status |
|------|------|-----------|--------|

| `/` | `routes/index.tsx` | Home | Basic |
| `/credentials` | `routes/credentials/index.tsx` | Listings with infinite scroll, Create button | ✅ |
| `/credentials/$credentialId` | `routes/credentials/$credentialId/index.tsx` | Detail view with lightbox, copy ID | ✅ |
| `/credentials/create` | `routes/credentials/create/index.tsx` | Create form with data blocks, image upload | ✅ |
| `/credentials/$credentialId/update` | `routes/credentials/$credentialId/update/index.tsx` | Edit form with delete button | ✅ |

**Root layout** (`routes/__root.tsx`): QueryClientProvider (no cache), GooeyToaster, TanStack DevTools panels.

## UI Components

shadcn/ui components in `apps/frontend/src/components/ui/`:

- **Base:** `badge`, `button`, `card`, `input`, `label`, `select`, `separator`, `skeleton`, `spinner`, `textarea`
- **Form:** `field` (Field, FieldLabel, FieldContent, FieldDescription, FieldError, FieldGroup), `form`
- **Display:** `item` (Item, ItemContent, ItemDescription, ItemMedia, ItemTitle), `table`
- **Custom:** `goey-toaster.tsx` (gooey toast notifications), `alert-dialog.tsx` (Base UI AlertDialog wrapper)

## Database Tables

**`users`** — id (UUID), name, username (UNIQUE), email (UNIQUE), password (hashed), special_password (encrypted), created_at, updated_at
**`session`** — id (UUID), user_id (FK), token, expires_at, created_at
**`types`** — id (UUID), label (UNIQUE), value (UNIQUE), description, created_at, updated_at
**`credentials`** — id (UUID), title, short_description, long_description, thumbnail_image_data (BYTEA), thumbnail_format, thumbnail_width, thumbnail_height, data (JSONB), notes, tags (JSONB), created_at, updated_at, user_id (FK), types_id (FK)
**`credential_images`** — id (UUID), image_data (BYTEA), format, width, height, byte_size, sort_order, created_at, updated_at, credential_id (FK, CASCADE on delete)

## Six Credential Types

| value | label | Color |
|-------|-------|-------|

| `credentials` | Credentials | Blue |
| `key` | Key | Amber |
| `api` | API | Purple |
| `media` | Media | Rose |
| `game_loadout` | Game Loadout | Emerald |
| `misc` | Misc | Cyan (fallback: Slate for card) |

## Key Dependencies

**Backend:** `iron-webcrypto`, `date-fns`, `zod`, `bun` (runtime)
**Frontend:** `react`, `@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/react-form`, `@base-ui/react`, `tailwindcss`, `framer-motion`, `lucide-react`, `@fontsource-variable/inter`, `gooey-toast`, `zod`, `tw-animate-css`, `clsx`, `tailwind-merge`

## Project Dir Structure (Key Paths)

```
credets/
├── apps/backend/
│   ├── db/               ← init.sql, connection.ts, seed.ts
│   ├── http/             ← route handlers (credentials/, csrf/, types/)
│   ├── validation/       ← server-side Zod validation
│   ├── utils/            ← encrypt, decrypt, processImage, parseLocalDate, response
│   ├── types/            ← formatZodError, response type defs
│   └── index.ts          ← Bun.serve entry with route definitions
├── apps/frontend/
│   └── src/
│       ├── routes/credentials/
│       │   ├── index.tsx                         ← listings
│       │   ├── -components/credential-card.tsx    ← card component
│       │   ├── -actions/getCredentialsListings.ts
│       │   ├── create/                           ← create form, DataBlock, actions
│       │   └── $credentialId/                    ← detail view, update form, image-lightbox
│       ├── components/ui/                        ← shadcn components
│       └── styles.css                            ← Tailwind v4 config + toast overrides
├── packages/
│   ├── shared-schema/src/credentials/            ← Zod schemas (create.ts, update.ts)
│   └── shared-types/src/credentials/             ← inferred types (create.ts, listings.ts)
└── docs/                                         ← project documentation + knowledge.md
```

## Environment Variables

- `ENC_KEY` — 64-char hex from `openssl rand -hex 32` (for iron-webcrypto seal/unseal)
- `CSRF_SECRET_KEY` — for `Bun.CSRF.generate()`/`verify()`
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` — PostgreSQL credentials
- `FRONTEND_APP` — frontend URL for CORS headers (e.g. `http://localhost:3000`)
- `VITE_BACKEND_APP` — backend URL for frontend fetch calls (e.g. `http://localhost:8000`)

## Sync Context

`utils/sync-context.ts` scans the project tree and auto-generates `docs/web-chat-ai.md` (the AI context file). Run `bun run sync-context` to regenerate. Static sections (best practices, rules) are hardcoded in the script itself.
