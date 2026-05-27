import type { CredentialDetail } from "@credets/shared-types/credentials/listings";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Check, Clock, Copy, FileText, ImageIcon, Info, Pencil, Tag } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Separator } from "#/components/ui/separator";
import { Skeleton } from "#/components/ui/skeleton";
import { getCredential } from "./-actions/getCredential";
import { CredentialDataRenderer } from "./-components/credential-data";
import { ImageLightbox } from "./-components/image-lightbox";

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

// ── Helpers ─────────────────────────────────────────────────────────

function imageSrc(img: { image_data: string | null; format: string | null } | null) {
	if (!img?.image_data || !img?.format) return null;
	return `data:image/${img.format};base64,${img.image_data}`;
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function formatTimeAgo(iso: string) {
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	const months = Math.floor(days / 30);
	return `${months}mo ago`;
}

// ── Tag colour palette ──────────────────────────────────────────────

const TAG_COLORS = [
	{ bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
	{ bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
	{ bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
	{ bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300" },
	{ bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
	{ bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300" },
	{ bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
	{ bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300" },
];

// ── Type colour helper ──────────────────────────────────────────────
const TYPE_COLORS = [
	{
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-700 dark:text-blue-300",
		dot: "bg-blue-500",
	},
	{
		bg: "bg-amber-100 dark:bg-amber-900/30",
		text: "text-amber-700 dark:text-amber-300",
		dot: "bg-amber-500",
	},
	{
		bg: "bg-purple-100 dark:bg-purple-900/30",
		text: "text-purple-700 dark:text-purple-300",
		dot: "bg-purple-500",
	},
	{
		bg: "bg-rose-100 dark:bg-rose-900/30",
		text: "text-rose-700 dark:text-rose-300",
		dot: "bg-rose-500",
	},
	{
		bg: "bg-emerald-100 dark:bg-emerald-900/30",
		text: "text-emerald-700 dark:text-emerald-300",
		dot: "bg-emerald-500",
	},
	{
		bg: "bg-cyan-100 dark:bg-cyan-900/30",
		text: "text-cyan-700 dark:text-cyan-300",
		dot: "bg-cyan-500",
	},
	{
		bg: "bg-pink-100 dark:bg-pink-900/30",
		text: "text-pink-700 dark:text-pink-300",
		dot: "bg-pink-500",
	},
];

// Simple hash function to turn strings into numbers
const hashString = (str: string): number => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
};

// ── Component ───────────────────────────────────────────────────────

function RouteComponent() {
	const credential = useLoaderData({
		from: "/credentials/$credentialId/",
	}) as CredentialDetail;
	const [copiedId, setCopiedId] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const hasImages = Array.isArray(credential.images) && credential.images.length > 0;
	const thumbnail = credential.thumbnail_image_data
		? {
				image_data: credential.thumbnail_image_data,
				format: credential.thumbnail_format,
			}
		: null;
	const thumbnailUri = imageSrc(thumbnail);

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
			<div className="mx-auto w-full max-w-5xl px-4 py-10">
				{/* ── Back link + Edit button ── */}
				<div className="mb-8 flex items-center justify-between">
					<Link
						to="/credentials"
						className="group inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors"
					>
						<ArrowLeft className="size-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
						Back
					</Link>
					<Link
						to="/credentials/$credentialId/update"
						params={{ credentialId: credential.id }}
						className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3.5 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 shadow-sm transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-md active:scale-[0.97]"
					>
						<Pencil className="size-3" />
						Edit
					</Link>
				</div>

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
						<div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-muted/30 ring-1 ring-border/40 sm:size-28">
							<ImageIcon className="size-8 text-muted-foreground/30" />
						</div>
					)}

					{/* Title + badge + dates on the right */}
					<div className="flex-1 min-h-full">
						<div className="flex flex-wrap items-center gap-3 mb-2">
							<h1 className="text-4xl font-bold tracking-tight leading-tight break-words">
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
								<h4 className="text-2xl font-semibold leading-relaxed text-card-foreground/70">
									{credential.short_description}
								</h4>
							</section>
						)}

						{/* Long description — simple & natural */}
						{credential.long_description && (
							<section>
								<p className="text-lg leading-relaxed mt-4 text-gray-800">
									{credential.long_description}
								</p>
							</section>
						)}

						{/* Image gallery — only credential.images (not thumbnail) */}
						{hasImages && (
							<section className="mt-12">
								<div className="mb-3 flex items-center gap-2">
									<ImageIcon className="size-4.5" />
									<h2 className="text-lg font-semibold uppercase tracking-wider">Gallery</h2>
									<span className="text-[13px] text-muted-foreground/90">
										{credential.images.length} image
										{credential.images.length > 1 ? "s" : ""}
									</span>
								</div>

								<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
									{credential.images.map((img, i) => {
										const src = imageSrc(img);
										if (!src) return null;
										return (
											<button
												key={img.id}
												type="button"
												onClick={() => openLightbox(i)}
												className="group relative w-full overflow-hidden rounded-xl border bg-muted/20 ring-1 ring-border/40 transition-all duration-200 hover:ring-primary/30 hover:shadow-md cursor-pointer border-0 h-[200px]" // ← ADDED fixed height
											>
												<img
													src={src}
													alt={`gallery ${i + 1}`}
													className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" // ← CHANGED to h-full and object-cover
												/>
												<div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/[0.02]" />
											</button>
										);
									})}
								</div>
							</section>
						)}

						{/* Thumbnail standalone (when no gallery images) */}
						{!hasImages && thumbnailUri && (
							<section>
								<div className="mb-3 flex items-center gap-2">
									<ImageIcon className="size-4 text-muted-foreground/50" />
									<h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
										Thumbnail
									</h2>
								</div>
								<button
									type="button"
									onClick={() => openLightbox(0)}
									className="group relative max-h-72 w-full overflow-hidden rounded-xl border bg-muted/20 ring-1 ring-border/40 transition-all duration-200 hover:ring-primary/30 hover:shadow-md cursor-pointer border-0"
								>
									<img
										src={thumbnailUri}
										alt={credential.title}
										className="mx-auto max-h-72 w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
									/>
									<div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/[0.02]" />
								</button>
							</section>
						)}

						{/* Data section */}
						{credential.data && (
							<section>
								<CredentialDataRenderer typeValue={credential.type_value} data={credential.data} />
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

				<div className="text-center text-xs text-muted-foreground/30">
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
			{lightboxOpen && (
				<ImageLightbox
					images={
						hasImages
							? credential.images
							: thumbnail
								? [
										{
											id: "thumbnail",
											image_data: thumbnail.image_data,
											format: thumbnail.format,
											width: credential.thumbnail_width,
											height: credential.thumbnail_height,
											byte_size: null,
											sort_order: 0,
										},
									]
								: []
					}
					initialIndex={lightboxIndex}
					onClose={() => setLightboxOpen(false)}
				/>
			)}
		</>
	);
}
