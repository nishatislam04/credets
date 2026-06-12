import type { CredentialDetail, DataBlockEntry } from "@credets/shared-types/credentials/listings";
import { Quote, TextQuote } from "lucide-react";
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
			{/* ── Short description — hero / pull-quote ── */}
			{credential.short_description && (
				<section className="relative">
					{/* Decorative left accent bar */}
					<div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-primary/60 to-primary/10" />

					<div className="pl-8">
						{/* Small label */}
						<span className="inline-flex items-center gap-1.5 mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/50">
							<TextQuote className="size-3" />
							Summary
						</span>

						<h4 className="text-4xl font-semibold leading-[1.3] tracking-tight text-card-foreground/80 selection:bg-primary/15 whitespace-pre-wrap">
							{credential.short_description}
						</h4>
					</div>
				</section>
			)}

			{/* ── Long description — editorial / reading ── */}
			{credential.long_description && (
				<section className="relative">
					{/* Subtle top separator with plenty of space */}
					<div className="absolute left-8 right-0 top-0 h-px bg-gradient-to-r from-border/60 via-border/20 to-transparent" />

					<div className="pt-14 pb-4">
						{/* Decorative opening quote mark */}
						<div className="mb-4 select-none">
							<Quote className="size-8 text-primary/10 -ml-1" />
						</div>

						<p className="font-serif text-[1.35rem] leading-[1.75] tracking-[0.01em] text-muted-foreground/70 dark:text-muted-foreground/80 selection:bg-primary/10 whitespace-pre-wrap">
							{credential.long_description}
						</p>
					</div>
				</section>
			)}

			{/* ── Decorative section divider before gallery ── */}
			{(credential.short_description || credential.long_description) && (
				<div className="relative py-4">
					<div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />
				</div>
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
