import { useState, useRef, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/core";
import { cn } from "#/lib/utils";

// ── Font data ──────────────────────────────────────────────────────

interface FontOption {
	name: string;
	value: string;
}

interface FontCategory {
	label: string;
	fonts: FontOption[];
}

const FONT_CATEGORIES: FontCategory[] = [
	{
		label: "Default",
		fonts: [{ name: "Default", value: "" }],
	},
	{
		label: "Sans-serif",
		fonts: [
			{ name: "Arial", value: "Arial" },
			{ name: "Helvetica Neue", value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
			{ name: "Helvetica", value: "Helvetica" },
			{ name: "Verdana", value: "Verdana, sans-serif" },
			{ name: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
			{ name: "Gill Sans", value: "'Gill Sans', 'Gill Sans MT', sans-serif" },
			{ name: "Futura", value: "Futura, 'Century Gothic', sans-serif" },
			{ name: "Frutiger", value: "Frutiger, 'Frutiger Linotype', sans-serif" },
			{ name: "Segoe UI", value: "'Segoe UI', sans-serif" },
			{ name: "Lucida Grande", value: "'Lucida Grande', 'Lucida Sans Unicode', sans-serif" },
			{ name: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
			{ name: "Impact", value: "Impact, sans-serif" },
			{ name: "Inter", value: "'Inter Variable', sans-serif" },
			{ name: "Montserrat", value: "'Montserrat Variable', sans-serif" },
			{ name: "Manrope", value: "'Manrope Variable', sans-serif" },
			{ name: "Geist", value: "'Geist Variable', sans-serif" },
			{ name: "Open Sans", value: "'Open Sans', sans-serif" },
			{ name: "Roboto", value: "Roboto, sans-serif" },
			{ name: "Lato", value: "Lato, sans-serif" },
			{ name: "System UI", value: "system-ui, sans-serif" },
		],
	},
	{
		label: "Serif",
		fonts: [
			{ name: "Times New Roman", value: '"Times New Roman", Times, serif' },
			{ name: "Georgia", value: "Georgia, serif" },
			{ name: "Garamond", value: "Garamond, 'Times New Roman', serif" },
			{ name: "Palatino", value: "Palatino, 'Palatino Linotype', serif" },
			{ name: "Baskerville", value: "Baskerville, 'Baskerville Old Face', serif" },
			{ name: "Book Antiqua", value: "'Book Antiqua', Palatino, serif" },
			{ name: "Calisto MT", value: "'Calisto MT', serif" },
			{ name: "Didot", value: "Didot, 'Didot LT Std', serif" },
			{ name: "Source Serif 4", value: "'Source Serif 4 Variable', serif" },
		],
	},
	{
		label: "Monospace",
		fonts: [
			{ name: "Courier New", value: "'Courier New', Courier, monospace" },
			{ name: "Lucida Console", value: "'Lucida Console', 'Lucida Sans Typewriter', monospace" },
			{ name: "Monaco", value: "Monaco, 'Courier New', monospace" },
			{ name: "Consolas", value: "Consolas, monospace" },
			{ name: "Monospace", value: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace" },
		],
	},
];

// ── Component ──────────────────────────────────────────────────────

interface FontFamilyDropdownProps {
	editor: Editor;
}

export default function FontFamilyDropdown({ editor }: FontFamilyDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const currentFont = editor.getAttributes("textStyle").fontFamily as string | undefined;
	const currentLabel = getFontLabel(currentFont);

	// Close on outside click
	useEffect(() => {
		if (!isOpen) return;
		const handleClick = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node) &&
				triggerRef.current &&
				!triggerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [isOpen]);

	// Close on Escape
	useEffect(() => {
		if (!isOpen) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsOpen(false);
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen]);

	const applyFont = useCallback(
		(value: string) => {
			if (!value) {
				editor.chain().focus().unsetFontFamily().run();
			} else {
				editor.chain().focus().setFontFamily(value).run();
			}
			setIsOpen(false);
		},
		[editor],
	);

	return (
		<div className="relative">
			<button
				ref={triggerRef}
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"flex items-center gap-1 rounded-md px-1.5 py-1 text-xs transition-colors duration-100 hover:bg-accent",
					isOpen && "bg-accent",
				)}
				title="Font family"
			>
				<span className="max-w-[80px] truncate">{currentLabel}</span>
				<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-50">
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>

			{isOpen && (
				<div
					ref={dropdownRef}
					className={cn(
						"font-family-dropdown",
						"absolute left-0 top-full mt-1 z-30",
						"min-w-[180px] max-h-[300px] overflow-y-auto",
						"rounded-lg border border-border shadow-lg",
						"bg-popover",
						"animate-in fade-in slide-in-from-top-1 duration-100",
					)}
				>
					{FONT_CATEGORIES.map((category, catIdx) => (
						<div key={category.label}>
							{catIdx > 0 && <div className="mx-2 my-1 h-px bg-border" />}
							<div className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
								{category.label}
							</div>
							{category.fonts.map((font) => {
								const isActive = isFontActive(currentFont, font.value);
								return (
									<button
										key={font.name}
										type="button"
										onClick={() => applyFont(font.value)}
										className={cn(
											"flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs leading-tight transition-colors",
											"hover:bg-accent",
											isActive
												? "bg-primary text-primary-foreground"
												: "text-popover-foreground",
										)}
										style={font.value ? { fontFamily: font.value, fontSize: "14px" } : undefined}
									>
										<span className="w-3 shrink-0">
											{isActive && (
												<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
													<polyline points="20 6 9 17 4 12" />
												</svg>
											)}
										</span>
										<span className="truncate">{font.name}</span>
									</button>
								);
							})}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// ── Helpers ─────────────────────────────────────────────────────────

function getFontLabel(fontFamily: string | undefined): string {
	if (!fontFamily) return "Default";
	const entry = FONT_CATEGORIES.flatMap((c) => c.fonts).find((f) =>
		normalizeFont(f.value) === normalizeFont(fontFamily),
	);
	return entry?.name ?? "Default";
}

function normalizeFont(v: string): string {
	return v.replace(/['" ]/g, "").toLowerCase();
}

function isFontActive(current: string | undefined, fontValue: string): boolean {
	if (!fontValue && !current) return true;
	if (!fontValue || !current) return false;
	return normalizeFont(current) === normalizeFont(fontValue);
}
