# Frontend Audit — Credets SPA

> **Stack:** React 19 · TanStack Router + Query + Form · shadcn/ui (Base UI) · Tailwind CSS 4 · Vite
> **Architecture:** SPA with file-based routing, code-splitting, lazy loading

---

## 1. Architecture Overview

```text
main.tsx                          → Entry point, router creation
├── router.tsx                    → Router factory
├── routes/                       → File-based routing (TanStack Router)
│   ├── __root.tsx                → Root layout with providers
│   ├── index.lazy.tsx            → Home page
│   └── credentials/             → Main feature module
│       ├── index.lazy.tsx        → Listings with infinite scroll
│       ├── create/               → Create form
│       ├── $credentialId/        → Detail view + update form
│       ├── draft/                → Draft listings + edit
│       ├── trash/                → Trash listings
│       ├── favourite/            → Favourite listings
│       └── types/                → Type management
├── components/ui/                → shadcn/ui components
├── hooks/                        → Custom hooks (theme, mobile)
└── lib/                          → Utilities (cn)
```

---

## 2. TanStack Router

File-based routing setup and router configuration analysis.

### 2.1 Current Setup

**✅ Already doing right:**

- File-based routing with auto code-splitting (`autoCodeSplitting: true`)
- Lazy routes via `createLazyFileRoute` — proper code splitting
- `defaultPreload: "intent"` — preloads routes on hover
- `scrollRestoration: true` — restores scroll position on back navigation
- Root route has `head` meta (title, OG tags, robots)
- `pendingComponent` on loading routes (credentials/index.tsx)

#### ⚠️ Issue: Double Router Creation

```ts
// main.tsx
const router = createRouter({ routeTree, ... });

// router.tsx (separate file, UNUSED in main.tsx)
export function getRouter() {
  const router = createTanStackRouter({ routeTree, ... });
  return router;
}
```

Two files create routers. `main.tsx` imports directly from `./routeTree.gen` and creates the router
itself. `router.tsx` is defined but never imported by `main.tsx`. This is dead code — either remove
`router.tsx` or use it.

**📋 Recommendations:**

1. **Remove unused `router.tsx`** or integrate it into `main.tsx`
2. **Add `notFoundComponent`** — Currently missing; 404s render blank. Add a not-found route:

   ```tsx
   notFoundComponent: () => <div>Page not found</div>
   ```

3. **Add route error boundaries** — Use `errorComponent` on route definitions for per-route error UI

### 2.2 Route Structure Pattern

The credentials module uses a good pattern:

```text
credentials/
├── index.tsx          → Route definition + pendingComponent
├── index.lazy.tsx     → Route component (lazy loaded)
├── -actions/          → Server actions (data fetching)
├── -components/       → Shared components
├── -ui/               → UI fragments (headers, footers, errors)
└── -utils/            → Utilities (colors, formatting)
```

**✅ Excellent organization.** The `-` prefix convention keeps utility directories visually separated
from route files.

---

## 3. TanStack Query

Data fetching, caching, and mutation patterns.

