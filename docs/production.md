# this is about production guide

## database

we are using neondb. and this env file `.env.production.local` contains our production var.
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

### reset

to reset the above seed data, we will truncate our db by

```bash
bun --env-file=.env.production.local apps/backend/db/reset-prod-data.ts
```
