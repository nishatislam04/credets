# Backend Audit — Credets API

> **Stack:** Bun · TypeScript · PostgreSQL · Zod · S3 (Supabase/MinIO)
> **Architecture:** HTTP → Service → Repository → DB (4-layer)

---

## 1. Architecture Overview

```text
HTTP Layer (routes/controllers)     → Request parsing, validation, response
    ↓
Service Layer                       → Business logic, S3 uploads, image processing
    ↓
Repository Layer                    → Database operations (SQL queries)
    ↓
Database Layer (PostgreSQL via Bun) → Connection pool, raw SQL
```

### 1.1 Directory Layout

```text
apps/backend/
├── index.ts              # Entry point — Bun.serve with route definitions
├── http/                 # Controllers — request handling
│   └── credentials/      #   CRUD + listings + toggle + trash/draft/fav
├── services/             # Business logic
│   └── credentials/      #   Image processing, S3 uploads, encryption
├── repository/           # Database queries
│   └── credentials/      #   SQL operations (tagged templates + sql.unsafe)
├── validation/           # Request validation (Zod)
├── utils/                # Shared utilities
├── err/                  # Error hierarchy (AppError + subclasses)
├── cipher/               # Encryption/decryption
└── db/                   # Connection, schema, seed, reset
```

**✅ Excellent separation of concerns.** Each layer has a single responsibility and is independently
testable.

---

## 2. Layer-by-Layer Analysis

Detailed breakdown of each architectural layer with strengths and recommendations.

### 2.1 HTTP Layer (Controllers)

**Location:** `http/credentials/*.ts`

**How it works:**

- Receives `BunRequest` from Bun's built-in router
- Validates request body size (10MB limit)
- Delegates to `parseAndValidateCredential()` for Zod validation
- Calls service layer
- Catches errors, maps `AppError` to appropriate HTTP response

```ts
// Pattern used across all controllers:
try {
  const result = await someService(input);
  return ResponseFactory.success({ data: result, path: req });
} catch (error) {
  if (error instanceof AppError) {
    return ResponseFactory.error({ error: error.message, type: error.type, status: error.status, path: req });
  }
  return ResponseFactory.error({ error: "An unexpected error occurred", status: 500, path: req });
}
```

**✅ Already doing right:**

- Body size limit prevents abuse
- `AppError instanceof` check replaces fragile string matching
- Consistent error response shape
- CORS + security headers on every response
- OPTIONS preflight handled via `ResponseFactory.preflight()`

**📋 Recommendations:**

1. **Add middleware for logging + timing** — Currently each controller duplicates
`log.info`/`log.error` calls. A wrapper could auto-log:

   ```ts
   function withLogging(handler: Handler, name: string) {
     return async (req: Request) => {
       const start = Date.now();
       const result = await handler(req);
       log.info(`http: ${name} completed`, { duration: Date.now() - start });
       return result;
     };
   }
   ```

2. **Remove stray `logger()` call** — `update.ts` line has `logger(result)` which is a dev-only
debug call left in committed code.

3. **Validate `credentialId` param early** — Some controllers check it, others don't. Standardize:

   ```ts
   if (!credentialId || !isValidUUID(credentialId)) {
     throw new BadRequestError("Invalid credential ID");
   }
   ```

### 2.2 Service Layer

**Location:** `services/credentials/*.ts`

**Responsibilities:**

- Image processing (resize + WebP conversion via Bun Image API)
- S3 uploads (thumbnail + images)
- Data encryption (credential data encrypted before storage)
- Coordination with timeout guard

**✅ Already doing right:**

- `withTimeout()` wrapper prevents hang on free-tier resources
- Image processing is parallelized with `Promise.all`
- Encryption before storage (defense in depth)
- Credential ID generated upfront (enables S3 path construction)
- TypeScript interfaces for all service inputs

**📋 Recommendations:**

1. **Add retry logic for S3 uploads** — S3 operations can fail transiently (especially on Supabase
free tier with cold storage). Add exponential backoff:

   ```ts
   async function uploadWithRetry(key: string, buffer: Uint8Array, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         return await uploadToS3(key, buffer, "image/webp");
       } catch (e) {
         if (i === retries - 1) throw e;
         const delay = Math.min(1000 * 2 ** i, 5000); // exponential backoff: 1s, 2s, 4s
         await sleep(delay);
       }
     }
   }
   ```

   > **Note:** The 30s `withTimeout` wrapper means retries must fit within that budget. With 3
   retries at 1+2+4=7s of sleep, budget is tight — consider reducing image size or increasing
   timeout if retries become necessary.

2. **Consider background image processing** — For large uploads, process images in a background job
instead of blocking the HTTP response.

3. **Extract image processing into its own module** — The service layer mixes business logic with
image processing concerns. A dedicated `images/` service would be cleaner.

### 2.3 Repository Layer

**Location:** `repository/credentials/*.ts`

**Responsibilities:**

- Raw SQL queries via Bun SQL tagged templates
- Transactional operations (using `sql.begin`)
- Type hierarchy resolution (auto-creates missing types)
- Error wrapping (`DatabaseError` for PG errors, `NotFoundError` for missing records)

