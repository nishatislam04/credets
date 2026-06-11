import type { CredentialDetail } from "@credets/shared-types/credentials/listings";
import { ImageIcon } from "lucide-react";

function imageSrc(img: { image_url?: string | null } | null) {
	return img?.image_url ?? null;
}

export function Gallery({
	hasImages,
	credential,
	openLightbox,
}: {
	hasImages: boolean;
	credential: CredentialDetail;
	openLightbox: (index: number) => void;
}) {
	if (!hasImages) return null;

	return (
		<section className="mt-12">
			<div className="mb-3 flex items-center gap-2">
				<ImageIcon className="size-4.5" />
				<h2 className="text-lg font-semibold uppercase tracking-wider">Gallery</h2>
				<span className="text-[13px] text-muted-foreground/90">
					{credential.images.length} image{credential.images.length !== 1 ? "s" : ""}
				</span>
			</div>

			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
				{credential.images.map((img: any, i: number) => {
					const src = imageSrc(img);
					if (!src) return null;
					return (
						<button
							key={img.id}
							type="button"
							onClick={() => openLightbox(i)}
							className="group relative w-full overflow-hidden rounded-xl bg-muted/20 ring-1 ring-border/40 transition-all duration-200 hover:ring-primary/30 hover:shadow-md cursor-pointer border-0 h-50"
						>
							<img
								src={src}
								alt={`gallery ${i + 1}`}
								className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							/>
							<div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/2" />
						</button>
					);
				})}
			</div>
		</section>
	);
}
