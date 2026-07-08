# RTE → Bare TipTap Migration

This doc describes the full **reactjs-tiptap-editor** (wrapper) system so an AI can port it to **bare @tiptap/react**.

---

## 1. Current Architecture Overview

The RTE lives in `apps/frontend/src/components/ui/rich-text-editor.tsx`. It uses:

- **`reactjs-tiptap-editor`** — a wrapper around TipTap that provides pre-built toolbar/bubble UI components + some custom extensions.
- **`@tiptap/react`** — the base React bindings that the wrapper sits on top of.
- **`RichTextProvider`** — context provider that makes the editor instance available to all `RichText*` toolbar/bubble components.
- **`RichTextBubbleText`** — the bubble menu component that renders a floating popup on text selection. We pass a custom `buttonBubble` prop to replace its default content.
- **Custom components**: `HeadingDropdown`, `FontFamilyDropdown`, `CodeBlockView`, `CodeBlockButton` — hand-built because the wrapper's built-in components didn't meet requirements.

### Data flow

```
Parent Component
  │
  ├── value (JSON-stringified TipTap JSON)
  ├── onChange (callback)
  │
  └── <RichTextEditor>
        ├── RichTextProvider (context)
        │   ├── Toolbar       ← uses editor from context
        │   ├── RichTextBubbleText (buttonBubble={<BubbleContent />})
        │   └── EditorContent (from @tiptap/react)
        └── useEditor(config)
```

The editor is initialized via `useEditor` from `@tiptap/react` (already bare TipTap). The wrapper's main value is:
1. Pre-built toolbar/bubble React components (`RichTextBold`, `RichTextItalic`, etc.)
2. Some custom extensions (`Clear`, `Indent`, `FontFamily`, `Color`, `LineHeight`)
3. Theme sync (`themeActions.setTheme`, `setColor`, `setBorderRadius`)

The goal is to replace items 1 & 2 with raw TipTap + custom UI, and replace item 3 with CSS variables.

---

## 2. Extension Map

Each extension currently used, its library import path, what tiptap extension it wraps, and configuration.

### 2.1 Base Kit (already from @tiptap directly)

| Current Import | Package | Notes |
|---|---|---|
| `Document` | `@tiptap/extension-document` | Standard, keep |
| `Text` | `@tiptap/extension-text` | Standard, keep |
| `Dropcursor` | `@tiptap/extension-dropcursor` | Already using `.configure({ class, color, width })` |
| `Gapcursor` | `@tiptap/extension-gapcursor` | Standard, keep |
| `HardBreak` | `@tiptap/extension-hard-break` | Standard, keep |
| `Paragraph` | `@tiptap/extension-paragraph` | Standard, keep |
| `ListItem` | `@tiptap/extension-list-item` | Standard, keep |
| `TextStyle` | `@tiptap/extension-text-style` | Required for Color and FontFamily marks |

### 2.2 Core Formatting Extensions

| Current Import | Wraps | Install Package | Config Notes |
|---|---|---|---|
| `Bold` from `reactjs-tiptap-editor/bold` | `@tiptap/extension-bold` | `@tiptap/extension-bold` | No config needed |
| `Italic` from `reactjs-tiptap-editor/italic` | `@tiptap/extension-italic` | `@tiptap/extension-italic` | No config needed |
| `Strike` from `reactjs-tiptap-editor/strike` | `@tiptap/extension-strike` | `@tiptap/extension-strike` | No config needed |
| `TextUnderline` from `reactjs-tiptap-editor/textunderline` | `@tiptap/extension-underline` | `@tiptap/extension-underline` | No config needed |
| `Code` from `reactjs-tiptap-editor/code` | `@tiptap/extension-code` | `@tiptap/extension-code` | No config needed |
| `Blockquote` from `reactjs-tiptap-editor/blockquote` | `@tiptap/extension-blockquote` | `@tiptap/extension-blockquote` | No config needed |
| `HorizontalRule` from `reactjs-tiptap-editor/horizontalrule` | `@tiptap/extension-horizontal-rule` | `@tiptap/extension-horizontal-rule` | No config needed |

