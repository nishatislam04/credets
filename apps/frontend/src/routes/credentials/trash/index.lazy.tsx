import type { TrashCredentialItem } from "@credets/shared-types/credentials/listings";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import {
	Activity,
	AlertTriangle,
	CalendarDays,
	Check,
	Clock,
	Copy,
	FileEdit,
	FolderTree,
	GitBranch,
	Heart,
	ImageIcon,
	Info,
	LoaderIcon,
	Quote,
	RefreshCw,
	Search,
	Tag,
	TextQuote,
	Timer,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { toast } from "#/components/ui/toast";
import { CredetsImage } from "#/components/ui/image";
import { Input } from "#/components/ui/input";
import { RichTextRenderer } from "#/components/ui/rich-text-renderer";
import { Skeleton } from "#/components/ui/skeleton";
import { getCSRFtoken } from "#/routes/credentials/create/-actions/getCSRFtoken";
import { CredentialsShell } from "../-components/credentials-shell";
import { TagListColorShared } from "../$credentialId/-shared/tagListColorShared";
import { typeColorShared } from "../$credentialId/-shared/typeColorShared";
import { getTrashListings } from "./-actions/getTrashListings";
import { permanentDeleteCredentialAction } from "./-actions/permanentDeleteCredential";

export const Route = createLazyFileRoute("/credentials/trash/")({
	component: RouteComponent,
});

// ─── Utility ────────────────────────────────────────────────────────────

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function formatDateTime(iso: string) {
	return new Date(iso).toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatTimeAgo(iso: string) {
	const now = Date.now();
	const then = new Date(iso).getTime();
	const diffMs = now - then;
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return "just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 30) return `${diffDays}d ago`;
	return formatDate(iso);
}

// ─── Trash Detail Dialog ────────────────────────────────────────────────

function calcDaysBetween(iso1: string, iso2: string) {
	const d1 = new Date(iso1).getTime();
	const d2 = new Date(iso2).getTime();
	return Math.max(0, Math.floor((d2 - d1) / 86400000));
}

function calcDaysAgo(iso: string) {
	const days = calcDaysBetween(iso, new Date().toISOString());
	return days;
}

function TrashDetailDialog({
	item,
	open,
	onOpenChange,
}: {
	item: TrashCredentialItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const typeColor = typeColorShared(item.type_value ?? "");
	const [copiedId, setCopiedId] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const queryClient = useQueryClient();

	// Scroll to top when the dialog opens so the user sees the header,
	// not scrolled-down to the Close / Delete buttons at the bottom.
	useEffect(() => {
		if (open) {
			// Double rAF to ensure the portal content is fully mounted
			// and scroll container is ready before scrolling to top.
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					document
						.querySelector('[data-slot="dialog-content"]')
						?.scrollTo(0, 0);
				});
			});
		}
	}, [open]);

	const handlePermanentDelete = async () => {
		setIsDeleting(true);
		try {
			// Fetch a fresh CSRF token
			const csrfRes = await getCSRFtoken();
			const csrfToken = csrfRes.data?.token;

			if (!csrfToken) {
				toast.error("Session expired", {
					description: "Please refresh the page and try again.",
				});
				setIsDeleting(false);
				setDeleteConfirmOpen(false);
				return;
			}

			await permanentDeleteCredentialAction({
				credentialId: item.id,
				csrfToken,
			});

			toast.success("Credential permanently deleted", {
				description: `"${item.title}" has been permanently removed.`,
			});

			// Close both dialogs
			setDeleteConfirmOpen(false);
			onOpenChange(false);

			// Refetch trash listings
			queryClient.invalidateQueries({ queryKey: ["trash-listings"] });
		} catch (err) {
			toast.error("Failed to delete", {
				description:
					err instanceof Error ? err.message : "Something went wrong",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const daysSinceDeletion = calcDaysAgo(item.deleted_at);
	const daysExisted = calcDaysBetween(item.created_at, item.deleted_at);

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent
					className="max-h-[90vh] overflow-y-auto p-8"
					style={{ maxWidth: "calc(100vw - 4rem)" }}
				>
					<DialogHeader className="mb-8">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<DialogTitle className="text-3xl font-bold tracking-tight leading-tight">
								{item.title || "Untitled"}
							</DialogTitle>

							<div className="flex items-center gap-2 shrink-0">
								{item.is_draft && (
									<Badge
										variant="outline"
										className="gap-1 rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-400"
									>
										<FileEdit className="size-3" />
										Draft
									</Badge>
								)}
								{item.is_favourite && (
									<Badge
										variant="outline"
										className="gap-1 rounded-full border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-400"
									>
										<Heart className="size-3" />
										Favourite
									</Badge>
								)}
							</div>
						</div>
						<DialogDescription className="sr-only">
							Full details of the trashed credential
						</DialogDescription>
					</DialogHeader>

					{/* Type badge below title */}
					{item.type_label && (
						<div className="mb-6 flex items-center gap-2">
							<FolderTree className="size-4 text-muted-foreground/40" />
							<Badge
								variant="outline"
								className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border-0 ${typeColor.bg} ${typeColor.text}`}
							>
								<span
									className={`inline-block size-2 rounded-full ${typeColor.dot}`}
								/>
								{item.type_label}
							</Badge>
						</div>
					)}

					<div className="space-y-8">
						{/* ── Deleted banner — prominent ── */}
						<div className="rounded-xl border-2 border-destructive/20 bg-gradient-to-r from-destructive/5 via-destructive/5 to-transparent px-5 py-4">
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
								<div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 ring-1 ring-destructive/20">
									<AlertTriangle className="size-5 text-destructive" />
								</div>
								<div className="flex flex-col">
									<span className="text-sm font-semibold text-destructive/90">
										Deleted Information
									</span>
									<span className="text-xs text-destructive/60">
										{formatDateTime(item.deleted_at)}
									</span>
								</div>
								<div className="ml-auto flex items-center gap-3 text-xs">
									<span className="rounded-md bg-destructive/10 px-2.5 py-1 font-mono text-destructive/80">
										{formatTimeAgo(item.deleted_at)}
									</span>
									{daysSinceDeletion > 0 && (
										<span className="text-destructive/50">
											{daysSinceDeletion}d ago
										</span>
									)}
								</div>
							</div>
						</div>

						{/* ── Image gallery ── */}
						{item.thumbnail_url ||
						(Array.isArray(item.images) && item.images.length > 0) ? (
							<section>
								<div className="mb-3 flex items-center gap-2">
									<ImageIcon className="size-4 text-muted-foreground/40" />
									<span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
										Images
									</span>
								</div>
								<div className="flex flex-wrap gap-3">
									{/* Thumbnail */}
									{item.thumbnail_url && (
										<div className="group relative size-36 overflow-hidden rounded-xl ring-1 ring-border/20 transition-shadow hover:ring-border/50">
											<CredetsImage
												src={item.thumbnail_url}
												alt={item.title}
												width={144}
												height={144}
												className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
											/>
										</div>
									)}
									{/* Additional images */}
									{Array.isArray(item.images) &&
										item.images.map(
											(img) =>
												img.image_url && (
													<div
														key={img.id}
														className="group relative size-36 overflow-hidden rounded-xl ring-1 ring-border/20 transition-shadow hover:ring-border/50"
													>
														<CredetsImage
															src={img.image_url}
															alt={`${item.title} image`}
															width={144}
															height={144}
															className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
														/>
													</div>
												),
										)}
								</div>
							</section>
						) : null}

						{/* ── Timeline ── */}
						<section>
							<div className="mb-3 flex items-center gap-2">
								<Activity className="size-4 text-muted-foreground/40" />
								<span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
									Timeline
								</span>
							</div>
							<div className="rounded-xl border bg-card">
								<div className="divide-y divide-border/40">
									{/* Created */}
									<div className="flex items-center gap-4 px-5 py-3.5">
										<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
											<CalendarDays className="size-4 text-emerald-600 dark:text-emerald-400" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-foreground">
												Created
											</p>
											<p className="text-xs text-muted-foreground/60">
												{formatDateTime(item.created_at)}
											</p>
										</div>
										<span className="text-xs text-muted-foreground/40 shrink-0">
											{formatTimeAgo(item.created_at)}
										</span>
									</div>

									{/* Updated */}
									{item.updated_at && (
										<div className="flex items-center gap-4 px-5 py-3.5">
											<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40">
												<Clock className="size-4 text-blue-600 dark:text-blue-400" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-foreground">
													Last updated
												</p>
												<p className="text-xs text-muted-foreground/60">
													{formatDateTime(item.updated_at)}
												</p>
											</div>
											<span className="text-xs text-muted-foreground/40 shrink-0">
												{formatTimeAgo(item.updated_at)}
											</span>
										</div>
									)}

									{/* Deleted */}
									<div className="flex items-center gap-4 px-5 py-3.5">
										<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
											<AlertTriangle className="size-4 text-destructive" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-destructive/90">
												Deleted
											</p>
											<p className="text-xs text-destructive/60">
												{formatDateTime(item.deleted_at)}
											</p>
										</div>
										<span className="text-xs text-destructive/50 shrink-0">
											{formatTimeAgo(item.deleted_at)}
										</span>
									</div>
								</div>

								{/* Lifespan summary */}
								{daysExisted > 0 && (
									<div className="border-t border-dashed border-border/30 px-5 py-3">
										<div className="flex items-center gap-2 text-xs text-muted-foreground/50">
											<Timer className="size-3.5" />
											<span>
												Existed for{" "}
												<strong className="text-muted-foreground/70">
													{daysExisted} day{daysExisted !== 1 ? "s" : ""}
												</strong>
											</span>
										</div>
									</div>
								)}
							</div>
						</section>

						{/* ── Short description / Summary ── */}
						{item.short_description && (
							<section className="relative">
								<div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-primary/40 to-primary/5" />
								<div className="pl-6">
									<span className="inline-flex items-center gap-1.5 mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/50">
										<TextQuote className="size-3" />
										Summary
									</span>
									<div className="rounded-xl border bg-card p-5">
										<RichTextRenderer
											content={item.short_description}
											className="text-sm leading-relaxed text-muted-foreground/80 dark:text-muted-foreground/90 selection:bg-primary/10"
										/>
									</div>
								</div>
							</section>
						)}

						{/* ── Long description ── */}
						{item.long_description && (
							<section className="relative">
								<div className="absolute left-0 top-3 h-px w-full bg-gradient-to-r from-border/40 via-border/20 to-transparent" />
								<div className="pt-6">
									<div className="mb-3">
										<Quote className="size-6 text-primary/15" />
									</div>
									<span className="inline-flex items-center gap-1.5 mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/50">
										<TextQuote className="size-3" />
										Full description
									</span>
									<div className="rounded-xl border bg-card p-5">
										<RichTextRenderer
											content={item.long_description}
											className="text-sm leading-relaxed text-muted-foreground/80 dark:text-muted-foreground/90 selection:bg-primary/10 font-serif"
										/>
									</div>
								</div>
							</section>
						)}

						{/* ── Notes ── */}
						{item.notes && (
							<section>
								<span className="inline-flex items-center gap-1.5 mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
									<FileEdit className="size-3" />
									Notes
								</span>
								<div className="rounded-xl border bg-card p-5">
									<RichTextRenderer
										content={item.notes}
										className="text-sm leading-relaxed text-muted-foreground/80 dark:text-muted-foreground/90 selection:bg-primary/10"
									/>
								</div>
							</section>
						)}

						{/* ── Metadata ── */}
						<section>
							<div className="mb-3 flex items-center gap-2">
								<Info className="size-4 text-muted-foreground/40" />
								<span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
									Metadata
								</span>
							</div>
							<div className="flex flex-col gap-4">
								{/* Version */}
								<div className="rounded-xl border bg-card p-4">
									<div className="flex items-center gap-2 mb-1.5">
										<GitBranch className="size-4 text-muted-foreground/40" />
										<span className="text-xs text-muted-foreground/50">
											Version
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
											{item.version}
										</span>
										<span className="text-xs text-muted-foreground/50">
											{item.version === 0
												? "Initial version"
												: `Updated ${item.version} time${item.version === 1 ? "" : "s"}`}
										</span>
									</div>
								</div>

								{/* ID */}
								<div className="rounded-xl border bg-card p-4">
									<div className="flex items-center gap-2 mb-1.5">
										<Info className="size-4 text-muted-foreground/40" />
										<span className="text-xs text-muted-foreground/50">ID</span>
									</div>
									<button
										type="button"
										onClick={() => {
											navigator.clipboard.writeText(item.id).then(() => {
												setCopiedId(true);
												setTimeout(() => setCopiedId(false), 1500);
											});
										}}
										className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-2 text-left transition-colors hover:border-border/80 hover:bg-accent/50"
									>
										<code className="flex-1 truncate text-xs font-mono text-muted-foreground/70">
											{item.id}
										</code>
										{copiedId ? (
											<Check className="size-3.5 shrink-0 text-emerald-500" />
										) : (
											<Copy className="size-3.5 shrink-0 text-muted-foreground/30" />
										)}
									</button>
								</div>
							</div>
						</section>

						{/* ── Tags ── */}
						{Array.isArray(item.tags) && item.tags.length > 0 && (
							<section>
								<div className="mb-3 flex items-center gap-2">
									<Tag className="size-4 text-muted-foreground/40" />
									<span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
										Tags
									</span>
								</div>
								<div className="flex flex-wrap gap-2">
									<TagListColorShared tags={item.tags} />
								</div>
							</section>
						)}
					</div>

					{/* ── Bottom action buttons ── */}
					<div className="flex items-center justify-center gap-3 pt-6">
						<DialogClose className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border/40 bg-background px-6 py-2 text-xs font-medium text-muted-foreground/60 shadow-xs transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-[0.97]">
							Close
						</DialogClose>

						<button
							type="button"
							onClick={() => setDeleteConfirmOpen(true)}
							className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-destructive/30 bg-destructive/5 px-6 py-2 text-xs font-medium text-destructive/70 shadow-xs transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 hover:shadow-sm active:scale-[0.97]"
						>
							<Trash2 className="size-3.5" />
							Delete permanently
						</button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Confirm permanent delete (outside Dialog for proper overlay) */}
			<AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<AlertDialogContent>
					<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
						<AlertTriangle className="size-8 text-destructive" />
					</div>

					<AlertDialogTitle className="text-center text-xl text-foreground">
						Permanently delete?
					</AlertDialogTitle>

					<AlertDialogDescription className="text-center">
						This will permanently remove{" "}
						<span className="font-semibold text-foreground">
							&ldquo;{item.title || "Untitled"}&rdquo;
						</span>{" "}
						from the database. This action cannot be undone.
					</AlertDialogDescription>

					<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive/70 mt-4">
						The credential and all associated data (images, version history)
						will be permanently removed and cannot be recovered.
					</div>

					<div className="flex justify-end gap-3 mt-6">
						<AlertDialogCancel
							variant="outline"
							size="lg"
							disabled={isDeleting}
						>
							Cancel
						</AlertDialogCancel>
						<Button
							type="button"
							variant="destructive"
							size="lg"
							onClick={handlePermanentDelete}
							disabled={isDeleting}
							className="gap-2 px-6 shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 transition-all duration-200"
						>
							{isDeleting ? (
								<LoaderIcon className="size-4 animate-spin" />
							) : (
								<Trash2 className="size-4" />
							)}
							{isDeleting ? "Deleting..." : "Yes, permanently delete"}
						</Button>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

// ─── Trash Item Card ────────────────────────────────────────────────────

function TrashItemCard({
	item,
	onClick,
}: {
	item: TrashCredentialItem;
	onClick: () => void;
}) {
	const typeColor = typeColorShared(item.type_value ?? "");

	return (
		<button
			type="button"
			onClick={onClick}
			className="group w-full cursor-pointer text-left"
		>
			<div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-destructive/20 active:translate-y-0 active:shadow-xs">
				{/* Icon */}
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 ring-1 ring-destructive/20">
					<Trash2 className="size-4 text-destructive/70" />
				</div>

				{/* Content */}
				<div className="flex min-w-0 flex-1 items-center gap-3">
					<div className="min-w-0 flex-1">
						<h3 className="font-semibold text-base leading-snug truncate tracking-tight group-hover:text-destructive/80 transition-colors duration-200">
							{item.title || "Untitled"}
						</h3>
						<div className="flex items-center gap-2 mt-0.5">
							{item.type_label && (
								<Badge
									variant="outline"
									className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0 h-4 text-[10px] font-medium uppercase tracking-wider border-0 ${typeColor.bg} ${typeColor.text}`}
								>
									<span
										className={`inline-block size-1 rounded-full ${typeColor.dot}`}
									/>
									{item.type_label}
								</Badge>
							)}
						</div>
					</div>

					{/* Deleted date */}
					<div className="shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground/40">
						<Clock className="size-3" />
						<span>{formatTimeAgo(item.deleted_at)}</span>
					</div>
				</div>
			</div>
		</button>
	);
}

// ─── Empty State ────────────────────────────────────────────────────────

function TrashEmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-24">
			<div className="relative mb-8">
				<div className="size-28 rounded-full bg-gradient-to-br from-muted-foreground/20 via-muted-foreground/10 to-muted flex items-center justify-center ring-1 ring-border/30">
					<Trash2 className="size-12 text-muted-foreground/40" />
				</div>
			</div>
			<h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
				Trash is empty
			</h2>
			<p className="text-sm text-muted-foreground/60 max-w-sm text-center leading-relaxed">
				Deleted credentials will appear here. You can restore them or
				permanently delete them from this page.
			</p>
		</div>
	);
}

