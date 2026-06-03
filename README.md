# Credets

A monorepo for securely managing private credentials — a full-stack credential management app.

## Stack

- **Monorepo** — Bun workspaces with shared packages (`packages/`)
- **Backend** — Bun HTTP server, PostgreSQL, Zod validation
- **Frontend** — TanStack Router + TanStack Query + TanStack Form
- **UI** — shadcn/ui with Base UI primitives (`@base-ui/react`)
- **Language** — TypeScript throughout
- **Formatting & Linting** — Biome
- **Hosting** — Backend on Render, Frontend TBD

## Features

- Credential listings with infinite scroll
- Create, update, and delete credentials
- Image upload support (thumbnail + gallery)
- Flexible data input (single value, key-pair, text blocks)
- Search, sort, and filter
- Security: CSRF protection, encryption-at-rest, password hashing

## Project Structure

```
credets/
├── apps/
│   ├── backend/        # Bun HTTP API server
│   └── frontend/       # TanStack Router SPA
├── packages/
│   ├── shared-schema/  # Zod schemas (backend validation source of truth)
│   ├── shared-types/   # TypeScript types shared across packages
│   └── shared-utils/   # Shared utility functions
├── docs/               # Project documentation
├── .agents/skills/     # AI agent skills (shadcn rules, etc.)
└── docker-compose.yml  # Local PostgreSQL
```

## Setup

### 1. Clone

```bash
git clone git@github.com:nishatislam04/credets.git
cd credets
```

### 2. Install dependencies

```bash
bun i
```

Note: Some environment variables are duplicated in both the root `.env` and `apps/backend/.env`. Observe both carefully.

### 3. Environment variables

```bash
cp .env.example .env
cp .env.example apps/backend/.env
```

Generate encryption keys:

```bash
openssl rand -hex 32
```

Set the output as `ENC_KEY` in both `.env` files — this encrypts/decrypts credential secrets.
`CSRF_SECRET_KEY` is used for CSRF token generation.

### 4. Start PostgreSQL

```bash
make db-up
```

### 5. Run the app

Start both frontend and backend in one terminal:

```bash
bun run dev
```

Or separately:

```bash
bun run dev:backend   # http://localhost:8000
bun run dev:frontend  # http://localhost:3000
```

### 6. Seed the database (optional)

```bash
bun run seed
```

## Documentation

All project documentation lives in [`docs/`](./docs). Key documents:

| Document | Description |
|----------|-------------|
| [`docs/app.md`](./docs/app.md) | App story, requirements, and feature list |
| [`docs/form.md`](./docs/form.md) | Frontend & backend form processing guide |
| [`docs/dblab.md`](./docs/dblab.md) | Database inspector setup |
| [`docs/production.md`](./docs/production.md) | Production deployment notes |

## AI Agent Skills

This project ships with [shadcn/ui](./docs/frontend/shadcn-ui-guide.md) skills for AI agents. The canonical skill files live in:

- **`.agents/skills/shadcn/`** — shadcn rules, patterns, and project-specific deviations

AI agents should also consult `docs/frontend/shadcn-ui-guide.md` for a consolidated reference covering import aliases, component patterns, and library choices specific to this project.
