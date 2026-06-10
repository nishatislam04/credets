import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LoaderIcon, Plus } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ThemeToggle } from "#/components/theme-toggle";
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
		data,
		isLoading,
		isError,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isRefetching,
	} = useInfiniteQuery({
		queryKey: ["credentials-listings"],
		queryFn: ({ pageParam }) =>
			getCredentialsListings(pageParam as string | undefined | null),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	const { ref: sentinelRef, inView } = useInView({ rootMargin: "200px" });

	// Auto-fetch the next page when the sentinel element enters the viewport
	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage && !isError) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

	// Flatten all pages into a single array of credentials
	const credentials = data?.pages.flatMap((page) => page.credentials) ?? [];

	// Distinguish initial load error from load-more error
	const isInitialError = isError && !data?.pages?.length;
	const isLoadMoreError = isError && (data?.pages?.length ?? 0) > 0;

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

			{/* Initial load error state */}
			{isInitialError && (
				<CredentialsErrorUI
					error={error instanceof Error ? error : new Error("Failed to load credentials")}
				/>
			)}

			{/* Empty state */}
			{!isError && credentials.length === 0 && (
				<div className="text-center py-24">
					<CredentialsEmptyState />
				</div>
			)}

			{/* Credentials list */}
			{!isInitialError && credentials.length > 0 && (
				<>
					<div className="space-y-3">
						{credentials.map((cred, idx) => (
							<div
								key={cred.id}
								className="animate-in fade-in slide-in-from-bottom-3 duration-200"
								style={{
									animationDelay: `${Math.min(idx * 30, 300)}ms`,
									animationFillMode: "backwards",
								}}
							>
								<CredentialCard credential={cred} />
							</div>
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
								error instanceof Error ? error.message : "Failed to load more credentials"
							}
							loadMore={() => fetchNextPage()}
						/>
					)}
				</>
			)}
		</div>
	);
}
