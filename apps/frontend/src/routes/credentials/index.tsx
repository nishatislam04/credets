import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "#/components/ui/skeleton";

export const Route = createFileRoute("/credentials/")({
	pendingComponent: () => (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			<div className="mb-8 flex items-start justify-between">
				<div>
					<Skeleton className="mb-2 h-8 w-40" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-24 rounded-lg" />
			</div>
			<div className="space-y-3">
				{[...Array(12)].map((_) => (
					<Skeleton key={crypto.randomUUID()} className="h-24 w-full rounded-xl" />
				))}
			</div>
		</div>
	),
});
