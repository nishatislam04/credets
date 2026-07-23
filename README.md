# Credets

A monorepo for securely managing private credentials — a full-stack credential management app.

## Stack

- **Monorepo** — Bun workspaces with shared packages (`packages/`)
- **Backend** — Bun HTTP server, PostgreSQL, Zod validation
- **Frontend** — TanStack Router + TanStack Query + TanStack Form
- **UI** — shadcn/ui with Base UI primitives
- **Formatting & Linting** — Biome
- **Hosting** — Backend on Render, Frontend on Render
- **Image Upload** - minio (local-podman(docker)) | supabase storage (production)

## Features

- Simple authentication and Full systematic Authorization
- Credential listings with infinite scroll
- CRUD credential
- CRUD types
- Image upload support (thumbnail + images) to supabase storage
- Flexible data input for credential (single value, key-pair, text blocks)
- Search, sort, and filter in credentials listings
- Security: CSRF protection, encryption-at-rest, password hashing

## Setup

setup the project

### 1. Clone

```bash
git clone git@github.com:nishatislam04/credets.git
cd credets
```

### 2. Install Dependencies

```bash
bun i
```

Note: Some environment variables are duplicated in both the root `.env`and
`apps/backend/.env`. Observe both carefully.

### 3. Environment Variables

```bash
cp .env.example .env
cp .env.example apps/backend/.env
```

Generate encryption keys:

```bash
openssl rand -hex 32
```

Set the output as `ENC_KEY` in both `.env` files — this encrypts/decrypts credential secrets.
`CSRF_SECRET_KEY` is used for CSRF token generation and verification

### 4. Start Podman

```bash
podman-compose up
```

### 5. Run the App

Start both frontend and backend in one terminal:

```bash
bun run dev
```

Or separately:

```bash
bun run dev:backend   # http://localhost:8000
bun run dev:frontend  # http://localhost:3000
```

### 6. Seed the Database Locally

```bash
bun run seed
```

## Documentation

All project documentation lives in [`docs/`](./docs)
