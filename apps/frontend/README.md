# @credets/frontend

TanStack Router SPA for the Credets credential management app.

## Stack

- **Framework** — React 19
- **Routing** — TanStack Router (file-based, `src/routes/`)
- **Data Fetching** — TanStack Query + Route loaders
- **Forms** — TanStack Form + Zod validation
- **UI Library** — [shadcn/ui](https://ui.shadcn.com) with [Base UI](https://base-ui.com) primitives
- **Styling** — Tailwind CSS v4 (with `@tailwindcss/vite`)
- **Toast** — `goey-toast`
- **Icons** — Lucide React
- **Animations** — Framer Motion
- **Build Tool** — Vite
- **Testing** — Vitest + React Testing Library
- **Linting & Formatting** — Biome

## Routes

| Path | Description |
|------|-------------|
| `/` | Home / dashboard |
| `/credentials` | Credential listings with infinite scroll |
| `/credentials/create` | Create new credential form |
| `/credentials/:id` | Single credential detail view |
| `/credentials/:id/update` | Update credential form |

## shadcn/ui Component Guide

This project uses [shadcn/ui](https://ui.shadcn.com) with **Base UI** primitives (`@base-ui/react`), not Radix UI.
A comprehensive reference for developers and AI agents can be found at:

**[`docs/frontend/shadcn-ui-guide.md`](../docs/frontend/shadcn-ui-guide.md)**

It covers:
- Import aliases (`#/` prefix)
- Project-specific library choices (goey-toast, TanStack Form)
- Base UI vs Radix API differences
- Code patterns with correct imports

Canonical skill files for AI agents: `.agents/skills/shadcn/`

## Development

```bash
bun run dev      # Start dev server on http://localhost:3000
bun run build    # Production build
bun run preview  # Preview production build
```

## Testing

```bash
bun run test     # Run Vitest
```

## Linting & Formatting

```bash
bun run lint     # Biome lint
bun run format   # Biome format
bun run check    # Biome check (lint + format)
```

## Import Aliases

This project uses the `#/` alias in `package.json` imports:

```tsx
import { cn } from "#/lib/utils";
import { Button } from "#/components/ui/button";
```

## Data Flow

1. Routes use TanStack Router **loaders** for critical data (credential details, CSRF tokens)
2. Secondary data (type listings) uses **TanStack Query** with `useQuery`
3. Mutations (create, update, delete) use **Route actions** with `FormData`
4. Server-side validation errors are returned to TanStack Form's `onSubmitAsync`