### 2.3 List Extensions

| Current Import | Wraps | Install Package | Config Notes |
|---|---|---|---|
| `BulletList` from `reactjs-tiptap-editor/bulletlist` | `@tiptap/extension-bullet-list` | `@tiptap/extension-bullet-list` | No config needed |
| `OrderedList` from `reactjs-tiptap-editor/orderedlist` | `@tiptap/extension-ordered-list` | `@tiptap/extension-ordered-list` | No config needed |
| `TaskList` from `reactjs-tiptap-editor/tasklist` | `@tiptap/extension-task-list` | `@tiptap/extension-task-list` | Also needs `@tiptap/extension-task-item` |

### 2.4 Link Extension

| Current Import | Wraps | Install Package | Config Notes |
|---|---|---|---|
| `Link` from `reactjs-tiptap-editor/link` | `@tiptap/extension-link` | `@tiptap/extension-link` | Current config: `{ openOnClick: true, linkOnPaste: true, autolink: true }` |

### 2.5 Heading Extension

| Current Import | Wraps | Install Package | Config Notes |
|---|---|---|---|
| `Heading` from `reactjs-tiptap-editor/heading` | `@tiptap/extension-heading` | `@tiptap/extension-heading` | Configured with `levels: [1, 2, 3, 4]` |

**Custom UI**: We replaced `RichTextHeading` with our own `HeadingDropdown` component because the library's heading dropdown showed H5/H6. See `apps/frontend/src/components/ui/heading-dropdown.tsx`.

### 2.6 History Extension

| Current Import | Wraps | Install Package | Config Notes |
|---|---|---|---|
| `History` from `reactjs-tiptap-editor/history` | `@tiptap/extension-history` | `@tiptap/extension-history` | No config needed |

### 2.7 Styling Extensions (TextStyle-based)

These extensions require `TextStyle` to be registered.

| Current Import | Wraps | Install Package | Config Notes |
|---|---|---|---|
| `FontFamily` from `reactjs-tiptap-editor/fontfamily` | `@tiptap/extension-font-family` | `@tiptap/extension-font-family` | Configured with `fontFamilyList: FONT_LIST` |
| `Color` from `reactjs-tiptap-editor/color` | `@tiptap/extension-color` | `@tiptap/extension-color` | Configured with `colors: COLOR_PRESETS` |
| `Highlight` from `reactjs-tiptap-editor/highlight` | `@tiptap/extension-highlight` | `@tiptap/extension-highlight` | No config currently |

**Custom UI**: FontFamily uses our custom `FontFamilyDropdown` component. See `apps/frontend/src/components/ui/font-family-dropdown.tsx`.

### 2.8 Text Alignment

| Current Import | Wraps | Install Package | Config Notes |
|---|---|---|---|
| `TextAlign` from `reactjs-tiptap-editor/textalign` | `@tiptap/extension-text-align` | `@tiptap/extension-text-align` | Configured with `alignments: ["left", "center", "right", "justify"]` |

### 2.9 Custom Extensions (No Tiptap Equivalent)

These are **custom implementations** that don't wrap a standard `@tiptap/extension-*`.

| Extension | Type | Source | Notes |
|---|---|---|---|
| `Clear` from `reactjs-tiptap-editor/clear` | Custom `Node` | In library's source | Clears all formatting at cursor. Maps to `editor.chain().focus().clearNodes().unsetAllMarks().run()` |
| `Indent` from `reactjs-tiptap-editor/indent` | Custom `Extension` | In library's source | Indent/outdent with config: `{ minIndent: 0, maxIndent: 48, types: ["paragraph","heading","blockquote","orderedList","bulletList"] }` |
| `LineHeight` from `reactjs-tiptap-editor/lineheight` | Custom `Extension` | In library's source | Sets line-height via CSS. Configured with `lineHeights: ["1","1.15","1.25","1.5","1.75","2","2.5"]` |

### 2.10 Emoji

