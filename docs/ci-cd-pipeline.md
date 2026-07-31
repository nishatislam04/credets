# CI/CD Pipeline for the Credets Monorepo — a Learning Guide

This guide teaches you how GitHub Actions works and why every line of a
workflow file is written. It covers every tool you researched (checkout,
setup-bun, Biome, reviewdog, rumdl, cache, semantic versioning), plus the
Render deploy part, running workflows locally on your Arch Linux
(EndeavourOS, KDE Plasma) machine, and watching cloud runs from your
terminal.

We do not save a real workflow file yet. The goal is research and
understanding — after reading this you can write the file yourself.

## 1. The Mental Model: What CI and CD Mean for Us

CI (continuous integration): every time you push to `main`, GitHub spins
up a fresh Linux virtual machine and runs your checks — formatting, lint,
tests, builds. If one check fails, the pipeline is red and you fix it
before anything else ships.

CD (continuous deployment): after all CI checks pass, the pipeline
automatically triggers a production deploy on Render. No manual clicks.

For now the trigger is simple: push to `main` only. No pull requests, no
staging branches. You can add more triggers later.

## 2. How GitHub Actions Works

Keep three ideas in your head:

- A workflow is a YAML file in `.github/workflows/`. YAML is data, not
  code — the keywords only configure what GitHub does for you.
- An event (`on:`) wakes the workflow. GitHub then creates a fresh VM,
  called a runner, with the OS you ask for (`runs-on`). For us that is
  `ubuntu-latest` — a free, shared, always-clean Ubuntu machine with many
  tools preinstalled (Git, Docker, Node, and so on).
- A job is a list of steps on that machine, run top to bottom. Each step
  either borrows a ready-made action (`uses:`) or runs a shell command
  (`run:`). Actions are just published GitHub repositories — that is
  what the marketplace links you collected are.

Free tier: GitHub gives free accounts a monthly allowance of runner
minutes (about 2,000 on free personal accounts). Our pipeline is short,
so we stay well under it.

## 3. Anatomy of a Workflow File — Keyword by Keyword

Here is the smallest honest workflow:

```yaml
name: CI

on:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Print a message
        run: echo "hello from CI"
```

Now every keyword, one by one:

- `name:` — a display name shown in the Actions tab. Optional; the file
  name is used otherwise.
- `on:` — the event that triggers the workflow. `push` fires on every
  push; `branches: [main]` narrows it to pushes on `main` only. That
  single rule satisfies "we only run CI on push to main".
- `permissions:` — the least-privilege block. Every workflow gets an
  automatic token (`GITHUB_TOKEN`) that can talk to the GitHub API. We
  only read the repository, so we say `contents: read`. A read-only
  token cannot push, delete, or publish — exactly what a pipeline that
  only checks code and then calls a Render webhook needs.
- `jobs:` — a map of job ids. Here one job named `checks`. Jobs run in
  parallel unless you add `needs:` between them.
- `runs-on:` — the runner image. `ubuntu-latest` is the free, standard
  choice.
- `steps:` — the ordered list of steps inside a job.
- `- name:` — a human label for the step; it shows up in the logs.
- `uses:` — borrow a published action. `actions/checkout@v4` is the
  official action that downloads your repository into the runner. It
  must be the first step of almost every job, because every later step
  works on the checked-out files. The `@v4` is a git tag — the action's
  major version. A major tag gives you bug fixes without editing the
  file; pinning a full commit SHA is the security-maximum option (see
  section 11).
- `run:` — a shell command executed directly on the runner.

Other keywords you will meet soon:

- `with:` — inputs to an action, e.g. `with: bun-version: 1.3.14`.
- `if:` — a condition, e.g. only run a step under certain circumstances.
- `env:` — environment variables for a step or the whole job.
- `needs:` — makes one job wait for another (used so deploy waits for
  all checks).
- `concurrency:` — cancels an older run when a newer push arrives.

## 4. What Our Pipeline Must Do

This table maps each requirement to the tool and the exact command:

