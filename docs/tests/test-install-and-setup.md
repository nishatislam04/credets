# Backend Tests with Bun — Install and Setup

This guide covers installing and setting up unit tests for the Credets
backend using the built-in bun test runner. It answers the question you
asked directly: do we need any additional packages or tools in our
monorepo?

## 1. What Bun Test Gives Us

Bun ships a full test runner built into the runtime — no Jest, no
Vitest, no extra framework. Everything is imported from `bun:test`:

- `describe`, `test` / `it`, `expect` — the core API (Jest-compatible)
- `beforeAll`, `afterAll`, `beforeEach`, `afterEach` — lifecycle hooks
- `mock`, `spyOn`, `mock.module` — mocking and spying
- `--coverage`, `--watch`, name and file filters — runner features

Because it is built in, tests run through the exact same Bun runtime and
TypeScript pipeline as the backend itself.

## 2. What We Need to Install

The honest answer: nothing new.

- `bun:test` ships with the Bun runtime we already use.
- `@types/bun` is already a devDependency at the monorepo root, and the
  root tsconfig sets `"types": ["bun", "node"]` — so TypeScript already
  knows about `Bun`, `BunRequest`, `File`, `FormData`, and `bun:test`.
- No new packages go into apps/backend, apps/frontend, or the root.

The only "setup" is wiring the test script and (optionally) a bit of
config in `bunfig.toml`.

## 3. Add the Test Script

apps/backend/package.json has no `test` script yet. Add one:

```json
"scripts": {
  "test": "bun test"
}
```

Then run it from the monorepo root, exactly like the existing
`dev:backend` script:

```bash
bun --filter @credets/backend test
```

The `--filter` flag makes Bun run the script inside the backend
workspace while resolving all workspace packages from the root.

## 4. Where Test Files Live

`bun test` discovers these automatically (anywhere under the backend,
skipping node_modules):

- `*.test.ts`, `*.spec.ts` (and their .js/.tsx variants)
- any test inside a `__tests__` directory

Two conventions work well here:

- Colocated: `repository/credentials/create.test.ts` next to
  `create.ts` — easy to find, matches the source it tests.
- Centralized: `apps/backend/tests/` mirroring the source tree.

Pick one. Colocated is the common choice for unit tests.

## 5. Configure `bunfig.toml`

The root bunfig.toml currently has an `[install]` section. You can add a
`[test]` section later, but nothing is required for a first run:

```toml
[test]
root = "apps/backend"          # only discover tests under the backend
timeout = 10000                # default per-test timeout (ms)
coverage = true                # collect coverage when asked
coverageThreshold = 80         # optional: fail under 80%
```

Notes:

- `root` avoids accidentally picking up frontend files if tests ever
  appear there.
- Coverage thresholds are a good habit once you have real tests.
- You can always override with flags: `bun test --timeout 20000`.

## 6. Run the Tests

From the root, via the workspace filter:

```bash
bun --filter @credets/backend test
```

Useful variants:

```bash
bun test --coverage                       # coverage report
bun test --watch                          # re-run on file changes
bun test validation/credential            # run files matching a path
bun test -t "csrf"                        # run tests whose name matches
```

## 7. Path Aliases and Types

No setup needed — Bun resolves tsconfig `paths` natively at runtime and
in tests. The aliases from the root tsconfig.json just work inside test
files:

```ts
import { sql } from "@db/connection";
import { encrypt } from "@backend/cipher/encrypt";
import { credentialsCreateSchema } from "@credets/shared-schema/credentials/create";
```

No tsconfig-paths, no plugin, no preload script required.

## 8. Environment Variables in Tests

Some modules read env vars at call time (not import time):

- `ENC_KEY` — the cipher uses it to derive the AES key
- `CSRF_SECRET_KEY` — CSRF verification uses it
- `STORAGE_*` — only touched when S3 is actually called

Real unit tests should mock the modules that touch these (see the
create-endpoint analysis). When a test needs a real env value, set it
inside the test and restore it in `afterEach`:

```ts
const saved = process.env.ENC_KEY;
process.env.ENC_KEY = "ab".repeat(32); // 64 hex chars
// ... test ...
process.env.ENC_KEY = saved;
```

`.env.test.local` is already gitignored if you prefer a dotenv file.

## 9. Verdict: No New Packages

- Test runner: built into Bun.
- Types: `@types/bun` already installed at root.
- Aliases: resolved by Bun from tsconfig.
- Mocking: built into `bun:test`.

The only change is the `test` script in apps/backend/package.json. The
related docs teach you the rest:

- How to write the CI workflow for tests — see
  `docs/tests/ci-github-actions-for-tests.md`
- What to test in the credentials create domain — see
  `docs/tests/backend/credentials/create.md`
