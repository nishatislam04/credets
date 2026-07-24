import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "#/components/ui/skeleton";

export const Route = createFileRoute("/credentials/draft/")({
	pendingComponent: () => (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			<div className="mb-8 flex items-start justify-between">
				<div>
					<Skeleton className="mb-2 h-8 w-32" />
					<Skeleton className="h-4 w-48" />
				</div>
			</div>
			<div className="space-y-3">
				{[...Array(5)].map((_, i) => (
					<Skeleton key={i} className="h-20 w-full rounded-xl" />
				))}
			</div>
		</div>
	),
});
