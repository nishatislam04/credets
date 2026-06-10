/**
 * Pretty dev-only logger.
 *
 * Only prints to stdout when `NODE_ENV !== "production"`.
 * Formats values with `Bun.inspect` for colorful, readable output
 * and annotates the caller's file and line via `Error().stack`.
 *
 * @example
 * ```ts
 * import { logger } from "@backend/utils/logger";
 *
 * logger({ key: "value" }, "Payload received");
 * logger(42);
 * logger("plain string");
 * ```
 */

// ── ANSI helpers (no third-party deps) ──────────────────────────

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const fg = {
	cyan: "\x1b[36m",
	yellow: "\x1b[33m",
	gray: "\x1b[90m",
	white: "\x1b[37m",
};

const bg = {
	cyan: "\x1b[46m",
};

// ── Dev guard ───────────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== "production";

// ── Caller info from stack ──────────────────────────────────────

function getCallerInfo(): { file: string; line: number } | null {
	const stack = new Error().stack;
	if (!stack) return null;

	const lines = stack.split("\n");
	for (const line of lines) {
		// skip frames inside this very file
		if (line.includes("logger.ts") || line === "Error") continue;

		// Bun / V8 format:  at functionName (/path/file.ts:line:col)
		//                   at /path/file.ts:line:col
		const match = line.match(/at\s+(?:.*?\s+)?\(?(.+?):(\d+):\d+\)?/);
		if (match) {
			const fullPath = match[1]!;
			// Strip everything before the project root marker
			const parts = fullPath.split("/credets/");
			const projectPath = parts.length > 1 ? parts[1]! : fullPath;
			return { file: projectPath, line: Number.parseInt(match[2]!, 10) };
		}
	}
	return null;
}

// ── Exported logger ─────────────────────────────────────────────

const LINE = "━".repeat(50);

/**
 * Log a value to the console **only in development**.
 *
 * @param value   - The value to inspect & print (required, first param).
 * @param message - Optional human-readable label shown in the header.
 */
export function logger(value: unknown, message?: string): void {
	if (Bun.env.NODE_ENV === "production") return;

	const caller = getCallerInfo();

	// ── top rule ──────────────────────────────────────────────
	process.stdout.write(`\n${DIM}${LINE}${RESET}\n`);

	// ── header ────────────────────────────────────────────────
	process.stdout.write(`  ${bg.cyan}${BOLD}${fg.white} LOG ${RESET}`);
	if (message) {
		process.stdout.write(`  ${BOLD}${fg.cyan}${message}${RESET}`);
	}
	process.stdout.write("\n\n");

	// ── value (Bun.inspect gives syntax-highlighted output) ───
	const formatted = Bun.inspect(value, { colors: true, depth: 6 });
	const indented = formatted
		.split("\n")
		.map((l) => `  ${l}`)
		.join("\n");
	process.stdout.write(`${indented}\n\n`);

	// ── caller ────────────────────────────────────────────────
	if (caller) {
		process.stdout.write(
			`  ${DIM}${fg.gray}📍 ${fg.cyan}${caller.file}${RESET}${DIM}${fg.gray}:${fg.yellow}${caller.line}${RESET}\n`,
		);
	}

	// ── bottom rule ───────────────────────────────────────────
	process.stdout.write(`${DIM}${LINE}${RESET}\n\n`);
}

/**
 * Variant of `logger()` that **always** prints (even in production).
 * Use sparingly – typically for startup banners or critical boot info.
 */
export function logAlways(value: unknown, message?: string): void {
	const cached = Bun.env.NODE_ENV;
	Bun.env.NODE_ENV = "development";
	logger(value, message);
	Bun.env.NODE_ENV = cached;
}
