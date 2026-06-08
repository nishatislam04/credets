---
name: env-safety
description: Prevents accidental destruction of .env files. Enforces strict rules: never use write_file on .env, always use str_replace for targeted edits, never commit secrets to VCS. Applies whenever any .env, .env.*, or secrets file is involved.
---

# .env File Safety

## The Problem

`.env` files are **not** under version control (they're in `.gitignore`). If an AI agent uses `write_file` (which **completely replaces** the file contents), the original values — including API keys, database passwords, and encryption secrets — are **permanently lost** with no way to revert.

This happened in this project: `write_file` was used on `.env`, overwriting the user's `ENC_KEY` and `CSRF_SECRET_KEY` along with their commented Supabase storage credentials.

## Critical Rules — Always Enforced

### Rule 1: Never `write_file` on `.env` or `.env.*` files

`write_file` replaces the entire file. This is **never** acceptable for `.env`, `.env.*`, or any secrets file. Use one of the alternatives below instead.

### Rule 2: Use `str_replace` for targeted edits

If you need to change a specific line or add a new variable, use `str_replace` with the exact `oldString` that matches the line you're changing.

```ts
// ✅ Correct: targeted replacement
str_replace({
  path: ".env",
  replacements: [{
    oldString: "ENC_KEY=KEY-HERE\n",
    newString: "ENC_KEY=actual-key-value\n"
  }]
})

// ❌ Wrong: write_file on .env
write_file({ path: ".env", content: "..." })  // NEVER DO THIS
```

### Rule 3: Use terminal `cat >>` to append new sections

If you need to add new blocks at the end of a `.env` file, use a terminal command to append:

```bash
cat >> .env << 'EOF'

# New section
VARIABLE_NAME=value
EOF
```

### Rule 4: Read first, edit second

Before touching `.env`, always read its current contents first with `read_files` or `cat`. Understand what's there before making any changes.

### Rule 5: Preserve commented sections

`.env` files often have commented-out sections with alternative configurations (e.g., production settings commented out while dev settings are active). Never remove these — they serve as documentation for deployment.

### Rule 6: Validate after every change

After any edit to `.env`, verify the file still has all expected sections by reading it back. Check that no variables or comments were accidentally removed.

## Applicable Files

- `.env`
- `.env.*` (`.env.local`, `.env.production`, `.env.staging`, etc.)
- Any file containing secrets, API keys, or credentials
