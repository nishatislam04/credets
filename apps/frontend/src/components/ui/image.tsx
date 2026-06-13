"use client";

import { Image as UnpicImage } from "@unpic/react/base";
import { transform } from "unpic/providers/supabase";
import type { ImgHTMLAttributes } from "react";

// ── Types ───────────────────────────────────────────────────────────

export interface CredetsImageProps {
	src: string;
	alt: string;
	/**
	 * Disable the unpic transformer and render a plain <img> tag.
	 *
	 * Use this for local blob: URLs (e.g. `URL.createObjectURL()`) or
	 * any URL that should not go through the Supabase image transformation.
	 *
	 * @default false
	 */
	unoptimized?: boolean;
	/**
	 * Image loading strategy.
	 *
	 * - `"lazy"`  — deferred loading (default, best for below‑the‑fold images)
	 * - `"eager"` — load immediately (use for above‑the‑fold / hero images)
	 *
	 * @default "lazy"
	 */
	loading?: "lazy" | "eager";
	/**
	 * The resizing behaviour of the image.
	 *
	 * - `constrained` (default): max width/height, scales down on smaller screens
	 * - `fullWidth`: stretches to 100% of container width
	 * - `fixed`: exact pixel dimensions, does not scale
	 */
	layout?: "constrained" | "fullWidth" | "fixed";
	/** Intrinsic width in pixels. Required for `constrained` and `fixed` layouts. */
	width?: number;
	/** Intrinsic height in pixels. Required for `constrained` and `fixed` layouts. */
	height?: number;
	className?: string;
	style?: React.CSSProperties;
	/** Sizes attribute for responsive image selection */
	sizes?: string;
	/** @deprecated Use `loading` instead — image decoding hint is set automatically */
	decoding?: "async" | "sync" | "auto";
}

// ── Component ───────────────────────────────────────────────────────

/**
 * **CredetsImage** — a custom image component powered by Unpic.
 *
 * Uses the **Supabase Storage provider** to automatically generate responsive
 * srcsets and optimize images on the fly via Supabase's built‑in image
 * transformation API (imgix).
 *
 * ---
 *
 * ## Basic usage
 *
 * ```tsx
 * import { CredetsImage } from "#/components/ui/image";
 *
 * <CredetsImage
 *   src="https://[project].supabase.co/storage/v1/object/public/credentials/abc/thumbnail.webp"
 *   alt="My credential thumbnail"
 *   width={400}
 *   height={300}
 * />
 * ```
 *
 * ## Layouts
 *
 * - **`constrained`** (default) — image renders at a maximum of `width` × `height`
 *   but scales down on smaller screens. Best for thumbnails, cards, galleries.
 * - **`fullWidth`** — stretches to 100% of the container width. Best for hero
 *   banners or full‑width images.
 * - **`fixed`** — renders at the exact pixel dimensions. Does not scale.
 *
 * ## Unoptimized mode (local / blob URLs)
 *
 * Pass `unoptimized` for local `blob:` URLs (file previews in forms):
 *
 * ```tsx
 * <CredetsImage
 *   src={URL.createObjectURL(file)}
 *   alt="Preview"
 *   unoptimized
 *   className="rounded-lg"
 * />
 * ```
 *
 * ## Lazy vs eager loading
 *
 * ```tsx
 * // Above the fold — load immediately
 * <CredetsImage src="..." alt="Header" loading="eager" />
 *
 * // Below the fold — lazy (default)
 * <CredetsImage src="..." alt="Gallery" />
 * ```
 */
export function CredetsImage({
	src,
	alt,
	unoptimized = false,
	layout = "constrained",
	loading = "lazy",
	...rest
}: CredetsImageProps) {
	// ── Blob / unoptimized URLs ─────────────────────────────────────
	// Render a plain <img> for blob: URLs and when the caller explicitly
	// opts out of the unpic transformer. These URLs cannot be transformed
	// by Supabase and attempting to do so would cause an error.
	const isBlobUrl = typeof src === "string" && src.startsWith("blob:");

	if (unoptimized || isBlobUrl) {
		return (
			<img
				src={src}
				alt={alt}
				loading={loading}
				decoding="async"
				{...(rest as ImgHTMLAttributes<HTMLImageElement>)}
			/>
		);
	}

	return (
		<UnpicImage
			src={src}
			alt={alt}
			transformer={transform}
			layout={layout}
			loading={loading}
			{...(rest as any)}
		/>
	);
}
