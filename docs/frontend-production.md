# Frontend Production Audit

> **Audit date:** June 4, 2026
> **Stack:** React 19 · TanStack Router + Query + Form · Vite 8 · shadcn/ui (Base UI) · Tailwind v4 · Render/Cloudflare

This document is a thorough review of your frontend for production readiness. Same format as the backend audit — three priority tiers.

---

## Before You Begin — Hosting Decision

Your frontend is not yet deployed. Here are the best **free-tier** options:

| Platform | SPA Routing | CDN | Bandwidth | Build Integration |
|----------|-------------|-----|-----------|-------------------|
| **Cloudflare Pages** | Auto (via `_routes.json` or `_redirects`) | Global edge (unmetered) | Unlimited | `wrangler deploy` or GitHub |
| **Netlify** | `_redirects` file (`/* /index.html 200`) | Global CDN | 100 GB/mo | GitHub auto-deploy |
| **Render Static** | Rewrite rule in dashboard | Basic CDN | Included | GitHub auto-deploy |

**Recommendation:** Use **Cloudflare Pages** — unmetered bandwidth, global edge network, fastest cold-start, free SSL. Your `_redirects` file is already set up for Netlify/Cloudflare. If you use Cloudflare Pages, also add a `_headers` file for cache control (see #19).

---

## TL;DR — The Critical Few

If you only fix six things, fix these:

| # | Issue | Risk |
|---|-------|------|
| 1 | **DevTools rendered in production** — TanStack Devtools, Router Devtools, Form Devtools all ship to users | 🔴 Bundle bloat + info leak |
| 2 | **Bundle analyzer runs on every build** — `analyzer()` plugin builds analysis files unconditionally | 🟠 Build overhead |
| 3 | **Console suppressed but errors silently swallowed** — `createCredentialAction.ts` ignores API error responses | 🟠 Silent failures |
| 4 | **Images sent as base64 in API** — listings page downloads all thumbnail data as base64 strings | 🟠 Huge payloads |
| 5 | **No SPA fallback on Render** — hard-refreshing any route returns 404 | 🟠 Broken navigation |
| 6 | **`robots.txt` allows full indexing** — Google can index all credential titles and descriptions | 🔴 Privacy leak |

---

## 🔴 MUST-HAVE (fix before real users)

### 1. DevTools Shipped to Production

In `apps/frontend/src/routes/__root.tsx`, three devtools panels render **unconditionally**:

```tsx
<TanStackDevtools config={{ ... }} plugins={[
  { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> },
  { name: "Tanstack Form", render: <FormDevtoolsPanel /> },
]} />
```

This adds ~50-80 KB to your production bundle and exposes internal Router/Form state to anyone who opens the devtools panel.

**Fix — gate behind `import.meta.env.DEV`:**

```tsx
import { lazy, Suspense } from "react";

const TanStackDevtools = lazy(() =>
  import("@tanstack/react-devtools").then((m) => ({ default: m.TanStackDevtools }))
);

// In the component:
{import.meta.env.DEV && (
  <Suspense fallback={null}>
    <TanStackDevtools ... />
  </Suspense>
)}
```

Or simply use conditional rendering:

```tsx
{import.meta.env.DEV && <TanStackDevtools ... />}
```

### 2. Bundle Analyzer Runs on Every Build

In `vite.config.ts`, `analyzer()` is always in the plugins array. This generates analysis HTML files and adds build-time overhead on every production build.

**Fix — gate behind an env variable:**

```ts
analyzer({
  enabled: process.env.ANALYZE === "true",
  defaultSizes: "gzip",
  summary: true,
}),
```

### 3. API Error Responses Silently Swallowed

In `apps/frontend/src/routes/credentials/create/-actions/createCredentialAction.ts`:

```ts
const response = await fetch(...);
await response.json();  // ❌ Result is ignored!
```

If the backend returns a 500 with an error message, it's completely ignored. The `catch` only catches network errors (connection refused, DNS failure, etc.).

**Fix:**

```ts
const response = await fetch(...);
const result = await response.json();

if (!result.success) {
  throw new Error(result.message || "Failed to create credential");
}

return result;
```

Same pattern already exists in `updateCredentialAction.ts` — just make `createCredentialAction.ts` match it.

### 4. Base64 Image Payloads Are Huge

Your backend stores images as `BYTEA` (PostgreSQL binary) and returns them as base64 strings in JSON. For the listings page, every credential's thumbnail is sent as a base64 data URL. With 12 items per page and ~50 KB thumbnails, that's **~800 KB** of JSON payload for a single page load.

**Short-term fix — remove thumbnail data from listings API:**

The listings `/api/credentials` endpoint returns `thumbnail_image_data` for every item. Since the listings page only shows small thumbnails (96×96px), you can:

1. Create a separate endpoint like `/api/credentials/:id/thumbnail` that returns raw image bytes
2. In the frontend, use `<img src="https://your-api/credentials/:id/thumbnail" />` — the browser caches this automatically
3. Remove `thumbnail_image_data` from the listings JSON response (only include it in the single-credential detail endpoint)

**Longer-term fix — move images to object storage:**

Use Cloudflare R2 (free 10 GB) or S3-compatible storage. Upload images once, serve via CDN. This also avoids Neon DB storage limits and reduces DB backup sizes.

### 5. No SPA Fallback on Current Host

Your `public/_redirects` file (`/* /index.html 200`) handles SPA routing for **Netlify and Cloudflare Pages**. But:

- If you deploy to **Render static site**, this file isn't used. You need to configure a rewrite rule in the Render dashboard.
- If you deploy to **Cloudflare Pages** without a `_routes.json` or proper config, hard refreshes on sub-routes will 404.

**Fix — create a `_headers` file for Cloudflare Pages:**

```apache
# public/_headers
/*.js
  Cache-Control: public, max-age=31536000, immutable
/*.css
  Cache-Control: public, max-age=31536000, immutable
/*.svg
  Cache-Control: public, max-age=31536000, immutable
/index.html
  Cache-Control: no-cache
```

And ensure your hosting platform has SPA fallback configured (see the "Before You Begin" section above).

### 6. robots.txt Allows Full Crawling (Privacy Leak)

Your `public/robots.txt` allows all search engine crawling:

```
User-agent: *
Disallow:
```

This means Google, Bing, and other crawlers can index every credential title, description, and tag. For a personal credential manager, this is a privacy risk — credential titles like "Bank Account 3" or "AWS Console" would appear in search results.

**Fix:**

```apache
# public/robots.txt
User-agent: *
Disallow: /
```

This blocks all crawling. Since the app requires authentication (or should — see backend audit), there's no benefit to being indexed.

---

## 🟠 SHOULD-HAVE (important for reliability and quality)

### 7. Console Suppression Hides Useful Debug Info

In `main.tsx`, `console.log`, `console.warn`, and `console.info` are silenced in production. While this prevents log spam, it hides:

- TanStack Query's helpful warnings (retry attempts, stale data detection)
- Network error details from `fetch()` failures
- Zod validation warnings during form submission

**Fix — only suppress console.log (not warn/info):**

```ts
if (import.meta.env.PROD) {
  console.log = () => {};  // Only suppress verbose debug logs
  // Keep console.warn and console.info for actionable warnings
}
```

Or better — don't suppress at all and rely on the logger function (#11) for production visibility.

### 8. TypesListings Query Re-fetches on Every Mount

In both create and update pages, `typesListings` is fetched via `useQuery` with no `staleTime`. Since credential types rarely change (you seeded them once), every visit to the create/edit page triggers a network request for the same data.

**Fix — add staleTime:**

```ts
const { data: typesListings } = useQuery({
  queryKey: ["types_listings"],
  queryFn: getTypesListings,
  staleTime: 5 * 60 * 1000,  // 5 minutes — types don't change often
  gcTime: 10 * 60 * 1000,
});
```

### 9. typesListings Error Not Surfaced to User

In both form pages, errors from `getTypesListings` are caught and shown via toast, but TanStack Query's `error` state isn't used:

```ts
const { data: typesListings, isLoading: isTypesListingsLoading } = useQuery({
  queryKey: ["types_listings"],
  queryFn: async () => {
    try {
      const res = await getTypesListings();
      return res.data;
    } catch (error) {
      gooeyToast.error(error instanceof Error ? error.message : "failed to fetch types");
      // ❌ Error is swallowed — query stays in "loading" state
    }
  },
});
```

**Fix — let the queryFn throw naturally and handle error in component:**

```ts
const { data: typesListings, isLoading: isTypesListingsLoading, error: typesError } = useQuery({
  queryKey: ["types_listings"],
  queryFn: () => getTypesListings().then(res => res.data),
  staleTime: 5 * 60 * 1000,
});

// In component:
{typesError && (
  <p className="text-xs text-destructive">Failed to load types</p>
)}
```

### 10. Bundle Size — Manual Chunk Splitting

Your `vite.config.ts` has no `manualChunks` configuration. With dependencies like `framer-motion` (~35 KB gzipped), `lucide-react` (~50 KB), and `@tanstack/react-form` (~40 KB), the main bundle is larger than necessary.

**Fix — add manual chunks in vite.config.ts:**

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ["react", "react-dom"],
        motion: ["framer-motion"],
        icons: ["lucide-react"],
        form: ["@tanstack/react-form", "@tanstack/react-form-devtools"],
        query: ["@tanstack/react-query"],
      },
    },
  },
},
```

Also, consider **tree-shaking lucide-react** — it imports fine but only dynamic imports reduce bundle. Alternatively, use single icon imports:

```tsx
import { ArrowLeft } from "lucide-react";  // Fine — tree-shakeable
```

### 11. No Meta Tags or Dynamic Head

The `index.html` has a generic `<title>Credets</title>` and no meta description, OG tags, or theme-color. For a personal app this is minor, but for any public sharing, the links will look bare.

**Fix — use `@tanstack/react-router`'s head management:**

TanStack Router supports per-route `<head>` metadata. Add to your route definitions:

```tsx
export const Route = createFileRoute("/credentials/$credentialId/")({
  head: () => ({
    meta: [
      { title: "Credential Detail — Credets" },
      { name: "description", content: "View credential details" },
    ],
  }),
  // ...
});
```

Also add basic OG tags to `index.html`:

```html
<meta name="description" content="Securely manage your credentials and secrets" />
<meta name="theme-color" content="#7c3aed" />
```

### 12. No Error Boundary at Route Level

If a React component crashes due to a rendering error (e.g., accessing a property on `undefined`), the entire UI collapses to a white screen with no recovery.

**Fix — add an error boundary to the root route:**

```tsx
import { ErrorBoundary } from "react-error-boundary";

