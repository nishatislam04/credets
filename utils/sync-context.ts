/**
 * sync-context.ts — Auto-regenerate web-chat-ai.md from live project state
 *
 * Usage:
 *   bun run sync-context          # regenerate web-chat-ai.md
 *   bun run sync-context --check  # exit 1 if file is stale (for CI / git hook)
 *
 * What it does:
 *   1. Reads all package.json files → extracts dependencies
 *   2. Reads the route tree → extracts current routes
 *   3. Reads the backend index.ts → extracts API endpoints
 *   4. Reads init.sql → extracts DB tables
 *   5. Reads docs/ → extracts requirements & todo status
 *   6. Reads biome.json / tsconfig.json → extracts config
 *   7. Injects all dynamic data into the MD template
 *   8. Preserves static sections (best practices, rules, etc.)
 *
 * The static sections (TanStack best practices, React rules, etc.) are kept
 * as template literals at the bottom of this file. Only the dynamic parts
 * are regenerated from the live project.
 */

import {
	existsSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

// ─── Configuration ──────────────────────────────────────────────────

const ROOT = findProjectRoot();
const OUTPUT_FILE = join(ROOT, "docs", "web-chat-ai.md");

function findProjectRoot(): string {
	// Walk up from cwd to find the project root (has package.json with workspaces)
	let dir = process.cwd();
	for (let i = 0; i < 10; i++) {
		const pkgPath = join(dir, "package.json");
		if (existsSync(pkgPath)) {
			try {
				const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
				if (pkg.workspaces) return dir;
			} catch {
				/* continue */
			}
		}
		dir = join(dir, "..");
	}
	// Fallback: use current directory
	return process.cwd();
}

// ─── Helpers ────────────────────────────────────────────────────────

function readJSON<T = any>(filePath: string): T | null {
	const fullPath = join(ROOT, filePath);
	if (!existsSync(fullPath)) return null;
	try {
		return JSON.parse(readFileSync(fullPath, "utf-8"));
	} catch {
		return null;
	}
}

function readText(filePath: string): string {
	const fullPath = join(ROOT, filePath);
	if (!existsSync(fullPath)) return "";
	return readFileSync(fullPath, "utf-8");
}

function listFiles(dir: string, ext?: string): string[] {
	const fullPath = join(ROOT, dir);
	if (!existsSync(fullPath)) return [];
	const results: string[] = [];
	for (const entry of readdirSync(fullPath)) {
		const entryPath = join(fullPath, entry);
		const stat = statSync(entryPath);
		if (stat.isDirectory()) {
			results.push(...listFiles(join(dir, entry), ext));
		} else if (!ext || entry.endsWith(ext)) {
			results.push(join(dir, entry));
		}
	}
	return results;
}

// ─── Scanners ───────────────────────────────────────────────────────

function scanDependencies(): {
	rootDeps: Record<string, string>;
	frontendDeps: Record<string, string>;
	backendDeps: Record<string, string>;
	sharedDeps: Record<string, string>;
} {
	const root = readJSON("package.json");
	const frontend = readJSON("apps/frontend/package.json");
	const backend = readJSON("apps/backend/package.json");
	const sharedSchema = readJSON("packages/shared-schema/package.json");

	return {
		rootDeps: {
			...(root?.devDependencies || {}),
			...(root?.dependencies || {}),
		},
		frontendDeps: {
			...(frontend?.dependencies || {}),
			...(frontend?.devDependencies || {}),
		},
		backendDeps: {
			...(backend?.dependencies || {}),
			...(backend?.devDependencies || {}),
		},
		sharedDeps: {
			...(sharedSchema?.dependencies || {}),
		},
	};
}

function scanRoutes(): Array<{ path: string; file: string }> {
	const routes: Array<{ path: string; file: string }> = [];

	function walkRoutes(dir: string, urlPrefix: string) {
		const fullPath = join(ROOT, "apps/frontend/src", dir);
		if (!existsSync(fullPath)) return;

		for (const entry of readdirSync(fullPath)) {
			const entryPath = join(fullPath, entry);
			const stat = statSync(entryPath);

			if (stat.isDirectory()) {
				// Skip private folders (-components, -actions, -utils)
				if (entry.startsWith("-")) continue;
				// Handle dynamic params
				const urlPart = entry.startsWith("$") ? `$${entry.slice(1)}` : entry;
				walkRoutes(join(dir, entry), `${urlPrefix}/${urlPart}`);
			} else if (
				entry.endsWith(".tsx") &&
				!entry.startsWith("-") &&
				entry !== "__root.tsx"
			) {
				const routeName = entry.replace(".tsx", "");
				const isIndex = routeName === "index";
				const urlPath = isIndex
					? urlPrefix || "/"
					: `${urlPrefix}/${routeName}`;
				routes.push({
					path: urlPath.replace(/\/+/g, "/") || "/",
					file: join("apps/frontend/src", dir, entry),
				});
			}
		}
	}

	walkRoutes("routes", "");
	return routes;
}

function scanAPIEndpoints(): Array<{
	method: string;
	path: string;
	handler: string;
}> {
	const indexContent = readText("apps/backend/index.ts");
	const endpoints: Array<{
		method: string;
		path: string;
		handler: string;
	}> = [];

	// Match route patterns like "/path": (req) => handler(req)
	const routeRegex =
		/["'`]([^"'`]+)["'`]\s*:\s*(?:\([^)]*\)\s*=>)?\s*(\w+(?:\.\w+)?)\s*[),]/g;
	let match;

	while ((match = routeRegex.exec(indexContent)) !== null) {
		const path = match[1];
		const handler = match[2];
		if (path === "/") continue; // Skip static HTML route

		// Determine HTTP method heuristically
		let method = "GET";
		if (path.includes("create") || path.includes("validation")) {
			method = "POST";
		}
		if (path.includes("delete") || path.includes("update")) {
			method = path.includes("delete") ? "DELETE" : "PUT";
		}

		endpoints.push({ method, path, handler });
	}

	return endpoints;
}

function scanDBTables(): string[] {
	const sql = readText("apps/backend/db/init.sql");
	const tables: string[] = [];
	const tableRegex = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/gi;
	let match;
	while ((match = tableRegex.exec(sql)) !== null) {
		tables.push(match[1]);
	}
	return tables;
}

function scanBiomeConfig(): {
	indent: string;
	lineWidth: number;
	quote: string;
} {
	const biome = readJSON("biome.json");
	return {
		indent: biome?.formatter?.indentStyle === "tab" ? "tabs" : "spaces",
		lineWidth: biome?.formatter?.lineWidth || 80,
		quote:
			biome?.javascript?.formatter?.quoteStyle === "double"
				? "double"
				: "single",
	};
}

function scanTypeScriptConfig(): { strict: boolean; noUnchecked: boolean } {
	const tsconfig = readJSON("tsconfig.json");
	const opts = tsconfig?.compilerOptions || {};
	return {
		strict: opts.strict === true,
		noUnchecked: opts.noUncheckedIndexedAccess === true,
	};
}

function scanDocs(): {
	requirements: string[];
	features: string[];
	todos: string[];
} {
	const appMd = readText("docs/app.md");
	const todoMd = readText("docs/#todo.md");

	// Extract requirements (lines starting with [])
	const requirements = appMd
		.split("\n")
		.filter((l) => l.trim().startsWith("[]"))
		.map((l) => l.replace(/^\s*\[\]\s*/, "").trim());

	// Extract features (numbered list items)
	const features = appMd
		.split("\n")
		.filter((l) => /^\d+\.\s/.test(l.trim()))
		.map((l) => l.replace(/^\s*\d+\.\s*/, "").trim());

	// Extract todos
	const todos = todoMd
		.split("\n")
		.filter((l) => l.trim().startsWith("- []"))
		.map((l) => l.replace(/^\s*-\s*\[\]\s*/, "").trim());

	return { requirements, features, todos };
}

function scanCredentialTypes(): Array<{ value: string; label: string }> {
	const seedContent = readText("apps/backend/db/seed.ts");
	const types: Array<{ value: string; label: string }> = [];

	const typeRegex =
		/label:\s*["']([^"']+)["'],\s*\n\s*value:\s*["']([^"']+)["']/g;
	let match;
	while ((match = typeRegex.exec(seedContent)) !== null) {
		types.push({ label: match[1], value: match[2] });
	}

	return types;
}

function scanShadcnComponents(): string[] {
	const uiDir = join(ROOT, "apps/frontend/src/components/ui");
	if (!existsSync(uiDir)) return [];
	return readdirSync(uiDir)
		.filter((f) => f.endsWith(".tsx"))
		.map((f) => f.replace(".tsx", ""));
}

function scanScripts(): Record<string, string> {
	const root = readJSON("package.json");
	return root?.scripts || {};
}

// ─── Template Sections (STATIC — updated manually or by AI) ──────────

// These sections contain best practices, rules, and guides that don't
// change based on project structure. They are maintained separately and
// injected into the final output.

const TANSTACK_ROUTER_SECTION = `### Route Definition
- Use **file-based routing** — create route files in \`src/routes/\`, not programmatic routes
- Route files export \`Route\` created with \`createFileRoute("/path")()\`
- Use \`Route\` export for route configuration (loader, component, pendingComponent, errorComponent)
- Never edit \`routeTree.gen.ts\` — it is auto-generated by the Vite plugin
- Use TanStack Router's type-safe \`Link\` component instead of \`<a>\` tags
- Use \`useNavigate()\` for programmatic navigation
- Use \`useLoaderData({ from: "/exact/path/" })\` for type-safe loader data access

### Data Loading
- Use **route loaders** for data fetching — they run before the route renders
- Return data from \`loader: async () => fetchData()\` — this ensures data is available before render
- Use \`pendingComponent\` to show skeleton/placeholder UI during loading
- Use \`errorComponent\` to handle loader failures gracefully
- Configure \`defaultPreload: 'intent'\` for preloading on hover/focus
- Configure \`scrollRestoration: true\` for proper back/forward navigation

### Router Configuration
- Register the router type via \`declare module '@tanstack/react-router' { interface Register { router: typeof router } }\`
- Use \`autoCodeSplitting: true\` in the Vite plugin for optimal bundle splitting
- Use the \`@tanstack/router-plugin/vite\` plugin, NOT the legacy \`@tanstack/router-vite-plugin\`

### Search Params & Navigation
- Use \`useSearch()\` and \`useNavigate()\` for type-safe search param access
- Use \`Link\` component's \`search\` prop for passing search params
- Use \`redirect()\` in loaders for auth guards (future implementation)`;

const TANSTACK_QUERY_SECTION = `### Query Configuration
- This project intentionally disables client-side caching: \`gcTime: 0\`, \`staleTime: 0\`
- This means every mount triggers a fresh fetch — appropriate for credentials data that must always be current
- If caching is needed later, use \`staleTime\` and \`gcTime\` per-query, not globally

### Query Usage Patterns
- Use \`useQuery\` for data fetching in components (e.g., CSRF token, types listings)
- Use route \`loader\` + \`fetch\` for critical page data (e.g., credential listings, credential detail)
- Route loaders bypass TanStack Query — they directly fetch and return data
- For mutations, use direct \`fetch\` calls in form submit handlers (not \`useMutation\`)
- Toast notifications for async feedback: \`gooeyToast.promise()\` for create operations, \`gooeyToast.error()\` for failures

### Infinite Scroll Pattern
- Initial data from route loader
- Additional pages fetched via the same fetch function with \`cursor\` param
- State: \`credentials[]\`, \`nextCursor\`, \`hasMore\`, \`isLoadingMore\`, \`loadError\`
- \`IntersectionObserver\` on a sentinel div with \`rootMargin: "200px"\` for pre-fetch
- Use \`useRef\` to prevent duplicate fetches (\`loadingRef\`)`;

const TANSTACK_FORM_SECTION = `### Form Setup
- Use \`useForm()\` with \`defaultValues\` — must match the form data structure
- Use \`validators.onSubmit\` for client-side Zod schema validation
- Use \`validators.onSubmitAsync\` for server-side validation via dedicated endpoint
- \`onSubmitAsync\` must **always return something** — even \`return {}\` — or the form breaks
- For server field errors, return \`{ fields: { fieldName: [{ message: "..." }] } }\`

### Field Pattern
\`\`\`tsx
<form.Field
  name="fieldName"
  children={(field) => {
    const isInvalid = !field.state.meta.isValid;
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor="fieldName">Label</FieldLabel>
        <Input
          id="fieldName"
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
/>
\`\`\`

### Array Fields
- Use \`mode="array"\` on \`form.Field\` for array data (e.g., \`data\` blocks)
- Use \`arrayField.pushValue()\` to add items
- Use \`arrayField.removeValue(idx)\` to remove items
- Access values via \`arrayField.state.value\`

### CSRF Integration
- Fetch CSRF token via \`useQuery\` before rendering form
- Include as hidden \`_csrf\` field in the form
- Backend verifies CSRF before processing any form submission`;

const REACT_BEST_PRACTICES = `### Component Design
- Use **function components** only — no class components
- Use **named exports** for components (not default exports)
- Keep components focused — one component per file
- Extract reusable logic into custom hooks
- Use \`useCallback\` for event handlers passed as props or used in dependency arrays
- Use \`useMemo\` for expensive computations
- Use \`useRef\` for mutable values that don't trigger re-renders (e.g., observer refs, loading flags)

### State Management
- Use route loaders for server state (primary pattern in this project)
- Use TanStack Query for client-side async state (secondary pattern)
- Use \`useState\` for local UI state only (e.g., lightbox open/close)
- Never duplicate server state in React state — derive from loader data

### Rendering
- Use \`key\` prop with stable, unique IDs (not array index)
- Use conditional rendering with \`&&\` for simple cases, ternary for if/else
- Use \`line-clamp-*\` Tailwind classes for text truncation
- Use \`truncate\` class for single-line truncation

### Accessibility
- Always set \`aria-invalid\` on form inputs when validation fails
- Use \`htmlFor\` on labels matching input \`id\`
- Use \`role="dialog"\` and \`aria-modal="true"\` on modals/lightboxes
- Provide \`aria-label\` for icon-only buttons

### Performance
- Use \`import.meta.env.VITE_BACKEND_APP\` for backend URL (Vite env variable)
- Use React 19's automatic batching (default behavior)
- Prefer CSS transitions over JavaScript animations for simple effects
- Use \`transition-all duration-200\` for hover states (Tailwind pattern in this project)`;

const FORM_HANDLING_SECTION = `### Frontend (TanStack Form)
1. **Always use \`FormData\`** for form submissions — never JSON
2. Use \`useForm()\` from \`@tanstack/react-form\`
3. Validation uses Zod schema via \`validators.onSubmit\`
4. Server-side validation via \`validators.onSubmitAsync\` — calls a dedicated validation endpoint
5. \`onSubmitAsync\` **must always return something** (even if unused) for TanStack Form to work
6. For server validation errors: return \`{ fields: data.errors }\` so field-level errors display
7. CSRF token is fetched via \`useQuery\` and included as \`_csrf\` hidden field
8. Each field uses \`form.Field\` with \`children\` render prop pattern

### Backend
1. Dedicated validation endpoint at \`/credentials/create/validation\`
2. Both create and validation endpoints: read \`FormData\`, verify CSRF, parse with Zod
3. \`formatZodError()\` transforms Zod issues into \`{ fieldName: [{ message: "..." }] }\` format
4. Image processing: \`processImage()\` resizes and converts to WebP before DB storage
5. Thumbnail: max 800px width, quality 50
6. Gallery images: max 1400px width, quality 75`;

const AUTH_SECTION = `### Design (not fully implemented in routes yet)
- **Single-user system** — only one user exists
- **Login fields:** username, email, password, special-password
- **Special password:** Two parts — static (encrypted in DB) + dynamic (today's date)
  - Static part: sealed with \`iron-webcrypto\` using \`ENC_KEY\` env var
  - Dynamic part: today's date in \`dd/MM/yyyy\` format (e.g., "3/5/2026")
  - Full format: \`"static part. dd/MM/yyyy"\`
  - Verification: decrypt static part from DB, append server date, compare with input
- **Session:** UUID token stored in DB, attached via cookies (no Max-Age/Expires)
- **CSRF:** Bun's built-in CSRF generation/verification with 30-minute expiry

### Environment Variables
- \`ENC_KEY\` — 64-char hex from \`openssl rand -hex 32\`
- \`CSRF_SECRET_KEY\` — for CSRF token generation
- \`DB_USER\`, \`DB_PASSWORD\`, \`DB_NAME\` — PostgreSQL credentials
- \`FRONTEND_APP\` — frontend URL for CORS headers
- \`VITE_BACKEND_APP\` — backend URL for frontend fetch calls`;

const CONVENTIONS_SECTION = `### Conventions
- **Path aliases:** Frontend uses \`#/*\` (e.g., \`#/components/ui/button\`), root uses \`@credets/*\` and \`@db/*\`, \`@backend/*\`
- **Formatting:** Biome — tabs, {biomeLineWidth} line width (root) / 100 (frontend), double quotes, organize imports on save
- **shadcn/ui style:** "base-luma" with neutral base color, CSS variables enabled
- **Icon library:** Lucide React
- **Image format:** All uploaded images converted to WebP before storage
- **CORS:** Backend sets \`Access-Control-Allow-Origin\` from \`FRONTEND_APP\` env var on responses
- **File naming:** Routes follow TanStack Router convention; private components use \`-components\`/\`-actions\`/\`-utils\` prefix folders

### Gotchas
- No \`.env\` template exists — must create \`.env\` manually with all required vars
- \`ENC_KEY\` must be copied to \`apps/backend/\` directory
- Backend uses \`bun --watch\`; frontend uses Vite HMR on port 3000
- \`onSubmitAsync\` in TanStack Form **must always return something** even if unused
- Frontend type-check is only at build time (no separate \`type-check\` script); backend has \`tsc --noEmit\`
- \`routeTree.gen.ts\` is auto-generated — never edit manually, excluded from Biome
- \`styles.css\` is also excluded from Biome
- Tags are stored as JSONB array but submitted as comma-separated string from the form
- The \`CredentialType\` in shared-types is deprecated — use \`CredentialListItem\` instead
- \`processImage()\` has a TODO for later optimization with profile presets
- \`DataBlock\` component still uses \`any\` types — needs proper \`FormApi\` typing`;

const DESIGN_DECISIONS = `1. **No ORM** — Raw SQL via Bun's \`SQL\` tagged template literals for maximum control and learning
2. **No client cache** — TanStack Query with \`gcTime: 0\` / \`staleTime: 0\` ensures fresh data always
3. **WebP everywhere** — All uploaded images converted to WebP for smaller size
4. **FormData over JSON** — Forms submit as \`multipart/form-data\` to support file uploads natively
5. **Custom CSRF** — Not using a library; Bun's built-in CSRF is used with manual lifecycle management
6. **Cursor pagination** — Switched from offset-based to cursor-based for better infinite scroll performance
7. **Flexible data** — JSONB \`data\` column + discriminated union form blocks allow any credential structure
8. **Single user** — No multi-tenancy; simplifies auth to a single special-password system
9. **Monorepo shared packages** — Zod schemas and TypeScript types are shared between frontend and backend
10. **Bun native APIs** — Using Bun.Image, Bun.CSRF, Bun.password, Bun.SQL instead of third-party libraries`;

// ─── MD Generator ───────────────────────────────────────────────────

function generateMD(): string {
	// Scan all dynamic data
	const deps = scanDependencies();
	const routes = scanRoutes();
	const endpoints = scanAPIEndpoints();
	const tables = scanDBTables();
	const biome = scanBiomeConfig();
	const tsconfig = scanTypeScriptConfig();
	const docs = scanDocs();
	const credTypes = scanCredentialTypes();
	const shadcnComponents = scanShadcnComponents();
	const scripts = scanScripts();

	// Format helpers
	const depList = (deps: Record<string, string>) =>
		Object.entries(deps)
			.map(([k, v]) => `- ${k}: ${v}`)
			.join("\n");

	const routeTable = routes
		.map((r) => `| ${r.path} | \`${r.file}\` |`)
		.join("\n");

	const endpointTable = endpoints
		.map((e) => `| ${e.method} | ${e.path} | \`${e.handler}\` |`)
		.join("\n");

	const typesTable = credTypes
		.map((t) => `| \`${t.value}\` | ${t.label} |`)
		.join("\n");

	const componentsList = shadcnComponents.map((c) => `\`${c}\``).join(", ");

	const reqList = docs.requirements.map((r) => `- [ ] ${r}`).join("\n");

	const featList = docs.features.map((f) => `- [ ] ${f}`).join("\n");

	const todoList = docs.todos.map((t) => `- [ ] ${t}`).join("\n");

	const scriptList = Object.entries(scripts)
		.map(([k, v]) => `\`bun run ${k}\` — ${v}`)
		.join("\n");

	// Inject dynamic values into conventions
	const conventionsFinal = CONVENTIONS_SECTION.replace(
		"{biomeLineWidth}",
		String(biome.lineWidth),
	);

	const now = new Date().toISOString();

	return `# Credets — AI Context File

> **Purpose:** This file provides full project context so that any AI assistant can understand the Credets monorepo web application — its architecture, conventions, current implementation state, and the best practices it follows. Feed this file to an AI chat before asking it to work on this project.
>
> **Last synced:** ${now}
>
> **Auto-generated by:** \`bun run sync-context\` — run this command after making structural changes to the project.

---

## 1. Project Overview

**Credets** is a personal credentials manager — a single-user web application for securely storing, organizing, and managing credentials, API keys, SSH keys, media assets, game loadouts, and other sensitive data. The name is a shorthand for "credentials."

**Core idea:** A monorepo web app where the backend exposes a REST API (Bun runtime) and the frontend consumes it (TanStack Router + React 19). The project emphasizes web security best practices since it holds sensitive information.

---

## 2. Monorepo Architecture

\`\`\`
credets/                          ← root (bun workspaces)
├── apps/
│   ├── backend/                  ← Bun HTTP server, raw PostgreSQL
│   │   ├── db/                   ← init.sql, connection.ts, seed.ts
│   │   ├── http/                 ← route handlers (credentials/, csrf/, types/)
│   │   ├── validation/           ← server-side Zod validation endpoints
│   │   ├── utils/                ← encrypt, decrypt, processImage, parseLocalDate, response
│   │   ├── types/                ← response type definitions
│   │   └── index.ts              ← Bun.serve entry point with route definitions
│   └── frontend/                 ← TanStack Router + React 19 SPA
│       ├── src/
│       │   ├── routes/           ← file-based routing (TanStack Router)
│       │   ├── components/ui/    ← shadcn/ui components
│       │   ├── lib/utils.ts      ← cn() utility
│       │   ├── main.tsx          ← app entry point
│       │   └── routeTree.gen.ts  ← auto-generated route tree
│       ├── vite.config.ts
│       ├── components.json
│       └── tsconfig.json
├── packages/
│   ├── shared-schema/            ← @credets/shared-schema — Zod schemas
│   ├── shared-types/             ← @credets/shared-types — TypeScript types
│   └── shared-utils/             ← @credets/shared-utils — shared utilities
├── docs/                         ← project documentation
├── docker-compose.yml            ← PostgreSQL 18 in Docker
├── makefile
├── biome.json
├── tsconfig.json
└── package.json
\`\`\`

---

## 3. Tech Stack

### Backend Dependencies
${depList(deps.backendDeps)}

### Frontend Dependencies
${depList(deps.frontendDeps)}

### Shared Package Dependencies
${depList(deps.sharedDeps)}

### Root Dev Dependencies
${depList(deps.rootDeps)}

---

## 4. Backend API Endpoints

| Method | Path | Handler |
|--------|------|---------|
${endpointTable}

**Response format (success):**
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "...",
  "timestamp": "ISO-8601",
  "path": "/credentials",
  "status": 200
}
\`\`\`

**Response format (error):**
\`\`\`json
{
  "success": false,
  "error": "error category",
  "message": "human-readable message",
  "timestamp": "ISO-8601",
  "details": { "originError": "..." },
  "data": {},
  "path": "/credentials",
  "status": 500
}
\`\`\`

---

## 5. Database Schema

**Tables:** ${tables.join(", ")}

(See \`apps/backend/db/init.sql\` for full column definitions, indexes, and triggers.)

---

## 6. Frontend Routes

| Path | File |
|------|------|
${routeTable}

**Router config:** \`defaultPreload: 'intent'\`, \`scrollRestoration: true\`, \`autoCodeSplitting: true\`

---

## 7. Credential Types

| Value | Label |
|-------|-------|
${typesTable}

---

## 8. UI Components (shadcn/ui)

${componentsList}

---

## 9. Form Handling Pattern

${FORM_HANDLING_SECTION}

---

## 10. Authentication System

${AUTH_SECTION}

---

## 11. Pagination

**Current:** Cursor-based (infinite scroll)
- Cursor = base64-encoded JSON \`{ createdAt, id }\`
- Composite cursor: \`(created_at, id)\` handles duplicate timestamps
- Frontend: \`IntersectionObserver\` with \`rootMargin: "200px"\`
- Limit: 1–24 per page, default 12

---

## 12. Conventions & Gotchas

${conventionsFinal}

---

## 13. TypeScript Configuration

- \`strict: ${tsconfig.strict}\`
- \`noUncheckedIndexedAccess: ${tsconfig.noUnchecked}\`

---

## 14. Biome Configuration

- Indent: ${biome.indent}
- Line width: ${biome.lineWidth} (root) / 100 (frontend)
- Quotes: ${biome.quote}
- Organize imports: on

---

## 15. TanStack Router Best Practices & Rules

${TANSTACK_ROUTER_SECTION}

---

## 16. TanStack Query Best Practices & Rules

${TANSTACK_QUERY_SECTION}

---

## 17. TanStack Form Best Practices & Rules

${TANSTACK_FORM_SECTION}

---

## 18. React Best Practices & Rules

${REACT_BEST_PRACTICES}

---

## 19. Requirements & Feature Checklist

### Requirements
${reqList}

### Features
${featList}

### Pending Todos
${todoList}

---

## 20. Scripts & Commands

${scriptList}

---

## 21. Key Design Decisions

${DESIGN_DECISIONS}

---

## 22. Host & Deployment

- **Backend:** Render (planned)
- **Frontend:** Not decided yet
- **Database:** Docker Compose (local development), planned managed PostgreSQL for production
`;
}

// ─── Main ───────────────────────────────────────────────────────────

const isCheckMode = process.argv.includes("--check");
const generated = generateMD();

if (isCheckMode) {
	// CI / git hook mode: check if the file is up to date
	const existing = existsSync(OUTPUT_FILE)
		? readFileSync(OUTPUT_FILE, "utf-8")
		: "";

	if (existing === generated) {
		console.log("✅ web-chat-ai.md is up to date");
		process.exit(0);
	} else {
		console.log(
			"❌ web-chat-ai.md is stale. Run `bun run sync-context` to update it.",
		);
		process.exit(1);
	}
} else {
	// Normal mode: write the file
	writeFileSync(OUTPUT_FILE, generated, "utf-8");
	console.log(`✅ Generated ${OUTPUT_FILE}`);
	console.log(
		"💡 Run `bun run sync-context --check` to verify it's up to date (useful in CI / git hooks)",
	);
}
