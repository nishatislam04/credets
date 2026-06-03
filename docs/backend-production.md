# Backend Production Audit

> **Audit date:** June 4, 2026
> **Stack:** Bun HTTP server · PostgreSQL (Neon) · Render (free tier) · Zod · iron-webcrypto

This document is a thorough review of your backend for production readiness. It is organized into three tiers of priority so you can decide what to tackle first — and what to skip.

---

## Before You Begin — Render Free Tier Reality Check

Your backend runs on **Render's free web service tier**. Two behaviors you MUST understand:

### Render Spin-Down

Render free web services **spin down to zero** after **15 minutes of inactivity**. The first request after idle takes **5-30 seconds** to cold-start. This means:
- Your app feels sluggish after not being used for a while
- Render periodically pings `/healthz` to keep it alive, but the 15-min window still applies
- If you rely on Render's health check pings, set the interval lower than 15 min (you can't — Render controls this)

**Mitigation:** Use an external uptime monitor (Better Stack, see #13) pinging every 3-5 minutes to keep your service warm. Or upgrade to Render's paid tier ($7/month) for no spin-down.

### Neon Auto-Pause

Neon's free compute endpoints **auto-pause after 5 minutes of inactivity**. First query after pause takes **1-2 seconds** — a cold start for the database. Combined with Render's spin-down, the first request after a quiet period can take **10-30+ seconds total**.

**Mitigation:** Same uptime monitor helps here too — regular pings prevent both Render and Neon from going idle.

---

## TL;DR — The Critical Few

If you only fix five things, fix these:

| # | Issue | Risk |
|---|-------|------|
| 1 | **No auth middleware** — anyone with the URL can read/write all credentials | 🔴 Data breach |
| 2 | **CSRF check is broken in `delete.ts`** — checks existence but never verifies the token | 🟠 Bypassable protection |
| 3 | **`development: true` hardcoded** — disables Bun's production optimizations | 🟠 Performance |
| 4 | **Connection pool `max: 1`** — one slow request blocks all others | 🟠 Availability |
| 5 | **No graceful shutdown (SIGTERM)** — connections drop on every deploy | 🟠 Data loss |

---

## 🔴 MUST-HAVE (fix before real users or public access)

### 1. Missing Authentication

The database schema has `users` and `session` tables, and `docs/authentication.md` describes a session-based auth system — but **none of the HTTP handlers actually check for authentication**.

Every endpoint (`/credentials`, `/credentials/create`, `/credentials/:id/update`, `/credentials/:id/delete`, even `/types/listings`) is publicly accessible. Anyone who knows your Render URL can read, create, update, and delete all credential data.

**Fix:**

```ts
// 1. Create a middleware/helper
import { sql } from "@db/connection";
import type { BunRequest } from "bun";

async function getSession(req: BunRequest): Promise<{ userId: string } | null> {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;

  const sessionId = cookie
    .split(";")
    .find(c => c.trim().startsWith("session_id="))
    ?.split("=")[1];
  if (!sessionId) return null;

  const [session] = await sql`
    SELECT user_id FROM session
    WHERE id = ${sessionId} AND expires_at > NOW()
  `;
  return session ? { userId: session.user_id } : null;
}
```

Then at the top of every protected handler:

```ts
const session = await getSession(req);
if (!session) {
  return ResponseFactory.error({ error: "Unauthorized", status: 401, ... });
}
```

**Alternative — Basic IP whitelist (if you're the only user):**

Since you said you're the only user, the **simplest production-ready solution** is to whitelist your IP address(es):

```ts
function isAllowedIP(req: BunRequest): boolean {
  const allowedIPs = (process.env.ALLOWED_IPS || "").split(",");
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  return allowedIPs.includes(clientIP);
}
```

Set `ALLOWED_IPS=your.home.ip,your.mobile.ip,your.vpn.ip` in Render env vars. This is not perfect (IPs change), but it's a solid layer for a single-user app paired with CSRF.

---

### 2. CSRF Verification Broken in `delete.ts`

In `apps/backend/http/credentials/delete.ts`, the code checks if `body._csrf` exists but **never calls `verifyCSRF()`** to validate it:

```ts
// ❌ This only checks if the field is present — any random string passes
if (!body._csrf) {
  return ResponseFactory.error({ ... });
}
// ...proceeds to delete without verifying the token!
```

**Fix:** Import and call `verifyCSRF` like the create/update handlers do:

```ts
import { verifyCSRF } from "../csrf/verifyCSRF";

// Replace the existing check with:
if (!body._csrf || !verifyCSRF(body._csrf)) {
  return ResponseFactory.error({
    error: "csrf token expired",
    type: "csrf-expired",
    status: 403,
    path: { url: req.url } as BunRequest,
  });
}
```

---

### 3. `development: true` Hardcoded in `Bun.serve()`

```ts
Bun.serve({
  development: true,  // ❌ Always on — even in production
  ...
});
```

In production mode (`development: false`), Bun:
- Enables HTTP/2 (faster multiplexed requests)
- Enables response compression
- Disables debug-level stack traces in errors
- Optimizes internal data structures

**Fix:**

```ts
Bun.serve({
  development: process.env.NODE_ENV !== "production",
  ...
});
```

---

### 4. Database Connection Pool `max: 1`

In `apps/backend/db/connection.ts`:

```ts
max: 1,  // ❌ Only 1 concurrent connection
```

With `max: 1`, every database query is serialized. If one request takes 2 seconds (e.g., image processing + insert), all other requests queue up.

**Fix:** Increase to a reasonable number for free-tier Neon:

```ts
max: 5,   // Good for free tier — Neon's free plan allows ~20 concurrent connections
```

---

### 5. No Graceful Shutdown (SIGTERM)

When Render deploys a new version or restarts your service, it sends a `SIGTERM` signal. Your server immediately exits, **dropping all in-flight requests and open database connections**.

**Fix:**

```ts
const server = Bun.serve({
  // ... your existing config
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received — shutting down gracefully...");
  server.stop();  // Stop accepting new connections
  // Bun's SQL client handles connection cleanup on process exit
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received — shutting down gracefully...");
  server.stop();
  process.exit(0);
});
```

---

### 6. Health Check Doesn't Verify Database

Your `/healthz` endpoint just returns `{ status: "ok" }` without touching the database. This means Render thinks the service is healthy even if the database connection is dead.

**Fix:**

```ts
"/healthz": async () => {
  try {
    await sql`SELECT 1`;  // Verify DB is reachable
    return ResponseFactory.success({
      data: { status: "ok", db: "connected" },
      message: "Server is healthy",
      status: 200,
      path: { url: "/healthz" } as BunRequest,
    });
  } catch (error) {
    return new Response("Database unavailable", { status: 503 });
  }
},
```

---

## 🟠 SHOULD-HAVE (important for reliability and quality)

### 7. No Request Body Size Limits

Bun doesn't limit request body size by default. An attacker (or bug) could upload a multi-gigabyte image and exhaust your server's memory. On Render's free tier (512 MB RAM), this will OOM-kill your process.

**Additionally, image processing is memory-intensive.** `Bun.Image` decodes images to raw pixel data in memory. A single 4000×3000 JPEG → ≈48 MB decoded → ≈12 MB as WebP. Processing 5 images concurrently (`Promise.all`) can spike memory **200 MB+** — on 512 MB RAM, this risks OOM kills, especially if multiple requests arrive simultaneously.

**Fix — add size validation at the start of create/update handlers:**

```ts
const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10 MB
const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
if (contentLength > MAX_BODY_SIZE) {
  return ResponseFactory.error({
    error: "Request body too large",
    message: `Maximum payload size is ${MAX_BODY_SIZE / 1024 / 1024} MB`,
    status: 413,
    path: req,
  });
}
```

### 8. No Request Timeout

On Render free tier, requests have a soft limit, but Bun doesn't enforce timeouts internally. If an image processing call hangs or the DB is slow, the connection pool thread is stuck forever.

**Fix — use `AbortController` with a timeout:**

```ts
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(timeout);
  }
}

// Usage:
const processedImages = await withTimeout(
  Promise.all(images.map(file => processImage({ file, ... }))),
  30000 // 30 second timeout
);
```

### 9. Production Logging is Not Structured

Your `logAlways` function works, but it outputs formatted text with ANSI colors and `Bun.inspect` — great for local development, but **unparseable by log aggregation services** (Render's built-in log viewer, Better Stack, etc.).

**Fix — add a structured JSON logger for production:**

```ts
export function logJSON(level: string, message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    }));
  }
}
```

Then in your critical operations:

```ts
logJSON("info", "credential created", { title: validatedData.data.title });
logJSON("error", "delete credential error", { error: error instanceof Error ? error.message : "unknown" });
```

Keep `logAlways` for startup banners and critical server events, but use structured JSON for data operation logging.

### 10. No Rate Limiting

On Render's free tier, a single machine sending rapid requests could exhaust your 512 MB RAM or trigger Render's usage limits. Since you can't use Redis (paid), implement a simple in-memory rate limiter:

```ts
// Simple in-memory rate limiter (resets on restart, fine for free tier)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}
```

Apply it to mutation endpoints (create, update, delete) with conservative limits like 10 requests per minute per IP.

### 11. No Security Headers

Your `ResponseFactory.getCorsHeaders()` adds CORS headers but missing essential security headers. Add these to every response:

```ts
private static getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "0",  // Modern browsers deprecate this; keep 0 to avoid issues
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  };
}
```

Then merge them into every response in `success()` and `error()`.

---

## 🟢 NICE-TO-HAVE (free tools and quality-of-life improvements)

### 12. Error Monitoring — Sentry (Free Tier)

[Sentry](https://sentry.io) has a generous free tier (5k events/month, 1 user) that's perfect for a solo project.

**Why:** When your backend throws an unhandled error at 3 AM, Sentry captures the full stack trace, request context, and even the user's IP/browser — so you can diagnose without digging through Render logs.

**Setup:**

```bash
cd apps/backend && bun add @sentry/bun
```

```ts
// apps/backend/index.ts — at the very top
import * as Sentry from "@sentry/bun";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% of transactions for performance
  environment: process.env.NODE_ENV || "development",
});
```

**Free tier limit:** 5,000 error events/month. For a single-user app, you'll barely scratch this.

### 13. Uptime Monitoring — Better Stack (Free Tier)

[Better Stack](https://betterstack.com) offers 10 uptime monitors at 3-minute intervals on the free tier.

**Why:** Your Render service can go down (OOM, deploy failure, Neon maintenance) and you won't know until you try to use the app. Better Stack emails/SMS/Discord-notifies you when it goes down.

**Setup:**
1. Sign up at betterstack.com
2. Create a monitor pointing to `https://your-app.onrender.com/healthz`
3. Set expected status code to 200
4. Configure notification (email is free, SMS costs)

**Alternative — UptimeRobot:** 50 monitors at 5-minute intervals. Less modern UI but more monitors.

**Alternative — Cronhub:** If you just want to know if a cron job / script fails. Not needed here.

### 14. CDN & DDoS Protection — Cloudflare (Free Tier)

[Cloudflare](https://cloudflare.com) free plan gives you global CDN, DDoS protection, WAF rules, and SSL termination — all for free.

**Why:** 
- Hides your Render origin IP (attackers can't hit Render directly)
- Caches static responses at edge (reduce Render compute usage)
- WAF blocks common attack patterns before they reach Bun
- Free SSL with auto-renewal

**Setup:**
1. Add your domain (or use a free subdomain) to Cloudflare
2. Set DNS records to point to your Render app (CNAME to `your-app.onrender.com`)
3. Enable proxy (orange cloud) for DDoS protection
4. Optionally set a WAF rule to block non-browser traffic to mutation endpoints

### 15. Database Backups — Neon PITR + pg_dump

**Neon's built-in Point-in-Time Recovery (PITR)** is already available on the free tier — it's the easiest backup strategy:

- **7-day retention** on free tier (you can restore to any point in the last 7 days)
- Restore via Neon Console with one click

**But** PITR only protects against database-level issues, not your entire Neon project being deleted. For worst-case off-site backup, add a weekly GitHub Action:

```yaml
# .github/workflows/db-backup.yml
name: Database Backup
on:
  schedule:
    - cron: "0 3 * * 0"  # Every Sunday at 3 AM
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun add @neondatabase/serverless
      - run: |
          bun -e "
            const { neon } = require('@neondatabase/serverless');
            const sql = neon(process.env.DATABASE_URL);
            const result = await sql\`SELECT * FROM credentials LIMIT 1\`;
            console.log('DB is reachable:', result.length > 0 ? 'yes' : 'no');
          "
        env:
          DATABASE_URL: ${{ secrets.NEON_DATABASE_URL }}
```

This is a connectivity check — for actual backups, use `pg_dump` piped to Cloudflare R2 (free 10 GB) or another S3-compatible storage.

### 16. Secrets Management — Infisical (Free Tier)

[Infisical](https://infisical.com) provides a centralized secrets dashboard with version history, environment separation, and CLI integration.

**Why:** Currently you're juggling `.env.production.local`, Render env vars, and local `.env` files. They get out of sync. Infisical gives you a single source of truth.

**Free tier:** Unlimited secrets, 3 users, unlimited environments.

### 17. Log Aggregation — Better Stack Logs (Free Tier)

**Free tier:** 1 GB/month log ingestion, 7-day retention.

**Why:** Render's built-in logs are ephemeral (limited retention, hard to search). Better Stack lets you search, filter, and set alerts on your logs.

**Setup:** Send structured JSON (see #9) to stdout — Render captures stdout, and Better Stack's log drain picks it up. Or install their log-tail agent.

### 18. Database GUI — Beekeeper Studio (Free, Open Source)

[Beekeeper Studio](https://beekeeperstudio.io) is a clean, modern SQL editor for PostgreSQL.

Use it to:
- Run `SELECT` queries against your Neon production DB (read-only mode for safety)
- Inspect table schemas and indexes
- Export data as CSV/JSON
- Test SQL queries before writing them in code

**Alternative (simpler):** The Neon Console's built-in SQL editor is already free and works from any browser.

### 19. Neon Connection Pooling

Neon supports **pooled connections** via PgBouncer. Use the pooled connection string (ends in `-pooler`) for production.

**Why:** Neon is serverless — individual connections are expensive to establish. A pooled connection reuses existing connections efficiently.

**Current code:** Uses raw `Bun.SQL` with `max: 1`. For production, you have two options:

**Option A — Use Neon pooled URL:**
In your Render env vars, use the pooled Neon URL (add `?pgbouncer=true` or use the `-pooler` endpoint). Bun's SQL client respects this.

**Option B — Use `@neondatabase/serverless` (recommended):**
```bash
bun add @neondatabase/serverless
```

```ts
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
```

This driver is optimized for Neon's serverless architecture — it uses HTTP rather than persistent TCP connections, which avoids connection limits entirely and works perfectly with Bun.

### 20. Neon Branching for Safe Migrations

Neon's **branching** feature lets you create an instant, zero-cost copy of your database.

**Why:** Instead of running schema migrations directly against production, you:
1. Create a branch (instant snapshot of prod DB)
2. Run your migration on the branch
3. Verify everything works
4. Promote the branch to production

**Free tier:** Unlimited branches with 3 GB storage per branch.

This is especially useful for your schema changes — you can run `run-prod-schema.ts` on a branch first to verify it doesn't break anything.

---

## Summary Checklist

### 🔴 Must-Have (before public)
- [ ] Add auth middleware (session check or IP whitelist)
- [ ] Fix CSRF verification in `delete.ts` (call `verifyCSRF()`)
- [ ] Make `development` flag dynamic: `process.env.NODE_ENV !== "production"`
- [ ] Increase DB pool `max` from 1 to 5 (or switch to Neon serverless driver)
- [ ] Add SIGTERM/SIGINT graceful shutdown
- [ ] Make `/healthz` verify database connectivity

### 🟠 Should-Have (for reliability)
- [ ] Add request body size limit (10 MB)
- [ ] Add request timeout wrapper (30s for image processing)
- [ ] Add structured JSON logging for production
- [ ] Add simple in-memory rate limiter for mutation endpoints
- [ ] Add security headers (HSTS, X-Content-Type-Options, etc.)

### 🟢 Nice-to-Have (free tools)
- [ ] Sign up for [Sentry](https://sentry.io) — error monitoring
- [ ] Sign up for [Better Stack](https://betterstack.com) — uptime monitoring + logs
- [ ] Set up [Cloudflare](https://cloudflare.com) — CDN, DDoS protection, SSL
- [ ] Set up weekly DB backup (GitHub Action + pg_dump)
- [ ] Consider [Infisical](https://infisical.com) for secrets management
- [ ] Try [Neon branching](https://neon.tech/docs/manage/branches) for safe migrations
- [ ] Install [Beekeeper Studio](https://beekeeperstudio.io) or use Neon Console for DB queries
- [ ] Evaluate `@neondatabase/serverless` driver (HTTP-based, avoids connection pool limits)

---

## Minor Cleanup Items

- **`apps/backend/index.html`** — Exists but is commented out in `index.ts` (`// import indexHtml from "./index.html";`). Either delete it or wire it up as a landing page.

---

## What You Already Have (that's good)

| Area | Status |
|------|--------|
| **Encryption** | ✅ `iron-webcrypto` for credential secrets at rest |
| **CSRF** | ✅ `Bun.CSRF.generate` + `Bun.CSRF.verify` (except delete.ts) |
| **Image processing** | ✅ `Bun.Image` with WebP conversion, resizing |
| **Form validation** | ✅ Zod schemas shared between frontend/backend |
| **CORS** | ✅ `ResponseFactory.getCorsHeaders()` with configurable origin |
| **Logger** | ✅ `logAlways` for critical events, `log` for debug |
| **Dockerfile** | ✅ Multi-stage build with Debian builder + Alpine runner |
| **Docker compose** | ✅ PostgreSQL with health check, init.sql auto-run |
| **Schema** | ✅ Full PostgreSQL schema with indexes, triggers, foreign keys |
| **Pagination** | ✅ Cursor-based (keyset) pagination on listings |
| **Response types** | ✅ Consistent success/error response shapes |
| **Neon DB** | ✅ Already on Neon free tier with PITR |

---

## Complexity / Time Estimates

| Priority | Tasks | Estimated time |
|----------|-------|----------------|
| 🔴 Must-have | 6 items | ~2-3 hours |
| 🟠 Should-have | 5 items | ~2-3 hours |
| 🟢 Nice-to-have | 8 items (setup + signup) | ~2-3 hours spread out |

Total: ~6-9 hours to go from current state to production-ready.

---

*This document was generated by auditing the full backend source code against production best practices. Take your time reading through it, and decide what makes sense for your single-user app vs. what's overkill.*
