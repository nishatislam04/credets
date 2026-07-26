import { useState, useRef, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/core";
import { cn } from "#/lib/utils";

const HEADING_LEVELS = [
	{
		label: "Paragraph",
		value: 0,
		command: (editor: Editor) => editor.chain().focus().setParagraph().run(),
	},
	{
		label: "Heading 1",
		value: 1,
		command: (editor: Editor) =>
			editor.chain().focus().toggleHeading({ level: 1 }).run(),
	},
	{
		label: "Heading 2",
		value: 2,
		command: (editor: Editor) =>
			editor.chain().focus().toggleHeading({ level: 2 }).run(),
	},
	{
		label: "Heading 3",
		value: 3,
		command: (editor: Editor) =>
			editor.chain().focus().toggleHeading({ level: 3 }).run(),
	},
	{
		label: "Heading 4",
		value: 4,
		command: (editor: Editor) =>
			editor.chain().focus().toggleHeading({ level: 4 }).run(),
	},
];

interface HeadingDropdownProps {
	editor: Editor;
}

export default function HeadingDropdown({ editor }: HeadingDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const currentLabel = getCurrentLabel(editor);

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

	useEffect(() => {
		if (!isOpen) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsOpen(false);
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen]);

	const apply = useCallback(
		(item: (typeof HEADING_LEVELS)[number]) => {
			item.command(editor);
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
					"flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium transition-colors duration-100 hover:bg-accent",
					isOpen && "bg-accent",
				)}
				title="Text style"
			>
				<span className="max-w-[80px] truncate">{currentLabel}</span>
				<svg
					width="10"
					height="10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="shrink-0 opacity-50"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>

			{isOpen && (
				<div
					ref={dropdownRef}
					className={cn(
						"absolute left-0 top-full mt-1 z-30",
						"min-w-[140px]",
						"rounded-lg border border-border shadow-lg",
						"bg-popover",
						"animate-in fade-in slide-in-from-top-1 duration-100",
					)}
				>
					{HEADING_LEVELS.map((item) => {
						const isActive = isHeadingActive(editor, item.value);
						return (
							<button
								key={item.label}
								type="button"
								onClick={() => apply(item)}
								className={cn(
									"flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors",
									"hover:bg-accent",
									isActive
										? "bg-primary text-primary-foreground"
										: "text-popover-foreground",
								)}
							>
								<span className="w-3 shrink-0">
									{isActive && (
										<svg
											width="10"
											height="10"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="3"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
									)}
								</span>
								<span>{item.label}</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

function getCurrentLabel(editor: Editor): string {
	if (editor.isActive("paragraph")) return "Paragraph";
	for (const level of [1, 2, 3, 4]) {
		if (editor.isActive("heading", { level })) return `Heading ${level}`;
	}
	return "Paragraph";
}

function isHeadingActive(editor: Editor, value: number): boolean {
	if (value === 0) return editor.isActive("paragraph");
	return editor.isActive("heading", { level: value });
}
