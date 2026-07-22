import { useInfiniteQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { LoaderIcon } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "#/components/ui/skeleton";
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
