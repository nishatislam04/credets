import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ChevronUp, ChevronDown, ImageIcon } from "lucide-react";
import type { CredentialImage } from "@credets/shared-types/credentials/listings";
import { CredetsImage } from "#/components/ui/image";
import { cn } from "#/lib/utils";

// ── Props ───────────────────────────────────────────────────────────

interface ImageGalleryProps {
	images: CredentialImage[];
	/** Called when the user clicks the main viewer image */
	onImageClick: (index: number) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────

function imageSrc(img: CredentialImage | null): string | null {
	return img?.image_url ?? null;
}

// ── Simple stack (≤3 images) ────────────────────────────────────────

function SimpleStack({
	images,
	onImageClick,
}: {
	images: CredentialImage[];
	onImageClick: (index: number) => void;
}) {
	return (
		<section className="mt-12">
			<div className="mb-3 flex items-center gap-2">
				<ImageIcon className="size-4.5" />
				<h2 className="text-lg font-semibold uppercase tracking-wider">
					Gallery
				</h2>
				<span className="text-[13px] text-muted-foreground/90">
					{images.length} image{images.length !== 1 ? "s" : ""}
				</span>
			</div>
			<div className="flex flex-col gap-5">
				{images.map((img, i) => {
					const src = imageSrc(img);
					if (!src) return null;
					return (
						<button
							key={img.id}
							type="button"
							onClick={() => onImageClick(i)}
							className="group relative w-full overflow-hidden rounded-xl bg-muted/20 ring-1 ring-border/40 transition-all duration-200 hover:ring-primary/30 hover:shadow-md cursor-pointer border-0 aspect-[3/2] max-h-[500px]"
						>
							<CredetsImage
								src={src}
								alt={`Gallery image ${i + 1}`}
								layout="fullWidth"
								className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
								draggable={false}
							/>
							<div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/2" />
						</button>
					);
				})}
			</div>
		</section>
	);
}

// ── Carousel gallery (>3 images) ────────────────────────────────────

function CarouselGallery({
	images,
	onImageClick,
}: {
	images: CredentialImage[];
	onImageClick: (index: number) => void;
}) {
	// Single source of truth for "which image is active"
	const [selectedIndex, setSelectedIndex] = useState(0);
	// ── MAIN carousel: horizontal, wheel remapped to x-axis ────────
	const [mainRef, mainApi] = useEmblaCarousel({ axis: "x", loop: false }, [
		WheelGesturesPlugin({ forceWheelAxis: "x" }),
	]);

	// ── Thumbnail scroll container ref ────────────────────────────
	const thumbScrollRef = useRef<HTMLDivElement>(null);

	// Clicking a thumbnail moves the main carousel to that image.
	const onThumbClick = useCallback(
		(index: number) => {
			if (!mainApi) return;
			mainApi.scrollTo(index);
		},
		[mainApi],
	);

	// Whenever selectedIndex changes, scroll the active thumbnail into view
	useEffect(() => {
		const container = thumbScrollRef.current;
		if (!container) return;
		const thumb = container.children[selectedIndex] as HTMLElement | undefined;
		thumb?.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}, [selectedIndex]);

	// Whenever the main carousel settles on a new slide, update the active index.
	const onSelect = useCallback(() => {
		if (!mainApi) return;
		const index = mainApi.selectedScrollSnap();
		setSelectedIndex(index);
	}, [mainApi]);

	// Attach Embla event listeners to main carousel only
	useEffect(() => {
		if (!mainApi) return;
		onSelect();
		mainApi.on("select", onSelect);
		mainApi.on("reInit", onSelect);
		return () => {
			mainApi.off("select", onSelect);
			mainApi.off("reInit", onSelect);
		};
	}, [mainApi, onSelect]);

	const total = images.length;

	return (
		<section className="mt-12">
			<div className="mb-3 flex items-center gap-2">
				<ImageIcon className="size-4.5" />
				<h2 className="text-lg font-semibold uppercase tracking-wider">
					Gallery
				</h2>
				<span className="text-[13px] text-muted-foreground/90">
					{total} image{total !== 1 ? "s" : ""}
				</span>
			</div>

			<div className="flex h-[clamp(20rem,60vh,32rem)] w-full items-stretch gap-4 sm:gap-6">
				{/* ── LEFT: narrow vertical thumbnail index ───────────── */}
				<div className="flex w-20 flex-col items-center gap-2 sm:w-24">
					{/* Chevron UP — navigate to previous image */}
					<button
						type="button"
						onClick={() => mainApi?.scrollPrev()}
						disabled={selectedIndex === 0}
						className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
						aria-label="Previous image"
					>
						<ChevronUp className="size-5" />
					</button>{" "}
					{/* Scrollable thumbnail container */}
					<div
						ref={thumbScrollRef}
						className="w-full grow overflow-y-auto overscroll-contain scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
					>
						{images.map((img, index) => {
							const src = imageSrc(img);
							if (!src) return null;
							return (
								<button
									key={img.id}
									type="button"
									onClick={() => onThumbClick(index)}
									aria-label={`Show image ${index + 1}`}
									aria-current={index === selectedIndex}
									className={cn(
										"relative mb-3 aspect-[3/2] w-full shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
										index === selectedIndex
											? "border-primary opacity-100"
											: "border-transparent opacity-60 hover:opacity-90",
									)}
								>
									<CredetsImage
										src={src}
										alt=""
										layout="fullWidth"
										className="size-full object-cover"
										draggable={false}
									/>
								</button>
							);
						})}
					</div>
					{/* Chevron DOWN — navigate to next image */}
					<button
						type="button"
						onClick={() => mainApi?.scrollNext()}
						disabled={selectedIndex === total - 1}
						className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
						aria-label="Next image"
					>
						<ChevronDown className="size-5" />
					</button>
				</div>

				{/* ── RIGHT: wide main viewer, horizontally scrollable ─── */}
				<div className="flex min-w-0 flex-1 flex-col gap-3">
					<div ref={mainRef} className="grow overflow-hidden rounded-2xl">
						<div className="flex h-full">
							{images.map((img, index) => {
								const src = imageSrc(img);
								return (
									<div
										key={img.id}
										className="min-w-0 shrink-0 grow-0 basis-full"
									>
										<button
											type="button"
											onClick={() => onImageClick(index)}
											className="size-full cursor-pointer overflow-hidden border-0 bg-muted p-0"
											aria-label="View image fullscreen"
										>
											{src ? (
												<CredetsImage
													src={src}
													alt={`Gallery image`}
													layout="fullWidth"
													className="size-full object-cover"
													draggable={false}
												/>
											) : (
												<div className="flex size-full items-center justify-center text-muted-foreground/40">
													No image data
												</div>
											)}
										</button>
									</div>
								);
							})}
						</div>
					</div>

					{/* Position indicator */}
					<p
						className="text-center text-sm font-medium tabular-nums text-muted-foreground"
						aria-live="polite"
					>
						{selectedIndex + 1}/{total}
					</p>
				</div>
			</div>
		</section>
	);
}

// ── Main exported component ─────────────────────────────────────────

/**
 * ImageGallery — synced dual-axis image gallery.
 *
 * When the image count is **3 or fewer**, images are rendered in a simple
 * vertical stack. When there are **more than 3**, a dual-axis Embla carousel
 * is used: a narrow vertical thumbnail rail on the left syncs with a wide
 * horizontal main viewer on the right.
 *
 * Clicking the main viewer image triggers `onImageClick` with the current
 * index so the parent can open a full‑screen preview overlay.
 */
export function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
	if (!images || images.length === 0) return null;

	const validImages = images.filter((img) => img.image_url);

	if (validImages.length <= 3) {
		return <SimpleStack images={validImages} onImageClick={onImageClick} />;
	}

	return <CarouselGallery images={validImages} onImageClick={onImageClick} />;
}
