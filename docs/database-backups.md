# Database Backups for Neon — Free Tier, Dump, and Storage

This guide answers a gap in docs/ci-cd-pipeline.md: that pipeline runs
lint, test, build, migrate, and deploy — but it never snapshots the
production data before touching it. This guide teaches you how to dump
your Neon database before any push that changes the schema, where to
store those dumps for free with timestamps, and how to restore them.

## 1. The Short Answer

No, the CI/CD docs did not cover a backup phase. Adding one is a small,
worthwhile habit: dump first, then migrate, then deploy. That way a bad
migration, a bad deploy, or a manual mistake can always be undone from
a file you own — independent of Neon entirely.

## 2. What Neon Gives You for Free

Neon is serverless Postgres with built-in protection. On the free tier:

- Point-in-time recovery — Neon keeps a history window of your data, so
  you can restore to a past moment or branch from past data. The window
  is limited on free; paid plans get longer windows.
- Branches — a branch is a copy-on-write clone of your data. Creating
  one is effectively a snapshot. The free plan allows up to 10 branches
  per project, and inactive branches are auto-archived.
- Logical backups — you can always `pg_dump` the database yourself.

Two important caveats:

- Neon's history and branches live inside Neon. If your Neon account is
  ever lost, banned, or deleted, that protection goes with it.
- The right backup strategy is therefore the one you own: a periodic
  `pg_dump` stored outside Neon, on storage you control. Neon's built-in
  features are convenience, not a substitute.

## 3. The Backup Principle: Dump Before You Touch

The habit you want: every time a push to main is about to change
production data, a fresh dump exists first. Concretely:

1. Dump production to a timestamped file.
2. Upload the file to backup storage.
3. Only then run migrations and deploy.

If the migration breaks, you have a known-good snapshot from moments
ago. This is a cheap insurance policy that never gets in your way.

## 4. The Pg_dump Workflow (Manual)

Dump your production database. The custom format is compressed and is
the recommended format for `pg_dump`:

```bash
pg_dump --format=custom --file=credets-$(date +%Y%m%d-%H%M%S).dump "$DATABASE_URL"
```

The `$DATABASE_URL` is your Neon connection string (the same one you
would use in `psql`). For a human-readable plain-SQL dump you can pipe
through gzip instead:

```bash
pg_dump "$DATABASE_URL" | gzip > credets-$(date +%Y%m%d-%H%M%S).sql.gz
```

Each run produces a uniquely timestamped file — that is the "look it up
anytime" property you asked for.

## 5. A CI/CD Backup Phase

Add a backup step to the pipeline BEFORE the migration step. In the
deploy job from docs/ci-cd-pipeline.md:

```yaml
- name: Backup production database
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    pg_dump --format=custom \
      --file=backup-$(date +%Y%m%d-%H%M%S).dump "$DATABASE_URL"
    ls -lh backup-*.dump
```

Then upload that file to backup storage (section 6) before the migration
step runs. `ubuntu-latest` ships with `pg_dump` and the AWS CLI
preinstalled, so no setup is needed.

You can also run a backup independently of deploys — a separate
`workflow_dispatch` job, or a scheduled workflow (cron) for a nightly
snapshot. The pre-deploy dump protects against bad changes; a nightly
dump protects against gradual data loss and accidents.

## 6. Where to Store Backups for Free

All options below are free-tier capable and S3-compatible, which means
the AWS CLI or rclone can push to them with an endpoint override.

| Storage | Free tier | Egress | Notes |
| --- | --- | --- | --- |
| Supabase Storage | 1 GB | small free allowance | You already use it — zero new accounts |
| Cloudflare R2 | 10 GB | free (zero egress) | S3-compatible, great for downloads |
| Backblaze B2 | 10 GB | free up to 3x storage | S3-compatible |
| GitHub Actions artifacts | 500 MB | n/a | 90-day retention, simple |
| GitHub Releases | per file 2 GiB | n/a | Indefinite, but misuses releases |

Recommendation for this project: **Cloudflare R2 or Backblaze B2** give
the most room (10 GB) with S3 compatibility and free or nearly free
downloads — ideal for storing timestamped dumps you may need to pull
back. If you want zero new accounts, reuse your existing Supabase
Storage bucket with a `backups/` prefix — it already has S3 credentials
in your environment.

Upload example with the AWS CLI (works for R2, B2, and Supabase by
changing the endpoint):

```bash
aws s3 cp backup-20260731-120000.dump \
  s3://credets-backups/ --endpoint-url "$STORAGE_ENDPOINT"
```

## 7. Restore Procedure

Restoring is the reverse of dumping. To a fresh or existing database:

```bash
pg_restore --clean --if-exists \
  --dbname="$DATABASE_URL" backup-20260731-120000.dump
```

For a plain SQL dump that was gzipped, decompress on the fly:

```bash
gunzip -c backup-20260731-120000.sql.gz | psql "$DATABASE_URL"
```

Test your restore occasionally. A backup you have never restored is a
hope, not a plan.

## 8. Retention and Cleanup

Free tiers have limits, so prune old dumps:

- Keep the N most recent backups (for example the last 14).
- Or keep dumps newer than X days and delete the rest.
- With the AWS CLI: `aws s3 ls` to list, `aws s3 rm` to delete.

Do not keep every dump forever — a rolling window of recent snapshots is
what protects you in practice, and it keeps your free tier happy.

## 9. Resources

```text
Neon branching — https://neon.tech/docs/manage/branches
Neon export (pg_dump) — https://neon.tech/docs/guides/export-data
pg_dump docs — https://www.postgresql.org/docs/current/app-pgdump.html
pg_restore docs — https://www.postgresql.org/docs/current/app-pgrestore.html
Cloudflare R2 pricing — https://developers.cloudflare.com/r2/pricing/
Backblaze B2 pricing — https://www.backblaze.com/cloud-storage/pricing
GitHub artifacts — https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts
```
