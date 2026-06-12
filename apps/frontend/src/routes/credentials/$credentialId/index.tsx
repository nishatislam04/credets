import type { CredentialDetail } from "@credets/shared-types/credentials/listings";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Separator } from "#/components/ui/separator";
import { Skeleton } from "#/components/ui/skeleton";
import { ImagePreviewOverlay } from "#/routes/credentials/-components/image-preview-overlay";
import { TAG_COLORS } from "../-utils/colors";
import { getCredential } from "./-actions/getCredential";
import { ImageLightbox } from "./-components/image-lightbox";
import { Content } from "./-ui/content";
import { Footer } from "./-ui/footer";
import { Header } from "./-ui/header";
import { Sidebar } from "./-ui/sidebar";
import { TopHeader } from "./-ui/topHeader";	export const Route = createFileRoute("/credentials/$credentialId/")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const credential = await getCredential(params.credentialId);
		// Add cache-busting version to thumbnail URL so the browser
		// re-fetches the image when the credential is updated (the S3 key
		// is deterministic so the URL never changes between updates).
		if (credential.thumbnail_url && credential.updated_at) {
			credential.thumbnail_url = `${credential.thumbnail_url}?v=${Date.parse(credential.updated_at)}`;
		}
		return credential;
	},
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
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [thumbnailPreviewOpen, setThumbnailPreviewOpen] = useState(false);

	const hasImages = Array.isArray(credential.images) && credential.images.length > 0;
	const thumbnailUri = credential.thumbnail_url;

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
				<Header
					thumbnailUri={thumbnailUri}
					onThumbnailClick={() => setThumbnailPreviewOpen(true)}
					credential={credential}
				/>

				<Separator className="my-12" />

				{/* ── Two-column layout ── */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					{/* ── Left column (2/3) — description, gallery, data ── */}
					<Content credential={credential} hasImages={hasImages} openLightbox={openLightbox} />

					{/* ── Right column (1/3) — sidebar ── */}
					<Sidebar credential={credential} />
				</div>

				{/* ── Footer separator ── */}

				<Footer credential={credential} />
			</div>

			{/* ── Thumbnail preview overlay — single image, no slideshow ── */}
			{thumbnailPreviewOpen && thumbnailUri && (
				<ImagePreviewOverlay
					src={thumbnailUri}
					onClose={() => setThumbnailPreviewOpen(false)}
					alt={credential.title}
				/>
			)}

			{/* ── Image gallery slideshow overlay — for gallery images only ── */}
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
