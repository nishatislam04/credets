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
import {
	Blockquote,
	RichTextBlockquote,
} from "reactjs-tiptap-editor/blockquote";
import { Bold, RichTextBold } from "reactjs-tiptap-editor/bold";
import { RichTextBubbleText } from "reactjs-tiptap-editor/bubble";
import {
	BulletList,
	RichTextBulletList,
} from "reactjs-tiptap-editor/bulletlist";
import { TaskList, RichTextTaskList } from "reactjs-tiptap-editor/tasklist";
import { Clear, RichTextClear } from "reactjs-tiptap-editor/clear";
import { Code, RichTextCode } from "reactjs-tiptap-editor/code";
import { CodeBlock } from "reactjs-tiptap-editor/codeblock";
import { Heading } from "reactjs-tiptap-editor/heading";
import HeadingDropdown from "#/components/ui/heading-dropdown";
import {
	History,
	RichTextRedo,
	RichTextUndo,
} from "reactjs-tiptap-editor/history";
import {
	HorizontalRule,
	RichTextHorizontalRule,
} from "reactjs-tiptap-editor/horizontalrule";
import { Italic, RichTextItalic } from "reactjs-tiptap-editor/italic";
import { Link, RichTextLink } from "reactjs-tiptap-editor/link";
import {
	OrderedList,
	RichTextOrderedList,
} from "reactjs-tiptap-editor/orderedlist";
import { RichTextStrike, Strike } from "reactjs-tiptap-editor/strike";
import {
	RichTextUnderline,
	TextUnderline,
} from "reactjs-tiptap-editor/textunderline";
import { Color, RichTextColor } from "reactjs-tiptap-editor/color";
import { Highlight, RichTextHighlight } from "reactjs-tiptap-editor/highlight";
import { Emoji, RichTextEmoji } from "reactjs-tiptap-editor/emoji";
import { FontFamily } from "reactjs-tiptap-editor/fontfamily";
import FontFamilyDropdown from "#/components/ui/font-family-dropdown";
import {
	LineHeight,
	RichTextLineHeight,
} from "reactjs-tiptap-editor/lineheight";
import { TextAlign, RichTextAlign } from "reactjs-tiptap-editor/textalign";
import { Indent, RichTextIndent } from "reactjs-tiptap-editor/indent";
import { Code2 } from "lucide-react";
import { cn } from "#/lib/utils";
import "reactjs-tiptap-editor/style.css";
import { createLowlight } from "lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockView from "#/components/ui/code-block-view";

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

const COLOR_PRESETS = [
	"#000000",
	"#434343",
	"#666666",
	"#999999",
	"#b7b7b7",
	"#e74c3c",
	"#e67e22",
	"#f1c40f",
	"#2ecc71",
	"#1abc9c",
	"#3498db",
	"#9b59b6",
	"#e91e63",
	"#795548",
	"#ffffff",
];

const FONT_LIST = [
	{ name: "Default", value: "" },
	{ name: "Arial", value: "Arial" },
	{ name: "Helvetica", value: "Helvetica" },
	{ name: "Times New Roman", value: '"Times New Roman", serif' },
	{ name: "Georgia", value: "Georgia, serif" },
	{ name: "Courier New", value: "'Courier New', monospace" },
	{ name: "Verdana", value: "Verdana, sans-serif" },
	{ name: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
	{ name: "Impact", value: "Impact, sans-serif" },
	{ name: "Inter", value: "'Inter Variable', sans-serif" },
	{ name: "Montserrat", value: "'Montserrat Variable', sans-serif" },
	{ name: "Source Serif 4", value: "'Source Serif 4 Variable', serif" },
	{ name: "Manrope", value: "'Manrope Variable', sans-serif" },
	{ name: "Geist", value: "'Geist Variable', sans-serif" },
	{ name: "System UI", value: "system-ui, sans-serif" },
	{ name: "Monospace", value: "ui-monospace, SFMono-Regular, monospace" },
];

const LINE_HEIGHTS = ["1", "1.15", "1.25", "1.5", "1.75", "2", "2.5"];

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
 */ export default function RichTextEditor({
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
			return window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
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
			Heading.configure({
				levels: [1, 2, 3, 4],
			}),
			Bold,
			Italic,
			TextUnderline,
			Strike,
			BulletList,
			OrderedList,
			TaskList,
			Code,
			Blockquote,
			HorizontalRule,
			Link.configure({
				openOnClick: true,
				linkOnPaste: true,
				autolink: true,
				// The library's LinkEditBlock already has built-in URL validation
			}),
			FontFamily.configure({
				fontFamilyList: FONT_LIST,
			}),
			LineHeight.configure({
				lineHeights: LINE_HEIGHTS,
			}),
			TextAlign.configure({
				alignments: ["left", "center", "right", "justify"],
			}),
			Indent.configure({
				minIndent: 0,
				maxIndent: 48,
				types: [
					"paragraph",
					"heading",
					"blockquote",
					"orderedList",
					"bulletList",
				],
			}),
			Color.configure({
				colors: COLOR_PRESETS,
			}),
			Highlight,
			Emoji,
			CodeBlock.extend({
				addNodeView() {
					return ReactNodeViewRenderer(CodeBlockView);
				},
			}).configure({
				lowlight: lowlight,
			}),
		],
		content: initialContent,
		editable: !disabled,
		onUpdate: ({ editor: ed }) => {
			const json = ed.getJSON();
			onChange?.(JSON.stringify(json));
		},
		// Fire on every selection change so toolbar buttons
		// (active state indicators) stay in sync with the cursor.
		onSelectionUpdate: () => {
			// no-op — just triggers a re-render that propagates
			// to the library's isActive subscriptions
		},
	});

	// ── Confirm editor readiness after commit ─────────────────────
	useEffect(() => {
		if (editor?.extensionManager) {
			setIsEditorReady(true);
		}
		return () => setIsEditorReady(false);
	}, [editor]);

	// Sync external value changes (e.g. form reset) to the editor.
	// IMPORTANT: We must NOT call setContent when the change originated from the
	// editor itself (the onUpdate callback), because that resets the cursor to
	// the start of the document.  Instead we compare the *actual document content*
	// against the incoming value — if they're semantically identical we skip the
	// update, preserving cursor position.
	useEffect(() => {
		if (editor && value !== prevValueRef.current) {
			prevValueRef.current = value;

			try {
				const parsed = value
					? (JSON.parse(value) as Record<string, unknown>)
					: null;
				if (!parsed) {
					editor.commands.setContent(EMPTY_DOC);
					return;
				}
				// Only set content if it actually differs from what's already in the editor.
				// This prevents cursor jumping when the change originated from onUpdate.
				const current = editor.getJSON();
				if (JSON.stringify(parsed) !== JSON.stringify(current)) {
					editor.commands.setContent(parsed);
				}
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
					"rounded-xl border border-input bg-input/30 p-3",
					className,
				)}
				style={{ height: "358px" }}
			>
				<div className="animate-pulse text-muted-foreground">
					Loading editor…
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"rich-text-editor-wrapper rounded-xl border border-input bg-input/30 transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
		>
			{" "}
			<RichTextProvider editor={editor}>
				<Toolbar editor={editor} />
				{/* Bubble text menu — appears on text selection */}
				<RichTextBubbleText buttonBubble={<BubbleContent editor={editor} />} />
				<div className="px-3 pb-3" style={{ minHeight }}>
					<EditorContent
						editor={editor}
						className="prose prose-sm dark:prose-invert max-w-none"
					/>
				</div>
			</RichTextProvider>
		</div>
	);
}

