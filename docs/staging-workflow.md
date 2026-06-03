# Staging Workflow — Local Testing + Neon Branching

> **Goal:** Test backend changes safely without deploying to Render's production service.
> **Cost:** \$0 — everything in this guide uses free-tier features you already have.

## How It Works

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Your code   │ ──> │  Local staging   │ ──> │  Render prod │
│  (dev branch)│     │  backend (port   │     │  (auto-deploy│
│              │     │  8000) + Neon    │     │  on push)    │
│              │     │  branch DB       │     │              │
└─────────────┘     └──────────────────┘     └──────────────┘
     edit              test locally             push to dev
```

---

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
3. Copy the connection string — it looks like:
   ```
   postgres://user:pass@ep-staging-branch.us-east-2.aws.neon.tech/credets_db
   ```
4. Parse out the values:
   - `DB_HOST` = `ep-staging-branch.us-east-2.aws.neon.tech`
   - `DB_PORT` = `5432`
   - `DB_USER` = the part before `:` in the credentials
   - `DB_PASSWORD` = the part between `:` and `@`
   - `DB_NAME` = `credets_db`

## Step 3 — Set Up the Staging Env File

```bash
cp .env.staging.example .env.staging
```

Edit `.env.staging` with the Neon branch values from Step 2. Keep the same `ENC_KEY` and `CSRF_SECRET_KEY` as production (you're testing the app, not the encryption).

## Step 4 — Run Schema Migration on Staging DB

Your staging branch is a fresh copy but might not have the latest schema. Run the migration:

```bash
bun --env-file=.env.staging apps/backend/db/run-prod-schema.ts
```

This creates any missing tables/columns. It's safe to run multiple times.

## Step 5 — Seed Data (Optional)

If you want test data in the staging branch:

```bash
bun --env-file=.env.staging apps/backend/db/seed.ts
```

## Step 6 — Start the Staging Backend

```bash
bun run dev:backend:staging
```

This starts the backend on `http://localhost:8000` using your staging DB.

You should see:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LOG  server started

  { port: "8000", env: "development" }
```

## Step 7 — Test Your Changes

Now you can make changes to your backend code and test them:

- Edit code in `apps/backend/`
- The dev server auto-restarts on file changes (`--watch` flag)
- Test endpoints via curl, browser, or the frontend

**Test example — create a credential:**

```bash
curl http://localhost:8000/healthz
# → { "success": true, "data": { "status": "ok" } }

curl http://localhost:8000/get-csrf
# → { "success": true, "data": { "token": "..." } }
```

## Step 8 — When You Break Something (You Will)

Since you're on a Neon branch, nothing is permanent:

- **Reset the branch:** Neon Console → Branches → `staging` → **Reset to parent** — this completely wipes the branch and re-copies production data
- **Delete the branch:** Just delete it and create a new one
- **No impact on production:** Production data is untouched

## Step 9 — Push When Ready

Once everything works locally:

```bash
git add .
git commit -m "your changes"
git push origin dev
```

Render auto-deploys to production (via `render.yaml` blueprint).

---

## Quick Reference

### One-time setup (do this once per staging session)

```bash
# 1. Create Neon branch + get connection string
# 2. Set up env file
cp .env.staging.example .env.staging
# 3. Edit .env.staging with Neon branch values
# 4. Run migration + seed
bun --env-file=.env.staging apps/backend/db/run-prod-schema.ts
bun --env-file=.env.staging apps/backend/db/seed.ts
```

### Daily workflow (repeat as needed)

```bash
bun run dev:backend:staging    # Start staging backend
# ... edit code, test, fix, repeat ...
git push origin dev            # Ship to production
```

### Reset staging DB (when you want a fresh start)

```bash
# Option A — Neon Console: Branches → Reset to parent
# Option B — Re-run seed
bun --env-file=.env.staging apps/backend/db/reset-prod-data.ts
bun --env-file=.env.staging apps/backend/db/seed.ts
```

---

## Why This Works

| Concern | How it's handled |
|---------|------------------|
| **No production data risk** | Neon branch is an isolated copy |
| **No Render instance hours** | Running locally uses zero Render resources |
| **Same env as production** | Dockerfile build + same env vars |
| **Free** | Neon branching is free, local dev is free |
| **Fast iteration** | `--watch` flag auto-restarts on changes |
