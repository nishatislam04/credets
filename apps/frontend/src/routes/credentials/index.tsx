import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LoaderIcon, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "#/components/theme-toggle";
import type { CredentialListItem } from "./-actions/getCredentialsListings";
import { getCredentialsListings } from "./-actions/getCredentialsListings";
import { CredentialCard } from "./-components/credential-card";
import { CredentialsErrorUI } from "./-ui/CredentialsErrorUI";
import { CredentialsEmptyState } from "./-ui/credentialsEmptyState";
import { CredentialsLoadMoreError } from "./-ui/credentialsLoadMoreError";
import { CredentialListingsSkeleton } from "./-ui/skeletonLoading";

export const Route = createFileRoute("/credentials/")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		data: firstPage,
		isLoading,
		error,
		isRefetching,
	} = useQuery({
		queryKey: ["credentials-listings"],
		queryFn: () => getCredentialsListings(),
	});

	// Local accumulator for "load more" items (not dependant on query cache)
	const [moreItems, setMoreItems] = useState<CredentialListItem[]>([]);
	// Keep track of the next cursor for the locally accumulated items
	const [moreCursor, setMoreCursor] = useState<string | null>(null);
	const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

	// Combine fresh first-page data with locally accumulated items
	const credentials = [...(firstPage?.credentials ?? []), ...moreItems];
	const initialCursor = firstPage?.nextCursor ?? null;
	const hasMore = (moreCursor ?? initialCursor) !== null;

	// Ref to prevent duplicate fetches while one is in flight
	const loadingRef = useRef(false);
	// Ref to keep the current IntersectionObserver so we can disconnect it
	const observerRef = useRef<IntersectionObserver | null>(null);

	const loadMore = useCallback(async () => {
		const cursor = moreCursor ?? initialCursor;
		if (loadingRef.current || !cursor) return;
		loadingRef.current = true;
		setLoadMoreError(null);

		try {
			const data = await getCredentialsListings(cursor);
			setMoreItems((prev) => [...prev, ...data.credentials]);
			setMoreCursor(data.nextCursor);
		} catch (err) {
			setLoadMoreError(err instanceof Error ? err.message : "Failed to load more credentials");
		} finally {
			loadingRef.current = false;
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

	if (isLoading) return <CredentialListingsSkeleton isLoading={isLoading} />;

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			{/* Page header */}
			<div className="mb-8 flex items-start justify-between">
				<div>
					<header className="flex items-center gap-2">
						<h1 className="text-2xl font-bold tracking-tight">Credentials</h1>
						<ThemeToggle />
					</header>
					<p className="text-sm text-muted-foreground mt-1">
						Browse your saved credentials, keys, and secrets
					</p>

					{/* Show count + spinner when credentials exist and not initial loading */}
					{credentials.length > 0 && !isLoading && (
						<div className="flex items-center gap-2 mt-2">
							<p className="text-xs text-muted-foreground/50">
								{credentials.length} credential{credentials.length !== 1 ? "s" : ""}
							</p>
							{/* Spinner shown during background refetch */}
							{isRefetching && <LoaderIcon className="size-3 animate-spin" />}
						</div>
					)}
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
			{error && <CredentialsErrorUI error={error} />}

			{/* Empty state */}
			{!error && credentials.length === 0 && (
				<div className="text-center py-24">
					<CredentialsEmptyState />
				</div>
			)}

			{/* Credentials list */}
			{!error && credentials.length > 0 && (
				<>
					<div className="space-y-3">
						{credentials.map((cred, idx) => (
							<div
								key={cred.id}
								className="animate-in fade-in slide-in-from-bottom-3 duration-300"
								style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "backwards" }}
							>
								<CredentialCard credential={cred} />
							</div>
						))}
					</div>

					{/* Infinite scroll sentinel */}
					{hasMore ||
						(loadingRef.current && (
							<div ref={sentinelCallback} className="flex justify-center py-8">
								{isLoading ? (
									<div className="flex items-center gap-2 text-sm text-muted-foreground/60">
										<LoaderIcon className="size-4 animate-spin" />
										<span>Loading more...</span>
									</div>
								) : (
									<div className="size-4" />
								)}
							</div>
						))}

					{/* Load more error */}
					{loadMoreError && (
						<CredentialsLoadMoreError loadMoreError={loadMoreError} loadMore={loadMore} />
					)}

					{/* End of results */}
					{!hasMore && (
						<div className="text-center py-8">
							<p className="text-xs text-muted-foreground/40">You&rsquo;ve reached the end</p>
						</div>
					)}
				</>
			)}
		</div>
	);
}
