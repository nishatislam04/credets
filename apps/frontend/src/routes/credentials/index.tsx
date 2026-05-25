import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Skeleton } from "#/components/ui/skeleton";
import { CredentialCard } from "./-components/credential-card";
import { getCredentialsListings } from "./-actions/getCredentialsListings";

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
	const { credentials } = useLoaderData({ from: "/credentials/" });

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-8">
			{/* Page header */}
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">Credentials</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Browse your saved credentials, keys, and secrets
				</p>
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

			{/* Load-more indicator (placeholder for future infinite scroll) */}
			{credentials.length > 0 && credentials.length >= 12 && (
				<div className="mt-8 text-center">
					<p className="text-xs text-muted-foreground/50">
						Scroll-based loading coming soon
					</p>
				</div>
			)}
		</div>
	);
}
