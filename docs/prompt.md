# Todo

1. update our homepage (/credentials) with sliders, section and switch between different view
   mode (infinite pagination or cursor based pagination)

2. (will introduce after adding local-cache system; draft data will live at IndexDB) add draft
   mode: if any content in create form is not saved properly then it will be saved on indexdb.
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

## saving this prompt for later usage in other project

## for our minhaj-portfolio project

i want you to scan my whole repo. the root, the backend, the frontend
and based on best practises, security practises, good coding practises, single responsibilty, tanstack
router, tanstack form, shadcn/ui (baseui), bunjs, reactJS latest docs referencing and any other refactor,
optimization, re-write and similar cases. write it out in single docs page. one docs for root dir
coding and pkg and other stuffs, another docs for backend and another one for frontend side.
since, we are publishing this app, and this is a credentials based web app and i want to learn
best practises based on respective docs guide for learning purpose and for security purpose and
for high speed web app and mobile responsiveness and following render best practises. since thats
where we are publishing our monorepo app.
in the docs, address all the concepts i issued earlier and add more concepts, concern, best practise
and etc and lastly what good practises i am already following and implemented. so that i have a
very good idea about this whole app architecture and coding part and pkg managements etc
