# This Is About Production Guide

This guide covers deploying the Credets backend and frontend to production.

## Backend Deploy

name=credets-backend
root-dir=null
build-command=bun install
start-command=bun run --cwd apps/backend start
health-check=/healthz

### Backend Env Keys

POSTGRES_URL=neon db connection string
DB_USER
DB_PASSWORD
DB_NAME
DB_HOST
DB_PORT
ENC_KEY
CSRF_SECRET_KEY
FRONTEND_APP
BACKEND_APP
NODE_ENV

## Frontend Deploy

name=credets
root-dir=null
build-command=bun install && bun run build:frontend
publish-dir=apps/frontend/dist

### Frontend Env Keys

VITE_BACKEND_APP

### Frontend Redirect Rewrite Rules

we add this rules since this is our spa application. otherwise, we see 404 upon navigation

```bash
source - destination - action
/*     - /index.html - rewrite
```

## Database Related

neondb database. `.env.production.local` contains our production env var.
without it, none of below command will work

### Migrate

execute below command at `root dir` from terminal and from `main branch`

```bash
bun --env-file=.env.production apps/backend/db/run-prod-schema.ts
```

### Seed

execute below command at root dir from terminal

```bash
bun --env-file=.env.production apps/backend/db/seed.ts
```

### Reset Data

to reset the above seed data, we will truncate our db by

```bash
bun --env-file=.env.production apps/backend/db/reset-prod-data.ts
```
