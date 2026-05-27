import { useEffect } from "react";
import { X } from "lucide-react";

interface ImagePreviewOverlayProps {
	src: string;
	onClose: () => void;
	alt?: string;
}

export function ImagePreviewOverlay({
	src,
	onClose,
	alt = "preview",
}: ImagePreviewOverlayProps) {
	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onClose]);

	// Lock body scroll
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

			{/* Image */}
			<div className="relative flex h-screen w-screen items-center justify-center p-4">
				<img
					src={src}
					alt={alt}
					className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
				/>
			</div>
		</div>
	);
}
