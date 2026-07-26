import type { FavouriteCredentialItem } from "@credets/shared-types/credentials/listings";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	CalendarDays,
	Heart,
	RefreshCw,
	Search,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Skeleton } from "#/components/ui/skeleton";
import { CredentialsShell } from "../-components/credentials-shell";
import { typeColorShared } from "../$credentialId/-shared/typeColorShared";
import { getFavouriteListings } from "./-actions/getFavouriteListings";

export const Route = createLazyFileRoute("/credentials/favourite/")({
	component: RouteComponent,
});

// ─── Utility ────────────────────────────────────────────────────────────

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
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

// ─── Favourite Item Card ────────────────────────────────────────────────

function FavouriteItemCard({ item }: { item: FavouriteCredentialItem }) {
	const typeColor = typeColorShared(item.type_value ?? "");

	return (
		<Link
			to="/credentials/$credentialId"
			params={{ credentialId: item.id }}
			className="group block"
		>
			<div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-rose-200/50 dark:hover:border-rose-800/30 active:translate-y-0 active:shadow-xs">
				{/* Icon */}
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-100/80 ring-1 ring-rose-200/60 dark:bg-rose-950/30 dark:ring-rose-800/40">
					<Heart className="size-4 text-rose-500 dark:text-rose-400" />
				</div>

				{/* Content */}
				<div className="flex min-w-0 flex-1 items-center gap-3">
					<div className="min-w-0 flex-1">
						<h3 className="font-semibold text-base leading-snug truncate tracking-tight group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors duration-200">
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
							{item.short_description && (
								<span className="text-xs text-muted-foreground/40 truncate max-w-[200px]">
									{item.short_description}
								</span>
							)}
						</div>
					</div>

					{/* Created date */}
					<div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground/40">
						<CalendarDays className="size-3" />
						<span>{formatTimeAgo(item.created_at)}</span>
					</div>
				</div>
			</div>
		</Link>
	);
}

// ─── Empty State ────────────────────────────────────────────────────────

function FavouriteEmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-24">
			<div className="relative mb-8">
				<div className="size-28 rounded-full bg-gradient-to-br from-rose-200/50 via-rose-100/30 to-muted flex items-center justify-center ring-1 ring-rose-200/40 dark:from-rose-900/30 dark:via-rose-800/20 dark:ring-rose-700/30">
					<Heart className="size-12 text-rose-400/60 dark:text-rose-500/50" />
				</div>
			</div>
			<h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
				No favourites yet
			</h2>
			<p className="text-sm text-muted-foreground/60 max-w-sm text-center leading-relaxed">
				Favourite credentials will appear here. Mark credentials as favourites
				from the credential detail or listings page to save your most-used
				items.
			</p>
		</div>
	);
}

// ─── Error State ────────────────────────────────────────────────────────

function FavouriteErrorUI({ error }: { error: Error }) {
	return (
		<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
			<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
				<AlertTriangle className="size-6 text-destructive" />
			</div>
			<p className="text-sm text-destructive/80 mb-1 font-medium">
				Failed to load favourites
			</p>
			<p className="text-xs text-destructive/60">
				{error instanceof Error ? error.message : "Something went wrong"}
			</p>
		</div>
	);
}

// ─── Main Route Component ──────────────────────────────────────────────

function RouteComponent() {
	const [deleteAllOpen, setDeleteAllOpen] = useState(false);

	const { data, isLoading, isError, error, isRefetching, refetch } = useQuery({
		queryKey: ["favourite-listings"],
		queryFn: () => getFavouriteListings(),
	});

	const items = data?.items ?? [];

	return (
		<CredentialsShell>
			<div className="mx-auto w-full max-w-3xl px-4 py-8">
				{/* Page header */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold tracking-tight">Favourites</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Your favourite credentials
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
								placeholder="Search favourites..."
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
									Delete all
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
				{!isLoading && isError && <FavouriteErrorUI error={error as Error} />}

				{/* Empty state */}
				{!isLoading && !isError && items.length === 0 && (
					<FavouriteEmptyState />
				)}

				{/* Favourite items list */}
				{!isLoading && !isError && items.length > 0 && (
					<div className="space-y-2">
						{items.map((item) => (
							<FavouriteItemCard key={item.id} item={item} />
						))}
					</div>
				)}

				{/* Count info */}
				{!isLoading && !isError && items.length > 0 && (
					<p className="text-xs text-muted-foreground/40 text-center mt-6">
						{items.length} favourite credential
						{items.length !== 1 ? "s" : ""}
					</p>
				)}
			</div>

			{/* Delete all confirmation dialog */}
			<AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
				<AlertDialogContent>
					<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
						<AlertTriangle className="size-8 text-destructive" />
					</div>

					<AlertDialogTitle className="text-center text-xl text-foreground">
						Remove all favourites?
					</AlertDialogTitle>

					<AlertDialogDescription className="text-center">
						This will remove all{" "}
						<span className="font-semibold text-foreground">
							{items.length}
						</span>{" "}
						credential
						{items.length !== 1 ? "s" : ""} from favourites. This action cannot
						be undone.
					</AlertDialogDescription>

					<div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive/70">
						All favourite credentials will be removed. You can heart them again
						later from the credential detail or listings page.
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
							Yes, remove all
						</Button>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</CredentialsShell>
	);
}
