/**
 * Logger — structured in production, colorful in development.
 *
 * ── Usage ────────────────────────────────────────────────────────
 *
 * Info / success:
 *   log.info("service: credential created", { credentialId, title });
 *
 * Errors (use `err` key with standard error shape):
 *   log.error("service: credential creation failed", {
 *     err: { message: error.message, name: error.name },
 *     credentialId,
 *   });
 *
 * Warnings:
 *   log.warn("rate limit nearing", { current, limit });
 *
 * Startup banners only (always colorful):
 *   logAlways({ port: 8000, env: "development" }, "server started");
 *
 * ── Common meta conventions ──────────────────────────────────────
 *
 * When logging errors, the `err` key follows the Elastic Common Schema
 * pattern for consistency with log aggregation services:
 *
 *   err: { message: string, name?: string, stack?: string, code?: string }
 *
 * Other context keys (credentialId, title, etc.) sit at the top level
 * of the meta object so they are easily searchable in JSON log streams.
 * ────────────────────────────────────────────────────────────────
 */

// ── ANSI helpers (no third-party deps) ──────────────────────────

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const fg = {
	cyan: "\x1b[36m",
	yellow: "\x1b[33m",
	gray: "\x1b[90m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	magenta: "\x1b[35m",
} as const;

const bg = {
	cyan: "\x1b[46m",
	red: "\x1b[41m",
	yellow: "\x1b[43m",
	green: "\x1b[42m",
	gray: "\x1b[47m",
} as const;

// ── Types ───────────────────────────────────────────────────────

type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Standard error shape following Elastic Common Schema conventions.
 * Use this as the `err` key in the meta object when logging errors.
 */
export interface LogErrorMeta {
	message: string;
	name?: string;
	stack?: string;
	code?: string;
}

export type LogMeta = Record<string, unknown>;

// ── Level config ────────────────────────────────────────────────

const LEVEL_CFG: Record<
	LogLevel,
	{ bg: string; label: string; fg: string }
> = {
	debug: { bg: bg.gray, label: "DEBUG", fg: fg.gray },
	info: { bg: bg.cyan, label: " INFO", fg: fg.cyan },
	warn: { bg: bg.yellow, label: " WARN", fg: fg.yellow },
	error: { bg: bg.red, label: "ERROR", fg: fg.red },
};

// ── Dev helper: caller info from stack ──────────────────────────

function getCallerInfo(): { file: string; line: number } | null {
	const stack = new Error().stack;
	if (!stack) return null;

	const lines = stack.split("\n");
	for (const line of lines) {
		if (line.includes("logger.ts") || line === "Error") continue;

		const match = line.match(/at\s+(?:.*?\s+)?\(?(.+?):(\d+):\d+\)?/);
		if (match) {
			const fullPath = match[1]!;
			const parts = fullPath.split("/credets/");
			const projectPath = parts.length > 1 ? parts[1]! : fullPath;
			return {
				file: projectPath,
				line: Number.parseInt(match[2]!, 10),
			};
		}
	}
	return null;
}

// ── Dev output (colorful, formatted) ────────────────────────────

const LINE = "━".repeat(50);

function devLog(level: LogLevel, message: string, meta?: LogMeta): void {
	const cfg = LEVEL_CFG[level];
	const caller = getCallerInfo();

	process.stdout.write(`\n${DIM}${LINE}${RESET}\n`);

	// badge + message
	process.stdout.write(
		`  ${cfg.bg}${BOLD}\x1b[37m ${cfg.label} ${RESET}`,
	);
	process.stdout.write(`  ${BOLD}${cfg.fg}${message}${RESET}\n\n`);

	// meta
	if (meta && Object.keys(meta).length > 0) {
		const formatted = Bun.inspect(meta, { colors: true, depth: 6 });
		const indented = formatted
			.split("\n")
			.map((l) => `  ${l}`)
			.join("\n");
		process.stdout.write(`${indented}\n\n`);
	}

	// caller
	if (caller) {
		process.stdout.write(
			`  ${DIM}${fg.gray}📍 ${fg.cyan}${caller.file}${RESET}${DIM}${fg.gray}:${fg.yellow}${caller.line}${RESET}\n`,
		);
	}

	process.stdout.write(`${DIM}${LINE}${RESET}\n\n`);
}

// ── Prod output (JSON) ──────────────────────────────────────────

function prodLog(level: LogLevel, message: string, meta?: LogMeta): void {
	const entry: Record<string, unknown> = {
		timestamp: new Date().toISOString(),
		level,
		message,
	};

	if (meta && Object.keys(meta).length > 0) {
		for (const [key, value] of Object.entries(meta)) {
			entry[key] = value;
		}
	}

	console.log(JSON.stringify(entry));
}

// ── Core log function ───────────────────────────────────────────

function logEntry(
	level: LogLevel,
	message: string,
	meta?: LogMeta,
): void {
	const isProd = Bun.env.NODE_ENV === "production";

	if (isProd) {
		prodLog(level, message, meta);
	} else {
		devLog(level, message, meta);
	}
}

// ── Public API ──────────────────────────────────────────────────

export const log = {
	debug: (message: string, meta?: LogMeta) =>
		logEntry("debug", message, meta),
	info: (message: string, meta?: LogMeta) =>
		logEntry("info", message, meta),
	warn: (message: string, meta?: LogMeta) =>
		logEntry("warn", message, meta),
	error: (message: string, meta?: LogMeta) =>
		logEntry("error", message, meta),
};

// ── Legacy dev-only debug logger ────────────────────────────────

/**
 * Pretty dev-only debug logger.
 * Only prints when `NODE_ENV !== "production"`.
 * Use for ad-hoc debugging during development; do NOT leave calls to
 * this function in committed code for production operations.
 */
export function logger(value: unknown, message?: string): void {
	if (Bun.env.NODE_ENV === "production") return;

	const caller = getCallerInfo();

	process.stdout.write(`\n${DIM}${LINE}${RESET}\n`);
	process.stdout.write(`  ${bg.cyan}${BOLD}\x1b[37m LOG ${RESET}`);
	if (message) {
		process.stdout.write(`  ${BOLD}${fg.cyan}${message}${RESET}`);
	}
	process.stdout.write("\n\n");

	const formatted = Bun.inspect(value, { colors: true, depth: 6 });
	const indented = formatted
		.split("\n")
		.map((l) => `  ${l}`)
		.join("\n");
	process.stdout.write(`${indented}\n\n`);

	if (caller) {
		process.stdout.write(
			`  ${DIM}${fg.gray}📍 ${fg.cyan}${caller.file}${RESET}${DIM}${fg.gray}:${fg.yellow}${caller.line}${RESET}\n`,
		);
	}

	process.stdout.write(`${DIM}${LINE}${RESET}\n\n`);
}

/**
 * Always-on logger — outputs colorful formatted output regardless of
 * `NODE_ENV`. Use **only** for startup banners and critical boot
 * events that should be visible when deploying.
 *
 * For all other logging (data operations, errors, etc.) use `log.info()`
 * or `log.error()` which produce structured JSON in production.
 */
export function logAlways(value: unknown, message?: string): void {
	const cached = Bun.env.NODE_ENV;
	Bun.env.NODE_ENV = "development";
	logger(value, message);
	Bun.env.NODE_ENV = cached;
}
