# Root Project Audit — Credets Monorepo

> **Stack:** Bun · TypeScript · Biome · Podman · Render
> **Scope:** Root project structure, tooling, package management, CI/CD, deployment

---

## 1. Monorepo Architecture

Overview of the monorepo setup, workspace layout, and shared packages.

### 1.1 Workspace Layout (Bun Workspaces)

```text
credets/
├── apps/
│   ├── backend/       @credets/backend    (Bun + SQL)
│   └── frontend/      @credets/frontend   (Vite + React + TanStack)
├── packages/
│   ├── shared-schema/ @credets/shared-schema  (Zod schemas)
│   ├── shared-types/  @credets/shared-types   (TypeScript types)
│   └── shared-utils/  @credets/shared-utils   (utilities — early stage)
└── package.json       (root workspace config)
```

**✅ Already doing right:**

- Shared packages for schemas and types keeps backend/frontend in sync
- Workspace protocol (`workspace:*`) resolves dependencies locally
- Catalog (`catalog:`) pins shared versions (zod, TypeScript) across all workspaces

**📋 Recommendations:**

| Area | Current | Recommended |
| ------ | --------- | ------------- |
| **Build orchestration** | Manual `bun run` commands | Turborepo or Bun's built-in `bun run --filter` with dependency graph |
| **Shared utilities** | `shared-utils` is empty/minimal | Move logger, error formatters, and date utils here |
| **Shared schemas** | Works well | Add Zod output types via `z.output<>` instead of duplicating in `shared-types` |
| **Bun linker** | `linker = "isolated"` | Good for monorepos — keeps each package's deps isolated |

---

## 2. TypeScript Configuration

TypeScript compiler options, strictness, and path mappings.

