import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { CredentialImage } from "@credets/shared-types/credentials/listings";

interface ImageLightboxProps {
	images: CredentialImage[];
	initialIndex: number;
	onClose: () => void;
}

function buildSrc(img: CredentialImage) {
	return img.image_data && img.format
		? `data:image/${img.format};base64,${img.image_data}`
		: null;
}

export function ImageLightbox({
	images,
	initialIndex,
	onClose,
}: ImageLightboxProps) {
	const [index, setIndex] = useState(initialIndex);
	const current = images[index]!;
	const src = buildSrc(current);

	const goNext = useCallback(() => {
		setIndex((i) => Math.min(i + 1, images.length - 1));
	}, [images.length]);

	const goPrev = useCallback(() => {
		setIndex((i) => Math.max(i - 1, 0));
	}, []);

	// Keyboard navigation
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "ArrowRight") {
				goNext();
			} else if (e.key === "ArrowLeft") {
				goPrev();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onClose, goNext, goPrev]);

	// Lock body scroll while open
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "";
		};
	}, []);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			role="dialog"
			aria-modal="true"
			aria-label="Image preview"
		>
			{/* Close button */}
			<button
				type="button"
				onClick={onClose}
				className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-colors cursor-pointer border-0"
				aria-label="Close"
			>
				<X className="size-5" />
			</button>

			{/* Previous */}
			{index > 0 && (
				<button
					type="button"
					onClick={goPrev}
					className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex size-12 items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-colors cursor-pointer border-0"
					aria-label="Previous image"
				>
					<ChevronLeft className="size-6" />
				</button>
			)}

			{/* Image */}
			<div className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center">
				{src ? (
					<img
						src={src}
						alt={`Image ${index + 1} of ${images.length}`}
						className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
					/>
				) : (
					<div className="flex size-48 items-center justify-center rounded-lg bg-muted text-muted-foreground/40">
						No image data
					</div>
				)}

				{/* Counter */}
				{images.length > 1 && (
					<div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80">
						{index + 1} / {images.length}
					</div>
				)}
			</div>

			{/* Next */}
			{index < images.length - 1 && (
				<button
					type="button"
					onClick={goNext}
					className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex size-12 items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-colors cursor-pointer border-0"
					aria-label="Next image"
				>
					<ChevronRight className="size-6" />
				</button>
			)}
		</div>
	);
}
