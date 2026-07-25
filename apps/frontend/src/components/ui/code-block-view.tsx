import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "#/lib/utils";

// ── Supported languages ───────────────────────────────────────────
// Drawn from highlight.js common languages plus a "plaintext" default.
const LANGUAGES = [
	{ id: "plaintext", label: "Plain Text" },
	{ id: "javascript", label: "JavaScript" },
	{ id: "typescript", label: "TypeScript" },
	{ id: "jsx", label: "JSX" },
	{ id: "tsx", label: "TSX" },
	{ id: "css", label: "CSS" },
	{ id: "html", label: "HTML" },
	{ id: "json", label: "JSON" },
	{ id: "yaml", label: "YAML" },
	{ id: "markdown", label: "Markdown" },
	{ id: "bash", label: "Bash" },
	{ id: "shell", label: "Shell" },
	{ id: "python", label: "Python" },
	{ id: "sql", label: "SQL" },
	{ id: "rust", label: "Rust" },
	{ id: "go", label: "Go" },
	{ id: "java", label: "Java" },
	{ id: "kotlin", label: "Kotlin" },
	{ id: "swift", label: "Swift" },
	{ id: "php", label: "PHP" },
	{ id: "ruby", label: "Ruby" },
	{ id: "cpp", label: "C++" },
	{ id: "csharp", label: "C#" },
	{ id: "dart", label: "Dart" },
];

interface CodeBlockViewProps {
	node: {
		attrs: {
			language?: string;
		};
	};
	updateAttributes: (attrs: Record<string, unknown>) => void;
	extension: {
		options: {
			lowlight: Record<string, unknown>;
		};
	};
}

export default function CodeBlockView({
	node,
	updateAttributes,
}: CodeBlockViewProps) {
	const currentLang = node.attrs.language || "plaintext";
	const [isOpen, setIsOpen] = useState(false);
	const [customMode, setCustomMode] = useState(false);
	const [customValue, setCustomValue] = useState(currentLang);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Close dropdown on outside click
	useEffect(() => {
		if (!isOpen) return;
		const handler = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsOpen(false);
				setCustomMode(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [isOpen]);

	// Focus input when entering custom mode
	useEffect(() => {
		if (customMode && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [customMode]);

	const selectLanguage = useCallback(
		(lang: string) => {
			updateAttributes({ language: lang });
			setIsOpen(false);
			setCustomMode(false);
		},
		[updateAttributes],
	);

	const handleCustomSubmit = useCallback(() => {
		const val = customValue.trim().toLowerCase() || "plaintext";
		selectLanguage(val);
	}, [customValue, selectLanguage]);

	const handleCustomKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleCustomSubmit();
			}
			if (e.key === "Escape") {
				setIsOpen(false);
				setCustomMode(false);
			}
		},
		[handleCustomSubmit],
	);

	const matched = LANGUAGES.find((l) => l.id === currentLang);
	const displayLabel = matched ? matched.label : currentLang;

	return (
		<NodeViewWrapper
			className={cn(
				"code-block-wrapper relative",
				"group",
			)}
		>
			{/* Language selector — top-right overlay */}
			<div
				ref={dropdownRef}
				className={cn(
					"code-block-lang-selector",
					"absolute top-1.5 right-1.5 z-20",
					"opacity-0 group-hover:opacity-100 transition-opacity duration-150",
					"focus-within:opacity-100",
					isOpen && "opacity-100",
				)}
			>
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className={cn(
						"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5",
						"text-[11px] font-medium uppercase tracking-wider",
						"text-white/60 hover:text-white/90 bg-black/30 hover:bg-black/50",
						"transition-colors duration-100",
					)}
				>
					<span className="truncate max-w-28">{displayLabel}</span>
					<svg
						width="10"
						height="10"
						viewBox="0 0 10 10"
						fill="none"
						className={cn(
							"shrink-0 transition-transform duration-150",
							isOpen && "rotate-180",
						)}
					>
						<path
							d="M2 3.5L5 6.5L8 3.5"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>

					{/* Dropdown menu */}
				{isOpen && (
					<div
						className={cn(
							"code-block-lang-dropdown",
							"absolute right-0 top-full mt-1 z-30",
							"min-w-[150px] max-h-[220px] overflow-y-auto",
							"rounded-lg border border-border p-0.5",
							"shadow-lg",
							"animate-in fade-in slide-in-from-top-1 duration-100",
						)}
					>
						{/* Listed languages */}
						<div className="space-y-px">
							{LANGUAGES.map((lang) => (
								<button
									key={lang.id}
									type="button"
									onClick={() => selectLanguage(lang.id)}
									className={cn(
										"flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left text-[11px] leading-tight",
										"transition-colors duration-75",
										lang.id === currentLang
											? "bg-primary text-primary-foreground font-medium"
											: "text-popover-foreground hover:bg-accent",
									)}
								>
									{lang.id === currentLang && (
										<svg
											width="10"
											height="10"
											viewBox="0 0 12 12"
											fill="none"
										>
											<path
												d="M2.5 6L5 8.5L9.5 3.5"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									)}
									<span className={cn(lang.id !== currentLang && "pl-4")}>
										{lang.label}
									</span>
								</button>
							))}
						</div>

						{/* Separator */}
						<div className="my-0.5 border-t border-border" />

						{/* Custom / unsupported language option */}
						{customMode ? (
							<div className="px-1 py-0.5">
								<input
									ref={inputRef}
									type="text"
									value={customValue}
									onChange={(e) => setCustomValue(e.target.value)}
									onKeyDown={handleCustomKeyDown}
									onBlur={handleCustomSubmit}
									placeholder="e.g. graphql, elixir..."
									className={cn(
										"w-full rounded-md border border-input bg-background px-1.5 py-1",
										"text-[11px] text-foreground placeholder:text-muted-foreground",
										"outline-none ring-0 focus:border-ring focus:ring-[2px] focus:ring-ring/40",
									)}
								/>
							</div>
						) : (
							<button
								type="button"
								onClick={() => {
									setCustomMode(true);
									setCustomValue("");
								}}
								className={cn(
									"flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left text-[11px]",
									"text-muted-foreground hover:bg-accent hover:text-foreground",
									"transition-colors duration-75",
								)}
							>
								<span className="pl-4">Other…</span>
							</button>
						)}
					</div>
				)}
			</div>

			{/* Code block content rendered by the editor */}
			<pre>
				<NodeViewContent as="code" />
			</pre>
		</NodeViewWrapper>
	);
}
