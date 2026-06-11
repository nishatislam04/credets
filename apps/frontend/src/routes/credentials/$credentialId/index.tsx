import type { CredentialDetail, DataBlockEntry } from "@credets/shared-types/credentials/listings";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import {
	ArrowLeft,
	CalendarDays,
	Check,
	Clock,
	Copy,
	FileText,
	ImageIcon,
	Info,
	Tag,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Separator } from "#/components/ui/separator";
import { Skeleton } from "#/components/ui/skeleton";
import { hashString, TAG_COLORS, TYPE_COLORS } from "../-utils/colors";
import { getCredential } from "./-actions/getCredential";
import { CredentialDataRenderer } from "./-components/credential-data";
import { ImageLightbox } from "./-components/image-lightbox";
import { Gallery } from "./-ui/gallery";
import { TopHeader } from "./-ui/topHeader";
import { formatDate } from "./-utils/formatDate";
import { formatTimeAgo } from "./-utils/formatTImeAgo";

export const Route = createFileRoute("/credentials/$credentialId/")({
	component: RouteComponent,
	loader: async ({ params }) => getCredential(params.credentialId),
	pendingComponent: () => (
		<div className="mx-auto w-full max-w-5xl px-4 py-10">
			<Skeleton className="mb-8 h-6 w-24 rounded-lg" />
			{/* Title row */}
			<div className="mb-3 flex items-start gap-4">
				<Skeleton className="size-20 shrink-0 rounded-xl" />
				<div className="min-w-0 flex-1 space-y-2">
					<Skeleton className="h-9 w-3/4 rounded-lg" />
					<Skeleton className="h-5 w-48 rounded-lg" />
				</div>
			</div>
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<Skeleton className="h-40 w-full rounded-xl" />
					<Skeleton className="h-52 w-full rounded-xl" />
					<Skeleton className="h-48 w-full rounded-xl" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-32 w-full rounded-xl" />
					<Skeleton className="h-28 w-full rounded-xl" />
				</div>
			</div>
		</div>
	),
	errorComponent: ({ error }) => (
		<div className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
			<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10">
				<span className="text-2xl text-destructive">!</span>
			</div>
			<h2 className="mb-2 text-lg font-semibold">Failed to load credential</h2>
			<p className="mb-6 text-sm text-muted-foreground">
				{error?.message || "Something went wrong. Please try again later."}
			</p>
			<Link
				to="/credentials"
				className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
			>
				<ArrowLeft className="size-3.5" />
				Back to credentials
			</Link>
		</div>
	),
});

