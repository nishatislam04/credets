# CredetsImage — Custom Image Component

A custom image component powered by [Unpic](https://unpic.pics/) that uses the **Supabase Storage provider** to automatically generate responsive srcsets and optimize images via Supabase's built‑in image transformation API.

---

## Quick Start

```tsx
import { CredetsImage } from "#/components/ui/image";

<CredetsImage
  src="https://[project].supabase.co/storage/v1/object/public/credentials/abc/thumbnail.webp"
  alt="My credential thumbnail"
  width={400}
  height={300}
/>
```

---

## Props

| Prop            | Type                                      | Default          | Description |
|-----------------|-------------------------------------------|------------------|-------------|
| `src`           | `string`                                  | — (required)     | Image URL. Supports Supabase Storage URLs, MinIO URLs, and blob: URLs. |
| `alt`           | `string`                                  | — (required)     | Alt text for accessibility. |
| `width`         | `number`                                  | —                | Intrinsic width in pixels. Required for `constrained` and `fixed` layouts. |
| `height`        | `number`                                  | —                | Intrinsic height in pixels. Required for `constrained` and `fixed` layouts. |
| `layout`        | `"constrained"` \| `"fullWidth"` \| `"fixed"` | `"constrained"` | Controls how the image resizes (see [Layouts](#layouts)). |
| `loading`       | `"lazy"` \| `"eager"`                    | `"lazy"`         | `"lazy"` defers loading (below‑the‑fold); `"eager"` loads immediately (hero images). |
| `unoptimized`   | `boolean`                                 | `false`          | Skip Supabase transformation and render a plain `<img>`. Use for `blob:` URLs. |
| `className`     | `string`                                  | —                | Tailwind / CSS classes passed to the underlying element. |
| `style`         | `CSSProperties`                           | —                | Inline styles. |
| `transformer`   | —                                         | Supabase          | Always uses the Supabase provider. No need to configure. |
| All other `<img>` attributes | —                               | —                | Forwarded to the underlying `<img>` element. |

---

## Layouts

### `constrained` (default)
The image renders at a maximum of `width` × `height` but scales down on smaller containers.

```tsx
<CredetsImage
  src="..."
  alt="Thumbnail"
  width={400}
  height={300}
  layout="constrained"
/>
```

### `fullWidth`
Stretches to 100% of the container width. Use for hero banners, full‑width gallery images, or overlays.

```tsx
<CredetsImage
  src="..."
  alt="Gallery image"
  layout="fullWidth"
  className="w-full h-64 object-cover"
/>
```

### `fixed`
Renders at the exact pixel dimensions. Does not scale.

```tsx
<CredetsImage
  src="..."
  alt="Avatar"
  width={48}
  height={48}
  layout="fixed"
  className="rounded-full"
/>
```

---

## Loading Strategies

- **`"lazy"`** (default) — defers loading until the image is near the viewport. Best for below‑the‑fold images such as gallery thumbnails and listings cards.
- **`"eager"`** — loads immediately. Use for above‑the‑fold / hero images, or any image that is critical to the initial paint.

```tsx
// Above the fold — load immediately
<CredetsImage src="..." alt="Header" loading="eager" />

// Below the fold — lazy load (default)
<CredetsImage src="..." alt="Gallery" />
```

---

## Unoptimized Mode (Local / Blob URLs)

For `blob:` URLs created via `URL.createObjectURL()` (e.g. local file previews in forms), pass `unoptimized` to render a plain `<img>` tag. This avoids errors from the Supabase transformer, which cannot process blob URLs.

```tsx
<CredetsImage
  src={URL.createObjectURL(file)}
  alt="File preview"
  unoptimized
  className="rounded-lg"
/>
```

**Note:** The component automatically detects `blob:` URLs and renders a plain `<img>` — you don't strictly need to pass `unoptimized` for blob URLs, but it's good practice to be explicit.

---

## How It Works

1. **Unpic auto‑detection** — When a Supabase Storage URL is passed, Unpic recognizes the CDN and uses the Supabase provider to generate responsive srcsets.
2. **On‑the‑fly optimization** — Supabase's image transformation API (powered by imgix) resizes and optimizes images at request time based on the `width`, `height`, and `quality` parameters.
3. **Fallback** — For URLs that are not recognized as Supabase (e.g. MinIO for local development), the component renders the image as-is without transformation.
4. **Blob URLs** — Automatically detected and rendered as plain `<img>` tags to avoid transformer errors.

---

## Backend

Images are processed server‑side using Bun's built‑in Image API and converted to WebP format before uploading to Supabase Storage:

| Image type   | Quality | Max width | Format |
|-------------|---------|-----------|--------|
| Thumbnail   | 80      | 800px     | WebP   |
| Gallery     | 88      | 1400px    | WebP   |

These quality settings are higher than before because Supabase Storage provides its own CDN with on‑demand optimization, so storing higher‑quality originals is safe.
