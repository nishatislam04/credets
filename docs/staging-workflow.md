# Staging Workflow — Local Testing + Neon Branching

## Step 1 — Create a Neon Branch

Neon lets you create an instant copy of your production database for free.

1. Go to [neon.tech](https://neon.tech) → your project → **Branches** tab
2. Click **Create branch**
3. Name it: `staging`
4. Source: `main` (your production branch)
5. Click **Create**

You now have a full copy of your production data. Any changes you make here won't affect production.

## Step 2 — Get the Branch Connection Details

1. In Neon Console, select your `staging` branch
2. Go to **Connection Details**
3. Copy the connection string
4. update all env in
	- `.env.staging`
	- `apps/backend/.env.staging`
	- `apps/frontend/.env.staging`

## Step 3 — Set Up the Staging Env File

```bash
cp .env.staging.example .env.staging
cd apps/backend/.env.staging.example apps/backend/.env.staging
cd apps/frontend/.env.staging.example apps/frontend/.env.staging
```

update `neon-connection-string` in /root & /backend `.env.staging`

## step 4 - Run data destruction if needed [optional]

in case you want to delete all the data in staging branch db

```bash
bun --env-file=.env.staging apps/backend/db/reset-prod-data.ts
```

## Step 4 — Run Schema Migration on Staging DB

```bash
bun --env-file=.env.staging apps/backend/db/run-prod-schema.ts
```

## Step 5 — Seed Data (Optional)

```bash
bun --env-file=.env.staging apps/backend/db/seed.ts
```

## step 6 - The actual Sauce

```bash
bun run staging
```

This `staging` command will build `frontend` and preview it locally and fire up backend server with staging environment and start docker compose for Minio

## Thats a wrap BABY
