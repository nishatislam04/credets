# Document Head, Meta Tags & Open Graph (TanStack Router SPA)

> **Stack:** Vite SPA · TanStack Router · Render Static Site  
> **Product:** Credets — private personal credential manager

This guide is Credets-specific. Goal is **privacy first**, not public SEO. Search engines and social crawlers should learn almost nothing about your credentials.

---

## 1. Mental model (SPA reality check)

| Layer | What crawlers / browsers see | Who controls it |
|-------|------------------------------|-----------------|
| **`index.html` (build output)** | Always. First paint + non-JS crawlers | Vite + static tags in `apps/frontend/index.html` |
| **TanStack `head` + `<HeadContent />`** | After JS runs (browsers). Most social bots **do not** run your SPA JS | Per-route `head` in route files |
| **`robots.txt`** | Bots that respect robots | `public/robots.txt` |

**Implication for Credets:**

- Put **noindex / nofollow** and a generic title in **`index.html`** so even dumb crawlers get the signal.
- Use TanStack `head` for **tab titles** and runtime meta after navigation.
- **Never** put credential titles, passwords, notes, or tags into `og:*` or `description`. Social previews would leak them if a URL were ever shared / misconfigured.

OG tags on a private SPA are mostly brand fluff. Prefer generic copy or skip rich OG entirely.

---

## 2. Static shell — `index.html`

Minimum privacy shell (already wired in this repo):

```html
<meta name="robots" content="noindex, nofollow" />
<title>Credets</title>
```

Optional static OG (safe, non-secret):

```html
<meta property="og:title" content="Credets" />
<meta property="og:description" content="Personal credential manager" />
<meta property="og:type" content="website" />
<!-- og:image only if you add a public brand asset, e.g. /og.png -->
```

Vite replaces `%VITE_*%` in HTML at build time (used for preconnect to `VITE_BACKEND_APP`).

---

## 3. TanStack Router head API

### Root: register head + render `<HeadContent />`

```tsx
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "Credets" },
      { name: "description", content: "Personal credential manager" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Credets" },
      { property: "og:description", content: "Personal credential manager" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
});
```

`<HeadContent />` must sit high in the tree (root component). In a Vite SPA you do **not** wrap `<html>/<head>` yourself — the browser already has `index.html`; TanStack updates the live document head.

### Child routes — override title only

```tsx
// credentials/create/index.tsx
export const Route = createFileRoute("/credentials/create/")({
  head: () => ({
    meta: [{ title: "Create · Credets" }],
  }),
  // ...
});
```

```tsx
// credentials/$credentialId/index.tsx — DO NOT leak secrets
export const Route = createFileRoute("/credentials/$credentialId/")({
  head: () => ({
    meta: [
      { title: "Credential · Credets" },
      // ❌ Never: title: loaderData.title
      // ❌ Never: description: loaderData.short_description
    ],
  }),
});
```

Child `meta` merges with parent. Later routes win on matching keys (title / same `name` / same `property`).

### Links / scripts (when needed)

```tsx
head: () => ({
  links: [{ rel: "icon", href: "/favicon.ico" }],
  // scripts: [...]  — avoid analytics on a private vault unless you really want it
}),
```

---

## 4. Open Graph & Twitter — Credets policy

| Tag | Recommendation |
|-----|----------------|
| `og:title` | Always `"Credets"` (or route label like `"Create · Credets"`) — never credential name |
| `og:description` | Generic product blurb only |
| `og:image` | Optional brand PNG in `public/`. No screenshots of the app UI with data |
| `og:url` | Optional site origin only |
| `twitter:card` | Skip, or `summary` with same generic copy |
| Per-credential OG | **Do not implement** |

If a URL is ever public by mistake, OG should still reveal zero vault content.

---

## 5. `robots.txt` (pair with meta)

```
User-agent: *
Disallow: /
```

- Meta `noindex` = “don’t index this document”
- `Disallow: /` = “don’t crawl paths”

Neither is auth. Real protection = login + API auth. Robots only reduces accidental indexing of public shells / error pages.

---

## 6. Checklist for new routes

1. Add `head: () => ({ meta: [{ title: "… · Credets" }] })` if the tab title should change.
2. Keep description/OG generic.
3. Never interpolate loader/API fields that contain user vault data into head.
4. Confirm root still emits `robots: noindex, nofollow`.
5. After deploy, `curl -sI https://your-frontend` / view source: static `noindex` present in HTML even with JS disabled.

---

## 7. What this stack cannot do without SSR/prerender

- Reliable **per-URL** social previews that need JS.
- Search-engine-friendly public marketing pages (you don’t want those anyway).

If you later need a public marketing site, host it separately from the vault SPA.

---

## 8. Related files

| File | Role |
|------|------|
| `apps/frontend/index.html` | Static noindex, title, preconnect |
| `apps/frontend/public/robots.txt` | Crawl block |
| `apps/frontend/src/routes/__root.tsx` | Root `head` + `<HeadContent />` |
| Route `*.tsx` files | Per-route titles via `head` |

Sources: [TanStack Router — Document Head Management](https://tanstack.com/router/latest/docs/guide/document-head-management)
