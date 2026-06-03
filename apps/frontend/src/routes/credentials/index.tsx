import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LoaderIcon, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "#/components/theme-toggle";
import { Skeleton } from "#/components/ui/skeleton";
import type { CredentialListItem } from "./-actions/getCredentialsListings";
import { getCredentialsListings } from "./-actions/getCredentialsListings";
import { CredentialCard } from "./-components/credential-card";

export const Route = createFileRoute("/credentials/")({
	gcTime: 0,
	component: RouteComponent,
});

function RouteComponent() {
	// Fetch first page with TanStack Query — guaranteed fresh on every navigation
	// because gcTime: 0 garbage-collects the query immediately on unmount,
	// and staleTime: 0 always re-fetches on mount.
	const {
		data: firstPage,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["credentials-listings"],
		queryFn: () => getCredentialsListings(),
		staleTime: 0,
		gcTime: 0,
	});

	// Local accumulator for "load more" items (not dependant on query cache)
	const [moreItems, setMoreItems] = useState<CredentialListItem[]>([]);
	// Keep track of the next cursor for the locally accumulated items
	const [moreCursor, setMoreCursor] = useState<string | null>(null);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

	// When firstPage changes (fresh load), reset the local accumulator
	useEffect(() => {
		setMoreItems([]);
		setMoreCursor(null);
		setIsLoadingMore(false);
		setLoadMoreError(null);
	}, [firstPage]);

	// Combine fresh first-page data with locally accumulated items
	const credentials = [...(firstPage?.credentials ?? []), ...moreItems];
	const hasMore = firstPage?.hasMore ?? false;
	const initialCursor = firstPage?.nextCursor ?? null;

	// Ref to prevent duplicate fetches while one is in flight
	const loadingRef = useRef(false);
	// Ref to keep the current IntersectionObserver so we can disconnect it
	const observerRef = useRef<IntersectionObserver | null>(null);

	const loadMore = useCallback(async () => {
		const cursor = moreCursor ?? initialCursor;
		if (loadingRef.current || !cursor) return;
		loadingRef.current = true;
		setIsLoadingMore(true);
		setLoadMoreError(null);

		try {
			const data = await getCredentialsListings(cursor);
			setMoreItems((prev) => [...prev, ...data.credentials]);
			setMoreCursor(data.nextCursor);
		} catch (err) {
			setLoadMoreError(
				err instanceof Error ? err.message : "Failed to load more credentials",
			);
		} finally {
			loadingRef.current = false;
			setIsLoadingMore(false);
		}
	}, [moreCursor, initialCursor]);

	// Set up the IntersectionObserver on the sentinel
	const sentinelCallback = useCallback(
		(node: HTMLDivElement | null) => {
			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}

			if (!node) return;

			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
						loadMore();
					}
				},
				{ rootMargin: "200px" },
			);

			observer.observe(node);
			observerRef.current = observer;
		},
		[hasMore, loadMore],
	);

	// Clean up the observer when the component unmounts
	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}
		};
	}, []);

	if (isLoading) {
		return (
			<div className="mx-auto w-full max-w-3xl px-4 py-8">
				<div className="mb-8 flex items-start justify-between">
					<div>
						<Skeleton className="h-8 w-40 mb-2" />
						<Skeleton className="h-4 w-64" />
					</div>
					<Skeleton className="h-10 w-24 rounded-lg" />
				</div>
				<div className="space-y-3">
					{[...Array(4)].map((_, i) => (
						<Skeleton key={i} className="h-24 w-full rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			{/* Page header */}
			<div className="mb-8 flex items-start justify-between">
				<div>
					<div className="flex">
						<h1 className="text-2xl font-bold tracking-tight">Credentials</h1>
						<ThemeToggle />
					</div>
					<p className="text-sm text-muted-foreground mt-1">
						Browse your saved credentials, keys, and secrets
					</p>
				</div>
				<Link
					to="/credentials/create"
					className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
				>
					<Plus className="size-4" />
					Create
				</Link>
			</div>

			{/* Error state */}
			{error && (
				<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
					<p className="text-sm text-destructive/80 mb-2">
						{error instanceof Error ? error.message : "Failed to load credentials"}
					</p>
				</div>
			)}

			{/* Empty state */}
			{!error && credentials.length === 0 && (
				<div className="text-center py-24">
					<div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
						<span className="text-2xl text-muted-foreground/40">~</span>
					</div>
					<h3 className="text-base font-medium text-muted-foreground">No credentials yet</h3>
					<p className="text-sm text-muted-foreground/60 mt-1">
						Create your first credential to get started
					</p>
				</div>
			)}

			{/* Credentials list */}
			{!error && credentials.length > 0 && (
				<>
					<div className="space-y-3">
						{credentials.map((cred) => (
							<CredentialCard key={cred.id} credential={cred} />
						))}
					</div>

					{/* Infinite scroll sentinel */}
					{hasMore && (
						<div ref={sentinelCallback} className="flex justify-center py-8">
							{isLoadingMore ? (
								<div className="flex items-center gap-2 text-sm text-muted-foreground/60">
									<LoaderIcon className="size-4 animate-spin" />
									<span>Loading more...</span>
								</div>
							) : (
								<div className="size-4" />
							)}
						</div>
					)}

					{/* Load more error */}
					{loadMoreError && (
						<div className="text-center py-6">
							<p className="text-sm text-destructive/80 mb-2">{loadMoreError}</p>
							<button
								type="button"
								onClick={() => loadMore()}
								className="text-xs text-muted-foreground underline hover:text-foreground transition-colors cursor-pointer"
							>
								Try again
							</button>
						</div>
					)}

					{/* End of results */}
					{!hasMore && (
						<div className="text-center py-8">
							<p className="text-xs text-muted-foreground/40">
								You&rsquo;ve reached the end
							</p>
						</div>
					)}
				</>
			)}
		</div>
	);
}