| Requirement | Tool | Command |
| --- | --- | --- |
| Get the code | actions/checkout | none (action) |
| Install Bun | oven-sh/setup-bun | none (action) |
| Install dependencies | bun (root) | `bun install --frozen-lockfile` |
| Format + lint | Biome | `bunx biome ci .` |
| Lint Markdown docs | rumdl | (action) |
| Backend tests | bun test | `bun --filter @credets/backend test` |
| Frontend build check | vite | `bun run build:frontend` |
| Backend container check | docker | `docker build -f apps/backend/Containerfile .` |
| Cache installs | actions/cache | none (action) |
| Deploy | Render hook | `curl -X POST URL` |

Each row is explained in the next sections.

## 5. Tool by Tool

Each tool below answers three questions: what it does, why we need it, and
how it fits our monorepo.

### 5.1 `actions/checkout` — Fetch the Code

Why first: the runner is empty. Without checkout there is nothing to
lint, test, or build. Defaults are fine for us. Two inputs worth knowing:

- `fetch-depth: 0` — fetches full history. We do not need it; the
  default shallow clone (depth 1) is faster.
- `persist-credentials: false` — stops the token from being saved into
  git config. Nice hygiene since our CD step does not push anywhere.

### 5.2 `oven-sh/setup-bun` — Install Bun

The runner does not ship Bun. This action downloads and installs it.
Version resolution, in order: your `package.json` `packageManager` field,
then `engines.bun`, then `latest`. Your root package.json has neither, so
it would grab the latest Bun — which can drift from your local version
and from the `1.3.14` pinned in the Containerfile.

Best practice: pin it, e.g. `bun-version: 1.3.14`, or better, add a
`.bun-version` file at the root containing `1.3.14` and set
`bun-version-file: .bun-version`. Then local dev, the Containerfile, and
CI all agree on one version.

### 5.3 `bun install` in a Monorepo — Root Only

You are right: run install once at the root. Bun reads the root
`package.json` `workspaces` array (`apps/*`, `packages/*`), installs
every workspace's dependencies, and links `@credets/*` workspace
packages into each app's `node_modules` automatically. Running `bun
install` inside `apps/backend` or `apps/frontend` would be wrong — those
folders are not the workspace root, and bun resolves everything from the
root anyway.

Use `--frozen-lockfile`: it fails the job if `bun.lock` is out of date,
which catches forgotten lockfile commits. The Containerfile already uses
the same flag.

### 5.4 Biome — Format and Lint Must Pass

Biome is already a devDependency at the root (`@biomejs/biome` 2.5.4), so
the least-moving-parts option is simply:

```yaml
- name: Check formatting and linting
  run: bunx biome ci .
```

`bunx biome ci .` is Biome's CI mode: it verifies formatting, lint rules,
and import organization, and exits non-zero on any violation — which
fails the job. That is exactly "must pass linting and formatting".

The alternative you linked, `biomejs/setup-biome`, installs the standalone
CLI and auto-detects your version from the lockfile or `biome.json`. It
is convenient if you do not want the dependency installed, but since
Biome is already pinned in your package.json, plain `bunx biome ci` keeps
one fewer moving part and guarantees the exact same version as local.

### 5.5 Biome + Reviewdog — Verdict: Skip It for Now

What reviewdog does: instead of only failing the job, it posts inline
comments on the changed lines directly in pull requests, with suggestion
blocks you can click to fix.

Why it does not fit us right now:

- reviewdog is built for pull requests. It comments on a diff. Our
  pipeline only fires on push to main — there is no PR to comment on.
- It needs extra permissions (`pull-requests: write`), which contradicts
  the least-privilege `contents: read` model from section 3.
- Without a PR, `biome ci` already fails loudly and shows the exact file
  and line in the run log. You lose nothing.

Verdict — skip it now. Revisit it the day you start working with pull
requests; then it is genuinely nice. The same logic applies to rumdl's
annotations feature below, which is the lightweight, PR-free equivalent.

### 5.6 rumdl — Lint the Markdown Docs

Your docs live under `docs/` and your `.rumdl.toml` already includes
`docs/**/*.md`. The official action is `rvben/rumdl`:

```yaml
- name: Lint markdown docs
  uses: rvben/rumdl@v0
  with:
    config: .rumdl.toml
    path: docs
    report-type: annotations
