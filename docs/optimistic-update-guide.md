# Optimistic Update — Full Technical Guide

## What is Optimistic Update?

Optimistic update is a UI pattern where you **assume a mutation will succeed** and immediately update the UI to reflect the expected result — **before** the server confirms it. If the server later reports failure, you roll back the UI to its previous state.

Think of it like writing a check: you write it and hand it over, acting as if the money is already spent. If the bank bounces it, you adjust your balance. In most cases, the check clears fine and you never had to think about it.

---

## Why Do We Need It?

### Before (Pessimistic / Wait-for-Server)

```
User clicks "Create" ──▶ Loading spinner ──▶ Wait for server validation
                                                 ──▶ Wait for server creation
                                                     ──▶ Redirect to listings
```

**Total perceived delay**: 2–5+ seconds (validation + creation + redirect + listing fetch)

### After (Optimistic)

```
User clicks "Create" ──▶ Instant redirect to listings ──▶ Item appears immediately
                                                           (mutation runs in background)
```

**Total perceived delay**: ~0 seconds. The user sees the credential in the list as if it already exists.

---

## How It Works — Data Flow

### Happy Path (Success)

```
┌──────────────────────────────────────────────────────────────────────┐
│  1. User fills out form and clicks Submit                           │
│                                                                     │
│  2. TanStack Form runs client-side Zod validation                  │
│     └─ If invalid → show field errors, STOP (no optimistic update) │
│                                                                     │
│  3. onMutate fires (BEFORE the server request):                    │
│     ├─ Cancel any in-flight queries for ["credentials-listings"]   │
│     ├─ Snapshot the current cache (for rollback)                   │
│     ├─ Insert a temporary "optimistic" item into the cache         │
│     └─ Navigate to /credentials (user sees the item instantly)     │
│                                                                     │
│  4. Mutation runs in background:                                    │
│     ├─ Server validation endpoint (/create/validation)             │
│     ├─ Server creation endpoint (/create)                          │
│     └─ Both succeed ✅                                              │
│                                                                     │
│  5. onSuccess fires:                                                │
│     ├─ Invalidate ["credentials-listings"] to fetch real data      │
│     ├─ The optimistic item gets replaced by the real server data   │
│     └─ User sees no change — item was already there                │
│                                                                     │
│  RESULT: User never saw a spinner. Item appeared instantly.        │
└──────────────────────────────────────────────────────────────────────┘
```

### Error Path (Failure)

```
┌──────────────────────────────────────────────────────────────────────┐
│  1. User fills out form and clicks Submit                           │
│                                                                     │
│  2. Client-side Zod validation passes                               │
│                                                                     │
│  3. onMutate fires: same as happy path                             │
│     └─ User is now on /credentials seeing the optimistic item      │
│                                                                     │
│  4. Mutation runs in background:                                    │
│     ├─ Server validation OR creation FAILS ❌                       │
│     └─ Error thrown (validation errors, network error, etc.)       │
│                                                                     │
│  5. onError fires:                                                  │
│     ├─ Rollback the cache to the snapshot from step 3              │
│     │  (optimistic item disappears from listings)                  │
│     ├─ Store the form values + errors in memory                    │
│     └─ Navigate BACK to /credentials/create                        │
│                                                                     │
│  6. Create page mounts:                                             │
│     ├─ Reads stored form values from memory                        │
│     ├─ Pre-fills all form fields with the user's original input    │
│     ├─ Renders server validation errors on the relevant fields     │
│     └─ Shows error toast                                           │
│                                                                     │
│  RESULT: User is back on the form, everything they typed is still  │
│  there, and they see what went wrong.                              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Overview

```
src/
├── lib/
│   ├── optimistic-store.ts          ← In-memory store for form recovery
│   └── use-optimistic-mutation.ts   ← Reusable optimistic mutation hook
│
├── components/ui/
│   ├── rich-text-editor.tsx         ← RTE with useEffect readiness gate (fix)
│   └── lazy-rich-text-editor.tsx    ← FlushSync lazy wrapper (fix)
│
└── routes/credentials/
    ├── index.lazy.tsx               ← Modified: renders optimistic items
    ├── create/
    │   ├── index.lazy.tsx           ← Modified: uses optimistic mutation
    │   └── -actions/
    │       └── optimistic-create.ts ← NEW: create action for mutation
    └── $credentialId/
        └── update/
            ├── index.lazy.tsx       ← Modified: uses optimistic mutation
            └── -actions/
                └── optimistic-update.ts ← NEW: update action for mutation
