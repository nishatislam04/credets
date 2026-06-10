// this render for the first fetching data

import { Skeleton } from "#/components/ui/skeleton";

export function CredentialListingsSkeleton({ isLoading }: { isLoading: boolean }) {
	return isLoading ? (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			<div className="mb-8 flex items-start justify-between">
				<div>
					<Skeleton className="h-8 w-40 mb-2" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-24 rounded-lg" />
			</div>
			<div className="space-y-3">
				{[...Array(12)].map((_, i) => (
					<Skeleton key={i} className="h-24 w-full rounded-xl" />
				))}
			</div>
		</div>
	) : (
		<p>something went wrong while fetching</p>
	);
}