```

Inputs explained:

- `config` — path to your config file. It is auto-detected, but saying
  it explicitly never hurts.
- `path` — what to lint. `docs` matches your `include` globs.
- `report-type: annotations` — shows violations as file annotations on
  the run page (reviewdog-style, but built-in and PR-free). `logs` is
  the plain log alternative.
- `version` — defaults to latest; pin it if you want stability.
- `fail-on-error` — defaults to true; leave it, a failing doc lint
  should fail the pipeline.

### 5.7 Backend Tests with Bun

Bun ships a full test runner — no extra package needed. Later (task 1 of
your todo) you will add a `test` script to `apps/backend/package.json`:

```json
"scripts": {
  "test": "bun test"
}
```

Then CI runs it through the workspace filter from the root:

```bash
bun --filter @credets/backend test
```

That is the same pattern as your existing `dev:backend` script. No
frontend tests for now, as you decided.

### 5.8 Frontend Build — Verify It Compiles

The root script already exists: `build:frontend` maps to
`bun --filter @credets/frontend build`, which runs `vite build`. CI just
calls it:

```bash
bun run build:frontend
```

This catches TypeScript, route, and bundling errors before they reach
production.

### 5.9 Backend Container Build — the Containerfile

`ubuntu-latest` ships with Docker preinstalled, so the step is simply:

```bash
docker build -f apps/backend/Containerfile .
```

Note the trailing dot: it is the build context, and your Containerfile
copies files relative to it (root package.json, apps/, packages/). No
push to a registry — Render builds from your repository itself. The CI
build is only a "can this image be built?" sanity check, which is what
you asked for.

### 5.10 `actions/cache` — Why and How

The problem: every run starts on a fresh VM, so `bun install` downloads
every package from the registry again each time. That is slow and
wasteful.

How `actions/cache` fixes it: GitHub keeps a blob store per repository.
The action saves the folders you list (`path:`) under a `key:`, and
restores them on the next run if the key matches. Two inputs matter:

- `key` — the fingerprint. You build it from `runner.os` plus a hash of
  the lockfile: `hashFiles('bun.lock')`. When the lockfile changes, the
  key changes and the cache is invalidated — stale caches are never used
  for new dependencies.
- `restore-keys` — fallback prefixes. If the exact key misses, GitHub
  restores the newest cache whose key starts with this prefix. The
  workflow then runs `bun install` anyway, but the warm cache makes it
  nearly instant.
- `cache-hit` — an output (`steps.X.outputs.cache-hit`) that tells you
  whether the restore was exact, so you can skip the install step
  entirely. With bun this is usually not worth it; bun's own cache below
  already makes installs fast.

For our monorepo, cache these two things:

| Path | Key | What it saves |
| --- | --- | --- |
| ~/.bun/install/cache | ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }} | Downloaded package tarballs |
| apps/frontend/node_modules/.vite | ${{ runner.os }}-vite-${{ hashFiles('apps/frontend/**') }} | Vite pre-bundled deps |

The first is the big win: your `bunfig.toml` sets `globalStore = true`,
so bun keeps a global store of every downloaded package in
`~/.bun/install/cache`. Restoring it means `bun install` mostly hard-links
from the cache instead of hitting the network. Keying it on `bun.lock`
means it only re-downloads when dependencies actually change. The whole
monorepo shares this one cache — that is the answer to "benefits in our
monorepo": one cache entry serves backend, frontend, and all shared
packages.

## 6. Semantic Versioning — Verdict: Not Now

What the tools do (your link pointed at a tool like
devops-infra/actions-semantic-version):

- `devops-infra/actions-semantic-version` — computes the next semver
  number from your commit messages and outputs it. No tags, no releases.
- `mathieudutour/github-tag-action` — bumps a git tag (fix: -> patch,
  feat: -> minor, breaking -> major) and creates a GitHub release.
- `semantic-release` — the full framework: parses commits, versions,
  writes changelogs, publishes. Powerful, but a real learning curve and
  it expects an npm-publishing workflow.

Why not now:

- Our app is deployed via Render webhooks, not published as a package. A
  version tag in the repo does not drive any deployment today.
- Every one of these tools needs a personal access token with write
  access (a custom `GITHUB_TOKEN`), which widens the attack surface — the
  opposite of the least-privilege rule.
- You are learning CI for the first time. Versioning is a distraction;
  get the green pipeline first.

Later, if you want tagged releases, start with the simplest tool and only
after conventional commits are a habit.

## 7. The CD Part: Render Deploy Hooks and GitHub Secrets

Render can deploy on every push by itself (your render.yaml has
`autoDeployTrigger: commit`). The point of doing it from CI is control:
deploy only after all checks pass. Two options:

Option A — deploy hook (recommended for learning):

1. In the Render dashboard open your backend service.
2. Go to Settings, then Deploy Hooks, then copy the hook URL. It looks
   like `https://api.render.com/deploy/srv-...`.