// ─── Error State ────────────────────────────────────────────────────────

function TrashErrorUI({ error }: { error: Error }) {
	return (
		<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
			<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
				<AlertTriangle className="size-6 text-destructive" />
			</div>
			<p className="text-sm text-destructive/80 mb-1 font-medium">
				Failed to load trash
			</p>
			<p className="text-xs text-destructive/60">
				{error instanceof Error ? error.message : "Something went wrong"}
			</p>
		</div>
	);
}

// ─── Main Route Component ──────────────────────────────────────────────

function RouteComponent() {
	const [selectedItem, setSelectedItem] = useState<TrashCredentialItem | null>(
		null,
	);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteAllOpen, setDeleteAllOpen] = useState(false);

	const { data, isLoading, isError, error, isRefetching, refetch } = useQuery({
		queryKey: ["trash-listings"],
		queryFn: () => getTrashListings(),
	});

	const items = data?.items ?? [];

	const handleItemClick = (item: TrashCredentialItem) => {
		setSelectedItem(item);
		setDialogOpen(true);
	};

	return (
		<CredentialsShell>
			<div className="mx-auto w-full max-w-3xl px-4 py-8">
				{/* Page header */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold tracking-tight">Trash</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage your deleted credentials
					</p>
				</div>

				{/* Actions toolbar */}
				<div className="mb-6 rounded-xl border bg-card p-3 md:p-5">
					<div className="flex flex-col gap-4">
						{/* Search row */}
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
							<Input
								type="text"
								placeholder="Search trash..."
								className="w-full pl-10"
							/>
						</div>

						{/* Separator */}
						<hr className="border-t border-border/40" />

						{/* Action buttons row */}
						<div className="flex flex-wrap items-center gap-3">
							<button
								type="button"
								onClick={() => refetch()}
								disabled={isRefetching}
								className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground/70 shadow-xs transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<RefreshCw
									className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`}
								/>
								Refresh
							</button>

							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									className="size-4 rounded border-border text-primary focus:ring-primary/30"
								/>
								<span className="text-xs text-muted-foreground/70 select-none">
									Select all
								</span>
							</label>

							<div className="ml-auto">
								<Button
									type="button"
									variant="destructive"
									size="sm"
									className="gap-1.5 shadow-xs"
									disabled={items.length === 0}
									onClick={() => setDeleteAllOpen(true)}
								>
									<Trash2 className="size-3.5" />
									Delete all permanently
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Loading state */}
				{isLoading && (
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="h-20 w-full rounded-xl" />
						))}
					</div>
				)}

				{/* Error state */}
				{!isLoading && isError && <TrashErrorUI error={error as Error} />}

				{/* Empty state */}
				{!isLoading && !isError && items.length === 0 && <TrashEmptyState />}

				{/* Trash items list */}
				{!isLoading && !isError && items.length > 0 && (
					<div className="space-y-2">
						{items.map((item) => (
							<TrashItemCard
								key={item.id}
								item={item}
								onClick={() => handleItemClick(item)}
							/>
						))}
					</div>
				)}

				{/* Count info */}
				{!isLoading && !isError && items.length > 0 && (
					<p className="text-xs text-muted-foreground/40 text-center mt-6">
						{items.length} deleted credential{items.length !== 1 ? "s" : ""}
					</p>
				)}
			</div>

			{/* Detail dialog */}
			{selectedItem && (
				<TrashDetailDialog
					item={selectedItem}
					open={dialogOpen}
					onOpenChange={setDialogOpen}
				/>
			)}

			{/* Delete all confirmation dialog */}
			<AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
				<AlertDialogContent>
					<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
						<AlertTriangle className="size-8 text-destructive" />
					</div>

					<AlertDialogTitle className="text-center text-xl text-foreground">
						Permanently delete all?
					</AlertDialogTitle>

					<AlertDialogDescription className="text-center">
						This will permanently delete all{" "}
						<span className="font-semibold text-foreground">
							{items.length}
						</span>{" "}
						trashed credential
						{items.length !== 1 ? "s" : ""}. This action cannot be undone.
					</AlertDialogDescription>

					<div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive/70">
						All trashed credentials will be permanently removed. Make sure you
						don&rsquo;t need any of them before proceeding.
					</div>

					<div className="flex justify-end gap-3 mt-6">
						<AlertDialogCancel variant="outline" size="lg">
							Cancel
						</AlertDialogCancel>
						<Button
							type="button"
							variant="destructive"
							size="lg"
							className="gap-2 px-6 shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 transition-all duration-200"
						>
							<Trash2 className="size-4" />
							Yes, delete all
						</Button>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</CredentialsShell>
	);
}
