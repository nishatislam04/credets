"use client";

import { X } from "lucide-react";
import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { Badge } from "#/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "#/lib/utils.ts";

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Parse a comma-separated string into a clean, unique array of tags.
 * - Splits by comma
 * - Trims whitespace
 * - Filters out empty/whitespace-only entries
 * - Removes duplicates (case-insensitive; keeps the first occurrence's casing)
 */
function parseTagString(value: string): string[] {
	const seen = new Set<string>();
	return value
		.split(",")
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0)
		.filter((tag) => {
			const lower = tag.toLowerCase();
			if (seen.has(lower)) return false;
			seen.add(lower);
			return true;
		});
}

/**
 * Serialize an array of tags back to a comma-separated string.
 * Each tag is trimmed; empty tags are omitted.
 */
function joinTags(tags: string[]): string {
	return tags.filter((t) => t.trim().length > 0).join(", ");
}

// ── Props ───────────────────────────────────────────────────────────

interface TagInputProps {
	/** Current tags as a comma-separated string (matching the existing form field type) */
	value: string;
	/** Called with a new comma-separated string whenever the tag set changes */
	onChange: (value: string) => void;
	onBlur?: () => void;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
	id?: string;
	/** @default false */
	"aria-invalid"?: boolean | "true" | "false";
	"aria-describedby"?: string;
	/** Maximum number of tags allowed (default 15) */
	maxTags?: number;
}

// ── Component ───────────────────────────────────────────────────────

/**
 * TagInput — a badge-based tag editor.
 *
 * Tags are rendered as badges **above** the input field.
 * The input field is used only for typing and committing new tags.
 *
 * 1. Parses the incoming `value` (comma-separated string) into an array of tags.
 * 2. Each tag is rendered as a badge with an X button to remove it.
 * 3. Pressing **Enter** or typing a **comma** commits the current input as a new tag.
 * 4. Duplicate tags (case‑insensitive) are silently ignored.
 * 5. Empty/whitespace-only input is ignored.
 * 6. When the tag set reaches `maxTags` (default 15), the input is hidden.
 *
 * @example
 * ```tsx
 * const [tags, setTags] = useState("");
 *
 * <TagInput
 *   value={tags}
 *   onChange={setTags}
 *   placeholder="Add tags (Enter or comma to add)"
 * />
 * ```
 */
export function TagInput({
	value,
	onChange,
	onBlur,
	disabled = false,
	placeholder = "Type a tag and press Enter or comma",
	className,
	id,
	"aria-invalid": ariaInvalid,
	"aria-describedby": ariaDescribedBy,
	maxTags = 15,
}: TagInputProps) {
	// ── Derive the tag array from the controlled string value ──────
	// This keeps the component fully controlled — the parent owns the state.
	const tags = parseTagString(value);

	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// Reset the input when the controlled value changes externally (e.g., form reset)
	useEffect(() => {
		setInputValue("");
	}, [value]);

	// ── Commit the current input as a new tag ─────────────────────
	const commitTag = useCallback(
		(raw: string) => {
			const trimmed = raw.trim();
			if (!trimmed) return; // ignore empty / whitespace-only

			if (tags.length >= maxTags) return; // respect limit

			// Case-insensitive duplicate check
			const lower = trimmed.toLowerCase();
			if (tags.some((t) => t.toLowerCase() === lower)) return;

			const next = joinTags([...tags, trimmed]);
			onChange(next);
		},
		[tags, maxTags, onChange],
	);

	// ── Keyboard: Enter or Comma commits the tag ──────────────────
	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter" || e.key === ",") {
				e.preventDefault();
				commitTag(inputValue);
				setInputValue("");
			}
		},
		[inputValue, commitTag],
	);

	// ── Remove a specific tag by index ────────────────────────────
	const removeTag = useCallback(
		(index: number) => {
			const next = tags.filter((_, i) => i !== index);
			onChange(joinTags(next));
			// Refocus the input after removal
			inputRef.current?.focus();
		},
		[tags, onChange],
	);

	// ── Paste support: split pasted text by comma ────────────────
	const handlePaste = useCallback(
		(e: React.ClipboardEvent<HTMLInputElement>) => {
			const pasted = e.clipboardData.getData("text");
			if (pasted.includes(",")) {
				e.preventDefault();
				const parts = pasted.split(",");
				for (const part of parts) {
					commitTag(part);
				}
			}
		},
		[commitTag],
	);

	const atMax = tags.length >= maxTags;

	return (
		<div className={cn("space-y-3", className)}>
			{/* ── Tags container — rendered above the input ──────────── */}
			{tags.length > 0 && (
				<div
					className="flex flex-wrap items-center gap-1.5"
					aria-label="Added tags"
				>
					{tags.map((tag, index) => (
						<Badge
							// biome-ignore lint/suspicious/noArrayIndexKey: tags have no stable unique id
							key={`${tag}-${index}`}
							variant="secondary"
							className="gap-0.5 pl-2 pr-1 text-xs font-normal max-w-40"
						>
							<span className="truncate">{tag}</span>
							{!disabled && (
								<button
									type="button"
									onClick={() => removeTag(index)}
									className="ml-0.5 inline-flex size-4 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-muted-foreground/50 transition-colors hover:bg-muted-foreground/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
									aria-label={`Remove tag: ${tag}`}
								>
									<X className="size-3" />
								</button>
							)}
						</Badge>
					))}
				</div>
			)}

			{/* ── Input field — standalone, only for generating new tags ── */}
			{!disabled && !atMax ? (
				<Input
					ref={inputRef}
					id={id}
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={onBlur}
					onPaste={handlePaste}
					placeholder={placeholder}
					aria-invalid={ariaInvalid}
					aria-describedby={ariaDescribedBy}
					aria-label="Add a tag"
				/>
			) : (
				/* When disabled or at max tags — render a visually muted input as a placeholder */
				<div
					className={cn(
						"flex h-9 w-full min-w-0 items-center rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm text-muted-foreground",
						disabled && "cursor-not-allowed opacity-50",
					)}
					aria-disabled={disabled}
				>
					{atMax ? "Maximum 15 tags reached" : "Tag input disabled"}
				</div>
			)}

			{/* Hidden input to preserve form field semantics for frameworks that inspect inputs */}
			<input type="hidden" value={value} readOnly aria-hidden="true" />
		</div>
	);
}
