# Debugging with Zed Editor

A practical guide to debugging Credets inside the Zed editor using breakpoints, stepping through code, and inspecting variables.

## Quick Answer: Yes, Backend Breakpoints Work from Your Browser

When you're browsing the app in **any browser** (Zen, Firefox, Chrome, whatever) and the frontend sends a request to the backend API — if you have a breakpoint set in the backend code, Zed will pause execution at that breakpoint. The browser doesn't matter because the breakpoint is on the server side.

---

## Part 1: Debugging the Backend (Bun) — This is the most useful one

### What happens

You set a breakpoint in a backend file (e.g., `apps/backend/http/credentials/create.ts`). When any request hits that endpoint — whether from your frontend, curl, or Postman — Zed pauses the server right at that line. You can then inspect variables, step through code, and see exactly what's happening.

### Step-by-step

**Step 1: Start the database**

The backend needs PostgreSQL running:
```bash
docker compose up -d db
```

**Step 2: Set breakpoints in your backend code**

Open a backend file and **click in the gutter** (the narrow area to the left of the line numbers). A red dot appears. That's a breakpoint.

Good files to set breakpoints in:
- `apps/backend/http/credentials/create.ts` — handler for creating credentials
- `apps/backend/http/credentials/listings.ts` — handler for listing credentials
- `apps/backend/services/credentials/*.ts` — business logic layer
- `apps/backend/repository/credentials/*.ts` — database queries

Set a breakpoint on a meaningful line — e.g., on the line that processes the request or calls a service function.

**Step 3: Launch the debugger**

Make sure the database is running first: `docker compose up -d db`

Press **`F4`** in Zed. A modal opens showing available debug configurations. Select **"Debug Backend (Bun)"**.

Zed starts the Bun server. You'll see output in the debug panel at the bottom. The server is now running on `http://localhost:8000` with the debug inspector attached.

> **Note**: The debug config runs Bun without `--watch`. This is intentional — watch mode restarts the process, which disconnects the debugger. For normal development, use the **task** "Start Backend (Bun)" to run with `--watch` for auto-reload. Switch to the **debug** config only when you need to investigate a specific bug.

**Step 4: Hit the breakpoint**

Now trigger a request to the backend. You can do this in any of these ways:

- **From your frontend** (Zen/Firefox browser): Navigate to `http://localhost:3000` (Vite dev server) and use the UI. When the frontend calls the API, it hits the backend, and Zed pauses at your breakpoint.
- **From curl**: Run `curl http://localhost:8000/credentials` in a terminal.
- **From the browser address bar**: Visit `http://localhost:8000/credentials` directly.

**Step 5: Debug**

When Zed hits a breakpoint:
1. The editor jumps to the file/line with the breakpoint
2. The bottom panel shows the **debug view** with:
   - **VARIABLES** — all local/scope variables and their current values
   - **WATCH** — expressions you manually add to track
   - **CALL STACK** — the chain of function calls that led here
   - **BREAKPOINTS** — all your breakpoints
3. **Hover over any variable** in the code to see its value in a tooltip
4. Use the debug toolbar (top of the debug panel):
   - **Continue** (`F5`) — resume execution until the next breakpoint
   - **Step Over** (`F10`) — execute the current line, go to the next line
   - **Step Into** (`F11`) — go into the function call on the current line
   - **Step Out** (`Shift+F11`) — finish the current function and return

### Example scenario

Say you click "Create Credential" on the frontend and get an error. Here's what you do:

1. Open `apps/backend/http/credentials/create.ts` and set a breakpoint on the first line of the handler function
2. Press `F4` → select "Debug Backend (Bun)"
3. Go back to your browser and click "Create Credential" again
4. Zed pauses at your breakpoint. You can now see the request data, step through line by line, and find the bug

---

## Part 2: Debugging the Frontend (React/TypeScript)

### The Zen/Firefox situation

Zed's built-in JavaScript debug adapter only supports **Chrome/Chromium** browsers. It cannot directly debug Firefox, Zen Browser, or any Firefox-based browser.

You have two options:

#### Option A: Keep it simple — Use Firefox DevTools alongside Zed