function RouteComponent() {
	const credential = useLoaderData({
		from: "/credentials/$credentialId/",
	}) as CredentialDetail;
	const [copiedId, setCopiedId] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const hasImages = Array.isArray(credential.images) && credential.images.length > 0;
	const thumbnailUri = credential.thumbnail_url;

	const typeValue = credential.type_value ?? "";
	const colorIndex = hashString(typeValue) % TYPE_COLORS.length;

	const typeColor = TYPE_COLORS[colorIndex];
	const tagList = Array.isArray(credential.tags) ? credential.tags : [];

	const openLightbox = (index: number) => {
		setLightboxIndex(index);
		setLightboxOpen(true);
	};

	return (
		<>
			<div className="mx-auto w-full max-w-6xl px-4 py-10">
				{/* ── Back link + Edit button ── */}

				<TopHeader credentialId={credential.id} />

				{/* ── Header row — thumbnail | title + badge + dates ── */}
				<div className="h-30 mb-10 flex items-start gap-5">
					{/* Thumbnail on the left */}
					{thumbnailUri ? (
						<button
							type="button"
							onClick={() => openLightbox(0)}
							className="group shrink-0 overflow-hidden rounded-xl ring-1 ring-border/40 transition-all duration-200 hover:ring-primary/30 hover:shadow-md cursor-pointer border-0"
						>
							<img
								src={thumbnailUri}
								alt={credential.title}
								className="size-24 object-cover transition-transform duration-300 sm:size-28"
							/>
						</button>
					) : (
						<div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-muted/60 ring-1 ring-border/60 sm:size-28">
							<ImageIcon className="size-8 text-muted-foreground/40" />
						</div>
					)}

					{/* Title + badge + dates on the right */}
					<div className="flex-1 min-h-full">
						<div className="flex flex-wrap items-center gap-3 mb-2">
							<h1 className="text-4xl font-bold tracking-tight leading-tight wrap-break-words">
								{credential.title}
							</h1>
							{credential.type_label && (
								<Badge
									variant="outline"
									className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border-0 ${typeColor.bg} ${typeColor.text}`}
								>
									<span className={`inline-block size-2 rounded-full ${typeColor.dot}`} />
									{credential.type_label}
								</Badge>
							)}
						</div>

						{/* Date row */}
						<div className="flex items-start gap-4 text-xs text-muted-foreground/60 mt-4 pb-4">
							<div className="flex items-center gap-1.5">
								<CalendarDays className="size-3.5" />
								<span>Created {formatDate(credential.created_at)}</span>
								<span className="text-muted-foreground/30">(</span>
								<Clock className="size-3" />
								<span>{formatTimeAgo(credential.created_at)}</span>
								<span className="text-muted-foreground/30">)</span>
							</div>
							{credential.updated_at && credential.updated_at !== credential.created_at && (
								<div className="flex items-center gap-1.5">
									<span className="text-muted-foreground/20">·</span>
									<span>Updated {formatTimeAgo(credential.updated_at)}</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<Separator className="my-12" />

				{/* ── Two-column layout ── */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					{/* ── Left column (2/3) — description, gallery, data ── */}
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

					{/* ── Right column (1/3) — sidebar ── */}
					<div className="space-y-12 mt-12 xl:mt-0">
						{/* ID reference — first */}
						<section>
							<div className="mb-2.5 flex items-center gap-2">
								<Info className="size-4.5" />
								<h2 className="text-base font-semibold uppercase tracking-wider">ID</h2>
							</div>
							<div
								className="flex cursor-pointer items-center gap-2 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-blue-50/50"
								onClick={() => {
									navigator.clipboard.writeText(credential.id).then(() => {
										setCopiedId(true);
										setTimeout(() => setCopiedId(false), 1500);
									});
								}}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										navigator.clipboard.writeText(credential.id).then(() => {
											setCopiedId(true);
											setTimeout(() => setCopiedId(false), 1500);
										});
									}
								}}
							>
								<code className="flex-1 text-[12px] font-mono text-muted-foreground/60 break-all select-all">
									{credential.id}
								</code>
								{copiedId ? (
									<Check className="size-3.5 shrink-0 text-emerald-500" />
								) : (
									<Copy className="size-3.5 shrink-0 text-muted-foreground/30" />
								)}
							</div>
						</section>

						{/* Notes — second */}
						{credential.notes && (
							<section className="mt-4">
								<div className="mb-2.5 flex items-center gap-2">
									<FileText className="size-4.5" />
									<h2 className="text-base font-semibold uppercase tracking-wider">Notes</h2>
								</div>
								<div className="rounded-xl border bg-card px-4 py-3">
									<p className="text-sm leading-relaxed text-card-foreground/80 whitespace-pre-wrap">
										{credential.notes}
									</p>
								</div>
							</section>
						)}

						{/* Tags — last, colorful badges */}
						{tagList.length > 0 && (
							<section className="mt-4">
								<div className="mb-2.5 flex items-center gap-2">
									<Tag className="size-4.5" />
									<h2 className="text-base font-semibold uppercase tracking-wider">Tags</h2>
								</div>
								<div className="flex flex-wrap gap-1.5">
									{tagList.map((tag: string) => {
										const color = TAG_COLORS[tag.length % TAG_COLORS.length];
										return (
											<Badge
												key={tag}
												className={`rounded-full text-[10px] font-medium border-0 ${color.bg} ${color.text}`}
											>
												{tag}
											</Badge>
										);
									})}
								</div>
							</section>
						)}
					</div>
				</div>

				{/* ── Footer separator ── */}
				<Separator className="my-12" />

				<div className="text-center text-sm text-muted-foreground/50">
					Created {formatDate(credential.created_at)}
					{credential.updated_at && credential.updated_at !== credential.created_at && (
						<>
							<span className="mx-1">·</span>
							Updated {formatDate(credential.updated_at)}
						</>
					)}
				</div>
			</div>

			{/* ── Lightbox overlay ── */}
			{lightboxOpen && hasImages && (
				<ImageLightbox
					images={credential.images}
					initialIndex={lightboxIndex}
					onClose={() => setLightboxOpen(false)}
				/>
			)}
		</>
	);
}