```

---

## Key Concepts Explained

### 1. The Optimistic Store (`optimistic-store.ts`)

This is a simple **module-level in-memory store**. It holds form data that needs to survive a page navigation. When the mutation fails and we redirect the user back to the form, we read from this store to repopulate all the fields.

**Why not URL params or sessionStorage?**
- URL params have length limits and can't hold rich text content
- sessionStorage is async to read/write and can't store File objects
- A module-level variable is synchronous, persists across SPA navigations, and can hold any JS value

**Why not TanStack Router state?**
- Router state is serialized to the URL/history, which has size limits
- Form data with rich text + images is too large

### 2. The Mutation Hook (`use-optimistic-mutation.ts`)

This hook wraps `useMutation` from TanStack Query and adds the optimistic update logic:

- **`onMutate`**: Runs BEFORE the server request. Cancels in-flight queries, snapshots the cache, inserts the optimistic item, and redirects.
- **`onSuccess`**: Runs AFTER a successful server response. Invalidates the listings query to fetch real data (which replaces the optimistic item).
- **`onError`**: Runs AFTER a failed server response. Rolls back the cache, stores form data + errors, and redirects back.

### 3. The Query Cache Manipulation

TanStack Query stores data in a cache keyed by `["credentials-listings"]`. The listings page uses `useInfiniteQuery`, so the cache structure is:

```ts
{
  pages: [
    { credentials: [...], nextCursor: "...", hasMore: true },
    { credentials: [...], nextCursor: null, hasMore: false },
  ],
  pageParams: [undefined, "cursor-value"],
}
```

To insert an optimistic item, we prepend it to the **first page's credentials array**. To roll back, we restore the entire cached data from the snapshot.

### 4. The Temporary ID

When creating an optimistic item, we generate a temporary ID using `crypto.randomUUID()` with a `"temp-"` prefix. This:

- Matches the `CredentialListItem.id` type (string)
- Is visually identical to a real ID in the UI
- Gets replaced when the real data comes in via `invalidateQueries`
- Never clashes with real IDs (UUID format)

### 5. The "No Indicator" Rule

Per your requirement, we show **no saving indicator**. The item appears in the listings as if it's already persisted. This works because:

- The optimistic item is indistinguishable from a real one in the UI
- If the mutation succeeds, `invalidateQueries` fetches the real data seamlessly
- If it fails, we immediately redirect back and the item vanishes from the list

---

## Incident Scenarios

### Scenario 1: Network Goes Down During Creation

```
1. User submits create form
2. Optimistic item appears in listings, user is on /credentials
3. Server is unreachable → fetch throws
4. onError fires:
   - Cache is rolled back (optimistic item removed)
   - Form data stored in optimistic store
   - Navigate to /credentials/create
5. Create page reads store, repopulates all fields
6. Toast: "Failed to create credential"
7. User fixes or retries
```

### Scenario 2: Server Validation Fails (e.g., duplicate title)

```
1. User submits create form
2. Optimistic item appears in listings
3. Server validation returns { success: false, type: "form-validation", errors: { title: ["already exists"] } }
4. onError fires:
   - Cache rolled back
   - Form data + field errors stored
   - Navigate to /credentials/create
5. Create page reads store, repopulates fields + shows "already exists" on title field
6. User changes title and resubmits
```

### Scenario 3: Database Error During Creation (validation passed but insert failed)

```
1. User submits create form
2. Optimistic item appears in listings
3. Validation passes, but creation endpoint returns 500
4. onError fires:
   - Cache rolled back
   - Form data + generic error stored
   - Navigate to /credentials/create
