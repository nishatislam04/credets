# Prompt for Implementing a Rich Text Editor (RTE) with `reactjs-tiptap-editor`

You are an expert frontend developer. Your task is to implement a **scalable, lazy‑loadable Rich Text Editor** using the `reactjs-tiptap-editor` library in a React application that uses **TanStack Router** and **TanStack Form**. The editor will be used for two fields: `long_description` and `notes`. You must provide code and configuration that is production‑ready, modular, and follows best practices.

## Goal
Create a self‑contained RTE component that:
- Can be **lazy loaded** (code‑split) to reduce initial bundle size.
- Integrates seamlessly with **TanStack Form** as a controlled component (receives `value` and `onChange`).
- Supports a rich toolbar and a **bubble menu** for basic formatting.
- Is reusable for both description and notes fields (two instances on the same page).
- Is built on top of `reactjs-tiptap-editor` (a TipTap wrapper with pre‑styled UI).

## Requirements

### Functional Requirements
1. **Lazy Loading**:
   - The editor component must be dynamically imported when it is first rendered (e.g., when the user navigates to the form page or when the editor container becomes visible).
   - Provide a fallback skeleton (e.g., `Skeleton` from Shadcn) during loading.

2. **TanStack Form Integration**:
   - Expose a React component that accepts `value` (TipTap JSON or HTML) and `onChange` callback.
   - When the editor content changes, call `onChange` with the updated content (preferably JSON for structured data, but HTML is acceptable if specified).
   - Do not break form submission or validation.

3. **Rich Toolbar**:
   - Include the most common extensions (see list below) and corresponding toolbar buttons.
   - Toolbar should be positioned above the editor area.
   - Buttons must have clear visual feedback (active/inactive states) and be accessible.

4. **Bubble Menu**:
   - Provide a bubble menu that appears when text is selected, allowing quick formatting (bold, italic, link, etc.).
   - The bubble menu should not conflict with the main toolbar.

5. **Styling**:
   - The editor should visually match the existing Shadcn / Tailwind CSS design system.
   - Apply consistent border, focus ring, padding, and typography classes.
   - Ensure dark mode compatibility if your app supports it.

6. **Data Persistence**:
   - The editor’s output (JSON) must be saved to PostgreSQL (via your Bun backend). You don’t need to implement the backend, but the component should produce a serializable value.
   - When editing existing content, the editor must be initialised with the stored JSON.

### Common Extensions & Toolbar Blocks
Include at least the following extensions (provided by `reactjs-tiptap-editor` by default or via extra packages). Assume the library already bundles them; if not, add instructions to install them.

| Extension         | Toolbar Button           | Bubble Menu |
| ----------------- | ------------------------ | ----------- |
| Bold              | Bold (`B`)               | Yes         |
| Italic            | Italic (`I`)             | Yes         |
| Underline         | Underline (`U`)          | Optional    |
| Strike            | Strikethrough            | Yes         |
| Heading           | Heading dropdown (h1,h2,h3) | No       |
| Bullet List       | Bullet list              | Yes (if selection) |
| Ordered List      | Numbered list            | Yes         |
| Blockquote        | Quote                    | No          |
| Code Block        | Code block               | No          |
| Link              | Link (with modal/prompt) | Yes         |
| Image             | Image (upload or URL)    | No          |
| Horizontal Rule   | Divider                  | No          |
| Clear Formatting  | Eraser / Clear marks     | Optional    |
| Undo / Redo       | Undo / Redo arrows       | No          |

Additionally, support:
- **Placeholder** (e.g., “Write something...”).
- **Tables** (if the library includes table extension).

### Edge Cases & Validation
- **Empty content**: When `value` is `null` or empty, the editor should show the placeholder and store an empty JSON structure (e.g., `{ type: "doc", content: [] }`).
- **Large content**: No performance degradation with ~10k words; ensure the editor is not re‑initialised unnecessarily.
- **Duplicate instances**: Two editors on the same page must not interfere with each other (each has its own state, toolbar, and bubble menu).
- **Paste handling**: Pasted content should be sanitised to prevent XSS (the library may already do this, but ensure it’s enabled).
- **Mobile view**: Toolbar buttons should be tappable and the bubble menu should not overflow the viewport.
- **Form reset**: When the form resets (e.g., after submission), the editor content must reset accordingly via the `value` prop.
- **Lazy loading fallback**: The skeleton should have the same height as the editor to avoid layout shift.