// ── Bubble menu content ───────────────────────────────────────────

function BubbleContent({
	editor,
}: {
	editor: NonNullable<ReturnType<typeof useEditor>>;
}) {
	return (
		<div className="flex items-center gap-0.5 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none">
			<HeadingDropdown editor={editor} />
			<div className="mx-1 h-4 w-px shrink-0 bg-border/50" />
			<RichTextBold />
			<RichTextItalic />
			<RichTextUnderline />
			<RichTextStrike />
			<RichTextCode />
			<RichTextLink />
			<div className="mx-1 h-4 w-px shrink-0 bg-border/50" />
			<RichTextColor />
			<RichTextHighlight />
			<RichTextAlign />
			<div className="mx-1 h-4 w-px shrink-0 bg-border/50" />
			<RichTextBulletList />
			<RichTextTaskList />
			<RichTextOrderedList />
			<RichTextBlockquote />
			<CodeBlockButton editor={editor} />
		</div>
	);
}

// ── Custom code block button ──────────────────────────────────────

function CodeBlockButton({
	editor,
}: {
	editor: NonNullable<ReturnType<typeof useEditor>>;
}) {
	const isActive = editor.isActive("codeBlock");

	const handleClick = () => {
		// Try toggleCodeBlock first — works when cursor is inside a paragraph.
		// If it fails (e.g. empty document with no block to wrap), fall back
		// to inserting a codeBlock node directly.
		const didToggle = editor.chain().focus().toggleCodeBlock().run();

		if (!didToggle) {
			// Check if we're in an empty document — only auto-insert a code block
			// if the document is basically empty (single empty paragraph).
			const { doc } = editor.state;
			const isEmptyParagraph =
				doc.childCount === 1 &&
				doc.firstChild?.type.name === "paragraph" &&
				doc.firstChild?.childCount === 0;

			if (isEmptyParagraph) {
				editor
					.chain()
					.focus()
					.setContent({
						type: "doc",
						content: [
							{
								type: "codeBlock",
								attrs: { language: "plaintext" },
							},
						],
					})
					.run();
			}
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			data-state={isActive ? "on" : undefined}
			className={cn(
				"flex items-center justify-center",
				"rounded-md p-1",
				"transition-colors duration-100",
				"hover:bg-accent",
				isActive && "bg-accent",
			)}
			title="Code block"
		>
			<Code2 size={18} />
		</button>
	);
}

// ── Toolbar ────────────────────────────────────────────────────────

function Toolbar({
	editor,
}: {
	editor: NonNullable<ReturnType<typeof useEditor>>;
}) {
	return (
		<div className="flex flex-wrap items-center gap-0.5 border-b border-border/50 px-2 py-1.5">
			<RichTextUndo />
			<RichTextRedo />
			<div className="mx-1 h-5 w-px shrink-0 bg-border/50" />
			<RichTextClear />
			<div className="mx-1 h-5 w-px shrink-0 bg-border/50" />
			<HeadingDropdown editor={editor} />
			<RichTextBold />
			<RichTextItalic />
			<RichTextUnderline />
			<RichTextStrike />
			<div className="mx-1 h-5 w-px shrink-0 bg-border/50" />
			<RichTextBulletList />
			<RichTextOrderedList />
			<RichTextBlockquote />
			<RichTextCode />
			<CodeBlockButton editor={editor} />
			<div className="mx-1 h-5 w-px shrink-0 bg-border/50" />
			<FontFamilyDropdown editor={editor} />
			<RichTextColor />
			<RichTextHighlight />
			<RichTextEmoji />
			<div className="mx-1 h-5 w-px shrink-0 bg-border/50" />
			<RichTextAlign />
			<RichTextLineHeight />
			<RichTextIndent />
			<div className="mx-1 h-5 w-px shrink-0 bg-border/50" />
			<RichTextLink />
			<RichTextHorizontalRule />
		</div>
	);
}
