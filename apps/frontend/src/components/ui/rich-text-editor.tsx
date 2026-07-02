import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import HardBreak from "@tiptap/extension-hard-break";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { RichTextProvider } from "reactjs-tiptap-editor";
import { themeActions } from "reactjs-tiptap-editor/theme";
import { useTheme } from "#/hooks/theme-provider";
import { Blockquote, RichTextBlockquote } from "reactjs-tiptap-editor/blockquote";
import { Bold, RichTextBold } from "reactjs-tiptap-editor/bold";
import { RichTextBubbleText } from "reactjs-tiptap-editor/bubble";
import { BulletList, RichTextBulletList } from "reactjs-tiptap-editor/bulletlist";
import { Clear, RichTextClear } from "reactjs-tiptap-editor/clear";
import { Code, RichTextCode } from "reactjs-tiptap-editor/code";
import { CodeBlock, RichTextCodeBlock } from "reactjs-tiptap-editor/codeblock";
import { Heading, RichTextHeading } from "reactjs-tiptap-editor/heading";
import { History, RichTextRedo, RichTextUndo } from "reactjs-tiptap-editor/history";
import { HorizontalRule, RichTextHorizontalRule } from "reactjs-tiptap-editor/horizontalrule";
import { Italic, RichTextItalic } from "reactjs-tiptap-editor/italic";
import { Link, RichTextLink } from "reactjs-tiptap-editor/link";
import { OrderedList, RichTextOrderedList } from "reactjs-tiptap-editor/orderedlist";
import { RichTextStrike, Strike } from "reactjs-tiptap-editor/strike";
import { RichTextUnderline, TextUnderline } from "reactjs-tiptap-editor/textunderline";
import { cn } from "#/lib/utils";
import "reactjs-tiptap-editor/style.css";
import { createLowlight } from "lowlight";

// ── Types ─────────────────────────────────────────────────────────

export interface RichTextEditorProps {
	/** TipTap JSON content as a JSON-stringified string, or null/undefined for empty */
	value?: string | null;
	/** Called with the updated JSON-stringified content */
	onChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	/** Minimum height for the editor content area */
	minHeight?: string;
	className?: string;
}

// ── Constants ──────────────────────────────────────────────────────

const EMPTY_DOC = { type: "doc", content: [] };

// ── Base Kit ───────────────────────────────────────────────────────

const BaseKit = [
	Document,
	Text,
	Dropcursor.configure({
		class: "reactjs-tiptap-editor-theme",
		color: "hsl(var(--primary))",
		width: 2,
	}),
	Gapcursor,
	HardBreak,
	Paragraph,
	ListItem,
	TextStyle,
];

import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";

const lowlight = createLowlight();
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

// ── Component ──────────────────────────────────────────────────────

/**
 * RichTextEditor — a controlled TipTap editor built on reactjs-tiptap-editor.
 *
 * Integrates with TanStack Form via `value` (JSON-stringified) and `onChange`.
 * Renders a rich toolbar above the content area with a bubble menu for inline
 * formatting (bold, italic, underline, strike, link).
 */	export default function RichTextEditor({
	value,
	onChange,
	placeholder,
	disabled = false,
	minHeight = "250px",
	className,
}: RichTextEditorProps) {
	const prevValueRef = useRef(value);
	const { theme: projectTheme } = useTheme();

	// ── Sync RTE theme with project theme ──────────────────────────
	const resolvedTheme = (() => {
		if (projectTheme === "system") {
			return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}
		return projectTheme;
	})();

	useEffect(() => {
		themeActions.setTheme(resolvedTheme);
		themeActions.setColor("default");
		themeActions.setBorderRadius("0.75rem");
	}, [resolvedTheme]);
	// ── Readiness gate ────────────────────────────────────────────
	// `isEditorReady` is only set to true inside a useEffect — i.e. after
	// React has committed the render to the DOM.  This guarantees that
	// RichTextProvider (and all its child toolbar components) only mount
	// on a committed frame, never during a speculative concurrent render
	// where editor.extensionManager can still be null.
	const [isEditorReady, setIsEditorReady] = useState(false);

	// Parse the initial content from the JSON-stringified value
	const initialContent = (() => {
		if (!value) return EMPTY_DOC;
		try {
			const parsed = JSON.parse(value);
			return parsed && typeof parsed === "object" ? parsed : EMPTY_DOC;
		} catch {
			return value || "";
		}
	})();

	const editor = useEditor({
		extensions: [
			...BaseKit,
			Placeholder.configure({
				placeholder: placeholder ?? "Type here...",
			}),
			History,
			Clear,
			Heading,
			Bold,
			Italic,
			TextUnderline,
			Strike,
			BulletList,
			OrderedList,
			Code,
			Blockquote,
			HorizontalRule,
			Link,
			CodeBlock.configure({
				lowlight: lowlight,
			}),
		],
		content: initialContent,
		editable: !disabled,
		onUpdate: ({ editor: ed }) => {
			const json = ed.getJSON();
			onChange?.(JSON.stringify(json));
		},
	});

	// ── Confirm editor readiness after commit ─────────────────────
	useEffect(() => {
		if (editor?.extensionManager) {
			setIsEditorReady(true);
		}
		return () => setIsEditorReady(false);
	}, [editor]);

	// Sync external value changes (e.g. form reset) to the editor
	useEffect(() => {
		if (editor && value !== prevValueRef.current) {
			prevValueRef.current = value;
			try {
				const newContent = value ? (JSON.parse(value) as Record<string, unknown>) : EMPTY_DOC;
				editor.commands.setContent(newContent);
			} catch {
				editor.commands.setContent(value || "");
			}
		}
	}, [value, editor]);

	// Cleanup
	useEffect(() => {
		return () => editor?.destroy();
	}, [editor]);

	// Update editable state
	useEffect(() => {
		if (editor) {
			editor.setEditable(!disabled);
		}
	}, [disabled, editor]);

	if (!isEditorReady || !editor || !editor.extensionManager) {
		return (
			<div
				className={cn(
					"overflow-hidden rounded-xl border border-input bg-background p-3",
					className,
				)}
				style={{ height: "358px" }}
			>
				<div className="animate-pulse text-muted-foreground">Loading editor…</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"rich-text-editor-wrapper overflow-hidden rounded-xl border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
		>
			<RichTextProvider editor={editor}>
				<Toolbar />
				{/* Bubble text menu — appears on text selection */}
				<RichTextBubbleText />
				<div className="px-3 pb-3" style={{ minHeight }}>
					<EditorContent editor={editor} className="prose prose-sm dark:prose-invert max-w-none" />
				</div>
			</RichTextProvider>
		</div>
	);
}

// ── Toolbar ────────────────────────────────────────────────────────

function Toolbar() {
	return (
		<div className="flex flex-wrap items-center gap-0.5 border-b border-border/50 px-2 py-1.5">
			<RichTextUndo />
			<RichTextRedo />
			<div className="mx-1 h-5 w-px shrink-0 bg-border/50" />
			<RichTextClear />
			<div className="mx-1 h-5 w-px shrink-0 bg-border/50" />
			<RichTextHeading />
			<RichTextBold />
			<RichTextItalic />
			<RichTextUnderline />
			<RichTextStrike />
			<div className="mx-1 h-5 w-px shrink-0 bg-border/50" />
			<RichTextBulletList />
			<RichTextOrderedList />
			<RichTextBlockquote />
			<RichTextCode />
			<RichTextCodeBlock />
			<div className="mx-1 h-5 w-px shrink-0 bg-border/50" />
			<RichTextLink />
			<RichTextHorizontalRule />
		</div>
	);
}