**✅ Already doing right:**

- All queries are wrapped in transactions (`sql.begin`)
- PG errors are caught and wrapped in `DatabaseError`
- `AppError` subclasses re-thrown, raw errors wrapped
- Proper parameterized queries (most of the time)

**⚠️ Area of concern: `sql.unsafe()` usage**

The `update.ts` repository builds SQL queries via string concatenation:

```ts
const setParts: string[] = [];
// ...
setParts.push(`title = $${idx++}`);
params.push(input.title);
// ...
const updateQuery = `UPDATE credentials SET ${setParts.join(", ")} WHERE id = $${idx}`;
await sql.unsafe(updateQuery, params);
```

While this **is** parameterized (user values go into `params` array, not directly into the string),
the `sql.unsafe()` bypasses Bun SQL's tag-template protection. If any column name or table name is
ever interpolated unsafely, it's an injection vector.

**📋 Recommendations:**

1. **Make `resolveOrCreateTypePath` a shared utility** — It's duplicated in `create.ts` and
`update.ts` with identical code.

2. **Add UUID validation** before using `credentialId` in queries:

   ```ts
   import { validate as isValidUUID } from "uuid";
   if (!isValidUUID(credentialId)) throw new BadRequestError("Invalid UUID");
   ```

3. **Add a comment documenting why `sql.unsafe()` is necessary** — The current comment explains it's
needed because Bun SQL helpers don't work in UPDATE/DELETE context, but a more prominent warning
would help future maintainers.

### 2.4 Database Layer

**Location:** `db/connection.ts`

```ts
export const sql: SQL = new SQL({
  max: 5,              // Good for Neon free tier (max 5 connections)
  idleTimeout: 10,     // Quick cleanup on deploy
  maxLifetime: 1800,   // Rotate connections every 30 min
  connectionTimeout: 5, // Fail fast
  tls: process.env.DB_TLS === "true",
});
```

**✅ Already doing right:**

- Connection pool size tuned for free-tier limits
- TLS configurable via env var (enabled in production)
- Idle timeout prevents zombie connections
- Max lifetime rotates connections regularly

**📋 Recommendations:**

1. **Add health check SQL at startup** — Verify DB connectivity before accepting requests:

   ```ts
   await sql`SELECT 1`; // Already done in /healthz
   ```

   Consider doing this in the server startup as well, and failing fast if DB is unreachable.

2. **Consider connection retry** — For Neon's cold-start (serverless DB), a retry with backoff would
make the first request after idle more reliable.

#### ⚠️ idleTimeout Collision Warning

`Bun.serve({ idleTimeout: 35 })` in `index.ts` closes HTTP connections idle for 35 seconds. The
service layer wraps long operations in `withTimeout(30_000)` which fires at 30 seconds. These are
**dangerously close** — if the app's 30s timeout guard and Bun's 35s idleTimeout race, Bun may
close the connection before the error response is sent, causing a connection reset from the user's
perspective.

**Fix:** Increase `Bun.serve` `idleTimeout` to **60**:

```ts
Bun.serve({
  idleTimeout: 60, // Was 35 — needs room above the 30s service timeout
  // ...
});
```

**Why this matters:** If the connection drops before the timeout guard returns, the user gets a
network error instead of a well-formed 408/503 JSON response with a helpful message.

---

## 3. Error Handling

Typed error hierarchy used throughout the backend.

### 3.1 Error Hierarchy

```text
AppError (base class)
├── NotFoundError          (404)
├── BadRequestError        (400)
├── ConflictError          (409)
├── ForbiddenError         (403)
├── UnauthorizedError      (401)
├── ValidationError        (422)
├── DatabaseError          (500/409/400 — PG code-dependent)
├── InternalError          (500)
├── TooManyRequestError    (429)
└── ServiceUnavailableError (503)
```

**✅ Excellent design.** Typed errors carry status + type + message, eliminating fragile string
matching in controllers.

**📋 Recommendations:**

1. **Add `error.cause`** — Chain original errors:

   ```ts
   throw new DatabaseError(error, { cause: error });
   ```

2. **Consider adding a request ID** — Include a `requestId` in every error response for tracing:

   ```ts
   // In base error class:
   this.requestId = crypto.randomUUID();
   ```

---

## 4. Security Analysis

Current security protections and improvement areas.

### 4.1 Current Protections

| Protection | Status | Notes |
| ----------- | -------- | ------- |
| **CORS** | ✅ Scoped to `FRONTEND_APP` origin | Prevents cross-origin abuse |
| **CSRF** | ✅ Token-based | Generated per-form, validated on mutations |
| **Input validation** | ✅ Zod schemas | Validates shape + types |
| **Body size limit** | ✅ 10MB | Prevents memory exhaustion |
| **SQL injection** | ✅ Mostly parameterized | `sql.unsafe()` is a risk surface |
| **Encryption at rest** | ✅ Cipher layer | Credential data encrypted before DB |
| **Security headers** | ✅ HSTS, XFO, CT, RP, PP | Defense in depth |
| **Session management** | ✅ Cookie-based httpOnly | No session in current code (single user) |
| **Rate limiting** | ❌ Not implemented | `TooManyRequestError` class exists but unused |

