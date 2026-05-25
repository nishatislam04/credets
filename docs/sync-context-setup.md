# Sync Context — Setup Guide

This guide shows how to integrate `sync-context.ts` into your project so that `web-chat-ai.md` stays up-to-date automatically.

## Step 1: Add the script to your project

Copy `sync-context.ts` to your project root:

```
credets/
├── sync-context.ts      ← put it here
├── package.json
├── apps/
├── packages/
└── ...
```

## Step 2: Add npm script

Add this to your root `package.json`:

```json
{
  "scripts": {
    "sync-context": "bun run sync-context.ts",
    "sync-context:check": "bun run sync-context.ts --check"
  }
}
```

Now you can run:

```bash
bun run sync-context         # regenerate web-chat-ai.md
bun run sync-context:check   # check if it's stale (exit 1 = stale)
```

## Step 3: Add a git hook (recommended)

### Option A: Using Husky (easiest)

1. Install Husky:

```bash
bun add -d husky
bunx husky init
```

2. Create a pre-commit hook:

```bash
echo 'bun run sync-context && git add web-chat-ai.md' > .husky/pre-commit
```

This will:
- Auto-regenerate `web-chat-ai.md` before every commit
- Stage the updated file so it's included in the commit

### Option B: Using simple-git-hooks (lighter)

1. Install:

```bash
bun add -d simple-git-hooks
```

2. Add to `package.json`:

```json
{
  "simple-git-hooks": {
    "pre-commit": "bun run sync-context && git add web-chat-ai.md"
  }
}
```

3. Activate:

```bash
bunx simple-git-hooks
```

### Option C: Manual git hook (no dependency)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
bun run sync-context && git add web-chat-ai.md
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

## Step 4: Optional — CI check

Add to your CI pipeline to ensure the file never goes stale:

```yaml
# GitHub Actions example
- name: Check AI context is up to date
  run: bun run sync-context:check
```

## How it works

The script scans these live project files and regenerates the dynamic sections:

| What it scans | Source files |
|---|---|
| Dependencies | `package.json` (root, frontend, backend, shared) |
| Routes | `apps/frontend/src/routes/**` |
| API endpoints | `apps/backend/index.ts` |
| Database tables | `apps/backend/db/init.sql` |
| Credential types | `apps/backend/db/seed.ts` |
| Biome config | `biome.json` |
| TypeScript config | `tsconfig.json` |
| Requirements & todos | `docs/app.md`, `docs/#todo.md` |
| shadcn components | `apps/frontend/src/components/ui/**` |

The **static sections** (TanStack best practices, React rules, form patterns, etc.) are hardcoded as template strings inside `sync-context.ts`. When you want to update those, edit them directly in the script.

## Workflow summary

```
You make code changes
       ↓
You commit (git commit)
       ↓
Pre-commit hook runs automatically:
  1. bun run sync-context → regenerates web-chat-ai.md
  2. git add web-chat-ai.md → stages the updated file
       ↓
Commit proceeds with the latest web-chat-ai.md included
```

**You never have to manually update the file again.** The only thing you might want to update manually are the static best-practice sections inside `sync-context.ts` — and even those rarely change.