### 2.1 Root `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "Preserve",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": false,        // ✅ Intentional — too noisy for active dev
    "noUnusedParameters": false,    // ✅ Intentional
    "verbatimModuleSyntax": true,   // ✅ Forces type-only imports
    "paths": {
      "@credets/shared-*": ["./packages/shared-*/src/*"],
      "@backend/*": ["./apps/backend/*"],
      "@db/*": ["./apps/backend/db/*"]
    }
  }
}
```

**✅ Already doing right:**

- `strict: true` catches null/undefined issues
- `noUncheckedIndexedAccess` prevents unsafe array access
- `verbatimModuleSyntax` enforces clean import hygiene
- `Preserve` module keeps ESM semantics
- `bundler` resolution matches Vite/Bun expectations

**📋 Recommendations:**

1. **Enable `noUnusedLocals` in CI** — Run a separate `tsc --noEmit` check with it on during CI,
even if disabled for dev. Catch dead code before PR merge.

2. **Use `exactOptionalPropertyTypes`** — Prevents accidentally writing `undefined` to optional
fields:

   ```json
   "exactOptionalPropertyTypes": true
   ```

---

## 3. Biome Configuration

Linting and formatting rules configured for the project.

### 3.1 Current Setup

```json
{
  "formatter": { "indentStyle": "tab", "lineWidth": 80 },
  "linter": {
    "rules": {
      "recommended": true,
      "complexity": { "noStaticOnlyClass": "off" },
      "correctness": { "noChildrenProp": "off" },
      "style": { "noNonNullAssertion": "off" }
    },
    "domains": { "react": "recommended" }
  },
  "assist": { "enabled": true, "actions": { "source": { "organizeImports": "on" } } }
}
```

**✅ Already doing right:**

- VCS integration enabled — respects `.gitignore`
- Organize imports on assist — keeps imports clean
- React-specific linting enabled

**📋 Recommendations:**

1. **Enable Tailwind v4 CSS linting** — Add CSS file support:

   ```json
   "files": {
     "includes": ["apps/frontend/src/styles.css"],
     "ignoreUnknown": false
   }
   ```

   > **Context:** Currently `biome format` errors on `@custom-variant`, `@theme`, `@apply` Tailwind
   directives because Tailwind CSS handling isn't configured.

2. **Add `noConsoleLog` for production** — Catch stray `console.log`:

   ```json
   "style": { "noConsoleLog": "warn" }
   ```

   (The app already suppresses console in prod, but this catches dev-introduced logs.)

3. **Consider increasing `lineWidth`** — 80 chars is narrow for modern TypeScript with long type
annotations. 100–120 is more practical.

---

## 4. Package Management

Dependencies, version management, and catalog configuration.

### 4.1 Dependencies

| Package | Version | Notes |
| --------- | --------- | ------- |
| `@biomejs/biome` | 2.5.4 | Latest — great |
| `zod` (catalog) | ^4.4.3 | Latest v4 — excellent DX |
| `typescript` (catalog) | ^7.0.2 | Very new — ensure Bun compatibility |
| `@types/bun` | latest | Bundled type definitions |

**✅ Already doing right:**

- `catalog:` for shared tooling versions
- `concurrently` for running dev servers in parallel
- `workspace:*` references for internal packages

**📋 Recommendations:**

1. **Add `@types/node` as root dep** — It's already listed but verify it's available for shared
scripts
2. **Consider Bun's built-in `.env` handling** — Root `.env` files are auto-loaded by Bun, no
`dotenv` needed
3. **Review Bun.lock regularly** — `bun.lock` can grow stale; run `bun install --frozen-lockfile` in
CI

---

## 5. Scripts & Dev Workflow

Development scripts, build commands, and workflow improvements.

### Dev Workflow

Key workflow commands for local development.

### 5.1 Current Scripts

```json
{
  "dev": "concurrently --names \"BACK,FRONT\" \"bun run dev:backend\" \"bun run dev:frontend\"",
  "staging": "bun run build:frontend:staging && concurrently --names \"MINIO,FRONT,BACK,REPORT\" ...",
  "seed": "bun run apps/backend/db/seed.ts"
}
```

**📋 Recommendations:**

1. **Add a `type-check` script at root** that runs type-checking for all workspaces:

   ```json
   "type-check": "bun run --filter @credets/backend type-check && bun run --filter @credets/frontend type-check"
   ```

2. **Add a `lint` script** for Biome:

   ```json
   "lint": "biome check .",
   "lint:fix": "biome check --write .",
   "format": "biome format --write ."
   ```

3. **Add a `validate` script** for CI (runs lint + type-check):

   ```json
   "validate": "bun run lint && bun run type-check"
   ```

4. **Document the `makefile` targets** — currently has `podman-up`, `podman-down`, `db-reset` with
`.PHONY`

---

## 6. Containerization (Podman + Docker)

Container setup for local development and production.

### 6.1 Current Setup

- `podman-compose.yml` — local development with PostgreSQL + MinIO
- `podman-compose.staging.yml` — staging environment
- `apps/backend/Containerfile` — production Docker image
- `.dockerignore` — properly excludes frontend, docs, env files

**✅ Already doing right:**

- `.dockerignore` separates concerns: backend image excludes frontend
- Multi-compose files for different environments
- Health check endpoint configured in Render

**📋 Recommendations:**

1. **Add `.dockerignore` entries for cache files:**

   ```text
   **/.turbo
   **/.rumdl_cache
   ```

2. **Pin container image versions** — Use specific tags for postgres/minio images instead of
`:latest`:

   ```yaml
   image: postgres:16-alpine
   ```

---

## 7. Deployment (Render)

Render platform configuration and deployment strategy.

### 7.1 Current Setup (`render.yaml`)

- Backend: Docker runtime on free plan, Singapore region
- Frontend: Static site (separate service)
- PostgreSQL: Neon DB (external)

**✅ Already doing right:**

- Synced env vars (not committed to repo)
- Health check path configured
- Dockerfile-based deployment for backend
- Separate frontend static site

**📋 Recommendations:**

1. **Add a frontend service to `render.yaml`** — Currently only backend is defined in the Render
config
2. **Configure `PRISMA` / `DB_TLS` explicitly** — Already done via `DB_TLS: "true"`
3. **Set `NODE_ENV` to production** — Already done
4. **Consider Render's auto-deploy** — Branch matching already configured (`branch: main`)

---

## 8. Markdown Linting via rumdl

rumdl configuration and linting rules for documentation.

### 8.1 Current Setup

- Config at `.rumdl.toml` with comprehensive rule set
- Recently cleaned up (invalid options removed)
- No lint errors across 13 docs files

**✅ Already doing right:**

- GFM flavor selected (GitHub Flavored Markdown)
- Code blocks and tables excluded from line-length checks
- Opt-in rules enabled for specific needs (MD060, MD063, MD080, MD082)
- VCS-ignored directories excluded

---

## 9. Security Practices

**✅ Already doing right:**

| Practice | Evidence |
| ---------- | ---------- |
| `Strict-Transport-Security` header | `ResponseFactory.getCorsHeaders()` |
| `X-Content-Type-Options: nosniff` | Same |
| `X-Frame-Options: DENY` | Same |
| `Referrer-Policy` | Same |
| `Permissions-Policy` | Same |
| CSRF protection | Custom CSRF token on all forms |
| No committed secrets | `.env*` in `.gitignore` and `.dockerignore` |
| CORS scoped to origin | `FRONTEND_APP` env var |
| Request body size limits | 10MB cap on create/update |
| Input validation | Zod schemas on all endpoints |

**📋 Recommendations:**

1. **Add a `security.txt`** — Create `public/.well-known/security.txt` for security researchers
2. **Consider rate limiting** — Even basic IP-based rate limiting on auth/creation endpoints
3. **Add Content Security Policy header** — Start with report-only mode:

   ```text
   Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'
   ```

4. **Audit `sql.unsafe()` usage** — Manual string concatenation in SQL is risky; ensure all inputs
are parameterized

---

## 10. What You're Already Doing Well

| Practice | Why It Matters |
| ---------- | --------------- |
| **Monorepo with shared schemas** | Single source of truth for data shapes between frontend/backend |
| **TypeScript strict mode** | Catches null/undefined bugs at compile time |
| **Biome for formatting + linting** | Consistent code style, catches issues early |
| **Feature branches + staging** | Isolates production changes |
| **Containerized dev environment** | Reproducible local setup |
| **Security headers** | Defense-in-depth for web app |
| **CSRF protection** | Prevents cross-site request forgery |
| **rumdl Markdown linting** | Clean, consistent documentation |
| **Workspace protocol with catalog** | Lockstep versioning across monorepo |
| **Health check endpoints** | Enables Render's auto-recovery |

---

## 11. Quick Wins (Priority Order)

1. **Add `type-check` and `lint:fix` scripts** at root
2. **Fix Biome CSS parsing** — enable Tailwind CSS support in config
3. **Increase `lineWidth` to 100** in Biome.json for better ergonomics
4. **Add CI validation pipeline** (GitHub Actions or Render pre-deploy)
5. **Document `makefile` targets** in README