### 4.2 Recommendations

1. **Implement rate limiting** — The `TooManyRequestError` class exists but no middleware uses it.
Add IP-based rate limiting for create/update/delete endpoints.

2. **Add request logging with correlation IDs** — Each request should carry a unique ID that
propagates through all log messages for debugging.

3. **Review `sql.unsafe()` thoroughly** — Every call site needs eyes-on verification that user input
NEVER ends up in query structure (only in parameter array).

4. **Add input size limits to Zod schemas** — Currently there's no `max()` constraint on string
fields. Long strings could still be sent even if body size is capped.

---

## 5. Logger Assessment

Structured logging system with dev and production modes.

### 5.1 Current Setup

- `log.info/warn/error` — structured JSON in prod, colorful in dev
- `logger()` — dev-only debug logger (⚠️ should NOT be in committed code)
- `logAlways()` — always-on colorful output (for startup only)

**✅ Already doing right:**

- Production JSON output is parseable by log aggregators
- Error meta follows Elastic Common Schema conventions
- Scope prefixes (`http:`, `service:`, `repo:`, `storage:`) make log filtering easy
- Caller info extraction aids debugging

**📋 Recommendation:** Remove the `logger()` call from `http/credentials/update.ts` — it's a dev
debug call that will produce noisy output in production.

---

## 6. Cipher Module

**Location:** `apps/backend/cipher/`

- `encrypt.ts` — Encrypts credential data before storage
- `decrypt.ts` — Decrypts data on read

**✅ Already doing right:**

- Proper use of AES encryption for sensitive credential data
- Encryption happens before DB write (defense in depth)
- Decryption on read — plaintext never stored
- Separate key management (`key.ts`) isolates crypto material

**📋 Recommendations:**

1. **Add key rotation support** — Store a key version alongside the data so you can rotate keys
without re-encrypting all existing records at once:

   ```ts
   interface EncryptedData {
     version: number;
     iv: string;
     data: string;
   }
   ```

2. **Add a `decrypt` method to the repository layer** — Currently decryption happens at the service
layer. For audit logging or search indexing, a repository-level decrypt wrapper could centralize
access patterns.

---

## 7. Zod V4 Usage Notes

The project uses **Zod v4** (`^4.4.3`) which has significant improvements over v3:

### Key V4 Features to Leverage

1. **`z.output<>` type inference** — Instead of duplicating types in `shared-types`, derive them
directly from schemas:

   ```ts
   // shared-schema/src/credentials/create.ts
   export const createCredentialSchema = z.object({ title: z.string(), ... });
   export type CreateCredential = z.output<typeof createCredentialSchema>;

   // shared-types/src/credentials/create.ts — may be redundant if you export from schema!
   ```

2. **`z.input<>` for form defaults** — Zod v4's input/output distinction:

   ```ts
   // Input type (what the user submits) — may allow partial/transformed values
   type FormInput = z.input<typeof schema>;
   // Output type (what passes validation) — fully resolved
   type ValidatedData = z.output<typeof schema>;
   ```

3. **Zod v4 error format** — Zod v4 changed error shaping slightly. The project uses a custom
`formatZodError` utility — ensure it's tested against v4's error structure.

### ⚠️ Migration Note

Zod v4 is not backward-compatible with v3 in some edge cases (e.g., `z.unknown()` returns
`unknown` instead of `any`). Verify all schemas still validate correctly after any version bump.

---

## 8. What You're Already Doing Well

| Practice | Why It Matters |
| ---------- | --------------- |
| **4-layer architecture** | Clear separation of concerns, testable in isolation |
| **Typed error hierarchy** | Eliminates fragile string matching, enables typed error handling |
| **Encryption at rest** | Credential data encrypted before hitting the database |
| **Timeout guards** | Prevents hung requests on free-tier infrastructure |
| **Structured logging** | JSON in production = parseable by log aggregators |
| **Zod validation** | Server-side validation matches frontend schemas via shared package |
| **S3 key convention** | Predictable object key structure (`credentials/{id}/...`) |
| **Database connection tuning** | Pool settings optimized for Neon free tier |
| **CSRF + CORS combo** | Defense against both same-site and cross-site attacks |
| **Health check with DB ping** | Guarantees DB is reachable before routing traffic |

---

## 9. Quick Wins (By Priority)

1. **Remove `logger()` from `update.ts`** — Stray dev-only debug call
2. **Deduplicate `resolveOrCreateTypePath`** — Identical code in create.ts and update.ts
3. **Fix idleTimeout collision** — Change `idleTimeout: 35` to `idleTimeout: 60` in `index.ts`
4. **Add UUID validation** for credentialId params
5. **Add rate limiting middleware** — The error class exists, just wire it up
6. **Document `sql.unsafe()` reasoning** with a prominent warning comment
7. **Add request correlation IDs** — Makes log debugging much easier
