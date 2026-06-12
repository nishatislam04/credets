import type { CredentialDetail, DataBlockEntry } from "@credets/shared-types/credentials/listings";
import { CredentialDataRenderer } from "../-components/credential-data";
import { Gallery } from "./gallery";

export function Content({
	credential,
	hasImages,
	openLightbox,
}: {
	credential: CredentialDetail;
	hasImages: boolean;
	openLightbox: (index: number) => void;
}) {
	return (
		<div className="space-y-8 lg:col-span-2">
			{/* Short description — simple & natural */}
			{credential.short_description && (
				<section>
					<h4 className="text-3xl font-semibold font-sans leading-relaxed text-card-foreground/70">
						{credential.short_description}
					</h4>
				</section>
			)}

			{/* Long description — simple & natural */}
			{credential.long_description && (
				<section>
					<p className="text-xl leading-relaxed mt-20 text-gray-600/90 italic">
						{credential.long_description}
					</p>
				</section>
			)}

			{/* Image gallery — only credential.images (not thumbnail) */}
			<Gallery hasImages={hasImages} credential={credential} openLightbox={openLightbox} />

			{/* Data section */}
			{credential.data && (
				<section>
					<CredentialDataRenderer
						typeValue={credential.type_value}
						data={credential.data as DataBlockEntry[]}
					/>
				</section>
			)}
		</div>
	);
}