| Current Import | Wraps | Install Package | Config Notes |
|---|---|---|---|
| `Emoji` from `reactjs-tiptap-editor/emoji` | `@tiptap/extension-emoji` | `@tiptap/extension-emoji` (free community) or `@tiptap-pro/extension-emoji` (commercial) | No config currently. The free version is more limited. |

### 2.11 CodeBlock (with Lowlight / Syntax Highlighting)

| Current Import | Wraps | Notes |
|---|---|---|
| `CodeBlock` from `reactjs-tiptap-editor/codeblock` | `@tiptap/extension-code-block` extended with Lowlight | Current code: `.extend({ addNodeView() { ... } }).configure({ lowlight })` |

This extension has a **custom NodeView**: `CodeBlockView` at `apps/frontend/src/components/ui/code-block-view.tsx`.

Lowlight setup:
```ts
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";

const lowlight = createLowlight();
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);
```

For the migration:
- Use `@tiptap/extension-code-block-lowlight` (already in package.json)
- Or use `@tiptap/extension-code-block` + `@tiptap/extension-code-block-lowlight` for syntax highlighting
- The custom `CodeBlockView` NodeView handles: language selector dropdown, copy, delete

---

## 3. Toolbar Layout (Current)

The toolbar is a horizontal flex row with groups separated by vertical dividers. Here's the exact order:

```
[Undo] [Redo]  |  [Clear]  |  [Heading▼] [Bold] [Italic] [Underline] [Strike]  |  [BulletList] [OrderedList] [Blockquote] [Code] [CodeBlock]  |  [Font▼] [Color] [Highlight] [Emoji]  |  [Align▼] [LineHeight▼] [Indent][Indent]  |  [Link] [HR]
```

Each item maps to:
| Toolbar Item | Component | Type |
|---|---|---|
| Undo | `RichTextUndo` from `reactjs-tiptap-editor/history` | Wrapper component → `editor.chain().focus().undo().run()` |
| Redo | `RichTextRedo` from `reactjs-tiptap-editor/history` | Wrapper → `editor.chain().focus().redo().run()` |
| Clear | `RichTextClear` from `reactjs-tiptap-editor/clear` | Wrapper → clears formatting |
| Heading | `HeadingDropdown` (custom) | `apps/frontend/src/components/ui/heading-dropdown.tsx` |
| Bold | `RichTextBold` from `reactjs-tiptap-editor/bold` | Wrapper → `toggleBold()` |
| Italic | `RichTextItalic` from `reactjs-tiptap-editor/italic` | Wrapper → `toggleItalic()` |
| Underline | `RichTextUnderline` from `reactjs-tiptap-editor/textunderline` | Wrapper → `toggleUnderline()` |
| Strike | `RichTextStrike` from `reactjs-tiptap-editor/strike` | Wrapper → `toggleStrike()` |
| BulletList | `RichTextBulletList` from `reactjs-tiptap-editor/bulletlist` | Wrapper → `toggleBulletList()` |
| OrderedList | `RichTextOrderedList` from `reactjs-tiptap-editor/orderedlist` | Wrapper → `toggleOrderedList()` |
| Blockquote | `RichTextBlockquote` from `reactjs-tiptap-editor/blockquote` | Wrapper → `toggleBlockquote()` |
| Code | `RichTextCode` from `reactjs-tiptap-editor/code` | Wrapper → `toggleCode()` |
| CodeBlock | `CodeBlockButton` (custom) | Inline component, `toggleCodeBlock()` |
| Font | `FontFamilyDropdown` (custom) | `apps/frontend/src/components/ui/font-family-dropdown.tsx` |
| Color | `RichTextColor` from `reactjs-tiptap-editor/color` | Wrapper → color picker |
| Highlight | `RichTextHighlight` from `reactjs-tiptap-editor/highlight` | Wrapper → highlight toggle |
| Emoji | `RichTextEmoji` from `reactjs-tiptap-editor/emoji` | Wrapper → emoji picker |
| Align | `RichTextAlign` from `reactjs-tiptap-editor/textalign` | Wrapper → alignment dropdown |
| LineHeight | `RichTextLineHeight` from `reactjs-tiptap-editor/lineheight` | Wrapper → line-height dropdown |
| Indent | `RichTextIndent` from `reactjs-tiptap-editor/indent` | Wrapper → indent/outdent buttons |
| Link | `RichTextLink` from `reactjs-tiptap-editor/link` | Wrapper → link button |
| HR | `RichTextHorizontalRule` from `reactjs-tiptap-editor/horizontalrule` | Wrapper → `setHorizontalRule()` |

