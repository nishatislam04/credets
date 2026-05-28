# this is about production guide

## backend deploy

name=credets-backend
root-dir=null
build-command=bun install && cd apps/backend && bun run build
start-command=cd apps/backend && bun dist/index.js
health-check=/healthz

### backend env keys

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


## frontend deploy

name=credets
root-dir=null
build-command=bun install && cd apps/frontend && bun run build
publish-dir=apps/frontend/dist

### frontend env keys

VITE_BACKEND_APP


## database related

neondb database. `.env.production.local` contains our production env var.
without it, none of below command will work

### migrate

one time script run to migrate the schema (create missing tables)
execute below command at root dir from terminal

```bash
bun --env-file=.env.production.local apps/backend/db/db-run-prod-schema.ts
```

### seed

execute below command at root dir from terminal

```bash
bun --env-file=.env.production.local apps/backend/db/seed.ts
```

### reset data

to reset the above seed data, we will truncate our db by

```bash
bun --env-file=.env.production.local apps/backend/db/reset-prod-data.ts
```