This is the easiest approach. Since you use Zen Browser:

1. Start the Vite dev server: `cd apps/frontend && bun run dev`
2. Open `http://localhost:3000` in Zen Browser
3. Press **`F12`** to open Firefox Developer Tools
4. Go to the **Debugger** tab
5. Find your source files (look under `webpack://` → `.` → `src/`)
6. Set breakpoints directly in the browser's debugger
7. Zed remains your editor; the browser handles the debugging

This is what most developers do when their IDE doesn't directly support their browser. It works well — you still get breakpoints, stepping, variable inspection, and source maps.

#### Option B: Use Chromium for debugging sessions

Install Chromium (or Chrome, or Brave, or Edge) just for debugging:

1. Start the Vite dev server: `cd apps/frontend && bun run dev`
2. Press `F4` → select **"Debug Frontend (Chrome) — start Vite first"**
3. Chromium opens a new window at `http://localhost:3000` with the debugger attached
4. Set breakpoints in your `.tsx`/`.ts` files in Zed (click the gutter)
5. Interact with the UI — Zed pauses at your breakpoints

### How frontend breakpoints work

When you debug the frontend through Zed:
- Vite serves **source maps** alongside your code
- This means you set breakpoints on your original `.tsx` files, not on bundled/minified code
- You step through real TypeScript/React code
- If your frontend calls a backend API, that request goes to the real backend — and if you also have the backend debugger running, it will also hit backend breakpoints

---

## Part 3: Debugging Both Ends Simultaneously

This is the power move: run both debuggers at once so you can trace a request from the browser all the way through the backend.

1. **Start the database**: `docker compose up -d db`
2. **Start the Vite dev server** (in a terminal or via `task: spawn`)
3. **Set backend breakpoints** in Zed
4. **Set frontend breakpoints** in Zed (or browser DevTools)
5. Press `F4` → select "Debug Backend (Bun)" to start the backend debugger
6. Press `F4` **again** → Zed supports running multiple debug sessions. Select "Debug Frontend (Chrome)" if using Chromium
7. In your browser, interact with the UI
8. Zed pauses at frontend breakpoints first (browser-side code), then at backend breakpoints when the API call reaches the server

---

## Part 4: Quick Workflow Summary

| What you want to debug | Setup | How to trigger breakpoints |
|---|---|---|
| Backend API logic | `F4` → "Debug Backend (Bun)" | Use the frontend UI, curl, or browser address bar to hit any API endpoint |
| Frontend React code | Run Vite + use Firefox DevTools (`F12`) or Chromium debug config | Click buttons, submit forms, navigate pages in the browser |
| Both at once | Backend debugger + browser DevTools | Single UI action triggers frontend → backend breakpoints in sequence |

### What NOT to do

- Don't use `bun run dev` (the `--watch` flag) with the debugger — the debug config handles starting the server
- Don't try to debug the backend by looking at console.log output — breakpoints are much more powerful
- Don't expect Zed to debug Zen/Firefox directly — use browser DevTools for that

---

## Config files

| File | Purpose |
|---|---|
| `.zed/tasks.json` | Tasks to start server processes (`task: spawn` from command palette) |
| `.zed/debug.json` | Debug launch configurations (`F4` to open) |

## Troubleshooting

- **Breakpoints not hit (backend)**: Zed shows a gray (not red) breakpoint dot if it can't be resolved. Restart the debug session with `F4`.
- **Cannot connect to backend**: Make sure Docker is running and the database is up (`docker compose ps`).
- **"Debug Frontend (Chrome)" does nothing**: You need Chromium/Chrome installed. If you only have Zen/Firefox, use Option A (browser DevTools).
- **Can't find the debug panel**: Press `F4` to start a debug session — the panel appears automatically.
- **Need to re-debug after fixing code**: You don't need to stop and start the debugger — the Bun inspector stays connected. Just save your changes, trigger the request again, and the new code runs (since we use `runtimeArgs: ["run", "--inspect=..."]` without `--watch`, you'll need to restart the debug session to pick up code changes — stop with the stop button in the debug panel, then `F4` again).
