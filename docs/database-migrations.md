# Database Migrations with Atlas — a Learning Guide

This guide solves one problem: how to evolve the Credets database schema
in production without ever dropping or resetting data, while keeping a
single SQL file as the source of truth. It explains why the current
init.sql approach cannot do this, why Atlas is the right fit for how we
think, and exactly how to adopt it, use it daily, and wire it into
CI/CD.

## 1. The Problem: Why the Current Flow Breaks

Today, `run-prod-schema.ts` re-executes the whole `init.sql` against the
database on every deploy. That worked while the schema was new, but it
has three hard limits:

- `CREATE TABLE IF NOT EXISTS` skips tables that already exist. Adding a
  new column to an existing table in `init.sql` does nothing in
  production. The deploy succeeds silently, the app then crashes with
  "column does not exist", and the only fix today is the destructive
  `reset-prod-data.ts` (`DROP SCHEMA public CASCADE`).
- Some statements are not idempotent. `CREATE TRIGGER` has no
  `IF NOT EXISTS` form, so re-running `init.sql` over an existing
  database fails.
- Nothing is versioned. There is no record of what changed when, so
  there is no safe way to apply one targeted change.

The requirement: production data must survive every schema change. New
columns, tables, and constraints are added by applying small, ordered,
recorded migrations — never by re-running a full schema dump.

## 2. The Fix: Declarative Migrations

A migration system answers two questions: what changed, and was it
applied? There are two families of tools:

- Imperative — you hand-write versioned migration files (001, 002, ...)
  and the tool runs the pending ones. Simple, but the SQL scatters
  across many files, and there is no single file you can read to
  understand the whole database. This is exactly what you detest.
- Declarative — you maintain ONE file describing the desired final
  state. The tool diffs it against a scratch database and generates the
  migration files for you. Migration files become build artifacts, like
  `dist/` — never hand-edited. This is the fit for us.

Atlas (atlasgo.io) is the declarative tool for PostgreSQL and works
natively with Neon. It keeps our philosophy: one hand-edited file, and
generated migration files that we review but never write.

## 3. What Atlas Is and How It Thinks

Three concepts to hold in your head:

- Desired state — a single `schema.sql` file describing what the
  database should look like. This is the only file we hand-edit.
- Dev database (`dev-url`) — an empty, disposable Postgres that Atlas
  uses as a scratch pad to compute diffs. Never point this at
  production.
- Revisions — Atlas records every applied migration in a table
  (`atlas_schema_revisions` by default) inside the target database, so
  it always knows which migrations are still pending.

The generated migrations live in a `migrations/` directory next to
`schema.sql`. You never edit them by hand — if you need a change, you
edit `schema.sql` and regenerate.

## 4. Install Atlas

Atlas is a single binary, used only during development and CI. It never
enters the runtime image. Install with the official script:

```bash
curl -sSf https://atlasgo.sh | sh
```

Arch Linux users can also check the AUR for an atlas package, or
download a release binary from the atlas GitHub releases page. Verify
the install:

```bash
atlas version
```

## 5. Set up the Migration Project

1. Rename `apps/backend/db/init.sql` to `apps/backend/db/schema.sql`.
   Its content becomes the desired state. It already describes the full
   schema, which is exactly what Atlas wants.
2. Create the migrations directory: `apps/backend/db/migrations/`.
3. Decide on your dev database (section 8) — you need its URL for the
   commands below.

The layout afterwards:

```text
apps/backend/db/
├── schema.sql        # the single hand-edited file (source of truth)
├── migrations/       # generated versioned migrations (never hand-edit)
└── connection.ts     # unchanged
```

## 6. Adopt Atlas on the Existing Database

Production already has every table, so we must teach Atlas what is
already applied. Two steps, done once:

Step 1 — generate the baseline migration from `schema.sql`. This uses an
empty dev database and produces a migration that describes the full
schema:

```bash
atlas migrate diff \
  --dir file://apps/backend/db/migrations \
  --to file://apps/backend/db/schema.sql \
  --dev-url "postgres://nishat:nishat004@localhost:5432/credets_dev"
```

Step 2 — mark that migration as already applied on production. Baseline
writes the revision records WITHOUT running the SQL, so nothing is
touched:

```bash
atlas migrate baseline \
  --dir file://apps/backend/db/migrations \
  --url "$DATABASE_URL"
```

Do this once, against the current production database, before any other
change. Verify the baseline was recorded:

```bash
atlas migrate status \
  --dir file://apps/backend/db/migrations \
  --url "$DATABASE_URL"
```

`migrate status` lists applied and pending migrations — after baseline
everything should show as applied. From now on, `atlas migrate apply`
only runs migrations newer than the baseline. On a fresh database
(local or a new staging branch), skip the baseline — apply runs the
initial migration normally.

## 7. The Daily Workflow

Every schema change follows the same loop:

1. Edit `schema.sql` — add the column, table, or constraint you want.
2. Generate a migration:

```bash
atlas migrate diff \
  --dir file://apps/backend/db/migrations \
  --to file://apps/backend/db/schema.sql \
  --dev-url "postgres://nishat:nishat004@localhost:5432/credets_dev"
```