### 3.1 Current Setup

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,  // 24hr garbage collection
      staleTime: 1000 * 60 * 60 * 20, // 20hr stale time
    },
  },
});
```

**✅ Already doing right:**

- Long stale times reduce unnecessary refetches
- Long GC time keeps data available after navigation
- Infinite query with cursor-based pagination (credentials listings)
- Proper query key conventions (`["credentials-listings"]`, `["draft-listings"]`)
- `invalidateQueries` after mutations to refresh listings

#### ⚠️ Issue: Stale Data Risk

20-hour stale time means users may see stale data for up to 20 hours after another session modifies
credentials. For a single-user app this is less critical, but if the backend or S3 data changes
externally, the UI won't reflect it for a long time.

**📋 Recommendations:**

1. **Add `refetchOnWindowFocus`** — Set to `true` or a shorter interval:

   ```ts
   refetchOnWindowFocus: true, // Already default in v5
   ```

2. **Consider per-query stale times** — Listings could be fresh for 5 min, detail pages for 30 min:

   ```ts
   queryKey: ["credentials-listings"],
   staleTime: 1000 * 60 * 5, // 5 minutes
   ```

### 3.2 Mutation Pattern

**✅ Good pattern:** Mutations (create, update, delete) use direct `fetch` calls wrapped in action
functions, then invalidate caches on success. This is lighter than TanStack Query mutations for
simpler cases.

---

## 4. TanStack Form

Form management with client and server-side validation.

### 4.1 Current Setup

```tsx
const form = useForm({
  defaultValues: { ... },
  validators: {
    onSubmit: credentialsCreateSchema,       // Zod schema (client-side)
    onSubmitAsync: async ({ value }) => {    // Server validation
      const data = await createCredentialValidation(value);
      if (!data.success) return { fields: data.errors };
    },
  },
  onSubmit: async ({ value }) => {
    await createCredentialAction(value);
  },
});
```

**✅ Already doing right:**

- Dual validation: client-side (Zod) + async server-side
- `mode="array"` for dynamic data blocks
- `form.Subscribe` for reactive submit button state
- `form.reset()` after successful submit
- Proper `children` render-prop pattern (TanStack Form idiomatic)

**📋 Recommendations:**

1. **Add `validators.onChange` for real-time feedback** — Currently validation only runs on submit.
Add field-level onChange validators:

   ```tsx
   validators: {
     onChange: ({ value }) => {
       if (value.title && value.title.length > 200) {
         return "Title must be under 200 characters";
       }
     },
   },
   ```

2. **Standardize error handling** — The create and update forms duplicate the same catch/error
handling logic. Extract into a shared utility:

   ```tsx
   function handleSubmitError(error: unknown) {
     if (error instanceof AppError) {
       toast.error(error.message);
       return { message: error.message };
     }
     toast.error("Something went wrong");
     return { message: "Something went wrong" };
   }
   ```

---

## 5. Shadcn/ui Usage (Base UI)

Component library usage patterns and conventions.

### 5.1 Component Library

**Installed components:** Button, Card, Input, Textarea, Select, Badge, Skeleton, Separator,
AlertDialog, Spinner, Item, Field, Label, Form, Dialog, Sheet, Sidebar, TagInput, Combobox, Switch,
Tooltip, Table, Empty

**✅ Already doing right:**

- Base UI primitives (`render` prop for custom triggers, not `asChild`)
- Semantic colors (`bg-card`, `text-muted-foreground`) — no raw colors
- Proper `cn()` usage for conditional classes
- `gap-*` for spacing instead of `space-*`
- `size-*` for equal dimensions
- `FieldGroup` + `Field` composition for forms
- `data-invalid` + `aria-invalid` for validation states
- Field labels with required indicators (`<span className="text-destructive">*</span>`)

**📋 Recommendations:**

1. **Replace raw `<button>` elements** — Several places use raw HTML `<button>` instead of the
shadcn `Button` component. Example from `index.lazy.tsx`:

   ```tsx
   // Before:
   <button type="button" onClick={...} className="inline-flex ...">
   // After:
   <Button type="button" variant="outline" size="sm" onClick={...}>
   ```

2. **Replace `<hr>` with `<Separator />`** — The shadcn `Separator` component is more theme-aware:

   ```tsx
   // Before:
   <hr className="border-t border-border/40" />
   // After:
   <Separator className="my-4" />
   ```

3. **Standardize button styling** — Custom button classes are duplicated across the listings page.
Extract into a shared component or use `Button` with consistent variants.

### 5.2 Toast System

**Recently migrated:** `gooey-toast` → `@base-ui/react/toast`

Now using shadcn's base-ui toast wrapper from `#/components/ui/toast` with:

- Top-right positioning
- Colorful icons (green/red/amber/blue)
- Offset support via `Toaster offset="5rem"`
- Theme sync via CSS variables
- Promise/loading/error/success states
- Convenience API: `toast.success()`, `.error()`, `.warning()`, `.info()`, `.promise()`

#### ⚠️ @Base-Ui/react Version Risk

The project uses `@base-ui/react@^1.5.0`. Base UI is a relatively new library (replacing the older
Radix UI v2 beta), and its API is still evolving. Key risks:

