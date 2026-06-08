/**
 * Shared colour palettes and helpers for credential type badges and tag badges.
 *
 * Keeps TYPE_COLORS and TAG_COLORS in one place so the listings card
 * and the detail page stay in sync.
 */

// ── Type colour palette ─────────────────────────────────────────────
// Each type gets a deterministic colour based on a hash of its value.

export const TYPE_COLORS = [
	{
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-700 dark:text-blue-300",
		dot: "bg-blue-500",
	},
	{
		bg: "bg-amber-100 dark:bg-amber-900/30",
		text: "text-amber-700 dark:text-amber-300",
		dot: "bg-amber-500",
	},
	{
		bg: "bg-purple-100 dark:bg-purple-900/30",
		text: "text-purple-700 dark:text-purple-300",
		dot: "bg-purple-500",
	},
	{
		bg: "bg-rose-100 dark:bg-rose-900/30",
		text: "text-rose-700 dark:text-rose-300",
		dot: "bg-rose-500",
	},
	{
		bg: "bg-emerald-100 dark:bg-emerald-900/30",
		text: "text-emerald-700 dark:text-emerald-300",
		dot: "bg-emerald-500",
	},
	{
		bg: "bg-cyan-100 dark:bg-cyan-900/30",
		text: "text-cyan-700 dark:text-cyan-300",
		dot: "bg-cyan-500",
	},
	{
		bg: "bg-pink-100 dark:bg-pink-900/30",
		text: "text-pink-700 dark:text-pink-300",
		dot: "bg-pink-500",
	},
] as const;

// ── Tag colour palette ──────────────────────────────────────────────
// Tags cycle through these based on tag string length for visual variety.

export const TAG_COLORS = [
	{ bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
	{ bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
	{ bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
	{ bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300" },
	{ bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
	{ bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300" },
	{ bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
	{ bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300" },
] as const;

// ── Hash helper ─────────────────────────────────────────────────────
// Deterministically maps a string to a number for colour selection.

export function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}