3. In GitHub, open your repo, then Settings, then Secrets and variables,
   then Actions. Click New repository secret. Name it
   `RENDER_DEPLOY_HOOK` and paste the URL as the value.
4. In the workflow, a deploy job that waits on all checks curls the hook:

```yaml
deploy:
  needs: checks
  runs-on: ubuntu-latest
  steps:
    - name: Trigger Render deploy
      env:
        RENDER_DEPLOY_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
      run: curl -f -X POST "$RENDER_DEPLOY_HOOK"
```

The hook accepts GET or POST and returns 200 (or 202 while another
deploy is queued). Use `curl -f`: without it, curl exits 0 even when
Render rejects the request, and the deploy step would look green while
nothing deployed. Because the URL lives in a secret, GitHub masks it in
logs. Anyone who knows the URL can deploy, so treat it like a password;
Render lets you regenerate it anytime.

Important — avoid double deploys: your render.yaml currently sets
`autoDeployTrigger: commit`, so Render already deploys on every push by
itself. If you also trigger via the webhook, every push causes two
deploys. When you move deployment to CI, set `autoDeployTrigger: off` in
render.yaml and let the pipeline be the only deployer.

Option B — checksPass (zero CI work): change `autoDeployTrigger: commit`
to `checksPass` in render.yaml. Then Render deploys only when your
GitHub checks pass. Simpler, but you have less control and visibility,
which is why Option A teaches you more.

## 8. A Complete Annotated Example — Study, Then Write Your Own

This is the teaching artifact. Do not copy it verbatim — understand it,
adjust it, and only then save it as `.github/workflows/ci.yml`:

```yaml
name: CI/CD

# Only run when code lands on main.
on:
  push:
    branches: [main]

# Read-only token: we only check code and curl a webhook.
permissions:
  contents: read

# If a new push arrives while an old run is going, cancel the old one.
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.3.14   # match your Containerfile

      - name: Restore bun cache
        uses: actions/cache@v6
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}

      - name: Install dependencies (root workspace)
        run: bun install --frozen-lockfile

      - name: Format + lint (Biome)
        run: bunx biome ci .

      - name: Lint markdown docs (rumdl)
        uses: rvben/rumdl@v0
        with:
          config: .rumdl.toml
          path: docs
          report-type: annotations

      - name: Backend tests
        run: bun --filter @credets/backend test

      - name: Build frontend
        run: bun run build:frontend

      - name: Build backend image
        run: docker build -f apps/backend/Containerfile .

  deploy:
    needs: checks          # deploy only if every check passed
    runs-on: ubuntu-latest
    steps:
      # No checkout needed: this job only curls a webhook.
      - name: Trigger Render deploy
        env:
          RENDER_DEPLOY_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
        run: curl -f -X POST "$RENDER_DEPLOY_HOOK"
```

Note the two-job shape: `checks` does the verification, `deploy` waits
with `needs:` and only runs when checks is green. A failed check
automatically blocks the deploy. The deploy job deliberately has no
checkout — it needs no repo files, only the webhook URL. That is the
whole CI/CD story in one file.

## 9. Running the Pipeline Locally with `act` on Arch

`act` (nektos/act) runs GitHub Actions workflows on your machine inside
containers, so you can test everything before pushing.

Install — `act` is in the official Arch repos, no AUR needed:

```bash
sudo pacman -S act
```

