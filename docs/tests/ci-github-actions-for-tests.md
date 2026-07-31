# GitHub Actions for Backend Tests — a Teaching Guide

This guide teaches you how to write a GitHub Actions workflow that runs
the backend tests. It is deliberately limited to the test scenario you
asked about: trigger on push to the main branch only, no pull requests
yet. We do not save the file — the goal is to understand every line so
you can write it yourself.

This doc is the test-case companion to docs/ci-cd-pipeline.md, which
explains the general concepts in more depth.

## 1. The Scenario

We want: every time code lands on `main`, GitHub spins up a fresh Linux
machine, installs Bun and the dependencies, runs `bun test` on the
backend, and reports pass or fail. Nothing else — no lint, no deploy,
just the tests.

The workflow file lives at `.github/workflows/backend-tests.yml` in the
repository root.

## 2. The Whole File, Annotated

Read this first, then read the keyword-by-keyword breakdown below:

```yaml
name: Backend Tests

on:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.3.14

      - name: Restore bun cache
        uses: actions/cache@v6
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run backend tests
        run: bun --filter @credets/backend test
```

## 3. Keyword by Keyword

- `name:` — the display name in the Actions tab. Optional, but it makes
  runs easy to recognize.
- `on:` — the trigger. `push` fires on every push; `branches: [main]`
  narrows it to the main branch only. This is the "no PR yet, main
  only" rule in one line.
- `permissions:` — the token GitHub gives the workflow. `contents:
  read` is the least privilege we need: tests only read the repo, they
  never push or publish.
- `jobs:` — a map of jobs. Here one job called `test`. Jobs run in
  parallel by default; with one job that does not matter yet.
- `runs-on: ubuntu-latest` — the virtual machine image. `ubuntu-latest`
  is the free, standard choice and ships with Git, Bun-friendly tools,
  and Docker preinstalled.
- `steps:` — the ordered list of commands executed on that machine,
  top to bottom.
- `- name:` — a human label for one step; it appears in the logs.
- `uses:` — borrow a published action (a versioned GitHub repository).
  Three actions are used here:
    - `actions/checkout@v4` — downloads our repository into the runner.
      It must come first, because every later step reads files from it.
    - `oven-sh/setup-bun@v2` — installs Bun. The `with:` block passes
      inputs; `bun-version: 1.3.14` pins the same version the
      Containerfile uses so CI matches production.
    - `actions/cache@v6` — restores Bun's package cache from previous
      runs. `path` says which folder to restore, `key` is a fingerprint
      built from the lockfile; when `bun.lock` changes the key changes
      and the cache is refreshed.
- `run:` — a plain shell command on the runner:
    - `bun install --frozen-lockfile` — installs all workspace
      dependencies from the root. The flag fails the job if `bun.lock`
      is out of date.
    - `bun --filter @credets/backend test` — runs the test script
      inside the backend workspace, the same command you use locally.

## 4. How a Run Actually Works

1. You push to `main`. GitHub sees the `on: push` trigger.
2. GitHub provisions a fresh `ubuntu-latest` virtual machine.
3. Each step runs in order inside that machine.
4. If any `run:` command exits with a non-zero code, the job stops and
   the run is marked failed. That is the whole contract: exit code 0 =
   pass, anything else = fail. Bun test follows this convention — a
   failing assertion exits non-zero.
5. GitHub stores the logs; you can watch them in the Actions tab or with
   the GitHub CLI.

The cache step is an optimization, not a requirement: without it the
pipeline still works, it just re-downloads packages every time.

## 5. What Makes a Test Pass or Fail

A test fails when an assertion fails (`expect(...)` throws), when a test
throws an unexpected error, or when the file fails to run at all (import
error, type error at runtime, missing module). Bun collects all of this
and exits non-zero, which fails the job, which marks the run red.

A red run does not block anything by itself — unless you add branch
protection on `main` requiring this check to pass, which is the
recommended follow-up.

## 6. Try It Locally Before Pushing

You can run the workflow on your own machine before it ever reaches
GitHub. Two tools, both covered in detail in docs/ci-cd-pipeline.md:

- `act` — executes the workflow locally in containers. It runs whatever
  workflow file you have saved at `.github/workflows/`, so write the
  file first and then test it locally. On Arch with podman:

    ```bash
    sudo pacman -S act
    systemctl --user enable --now podman.socket
    export DOCKER_HOST="unix:///run/user/$(id -u)/podman/podman.sock"
    act -j test
    ```

- `gh` — watch the real cloud runs from the terminal:

    ```bash
    gh run list
    gh run watch
    gh run view <run-id> --log
    ```

## 7. What We Deliberately Did Not Add

- No `pull_request` trigger — you asked for push-only, and it stays
  that way until you are ready.
- No coverage upload — bun produces coverage locally; a service like
  Codecov is a later decision, not a first step.
- No failing-fast tricks, no matrix, no concurrency — all unnecessary
  for a single test job. Keep it minimal while you are learning.
- No deploy step — deployment belongs in the CI/CD pipeline doc, and
  should only happen after tests pass.

## 8. Resources

```text
Workflow syntax — https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions
Events that trigger workflows — https://docs.github.com/actions/using-workflows/events-that-trigger-workflows
actions/checkout — https://github.com/marketplace/actions/checkout
oven-sh/setup-bun — https://github.com/oven-sh/setup-bun
actions/cache — https://github.com/marketplace/actions/cache
Bun test runner — https://bun.com/docs/test
```
