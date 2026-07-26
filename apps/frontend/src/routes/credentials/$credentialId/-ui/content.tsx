import type {
	CredentialDetail,
	DataBlockEntry,
} from "@credets/shared-types/credentials/listings";
import { Quote, TextQuote } from "lucide-react";
import {
	isContentEmpty,
	RichTextRenderer,
} from "#/components/ui/rich-text-renderer";
import { CredentialDataRenderer } from "../-components/credential-data";

export function Content({ credential }: { credential: CredentialDetail }) {
	return (
		<div className="space-y-8 lg:col-span-2 lg:border-r lg:border-border/30 lg:pr-8">
			{/* ── Short description — hero / pull-quote ── */}
			{!isContentEmpty(credential.short_description) && (
				<section className="relative">
					{/* Decorative left accent bar */}
					<div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-primary/60 to-primary/10" />

					<div className="pl-8">
						{/* Small label */}
						<span className="inline-flex items-center gap-1.5 mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/50">
							<TextQuote className="size-3" />
							Summary
						</span>

						{/*<h4 className="text-4xl font-semibold leading-[1.3] tracking-tight text-card-foreground/80 selection:bg-primary/15 whitespace-pre-wrap">
							{credential.short_description}
						</h4>*/}
						<RichTextRenderer
							content={credential.short_description}
							className="font-serif text-[1.35rem] leading-[1.75] tracking-[0.01em] text-muted-foreground/70 dark:text-muted-foreground/80 selection:bg-primary/10"
						/>
					</div>
				</section>
			)}

			{/* ── Long description — editorial / reading ── */}
			{!isContentEmpty(credential.long_description) && (
				<section className="relative">
					{/* Subtle top separator with plenty of space */}
					<div className="absolute left-8 right-0 top-0 h-px bg-gradient-to-r from-border/60 via-border/20 to-transparent" />

					<div className="pt-14 pb-4">
						{/* Decorative opening quote mark */}
						<div className="mb-4 select-none">
							<Quote className="size-8 text-primary/10 -ml-1" />
						</div>

						<RichTextRenderer
							content={credential.long_description}
							className="font-serif text-[1.35rem] leading-[1.75] tracking-[0.01em] text-muted-foreground/70 dark:text-muted-foreground/80 selection:bg-primary/10"
						/>
					</div>
				</section>
			)}

			{/* Subtle divider before data section */}
			{(!isContentEmpty(credential.short_description) ||
				!isContentEmpty(credential.long_description)) &&
				credential.data && (
					<div className="relative py-2">
						<div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-border/20 via-border/30 to-transparent" />
					</div>
				)}

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