Point `act` at podman. Podman speaks the Docker API through a socket,
and `act` talks to the Docker socket:

```bash
systemctl --user enable --now podman.socket
export DOCKER_HOST="unix:///run/user/$(id -u)/podman/podman.sock"
```

Put the export in `~/.bashrc` so every terminal has it.

Give `act` your secrets. Create a `.secrets` file at the repo root and
add it to `.gitignore` (treat it like any `.env` file):

```bash
RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-...
GITHUB_TOKEN=<paste a personal access token>
```

Then run the workflow:

```bash
act push                    # run the whole workflow as if you pushed
act -l                      # list jobs and their ids
act -j checks               # run only the checks job
act -n                      # dry run: validate without executing
```

Gotchas you will hit:

- Default images are huge. Use a lean image:
  `act -P ubuntu-latest=catthehacker/ubuntu:act-latest`.
- `act` mocks `GITHUB_TOKEN`; use a real one from the GitHub CLI when a
  step calls the GitHub API: `act -s GITHUB_TOKEN="$(gh auth token)"`.
- The deploy job really hits your Render hook if you run the full
  workflow. Run `act -j checks` locally and let the cloud handle deploys,
  or omit `RENDER_DEPLOY_HOOK` from `.secrets`.

## 10. Watching Cloud Runs from the Terminal with `gh`

Install and authenticate the GitHub CLI:

```bash
sudo pacman -S github-cli
gh auth login
```

Then, from any terminal inside the repo:

```bash
gh run list                       # recent runs and their status
gh run watch                      # live-stream a running workflow
gh run view <run-id> --log        # full log of a finished run
gh run rerun <run-id> --failed    # retry only the failed jobs
gh workflow run ci.yml            # manually dispatch a workflow
```

`gh run watch --compact` prints only relevant lines — your best friend
while iterating on the pipeline.

## 11. Security and Secrets — the Habits

- Never echo a secret. GitHub masks known secrets in logs, but a
  modified string can slip through. Reference secrets only inside `env:`.
- Pin actions: prefer a full commit SHA with a comment
  (`uses: actions/checkout@<40-char-sha> # v4`), or at least a major tag.
  A floating tag can be silently changed by its owner.
- Keep `permissions:` minimal (`contents: read` unless a step needs more).
- Never commit `.secrets`, `.env`, or `.env.*` files. Add `.secrets` to
  your `.gitignore` — it is not there yet.
- The Render hook URL is a secret — rotate it in Render if it leaks.
- Consider branch protection on `main` requiring CI to pass. GitHub then
  refuses to merge code that fails the pipeline.

## 12. Good Practices You Asked Me to Add

- `concurrency:` cancels superseded runs (section 8) — saves free-tier
  minutes when you push fix after fix.
- `timeout-minutes: 10` on the checks job prevents a hung step from
  burning your minutes forever.
- `--frozen-lockfile` makes CI fail if you forgot to commit lockfile
  changes (section 5.3).
- Keep the pipeline green-first: add checks one at a time, not all at
  once, so each new rule's failure is easy to understand.
- Add a status badge to your README:
  `![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)`.
- When debugging, scrub secrets and env diffs before committing.

## 13. Resources

```text
Workflow syntax — https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions
Events that trigger workflows — https://docs.github.com/actions/using-workflows/events-that-trigger-workflows
actions/checkout — https://github.com/marketplace/actions/checkout
oven-sh/setup-bun — https://github.com/oven-sh/setup-bun
Bun CI/CD guide — https://bun.com/docs/guides/runtime/cicd
actions/cache — https://github.com/marketplace/actions/cache
Biome CLI reference — https://biomejs.dev/reference/cli/
biomejs/setup-biome — https://github.com/marketplace/actions/setup-biome
rvben/rumdl — https://github.com/rvben/rumdl
run-biome-with-reviewdog — https://github.com/marketplace/actions/run-biome-with-reviewdog
Render deploy hooks — https://render.com/docs/deploy-hooks
Render blueprint spec — https://render.com/docs/blueprint-spec
nektos/act — https://nektosact.com/
gh run manual — https://cli.github.com/manual/gh_run
```