3. Review the generated file (for example `000002_add_column.sql`). It
   should contain exactly the ALTER you intended — nothing more. Pass
   `--edit` to open it in your editor before saving.
4. Apply it to staging first — a Neon branch or the local database:

```bash
atlas migrate apply \
  --dir file://apps/backend/db/migrations \
  --url "postgres://nishat:nishat004@localhost:5432/credets_db"
```

5. Test the app against the migrated database.
6. Commit `schema.sql` and the new migration file together, then
   deploy. CI applies the pending migration to production (section 9).

Because `schema.sql` is the source of truth and migrations are derived
from it, the two can never drift apart. That is the guarantee you asked
for: one file to read, zero scattered hand-written SQL.

## 8. The Dev Database

Atlas needs an empty scratch database for diffs. Two practical options
for us.

### 8.1 Local Postgres Container

You already run Postgres in podman-compose. Create a second, empty
database for Atlas and never seed it:

```bash
psql -h localhost -U nishat -d credets_db -c "CREATE DATABASE credets_dev;"
```

Then use `postgres://nishat:nishat004@localhost:5432/credets_dev` as
the `--dev-url` in the commands above. It only ever holds scratch
schema, so you can drop and recreate it freely.

### 8.2 Neon Ephemeral Branch

For a production-faithful dev database, use a Neon ephemeral branch — an
instant copy-on-write fork of production that costs nothing on the free
tier (up to 10 branches per project):

```bash
npm i -g neon                # the Neon CLI
neon auth login
neon branches create --type=ephemeral --name dev-branch
neon connection-string dev-branch
```

Paste the returned URL into the `--dev-url` flag, and delete the branch
when done. This is the most realistic dev database because it shares the
exact Postgres version of production.

Tip — avoid repeating the dev URL in every command by exporting it once:

```bash
export ATLAS_DEV_URL="postgres://nishat:nishat004@localhost:5432/credets_dev"
```

Atlas picks it up automatically, so `--dev-url` can be dropped from all
the commands above. Add the two atlas commands to root package.json
scripts or the Makefile so the flags stay in one place.

## 9. CI/CD: Apply Migrations on Deploy

Migrations must run automatically before the new backend starts, or the
app breaks (new code, old schema). In the GitHub Actions workflow (see
docs/ci-cd-pipeline.md), add a step that applies pending migrations,
then trigger the Render deploy:

```yaml
- name: Apply migrations
  uses: ariga/atlas-action/migrate/apply@v1
  with:
    dir: file://apps/backend/db/migrations
    url: ${{ secrets.DATABASE_URL }}
```

Add `DATABASE_URL` as a GitHub Actions secret — the Neon connection
string of the production database. Note that this is separate from the
app's own `DB_*` env vars used by connection.ts: the migration step is
the only consumer of `DATABASE_URL`, so it only needs to exist as a
GitHub Actions secret. Optionally lint the migration directory for
destructive changes before applying:

```bash
atlas migrate lint \
  --dir file://apps/backend/db/migrations \
  --dev-url "postgres://nishat:nishat004@localhost:5432/credets_dev"
```

Lint flags data-loss operations (dropped columns, dropped tables) so a
careless migration never reaches production. And remember the CI/CD
double-deploy warning: once CI owns deploys, set `autoDeployTrigger` to
`off` in render.yaml.

## 10. Best Practices and Safety

- Never edit an applied migration. Migration files are immutable
  history; fix a bad change with a new migration.
- One logical change per migration. Small migrations are easy to review
  and easy to reason about.
- Backfill data carefully. Adding a `NOT NULL` column to a table with
  rows needs a DEFAULT or a backfill UPDATE inside the migration.
- Test on staging first. Use a Neon branch so the migration runs against
  a copy of real data, not just an empty database.
- Keep `schema.sql` and the migration in the same commit. The migration
  applies the change; `schema.sql` records the desired end state.
- Additions (new tables, columns, indexes) are safe and cheap. Changes
  that rewrite large tables can lock writes — for our scale, standard
  ALTER statements are fine.

## 11. What Happens to the Old Scripts

- `run-prod-schema.ts` is replaced by `atlas migrate apply`. Keep the
  file for reference, but stop calling it in production.
- `reset-prod-data.ts` stays useful for local and staging resets only —
  it must never run against production again.
- podman-compose mounts `init.sql` into `docker-entrypoint-initdb.d`,
  which runs only on the first volume creation. Once migrations exist,
  remove that mount and build a fresh local database with `atlas migrate
  apply` — then local is built exactly like production.
- Update docs/production.md and docs/staging-workflow.md so their
  "run schema" steps use `atlas migrate apply` instead.

## 12. Resources

```text
Atlas install — https://atlasgo.sh
Atlas docs — https://atlasgo.io
Versioned migrations — https://atlasgo.io/versioned/diff
Apply — https://atlasgo.io/versioned/apply
Dev database concept — https://atlasgo.io/concepts/dev-database
Atlas GitHub Actions — https://atlasgo.io/integrations/github-actions
Neon CLI — https://neon.tech/docs/reference/neon-cli
Neon branches — https://neon.tech/docs/reference/cli-branches
```