## Tasks for the AI
1. **Provide installation commands** for `reactjs-tiptap-editor` and any peer dependencies (e.g., `@tiptap/react`, `@tiptap/starter-kit`, `lucide-react` for icons).
2. **Write the main editor component** (`RichTextEditor`) that:
   - Imports the necessary extensions and styles.
   - Configures the toolbar and bubble menu (follow the library’s API).
   - Uses `forwardRef` if needed.
   - Handles `value` and `onChange` correctly.
3. **Create a lazy wrapper** using `React.lazy` and `Suspense` to enable code splitting.
4. **Show how to use the editor inside a TanStack Form**:
   - Provide a snippet of the form field using `<RichTextEditor value={field.state.value} onChange={field.handleChange} />`.
5. **Add Tailwind CSS integration** (if needed) to style the editor’s content area (`.ProseMirror`).
6. **Write a brief example** of saving the editor’s JSON output to an API and re‑hydrating the editor from stored JSON.
7. **Include a note on accessibility** (ARIA labels, keyboard navigation).

## Expected Output Format
- Provide code blocks with explanations.
- Do not assume any specific file structure – the AI should describe where each piece of code could live (e.g., “in a `components/rich-text-editor` folder”).
- Use TypeScript interfaces for all component props.
- Ensure all imports are correct and use path aliases (like `@/components/ui/skeleton`) if applicable.

## Deliverables
A complete implementation guide that the developer can copy and paste into their existing TanStack Router + TanStack Form project, with minimal modifications.

---

**Now, generate the response with the exact code and instructions.**


---

# TASK: Build a synced dual-axis image gallery

Build a fully functional image gallery component

## Visual / behavioral spec

A horizontal two-column layout inside a bounded-height container:

- **LEFT column** = a narrow VERTICAL thumbnail rail used purely as an index.
  - Thumbnails are deliberately small/narrow (they're just an index).
  - Scrollable by: mouse wheel, click-drag (up/down), AND two chevron buttons.
  - The chevron Up / Down buttons sit ABOVE and BELOW the rail viewport (pushed "far outside"), never overlapping the images, so they don't distract.
  - The active thumbnail is highlighted (colored border + full opacity); inactive ones are dimmed.
- **RIGHT column** = a much WIDER main image viewer.
  - Scrollable HORIZONTALLY by: mouse wheel (vertical wheel remapped to horizontal) AND click-drag.
  - NO arrow/prev/next buttons here.
  - Below the main image, show the current position as `current/total`, e.g. `2/6`.
- Clicking a thumbnail (left img) moves the main viewer to that image.
- Scrolling/dragging the main viewer updates the active thumbnail AND scrolls the rail to keep it in view.
- The two scrollers stay perfectly in sync via a single source-of-truth index.
- when total images length is 3 and below. simply render all images in Y axis. when the total images length are more than 3, then implement above gallery system
- when we click on any right side of img, the big img preview should show the image big with overlay. so that we can just single view the image nicely without any distraction

## Tech & libraries (use exactly these)

- **embla-carousel-react** — the carousel engine (gives drag-to-scroll for free). This is the same engine shadcn/ui's Carousel is built on.
- **embla-carousel-wheel-gestures** — plugin enabling mouse-wheel scrolling and remapping wheel axis.
- **lucide-react** — for `ChevronUp` / `ChevronDown` icons.
- Tailwind v4 utility classes for all styling (no config file needed; v4 is CSS-first).

Install: `bun add -D embla-carousel-react embla-carousel-wheel-gestures lucide-react`
should we install with -D or omit it?

## Architecture (the key idea)

There are **two independent Embla carousels** that share **one piece of React state**: `selectedIndex`. That state is the single source of truth for "which image is active."

1. **Main carousel** — `axis: "x"`, with `WheelGesturesPlugin({ forceWheelAxis: "x" })` so a normal vertical scroll wheel moves it sideways. Drag is on by default.
2. **Thumbnail carousel** — `axis: "y"`, `dragFree: true`, `containScroll: "keepSnaps"`, with `WheelGesturesPlugin({ forceWheelAxis: "y" })`. Fixed-height viewport so only a few thumbnails show and the rest scroll.

Sync rules:

- Clicking a thumbnail → `mainApi.scrollTo(index)` (drives the main image; never the reverse).
- Main carousel `"select"` event → read `mainApi.selectedScrollSnap()`, set `selectedIndex`, then `thumbApi.scrollTo(index)` to bring the active thumb into view.
- Attach listeners only after the Embla API exists; also listen to `"reInit"` (handles resize); clean up with `.off()` on unmount.

## i am just pasting the gallery component for your inpiration. dont follow it blindly. if these reference code match our Requirements, then follow otherwise prioratize Requirements more

### `src/components/image-gallery.tsx`

```tsx
import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { ChevronUp, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { galleryImages } from "@/data/gallery"

export function ImageGallery() {
  // selectedIndex is the single source of truth for "which image is active".
  const [selectedIndex, setSelectedIndex] = useState(0)

  // MAIN carousel: horizontal. Vertical mouse-wheel is remapped to the x-axis
  // (forceWheelAxis: "x") so a normal scroll wheel moves it sideways. Dragging
  // is enabled by default in Embla.
  const [mainRef, mainApi] = useEmblaCarousel({ axis: "x", loop: false }, [
    WheelGesturesPlugin({ forceWheelAxis: "x" }),
  ])

  // THUMBNAIL rail: vertical index strip. It shows several slides at once
  // (height set via CSS), and the wheel naturally scrolls it on the y-axis.
  const [thumbRef, thumbApi] = useEmblaCarousel(
    { axis: "y", loop: false, dragFree: true, containScroll: "keepSnaps" },
    [WheelGesturesPlugin({ forceWheelAxis: "y" })],
  )

  // Clicking a thumbnail moves the main carousel to that image.
  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) return
      mainApi.scrollTo(index)
    },
    [mainApi],
  )

  // Whenever the main carousel settles on a new slide, update the active index
  // and bring the matching thumbnail into view in the vertical rail.
  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return
    const index = mainApi.selectedScrollSnap()
    setSelectedIndex(index)
    thumbApi.scrollTo(index)
  }, [mainApi, thumbApi])

  useEffect(() => {
    if (!mainApi) return
    onSelect()
    mainApi.on("select", onSelect)
    mainApi.on("reInit", onSelect)
    return () => {
      mainApi.off("select", onSelect)
      mainApi.off("reInit", onSelect)
    }
  }, [mainApi, onSelect])

  const total = galleryImages.length

  return (
    <div className="flex h-[clamp(20rem,60vh,32rem)] w-full max-w-6xl items-stretch gap-4 sm:gap-6">
      {/* LEFT: narrow vertical thumbnail index with arrows pushed far outside */}
      <div className="flex w-24 flex-col items-center gap-2 sm:w-28 md:w-32">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Scroll thumbnails up"
          onClick={() => thumbApi?.scrollPrev()}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <ChevronUp className="size-5" />
        </Button>

        {/* Embla viewport (fixed height -> only a few thumbnails visible) */}
        <div ref={thumbRef} className="w-full grow overflow-hidden">
          <div className="flex h-full flex-col">
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => onThumbClick(index)}
                aria-label={`Show image ${index + 1}: ${image.alt}`}
                aria-current={index === selectedIndex}
                className={cn(
                  "relative mb-3 aspect-[3/2] w-full shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all",
                  index === selectedIndex
                    ? "border-primary opacity-100"
                    : "border-transparent opacity-60 hover:opacity-90",
                )}
              >
                <img
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  className="size-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Scroll thumbnails down"
          onClick={() => thumbApi?.scrollNext()}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="size-5" />
        </Button>
      </div>

      {/* RIGHT: wide main viewer, horizontally scrollable, no arrow buttons */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div ref={mainRef} className="grow overflow-hidden rounded-2xl">
          <div className="flex h-full">
            {galleryImages.map((image) => (
              <div key={image.id} className="min-w-0 shrink-0 grow-0 basis-full">
                <div className="size-full overflow-hidden bg-muted">
                  <img
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    className="size-full object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Position indicator: current / total */}
        <p
          className="text-center text-sm font-medium tabular-nums text-muted-foreground"
          aria-live="polite"
        >
          {selectedIndex + 1}/{total}
        </p>
      </div>
    </div>
  )
}
```

## Important implementation rules / edge cases

- Set `draggable={false}` on every `<img>` so the browser's native image-drag doesn't fight Embla's drag gesture.
- Use `loop: false` so it doesn't wrap past the last image; `containScroll: "keepSnaps"` prevents dead-zone over-scroll at the ends.
- The whole gallery has a bounded height via `h-[clamp(20rem,60vh,32rem)]`; both columns stretch to fill it (`items-stretch`, `grow`). This is what keeps the proportions correct — the main image fills the height rather than blowing up the layout.
- Accessibility: thumbnails are real `<button>`s with `aria-label` and `aria-current`; the position indicator uses `aria-live="polite"` to announce changes.

## Acceptance criteria
1. Left rail scrolls via wheel, drag, and the two outside chevron buttons.
2. Right viewer scrolls horizontally via wheel and drag, with no arrow buttons.
3. Clicking a thumbnail (left side img) changes the main image; scrolling the main image updates + scrolls to the active thumbnail.
4. `current/total` indicator updates live and is correct at both ends.
5. Layout stays balanced (wide main image, narrow thumbnail index) and is responsive.
