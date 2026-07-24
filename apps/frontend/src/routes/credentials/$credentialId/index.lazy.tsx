import type { CredentialDetail } from "@credets/shared-types/credentials/listings";
import { createLazyFileRoute, useLoaderData } from "@tanstack/react-router";
import { useState } from "react";
import { Separator } from "#/components/ui/separator";
import { ImagePreviewOverlay } from "#/routes/credentials/-components/image-preview-overlay";
import { CredentialsShell } from "#/routes/credentials/-components/credentials-shell";
import { ImageGallery } from "./-components/ImageGallery";
import { Content } from "./-ui/content";
import { Footer } from "./-ui/footer";
import { Header } from "./-ui/header";
import { Sidebar } from "./-ui/sidebar";
import { TopHeader } from "./-ui/topHeader";

export const Route = createLazyFileRoute("/credentials/$credentialId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const credential = useLoaderData({
		from: "/credentials/$credentialId/",
	}) as CredentialDetail;
	const [galleryPreviewOpen, setGalleryPreviewOpen] = useState(false);
	const [galleryPreviewIndex, setGalleryPreviewIndex] = useState(0);
	const [thumbnailPreviewOpen, setThumbnailPreviewOpen] = useState(false);

	const hasImages =
		Array.isArray(credential.images) && credential.images.length > 0;
	const thumbnailUri = credential.thumbnail_url;

	const openGalleryPreview = (index: number) => {
		setGalleryPreviewIndex(index);
		setGalleryPreviewOpen(true);
	};

	return (
		<CredentialsShell>
			<div className="mx-auto w-full max-w-6xl px-4 py-10">
				<TopHeader credentialId={credential.id} />

				<Header
					thumbnailUri={thumbnailUri}
					onThumbnailClick={() => setThumbnailPreviewOpen(true)}
					credential={credential}
				/>

				<Separator className="my-12" />

				{/* ── Descriptions + data (2/3) with sidebar (1/3) ── */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<Content credential={credential} />
					<Sidebar credential={credential} />
				</div>

				{/* ── Gallery — full width below the grid, so it can breathe ── */}
				{hasImages && (
					<ImageGallery
						images={credential.images}
						onImageClick={openGalleryPreview}
					/>
				)}

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

			{/* ── Gallery image preview overlay — single image fullscreen ── */}
			{galleryPreviewOpen &&
				hasImages &&
				credential.images[galleryPreviewIndex]?.image_url && (
					<ImagePreviewOverlay
						src={credential.images[galleryPreviewIndex].image_url}
						onClose={() => setGalleryPreviewOpen(false)}
						alt={`Gallery image ${galleryPreviewIndex + 1}`}
					/>
				)}
		</CredentialsShell>
	);
}