- **Breaking changes between minor versions** — Pin to a specific version (e.g., `"1.5.0"` without
`^`) to prevent unexpected breakage from `bun update`.
- **Missing component variants** — Some shadcn/ui presets assume Radix UI patterns; Base UI
variants may differ. Verify each component works after updates.
- **Swipe-to-dismiss bug** — Base UI toast animations for swipe dismissals can interfere with
top-positioned toasts. The current `translateY(-150%)` fix addresses this, but future versions may
change the animation API.

---

## 6. Performance Analysis

Code splitting, image handling, and rendering performance.

### 6.1 Code Splitting

**✅ Already doing right:**

- TanStack Router auto code-splitting
- `lazy()` + `Suspense` for RichTextEditor (large component)
- Route-specific actions (action functions co-located with routes)

**📋 Recommendations:**

1. **Add route-level error boundaries** — Currently only a global `ErrorBoundary`. Route-level error
boundaries provide better UX per section.

2. **Monitor bundle size** — The vite-bundle-explorer plugin is configured but only runs in staging
mode. Run it regularly to track bundle growth.

### 6.2 Image Handling

**✅ Already doing right:**

- WebP conversion on the backend
- Thumbnails resized to 800px width
- Images resized to 1400px width
- `CredetsImage` component (likely handles optimization)

### 6.3 Infinite Scroll

**✅ Already doing right:**

- Cursor-based pagination (not offset-based — more reliable)
- IntersectionObserver with 200px rootMargin for pre-loading
- Separate UI components for loading/error/empty states
- Proper guard conditions for fetch triggers

---

## 7. Styling & CSS

Tailwind CSS v4 setup, theming, and CSS organization.

### 7.1 Current Setup

- Tailwind CSS v4 with `@theme inline` blocks
- Dark mode via `.dark` class toggle
- CSS variables in `:root` (light) and `.dark` (dark)
- Semantic color tokens throughout
- Animate CSS (`tw-animate-css`) for transitions

**✅ Already doing right:**

- All colors use oklch color space (better perception accuracy)
- Semantic tokens used everywhere (no raw hex colors)
- Rich text content has proper reset styles
- Code block syntax highlighting with lowlight
- Proper caret-color fix for Tiptap editor

**📋 Recommendations:**

1. **Consolidate CSS** — The styles.css file has grown large. Consider splitting into:
   - `styles.css` (base styles, theme variables)
   - `rte.css` (rich text editor styles)
   - `hljs.css` (syntax highlighting)

2. **Use `@layer`** — Organize CSS into layers:

   ```css
   @layer base, components, utilities;
   ```

---

## 8. Accessibility

Current accessibility features and improvement areas.

### 8.1 Current State

**✅ Already doing right:**

- `aria-invalid` on form controls
- Field labels with `htmlFor` attribute
- `aria-label` on icon buttons
- Dialog titles (mandatory for Dialog/Sheet/Drawer)
- Proper heading hierarchy in content pages

**📋 Recommendations:**

1. **Add `aria-live="polite"` to toast viewport** — Screen readers should announce toasts:

   ```tsx
   <ToastViewport aria-live="polite" aria-label="Notifications" />
   ```

2. **Add skip-to-content link** — Keyboard users benefit from skipping navigation.

3. **Ensure form error announcements** — Use `aria-describedby` to associate errors with inputs.

---

## 9. Import Conventions

Import alias usage and standardization recommendations.

### 9.1 Alias Usage

The project has **two** import aliases:

- `#/` — via `package.json` `imports` field (preferred)
- `@/` — via `tsconfig.json` `paths`

#### ⚠️ Issue: Inconsistent Usage

```tsx
// Some files use #/:
import { Field } from "#/components/ui/field";
import { toast } from "#/components/ui/toast";

// Some files use @/:
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
```

**📋 Recommendation:** Standardize on **`#/`** (from `package.json` imports) since it's the project's
explicit preference and works with both Bun and bundler resolution.

---

## 10. Mobile Responsiveness

**✅ Already doing right:**

- Mobile-first layout (grid breaks at `md:` breakpoint)
- Full-width mobile sidebar
- Responsive form layouts (stacked on mobile, side-by-side on desktop)
- Image gallery adapts to viewport

**📋 Recommendations:**

1. **Test on 320px viewport** — Some elements (especially the credentials header toolbar) may
overflow on very small screens
2. **Consider bottom navigation** — The sidebar is hidden on mobile; ensure all navigation paths are
accessible via the top header