function RootComponent() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary
          fallback={
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-semibold">Something went wrong</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Try refreshing the page
                </p>
              </div>
            </div>
          }
        >
          <Outlet />
        </ErrorBoundary>
        ...
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

Note: `react-error-boundary` is not installed. You could also use a simple class-based error boundary to avoid the extra dependency.

### 13. No Loading Skeletons for typesListings in Create Page

The create page shows "fetching types..." as a disabled select option while types load. This is functional but not polished. The update page has the same issue.

**Fix — Add a skeleton that matches the Select height:**

```tsx
{isTypesListingsLoading ? (
  <Skeleton className="h-10 w-full rounded-lg" />
) : (
  <Select ...>
```

---

## 🟢 NICE-TO-HAVE (free tools and quality-of-life improvements)

### 14. Frontend Error Monitoring — Sentry (Free Tier)

Same as the backend — [Sentry](https://sentry.io) free tier (5k events/month) catches React errors, unhandled promise rejections, and performance issues.

**Setup:**

```bash
cd apps/frontend && bun add @sentry/react @sentry/vite
```

```ts
// apps/frontend/src/main.tsx — at the very top
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN_FRONTEND,
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

Add the Vite plugin for source maps:

```ts
// vite.config.ts
plugins: [
  sentryVitePlugin({
    org: "...",
    project: "...",
    authToken: process.env.SENTRY_AUTH_TOKEN,
    sourcemaps: { assets: "./dist/**" },
  }),
  // ...
]
```

### 15. Frontend Monitoring — Cloudflare Web Analytics (Free)

[Cloudflare Web Analytics](https://cloudflare.com/web-analytics/) is completely free, privacy-first, and requires no cookie banner. It gives you page views, visit duration, and Core Web Vitals.

**Setup:** If you use Cloudflare Pages, it's one click in the dashboard. Otherwise, add a script snippet to your `index.html`.

### 16. Performance Monitoring — Lighthouse CI (Free)

Add a [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) GitHub Action to catch performance regressions before they ship.

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g @lhci/cli
      - run: bun install
      - run: bun run build
      - run: lhci autorun
```

### 17. Form Analytics — Plausible / Umami (Free/Self-Hosted)

If you want to know which credential types are most popular, or how users interact with forms:

- **[Umami](https://umami.is)** — Open-source, self-host for free. Lightweight script (~2 KB).
- **[Plausible](https://plausible.io)** — Paid hosted, free self-hosted (open source). Also lightweight.

**Alternative — Zero-effort:** Cloudflare Web Analytics (#14) already covers page views and basic interactions.

### 18. Preconnect to Backend API

Add a `<link rel="preconnect">` in your `index.html` for the backend origin. This hints the browser to open a connection early, reducing latency for API calls.

```html
<link rel="preconnect" href="%VITE_BACKEND_APP%" />
```

Note: This only works if `VITE_BACKEND_APP` is a static URL known at build time. If it varies by environment, you'll need to inject it via Vite's HTML transform.

### 19. Cache Control Headers for Cloudflare Pages

If you use Cloudflare Pages, add a `_headers` file to `public/` for aggressive caching of hashed assets:

```apache
# public/_headers
# Hashed assets (Vite appends content hash to filenames)
/apps/frontend/dist/assets/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# Service worker (if used)
/service-worker.js
  Cache-Control: no-cache

# HTML (never cache)
/*.html
  Cache-Control: no-cache
```

This is already partially mentioned in #5, but the `_headers` file is specifically for Cloudflare Pages.

### 20. Vite Bundle Visualizer Report

The `vite-bundle-analyzer` is already installed and configured, but gated behind `ANALYZE=true` (see #2). Use it to audit your bundle:

```bash
ANALYZE=true bun run build
```

This generates a visual treemap of your production bundle showing which packages take the most space. Review this after adding `manualChunks` (#9) to verify the split works.

### 21. Consider Moving to Cloudflare Pages or Netlify

If you're currently on Render's free tier for the frontend, **Cloudflare Pages** or **Netlify** are strictly better:

| Feature | Render Static | Cloudflare Pages | Netlify |
|---------|--------------|-------------------|---------|
| **Cold start** | None (static) | None (static) | None (static) |
| **Bandwidth** | Included | **Unmetered** | 100 GB/mo |
| **Edge network** | Basic CDN | **Global (330 cities)** | Global |
| **Build minutes** | 500/mo | 500/mo | 300/mo |
| **SPA routing** | Manual rewrite | Auto (`_routes.json`) | `_redirects` file |
| **Free SSL** | ✅ | ✅ | ✅ |

**Recommendation:** Deploy to **Cloudflare Pages**. Your existing `_redirects` file works there. Add a `_headers` file for cache control. Set up auto-deploy from GitHub.

### 22. Update skills-lock.json Path

After the shadcn skill normalization, `apps/frontend/skills-lock.json` still references the old Windsurf path:

```json
{
  "skills": {
    "shadcn": {
      "skillPath": "skills/shadcn/SKILL.md"  // ❌ Old location — was removed
    }
  }
}
```

The skills are now at `.agents/skills/shadcn/SKILL.md` (project root). This file is only used by Windsurf, which you don't use.

**Fix:**

```bash
rm apps/frontend/skills-lock.json
```

Or update the path to the new location if you want to keep it for reference.

---

## Summary Checklist

### 🔴 Must-Have (before public — 6 items)
- [ ] Gate DevTools behind `import.meta.env.DEV`
- [ ] Gate bundle analyzer behind `ANALYZE=true` env var
- [ ] Fix `createCredentialAction.ts` to check `result.success`
- [ ] Remove thumbnail base64 from listings API response (serve via separate endpoint)
- [ ] Configure SPA fallback routing on your chosen hosting platform
- [ ] Block search engine crawling in `robots.txt` (`Disallow: /`)

### 🟠 Should-Have (for reliability & quality — 7 items)
- [ ] Keep `console.warn` and `console.info` in production (only suppress `console.log`)
- [ ] Add `staleTime: 5min` to `typesListings` queries
- [ ] Surface `typesListings` query errors to the component level
- [ ] Add `manualChunks` to Vite config for code splitting
- [ ] Add per-route `<head>` metadata via TanStack Router
- [ ] Add error boundary at root route level
- [ ] Add proper loading skeletons for types dropdown

### 🟢 Nice-to-Have (free tools & improvements — 9 items)
- [ ] Set up [Sentry](https://sentry.io) for frontend error monitoring
- [ ] Enable [Cloudflare Web Analytics](https://cloudflare.com/web-analytics/) (free, privacy-first)
- [ ] Add Lighthouse CI GitHub Action for performance budgets
- [ ] Add preconnect link for backend API in `index.html`
- [ ] Add `_headers` file for Cloudflare Pages cache control
- [ ] Run bundle analyzer to audit and optimize bundle size
- [ ] Migrate from Render to Cloudflare Pages or Netlify for better free tier
- [ ] Add form analytics (Umami self-hosted or Cloudflare Web Analytics)
- [ ] Update or remove `skills-lock.json` (old Windsurf path)

---

## What You Already Have (that's good)

| Area | Status |
|------|--------|
| **Code splitting** | ✅ TanStack Router `autoCodeSplitting: true` — lazy-loaded routes |
| **Scroll restoration** | ✅ `scrollRestoration: true` in router config |
| **Route preloading** | ✅ `defaultPreload: 'intent'` — preloads on hover |
| **Infinite scroll** | ✅ Cursor-based with `IntersectionObserver`, sentinel element |
| **Skeleton loading** | ✅ Route-level `pendingComponent` with Skeletons on all data routes |
| **Error states** | ✅ Route-level `errorComponent` with back links on all data routes |
| **Theme support** | ✅ Light/dark/system with `ThemeProvider` |
| **Toast system** | ✅ `gooey-toast` with promise-based success/error/loading |
| **CSRF** | ✅ Token fetched via route loader, included in all mutations |
| **Form validation** | ✅ Zod schemas shared with backend, `onSubmitAsync` for server validation |
| **Form state** | ✅ TanStack Form with full field-level validation, dirty/pristine tracking |
| **Image preview** | ✅ Click-to-preview overlay for thumbnails and gallery images |
| **Lightbox** | ✅ Keyboard-navigable lightbox with prev/next/counter |
| **Copy-to-clipboard** | ✅ Click-to-copy on all sensitive values with visual feedback |
| **Tag coloring** | ✅ Deterministic color palette based on hash of tag string |
| **Type coloring** | ✅ Consistent color per type across detail page and listings |
| **Sensitive data** | ✅ "Reveal/Hide" toggle for password/key/secret fields |
| **Tailwind v4** | ✅ Using latest Tailwind with `@theme` directive, OKLCH colors |
| **Biome** | ✅ Linting and formatting configured |
| **Vitest** | ✅ Test runner configured with React Testing Library |

---

## Complexity / Time Estimates

| Priority | Tasks | Estimated time |
|----------|-------|----------------|
| 🔴 Must-have | 6 items | ~2-3 hours |
| 🟠 Should-have | 7 items | ~3-4 hours |
| 🟢 Nice-to-have | 9 items (setup + signup) | ~3-4 hours spread out |

Total: ~7-10 hours to go from current state to production-ready.

---

*This document was generated by auditing the full frontend source code against production best practices. Take your time reading through it, and decide what makes sense for your personal app vs. what's overkill.*