---

## 4. Bubble Menu Layout (Current)

The bubble menu shows on text selection via `<RichTextBubbleText buttonBubble={<BubbleContent editor={editor} />} />`.

Layout (grouped by dividers):

```
[Heading▼]  |  [Bold] [Italic] [Underline] [Strike] [Code] [Link]  |  [Color] [Highlight] [Align▼]  |  [BulletList] [TaskList] [OrderedList] [Blockquote] [CodeBlock]
```

The custom `BubbleContent` wrapper:
```tsx
<div className="flex items-center gap-0.5 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none">
```

---

## 5. Custom Components to Port

### 5.1 HeadingDropdown (`apps/frontend/src/components/ui/heading-dropdown.tsx`)

A dropdown button showing current heading level with options: Paragraph, H1, H2, H3, H4.

- Uses `editor.isActive("paragraph")` and `editor.isActive("heading", { level })` for active detection
- Uses `editor.chain().focus().setParagraph().run()` and `editor.chain().focus().toggleHeading({ level }).run()` for commands
- Outside-click and Escape to close
- Checkmark on active item

### 5.2 FontFamilyDropdown (`apps/frontend/src/components/ui/font-family-dropdown.tsx`)

Categorized font dropdown with groups: Default, Sans-serif, Serif, Monospace.

- Uses `editor.getAttributes("textStyle").fontFamily` to read current font
- Uses `editor.chain().focus().setFontFamily(value).run()` and `unsetFontFamily()` for commands
- Font preview in dropdown via `fontFamily` style on each item
- Outside-click and Escape to close
- Category headers with dividers

### 5.3 CodeBlockView (`apps/frontend/src/components/ui/code-block-view.tsx`)

NodeView for code blocks with language selector dropdown overlay.

- Renders as `<NodeViewWrapper>` with `<pre><NodeViewContent as="code" /></pre>`
- Language selector in top-right corner, visible on hover
- 24+ languages listed with custom/unsupported language input
- Uses `updateAttributes({ language })` for language changes
- Active language shown with checkmark

### 5.4 CodeBlockButton (in `rich-text-editor.tsx`)

Toolbar/bubble button for toggling code blocks.

- `editor.isActive("codeBlock")` for active state
- `editor.chain().focus().toggleCodeBlock().run()` for toggling
- Fallback for empty document: inserts codeBlock node directly
- Uses `<Code2>` icon from lucide-react

---

## 6. Theme Handling (Current)

The editor syncs with the project's shadcn theme:

```tsx
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
```

**For migration**: The wrapper's `themeActions` sets CSS variables. With bare TipTap, the editor will automatically use the project's existing CSS (shadcn theme variables) since we render HTML directly. The `reactjs-tiptap-editor/style.css` import should be removed.

The editor wrapper already has the styling classes:
```tsx
<div className="rounded-xl border border-input bg-input/30 transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
```

---

## 7. Value / onChange Flow

The editor is controlled via JSON-stringified TipTap documents:

```tsx
const initialContent = (() => {
  if (!value) return EMPTY_DOC; // { type: "doc", content: [] }
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : EMPTY_DOC;
  } catch {
    return value || "";
  }
})();

// In useEditor config:
onUpdate: ({ editor: ed }) => {
  const json = ed.getJSON();
  onChange?.(JSON.stringify(json));
},
```

There's also logic to sync external value changes (e.g., form reset) while preventing cursor jumping:

```tsx
useEffect(() => {
  if (editor && value !== prevValueRef.current) {
    // Only setContent if JSON differs from current editor content
    // Prevents cursor jumping
  }
}, [value, editor]);
```

---

## 8. Readiness Gate

The editor uses a readiness gate to prevent rendering `RichTextProvider` before the editor is fully initialized:

```tsx
const [isEditorReady, setIsEditorReady] = useState(false);

useEffect(() => {
  if (editor?.extensionManager) {
    setIsEditorReady(true);
  }
  return () => setIsEditorReady(false);
}, [editor]);
```

With bare TipTap, this gate can be simplified since there's no `RichTextProvider`. The `EditorContent` component from `@tiptap/react` handles this gracefully.

---

## 9. Fallback Section for Each Extension

> Use this section if the initial bare TipTap implementation fails for a particular extension. Check the current working RTE system's behavior and compare with TipTap docs to implement a working version.

### 9.1 Clear (Clear All Formatting)

**If `editor.chain().focus().clearNodes().unsetAllMarks().run()` fails**:
- Check the current wrapper's source at `apps/frontend/node_modules/reactjs-tiptap-editor/lib/extensions/Clear/Clear.js` or `.d.ts`
- It's a custom `Node` extension that iterates through all marks and nodes and clears them
- Fallback: Create a custom extension that clears nodes and unset marks

### 9.2 Indent

**If a custom indent extension fails**:
- Check the current wrapper's source at `apps/frontend/node_modules/reactjs-tiptap-editor/lib/extensions/Indent/`
- It's a custom `Extension` that:
  - Stores indent level as an attribute on paragraph/heading/blockquote/list nodes
  - Provides `setNodeIndentMarkup()` for modifying the indent attribute
  - Uses CSS `padding-left` for visual indentation
- Fallback: Use `@tiptap/extension-indent` from the community, or implement a simple `Extension` that toggles `margin-left` or `padding-left` via a mark

### 9.3 LineHeight

**If a custom line-height extension fails**:
- Check the current wrapper's source at `apps/frontend/node_modules/reactjs-tiptap-editor/lib/extensions/LineHeight/`
- It's a custom `Extension` that sets `line-height` CSS via inline styles on paragraph/heading nodes
- Fallback: Implement as a simple `Extension` that uses `@tiptap/extension-text-style` to store line-height as a style attribute

### 9.4 FontFamily

**If `@tiptap/extension-font-family` fails**:
- Check the current wrapper's source at `apps/frontend/node_modules/reactjs-tiptap-editor/lib/extensions/FontFamily/`
- It wraps `@tiptap/extension-font-family` and provides `fontFamilyList` option
- The `FONT_LIST` constant in `rich-text-editor.tsx` contains all font names and values
- Fallback: Use a custom `Extension` that stores `fontFamily` via `textStyle` and sets `font-family` CSS

### 9.5 Color

**If `@tiptap/extension-color` fails**:
- Check the current wrapper's source at `apps/frontend/node_modules/reactjs-tiptap-editor/lib/extensions/Color/`
- It wraps `@tiptap/extension-color` with a `colors` option for preset color list
- The `COLOR_PRESETS` constant has 15 colors
- Fallback: Custom extension that stores color via TextStyle mark

### 9.6 CodeBlock with Lowlight

**If `@tiptap/extension-code-block-lowlight` fails**:
- Check the current wrapper's source at `apps/frontend/node_modules/reactjs-tiptap-editor/lib/extensions/CodeBlock/`
- It wraps `@tiptap/extension-code-block` and adds Lowlight integration
- Current code extends it with a custom NodeView for the language selector
- Fallback: Use `@tiptap/extension-code-block` + `@tiptap/extension-code-block-lowlight` separately

---

## 10. Imports to Add After Migration

These packages are **not yet installed** and will need to be added:

| Package | For |
|---|---|
| `@tiptap/extension-bold` | Bold mark |
| `@tiptap/extension-italic` | Italic mark |
| `@tiptap/extension-strike` | Strike mark |
| `@tiptap/extension-underline` | Underline mark |
| `@tiptap/extension-code` | Inline code mark |
| `@tiptap/extension-blockquote` | Blockquote node |
| `@tiptap/extension-bullet-list` | Bullet list node |
| `@tiptap/extension-ordered-list` | Ordered list node |
| `@tiptap/extension-task-list` | Task list node |
| `@tiptap/extension-task-item` | Task list item node |
| `@tiptap/extension-link` | Link mark |
| `@tiptap/extension-heading` | Heading node |
| `@tiptap/extension-history` | Undo/redo |
| `@tiptap/extension-horizontal-rule` | Horizontal rule |
| `@tiptap/extension-font-family` | Font family (requires TextStyle) |
| `@tiptap/extension-color` | Color mark (requires TextStyle) |
| `@tiptap/extension-highlight` | Highlight mark |
| `@tiptap/extension-text-align` | Text alignment |
| `@tiptap/extension-code-block` | Code block node (if not using lowlight version) |
| `@tiptap/extension-code-block-lowlight` | Code block with syntax highlighting |

**Already installed** (from current package.json):
- `@tiptap/extension-document`
- `@tiptap/extension-text`
- `@tiptap/extension-paragraph`
- `@tiptap/extension-hard-break`
- `@tiptap/extension-list-item`
- `@tiptap/extension-text-style`
- `@tiptap/extension-placeholder`
- `@tiptap/extension-dropcursor`
- `@tiptap/extension-gapcursor`
- `@tiptap/extension-code-block-lowlight`
- `@tiptap/extension-emoji`
- `@tiptap/extensions` (may bundle several)
- `@tiptap/core`
- `@tiptap/react`

---

## 11. Summary of UI Components to Build

Instead of importing `RichText*` from `reactjs-tiptap-editor/*`, build these:

### Toolbar buttons (simple toggles)
Create a reusable `ToolbarButton` component:
```tsx
function ToolbarButton({ onClick, isActive, children, title }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={cn("flex items-center justify-center rounded-md p-1 transition-colors duration-100 hover:bg-accent", isActive && "bg-accent")}>
      {children}
    </button>
  );
}
```

Then for each format:
- **Bold**: `editor.chain().focus().toggleBold().run()` / `editor.isActive("bold")`
- **Italic**: `toggleItalic()` / `isActive("italic")`
- **Underline**: `toggleUnderline()` / `isActive("underline")`
- **Strike**: `toggleStrike()` / `isActive("strike")`
- **Code**: `toggleCode()` / `isActive("code")`
- **Link**: `editor.chain().focus().setLink({ href: url }).run()` / `isActive("link")`
- **BulletList**: `toggleBulletList()` / `isActive("bulletList")`
- **OrderedList**: `toggleOrderedList()` / `isActive("orderedList")`
- **Blockquote**: `toggleBlockquote()` / `isActive("blockquote")`
- **HorizontalRule**: `setHorizontalRule()`
- **CodeBlock**: `toggleCodeBlock()` / `isActive("codeBlock")`
- **Clear**: `clearNodes().unsetAllMarks()`
- **Undo**: `undo()`
- **Redo**: `redo()`

### Bubble Menu
Use `@tiptap/extension-bubble-menu` directly and render custom content inside it, instead of relying on `RichTextBubbleText`.

### TaskList
Button: `toggleTaskList()` / `isActive("taskList")` (also needs `@tiptap/extension-task-item`)

### TextAlign
Dropdown with left/center/right/justify: `setTextAlign("left")` / `isActive({ textAlign: "left" })`

### LineHeight
Dropdown with values ["1","1.15","1.25","1.5","1.75","2","2.5"] - custom extension that applies `line-height` style via TextStyle mark or inline style.

### Color
Color picker: `setColor("#ff0000")` / `isActive("textStyle", { color: "#ff0000" })` / `unsetColor()`

### Highlight
`toggleHighlight()` / `isActive("highlight")` / `unsetHighlight()`

### Emoji
Emoji picker component. The free `@tiptap/extension-emoji` provides basic emoji insertion, or use a custom emoji picker.
