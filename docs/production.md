# this is about production guide

## backend deploy

name=credets-backend
root-dir=null
build-command=bun install
start-command=bun run --cwd apps/backend start
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
NODE_ENV

## frontend deploy

name=credets
root-dir=null
build-command=bun install && bun run build:frontend
publish-dir=apps/frontend/dist

### frontend env keys

VITE_BACKEND_APP

### frontend redirect rewrite rules

we add this rules since this is our spa application. otherwise, we see 404 upon navigation

```bash
source - destination - action
/*     - /index.html - rewrite
```

## database related

neondb database. `.env.production.local` contains our production env var.
without it, none of below command will work

### migrate

execute below command at `root dir` from terminal and from `main branch`

```bash
bun --env-file=.env.production apps/backend/db/run-prod-schema.ts
```

### seed

execute below command at root dir from terminal

```bash
bun --env-file=.env.production apps/backend/db/seed.ts
```

### reset data

to reset the above seed data, we will truncate our db by

```bash
bun --env-file=.env.production apps/backend/db/reset-prod-data.ts
```
