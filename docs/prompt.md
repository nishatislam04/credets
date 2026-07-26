# Todo

1. update our homepage (/credentials) with sliders, section and switch between different view mode
(infinite pagination or cursor based pagination)

2. [we will introduce it after adding local-cache system. and draft data will live at IndexDB] add
draft mode: if any content in create form is not saved properly then it will be saved on indexdb.
then each time, create page is loaded, we auto load the content. and show a non-interference ui
actions: remove saved content. it will be like toast, which will disappear after a while

3. add img support in rte later

---

## Logging Conventions

Use the structured `log` object for all data operation logging. It outputs
colorful formatted text in development and parseable JSON in production.

```ts
import { log } from "@backend/utils/logger";

// Info / success — context keys at top level
log.info("service: credential created", { credentialId, title });

// Errors — use `err` key with standard shape
log.error("http: credential creation failed", {
  err: { message: error.message, name: error.name },
  credentialId,
});

// Warnings
log.warn("rate limit nearing", { current, limit });

// Debug (dev-only, never in committed code)
// log.debug("parsing payload", { raw });
```

### Scope Prefixes

Every log message should start with a scope prefix:

- `http:` — HTTP handler layer
- `service:` — business logic / service layer
- `repo:` — database repository layer
- `storage:` — S3 / file storage operations
- `server:` — startup / server events

### Error Meta Convention

When logging errors, use the standard `err` shape:

```text
err: { message: string; name?: string; stack?: string; code?: string }
```

Do NOT use `logAlways` for data operations — it is reserved for startup
banners and critical boot events in `index.ts`.

---

## Key Features

- Encrypted Credential Vault — Store sensitive credentials with AES encryption at rest. Flexible
data input supports single labels, key-value pairs, and rich text sections via a Tiptap editor. Each
credential can have a hierarchical type, multiple images, and a thumbnail.
- Full Lifecycle Workflow — Create credentials as drafts, iterate with Update & Draft, and publish
when ready. Soft-delete sends items to Trash where they can be restored or permanently deleted. Mark
favourites for quick access.
- Security-First Authentication — Password-based sign-in with a dynamic date-verified special
password (acts as a second factor without SMS or email dependency). CSRF token protection on every
form submission. All sensitive credential data is encrypted before storage.
- Dashboard & Resource Management — A live dashboard with usage statistics, trend charts, and
quick-action links. Hierarchical type system, bulk export via email, cursor-based infinite scroll
for smooth browsing, and local IndexedDB caching to mitigate server cold starts.

**Tech Stack**
Bun, TypeScript, React 19, TanStack Router, TanStack Query, TanStack Form, PostgreSQL, shadcn/ui,
Base UI, Tailwind CSS 4, Zod, Tiptap Editor, AWS S3 (Supabase Storage), Lucide React, Framer Motion,
Embla Carousel, Highlight.js, Biome, Vite, Podman, Render