5. Create page reads store, repopulates all fields
6. Toast: "Something went wrong on our server"
7. User can retry
```

### Scenario 4: User Navigates Away During Background Mutation

```
1. User submits, is now on /credentials seeing optimistic item
2. User quickly navigates to /credentials/$someId
3. Mutation completes in background (success or failure)
4a. If success: invalidateQueries fires, listings cache refreshed (user won't notice)
4b. If failure: onError fires, cache rolled back, navigate to /credentials/create
    - User is redirected back to create form with their data
```

### Scenario 5: Multiple Rapid Submissions

```
1. User submits create form
2. Immediately navigates back and submits again
3. First mutation's onMutate already ran (cache has optimistic item #1)
4. Second mutation's onMutate cancels first mutation's query
5. Both mutations run in parallel
6. Whichever completes last "wins" — invalidateQueries fetches fresh data
7. If either fails, its onError rolls back properly
```

---

## The Form Recovery System

When an error occurs, we need to put the user back on the form with **all their data intact**. This is the trickiest part.

### What Gets Stored

```ts
interface PendingRecovery {
  type: "create" | "update";
  formValues: Record<string, unknown>;  // All field values
  errors?: Record<string, string[]>;     // Server validation errors (field-level)
  globalError?: string;                  // Non-field error message
  credentialId?: string;                 // Only for update
  timestamp: number;                     // When the error occurred
}
```

### What Does NOT Get Stored

- **File objects** (thumbnail, images): Files cannot survive a full page navigation in an SPA. When we redirect back, file inputs will be empty. This is a browser limitation. The user will need to re-select files.
  - **Mitigation**: We show a message like "Please re-select your files" when recovering from an error that involved file uploads.

### How Form Recovery Works on the Create Page

```tsx
function RouteComponent() {
  // Check if we're recovering from a failed optimistic mutation
  const recovery = getPendingRecovery("create");

  const form = useForm({
    // Use recovered values if they exist, otherwise use defaults
    defaultValues: recovery?.formValues ?? defaultCredentialValues(csrfToken),
  });

  // Show recovered server errors
  useEffect(() => {
    if (recovery?.errors) {
      // Set field-level errors on the form
      for (const [field, messages] of Object.entries(recovery.errors)) {
        form.setFieldMeta(field, (meta) => ({
          ...meta,
          isValid: false,
          errors: messages,
        }));
      }
    }
    if (recovery?.globalError) {
      gooeyToast.error(recovery.globalError);
    }
    // Clear the recovery data after consuming it
    clearPendingRecovery("create");
  }, []);
}
```

---

## File-by-File Changes Summary

| File | Change Type | Description |
|------|------------|-------------|
| `src/lib/optimistic-store.ts` | **NEW** | In-memory store for form recovery data |
| `src/lib/use-optimistic-mutation.ts` | **NEW** | Reusable optimistic mutation hook |
| `src/components/ui/rich-text-editor.tsx` | **MODIFIED** | Added useEffect readiness gate |
| `src/components/ui/lazy-rich-text-editor.tsx` | **NEW** | FlushSync lazy wrapper replacing React.lazy() + Suspense |
| `src/routes/credentials/create/-actions/optimistic-create.ts` | **NEW** | Combined validation + creation action for the mutation |
| `src/routes/credentials/$credentialId/update/-actions/optimistic-update.ts` | **NEW** | Combined validation + update action for the mutation |
| `src/routes/credentials/create/index.lazy.tsx` | **MODIFIED** | Uses optimistic mutation + LazyRichTextEditor + form recovery |
| `src/routes/credentials/$credentialId/update/index.lazy.tsx` | **MODIFIED** | Uses optimistic mutation + LazyRichTextEditor + form recovery |
| `src/routes/credentials/index.lazy.tsx` | **MODIFIED** | Renders optimistic items from cache + visual distinction |

---

## Manual Steps Required

1. **Copy all new files** to their respective locations in your project
2. **Replace existing files** with the modified versions
3. **No environment variables or backend changes needed** — this is purely a frontend change
4. **File inputs will be empty after error recovery** — this is a browser limitation (File objects cannot survive navigation). The UI shows a message asking the user to re-select files when recovering.
5. **The `use-optimistic-mutation.ts` hook** uses your existing `queryClient` from the root component — no changes needed there.
