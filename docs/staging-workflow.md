# Staging Workflow — Local Testing + Neon Branching

this is the staging guide. so that we can feel production here in local environment!

## Step 1 — Create a Neon Branch (One Time)

Neon lets you create an instant copy of your production database for free.

1. Go to [neon.tech](https://neon.tech) → your project → **Branches** tab
2. Click **Create branch**
3. Name it: `staging`
4. Source: `main` (your production branch)
5. Click **Create**

You now have a full copy of your production data.
Any changes you make on this branch won't affect production database.

## Step 2 — Get the Branch Connection Details

1. In Neon Console, select your `staging` branch
2. Go to **Connection Details**
3. Copy the connection string
4. update all env in
    - `.env.staging`
    - `apps/backend/.env.staging`
    - `apps/frontend/.env.staging`

## Step 3 — Set up the Staging Env File

```bash
cp .env.staging.example .env.staging
cd apps/backend/.env.staging.example apps/backend/.env.staging
cd apps/frontend/.env.staging.example apps/frontend/.env.staging
```

update `neon-connection-string` in /root & /backend `.env.staging`

## Step 4 - Run Data Destruction If Needed (Optional)

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

## Step 6 - Stop All Development Servers and Stuffs

1. docker compose
2. backend local dev server
3. frontend local dev server

## Step 6 - the Actual Sauce

```bash
bun run staging
```

## Step 7 - Access the App

```bash
http://localhost:3000
```

This `staging` command will build `frontend` and preview it locally
and fire up backend server with staging environment
and start docker compose for Minio

## Thats a Wrap BABY
