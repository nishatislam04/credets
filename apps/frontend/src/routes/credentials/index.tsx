import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { LoaderIcon, Plus } from "lucide-react";
import { Skeleton } from "#/components/ui/skeleton";
import { CredentialCard } from "./-components/credential-card";
import { getCredentialsListings } from "./-actions/getCredentialsListings";
import type { CredentialListItem } from "./-actions/getCredentialsListings";

export const Route = createFileRoute("/credentials/")({
	component: RouteComponent,
	loader: async () => getCredentialsListings(),
	pendingComponent: () => (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			<div className="mb-8">
				<Skeleton className="h-8 w-48 rounded-lg" />
				<Skeleton className="h-4 w-72 mt-2 rounded-lg" />
			</div>

			<div className="space-y-3">
				{Array.from({ length: 8 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-4 rounded-xl border p-4"
					>
						<Skeleton className="size-12 shrink-0 rounded-full" />
						<div className="min-w-0 grow space-y-2">
							<Skeleton className="h-5 w-2/3 rounded-lg" />
							<Skeleton className="h-3 w-full rounded-lg" />
							<div className="flex gap-2">
								<Skeleton className="h-3 w-16 rounded-full" />
								<Skeleton className="h-3 w-20 rounded-full" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	),
	errorComponent: ({ error }) => (
		<div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
			<div className="size-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
				<span className="text-2xl">!</span>
			</div>
			<h2 className="text-lg font-semibold mb-2">Failed to load credentials</h2>
			<p className="text-sm text-muted-foreground">
				{error?.message || "Something went wrong. Please try again later."}
			</p>
		</div>
	),
});

function RouteComponent() {
	const loaderData = useLoaderData({ from: "/credentials/" });

	// Accumulate credentials across pages
	const [credentials, setCredentials] = useState<CredentialListItem[]>(
		loaderData.credentials,
	);
	const [nextCursor, setNextCursor] = useState<string | null>(
		loaderData.nextCursor,
	);
	const [hasMore, setHasMore] = useState(loaderData.hasMore);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	// Ref to prevent duplicate fetches while one is in flight
	const loadingRef = useRef(false);
	// Ref to keep the current IntersectionObserver so we can disconnect it
	const observerRef = useRef<IntersectionObserver | null>(null);

	const loadMore = useCallback(async () => {
		if (loadingRef.current || !nextCursor) return;
		loadingRef.current = true;
		setIsLoadingMore(true);
		setLoadError(null);

		try {
			const data = await getCredentialsListings(nextCursor);
			setCredentials((prev) => [...prev, ...data.credentials]);
			setNextCursor(data.nextCursor);
			setHasMore(data.hasMore);
		} catch (err) {
			setLoadError(
				err instanceof Error ? err.message : "Failed to load more credentials",
			);
		} finally {
			loadingRef.current = false;
			setIsLoadingMore(false);
		}
	}, [nextCursor]);

	// Set up the IntersectionObserver on the sentinel
	const sentinelCallback = useCallback(
		(node: HTMLDivElement | null) => {
			// Disconnect the previous observer before creating a new one
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

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			{/* Page header */}
			<div className="mb-8 flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Credentials</h1>
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

			{/* Credentials list */}
			{credentials.length === 0 ? (
				<div className="text-center py-24">
					<div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
						<span className="text-2xl text-muted-foreground/40">~</span>
					</div>
					<h3 className="text-base font-medium text-muted-foreground">
						No credentials yet
					</h3>
					<p className="text-sm text-muted-foreground/60 mt-1">
						Create your first credential to get started
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{credentials.map((cred) => (
						<CredentialCard key={cred.id} credential={cred} />
					))}
				</div>
			)}

			{/* Sentinel — observed by IntersectionObserver for infinite scroll */}
			{hasMore && credentials.length > 0 && (
				<div
					ref={sentinelCallback}
					className="flex justify-center py-8"
				>
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

			{/* Load error */}
			{loadError && (
				<div className="text-center py-6">
					<p className="text-sm text-destructive/80 mb-2">{loadError}</p>
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
			{!hasMore && credentials.length > 0 && (
				<div className="text-center py-8">
					<p className="text-xs text-muted-foreground/40">
						You've reached the end
					</p>
				</div>
			)}
		</div>
	);
}
