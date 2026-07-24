import { useInfiniteQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { LoaderIcon, Plus, RefreshCw, Search } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Input } from "#/components/ui/input";
import { Skeleton } from "#/components/ui/skeleton";
import { Switch } from "#/components/ui/switch";
import { getCredentialsListings } from "./-actions/getCredentialsListings";
import { CredentialCard } from "./-components/credential-card";
import { TopHeader } from "./-components/top-header";
import { CredentialsErrorUI } from "./-ui/CredentialsErrorUI";
import { CredentialsEmptyState } from "./-ui/credentialsEmptyState";
import { CredentialsLoadMoreError } from "./-ui/credentialsLoadMoreError";

export const Route = createLazyFileRoute("/credentials/")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		data,
		isLoading,
		isError,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isRefetching,
		refetch,
	} = useInfiniteQuery({
		queryKey: ["credentials-listings"],
		queryFn: ({ pageParam }) =>
			getCredentialsListings(pageParam as string | undefined | null),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	const { ref: sentinelRef, inView } = useInView({ rootMargin: "200px" });

	useEffect(() => {
		const shouldFetchNextPage =
			inView && // user at bottom view
			hasNextPage && // has more data to load
			!isFetchingNextPage && // not currently fetching
			!isError; // no error

		if (shouldFetchNextPage) fetchNextPage();
	}, [inView, hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

	const credentials = data?.pages.flatMap((page) => page.credentials) ?? [];

	// Distinguish initial load error from load-more error
	const isInitialError = isError && !data?.pages?.length;
	const isLoadMoreError = isError && (data?.pages?.length ?? 0) > 0;

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			{/* Page header */}
			<TopHeader
				isLoading={isLoading}
				isRefetching={isRefetching}
				credentialsLength={credentials.length}
			/>

			{/* Actions toolbar */}
			<div className="mb-6 rounded-xl border bg-card p-3 md:p-6">
				{/* Mobile layout: stacked with absolute create button */}
				<div className="flex flex-col gap-4 md:hidden">
					{/* Search input */}
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
						<Input
							type="text"
							placeholder="Search credentials by title, type, or tags..."
							className="w-full pl-10"
						/>
					</div>

					{/* Horizontal separator */}
					<hr className="border-t border-border/40" />

					{/* Action buttons row */}
					<div className="flex flex-wrap items-center gap-3">
						<button
							type="button"
							onClick={() => refetch()}
							disabled={isRefetching}
							className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground/70 shadow-xs transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`} />
							Refresh
						</button>
						<div className="flex items-center gap-2">
							<Switch id="enable-local-cache" />
							<label htmlFor="enable-local-cache" className="text-xs text-muted-foreground/70 cursor-pointer select-none">
								Enable local cache
							</label>
						</div>
					</div>

					{/* Create button — full width on mobile */}
					<Link
						to="/credentials/create"
						className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary p-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
					>
						<Plus className="size-5" />
						<span>Create</span>
					</Link>
				</div>

				{/* Desktop layout: two columns with separators */}
				<div className="hidden md:grid md:grid-cols-[1fr_auto_auto]">
					{/* Left column: search + actions */}
					<div className="flex flex-col gap-4 md:pr-6">
						{/* Search input */}
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
							<Input
								type="text"
								placeholder="Search credentials by title, type, or tags..."
								className="w-full pl-10"
							/>
						</div>

						{/* Horizontal separator */}
						<hr className="border-t border-border/40" />

						{/* Action buttons row */}
						<div className="flex flex-wrap items-center gap-3">
							<button
								type="button"
								onClick={() => refetch()}
								disabled={isRefetching}
								className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground/70 shadow-xs transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`} />
								Refresh
							</button>
							<div className="flex items-center gap-2">
								<Switch id="enable-local-cache" />
								<label htmlFor="enable-local-cache" className="text-xs text-muted-foreground/70 cursor-pointer select-none">
									Enable local cache
								</label>
							</div>
						</div>
					</div>

					{/* Vertical separator — full height, edge to edge */}
					<div className="w-px self-stretch bg-border/60" />

					{/* Right column: create button — vertically centered */}
					<div className="flex items-center md:pl-6">
						<Link
							to="/credentials/create"
							className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
						>
							<Plus className="size-4" />
							<span>Create</span>
						</Link>
					</div>
				</div>
			</div>

			{/* show inital skeleton loading */}
			{isLoading && (
				<div className="mx-auto w-full px-2 py-0 pt-28">
					<div className="space-y-3">
						{[...Array(12)].map(() => (
							<Skeleton
								key={crypto.randomUUID()}
								className="h-36 w-full rounded-xl"
							/>
						))}
					</div>
				</div>
			)}

			{/* Initial load error state */}
			{isInitialError && (
				<CredentialsErrorUI
					error={
						error instanceof Error
							? error
							: new Error("Failed to load credentials")
					}
				/>
			)}

			{/* Empty state — only after first successful fetch, no error, and confirmed zero credentials */}
			{!!data && !isError && credentials.length === 0 && (
				<div className="text-center">
					<CredentialsEmptyState />
				</div>
			)}

			{/* Credentials list */}
			{!isInitialError && credentials.length > 0 && (
				<>
					<div className="space-y-3">
						{credentials.map((cred) => (
							<CredentialCard key={cred.id} credential={cred} />
						))}
					</div>

					{/* Infinite scroll sentinel */}
					<div ref={sentinelRef} className="flex justify-center py-8">
						{isFetchingNextPage ? (
							<div className="flex items-center gap-2 text-sm text-muted-foreground/60">
								<LoaderIcon className="size-4 animate-spin" />
								<span>Loading more...</span>
							</div>
						) : hasNextPage ? (
							<div className="size-4" />
						) : (
							<div className="text-center">
								<p className="text-xs text-muted-foreground/40">
									You&rsquo;ve reached the end
								</p>
							</div>
						)}
					</div>

					{/* Load more error */}
					{isLoadMoreError && error && (
						<CredentialsLoadMoreError
							loadMoreError={
								error instanceof Error
									? error.message
									: "Failed to load more credentials"
							}
							loadMore={() => fetchNextPage()}
						/>
					)}
				</>
			)}
		</div>
	);
}
