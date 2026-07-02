import { useEffect, useRef, useState } from "react";
import { cn } from "#/lib/utils";

/** Check whether a TipTap content string is effectively empty
 *  (null, undefined, empty doc, or a doc with only an empty paragraph). */
function isContentEmpty(content: string | null | undefined): boolean {
	if (!content) return true;
	try {
		const json = JSON.parse(content);
		if (json && typeof json === "object" && json.type === "doc") {
			if (!json.content || json.content.length === 0) return true;
			// Single empty paragraph is also empty
			if (
				json.content.length === 1 &&
				json.content[0].type === "paragraph" &&
				(!json.content[0].content || json.content[0].content.length === 0)
			) {
				return true;
			}
			return false;
		}
	} catch {
		// Not valid JSON — treat as non-empty (it has content to display)
	}
	return false;
}

/**
 * Renders TipTap JSON content as sanitized HTML.
 * Lightweight — doesn't pull in the full editor, just a minimal renderer.
 * Returns null when content is empty (no visible output).
 */
export function RichTextRenderer({
	content,
	className,
}: {
	/** JSON-stringified TipTap document, or a plain HTML string, or null */
	content: string | null | undefined;
	className?: string;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [html, setHtml] = useState<string>("");

	// Render nothing if the content is empty
	if (isContentEmpty(content)) return null;

	useEffect(() => {
		if (!content) {
			setHtml("");
			return;
		}

		// Try parsing as TipTap JSON
		try {
			const json = JSON.parse(content);
			if (json && typeof json === "object" && json.type === "doc") {
				const rendered = renderTipTapJson(json);
				setHtml(rendered);
				return;
			}
		} catch {
			// Not JSON — treat as plain text
		}

		// Fallback: render as escaped text
		setHtml(escapeHtml(content));
	}, [content]);

	return (
		<div
			ref={containerRef}
			className={cn("rich-content", className)}
			dangerouslySetInnerHTML={html ? { __html: html } : undefined}
		/>
	);
}

// ── TipTap JSON → HTML renderer ────────────────────────────────────

type TipTapNode = {
	type: string;
	content?: TipTapNode[];
	text?: string;
	marks?: TipTapMark[];
	attrs?: Record<string, unknown>;
};

type TipTapMark = {
	type: string;
	attrs?: Record<string, unknown>;
};

function renderTipTapJson(node: TipTapNode): string {
	if (!node) return "";

	switch (node.type) {
		case "doc":
			return renderChildren(node.content);

		case "paragraph":
			return `<p>${renderChildren(node.content)}</p>`;

		case "heading": {
			const level = (node.attrs?.level as number) || 2;
			return `<h${level}>${renderChildren(node.content)}</h${level}>`;
		}

		case "bulletList":
			return `<ul>${renderChildren(node.content)}</ul>`;

		case "orderedList":
			return `<ol>${renderChildren(node.content)}</ol>`;

		case "listItem":
			return `<li>${renderChildren(node.content)}</li>`;

		case "blockquote":
			return `<blockquote>${renderChildren(node.content)}</blockquote>`;

		case "codeBlock": {
			const lang = node.attrs?.language
				? ` class="language-${node.attrs.language}"`
				: "";
			return `<pre${lang}><code>${escapeHtml(node.text || renderChildren(node.content))}</code></pre>`;
		}

		case "horizontalRule":
			return `<hr />`;

		case "hardBreak":
			return `<br />`;

		case "text":
			return renderTextWithMarks(node.text || "", node.marks);

		default:
			return renderChildren(node.content);
	}
}

function renderChildren(children?: TipTapNode[]): string {
	if (!children || children.length === 0) return "";
	return children.map((child) => renderTipTapJson(child)).join("");
}

function renderTextWithMarks(text: string, marks?: TipTapMark[]): string {
	if (!marks || marks.length === 0) return escapeHtml(text);

	let result = escapeHtml(text);
	for (const mark of marks) {
		switch (mark.type) {
			case "bold":
				result = `<strong>${result}</strong>`;
				break;
			case "italic":
				result = `<em>${result}</em>`;
				break;
			case "underline":
				result = `<u>${result}</u>`;
				break;
			case "strike":
				result = `<s>${result}</s>`;
				break;
			case "code":
				result = `<code>${result}</code>`;
				break;
			case "link": {
				const href = mark.attrs?.href || "#";
				result = `<a href="${escapeAttr(href as string)}" target="_blank" rel="noopener noreferrer">${result}</a>`;
				break;
			}
			case "textStyle": {
				const color = mark.attrs?.color;
				if (color) {
					result = `<span style="color:${escapeAttr(color as string)}">${result}</span>`;
				}
				break;
			}
		}
	}
	return result;
}

// ── Helpers ────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
	const el = document.createElement("div");
	el.textContent = text;
	return el.innerHTML;
}

function escapeAttr(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