---

## 11. Render.com SPA Deployment Guide

Credets is deployed on Render as a static site. Here are specific considerations for SPA hosting:

### 11.1 SPA Routing (Redirects/Rewrites)

Render's static sites do NOT use a `_redirects` file (like Netlify). Instead, you configure
redirects in the **Dashboard** or in `render.yaml`:

```yaml
# In render.yaml under the frontend service:
routes:
  - source: /*
    destination: /index.html
    action: rewrite
```

> **Why this is required:** Without this rule, navigating directly to `/credentials/create` or
> refreshing the page on any route other than `/` will return a 404 from Render's CDN. The rewrite
> instructs Render to serve `index.html` for all paths, letting your React Router handle the
> actual routing.

### 11.2 Caching Strategy

Set different cache headers for hashed assets vs the entry HTML:

```yaml
headers:
  - path: /assets/*
    name: Cache-Control
    value: "public, max-age=31536000, immutable"  # 1 year — hashed files never change
  - path: /*
    name: Cache-Control
    value: "public, max-age=300, must-revalidate"  # 5 min — HTML must check for new deploys
```

> **Why two rules:** Vite generates hashed filenames (`main.abc123.js`). These are immutable — once
> deployed, they never change. But `index.html` must fetch fresh on each deploy, so short cache +
> `must-revalidate` ensures users get the latest JS bundle.

### 11.3 Preview Deploys (PR Branches)

Enable automatic preview environments in `render.yaml`:

```yaml
previews:
  generation: automatic
```

Each PR gets a unique URL. Include `[skip preview]` in PR titles to skip builds for documentation
or minor changes.

### 11.4 Current `public/` Directory

The project already has:

- `public/_redirects` — This is a Netlify convention, **NOT used by Render**. Remove or ignore it.
- `public/manifest.json`, `public/robots.txt` — These are correctly in the static publish root.

---

## 11. Key Issues Found

| Severity | Issue | File | Fix |
| ---------- | ------- | ------ | ----- |
| 🔴 Medium | Unused `router.tsx` | `apps/frontend/src/router.tsx` | Remove or integrate |
| 🟡 Low | Raw `<button>` instead of `Button` | Multiple files | Use `Button` component |
| 🟡 Low | `<hr>` instead of `<Separator>` | `index.lazy.tsx` | Use `Separator` |
| 🟡 Low | Inconsistent imports (`#/` vs `@/`) | Multiple files | Standardize on `#/` |
| 🟢 Info | `crypto.randomUUID()` in render | `index.lazy.tsx` | Use stable key (index-based) |
| 🟢 Info | Duplicated error handling in forms | `create/` and `update/` | Extract shared handler |
| 🟢 Info | 20hr stale time | `__root.tsx` | Consider shorter per-query stale times |

---

## 12. What You're Already Doing Well

| Practice | Why It Matters |
| ---------- | --------------- |
| **File-based routing with code-splitting** | Automatic lazy loading per route, smaller bundles |
| **TanStack Form with dual validation** | Client + server validation for data integrity |
| **Cursor-based infinite scroll** | Reliable pagination that handles insertions/deletions |
| **shadcn/ui with semantic colors** | Consistent, themeable UI with proper dark mode |
| **Base UI primitives** | Accessible, customizable, headless components |
| **Lazy-loaded RichTextEditor** | Keeps main bundle small — RTE is only loaded on form pages |
| **Separate action/utils/ui dirs** | Clean separation by concern within route modules |
| **Error boundary + toast system** | Graceful error handling with user feedback |
| **Theme provider with system sync** | Respects user preferences, persists choice |
| **Bundle analysis in staging** | Early visibility into bundle size changes |

---

## 13. Quick Wins (By Priority)

1. **Remove dead `router.tsx`** — Unused file, confusing for developers
2. **Replace raw `<button>` with `<Button>`** — Better consistency, less custom CSS
3. **Standardize imports — use `#/` everywhere** — One alias, one convention
4. **Add `notFoundComponent`** — Better UX for invalid routes
5. **Replace `<hr>` with `<Separator>`** — Theme-aware, shadcn convention
6. **Add route-level error boundaries** — Granular error recovery
7. **Shorten stale time for listings** — 20 hours is too long for dynamic data
