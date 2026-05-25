import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Skeleton } from "#/components/ui/skeleton";
import { CredentialCard } from "./-components/credential-card";
import { getCredentialsListings } from "./-actions/getCredentialsListings";	export const Route = createFileRoute("/credentials/")({
	component: RouteComponent,
	loader: async () => getCredentialsListings(),
	pendingComponent: () => (
		<div className="container mx-auto px-4 py-8">
			{/* Page title */}
			<div className="mb-8">
				<Skeleton className="h-8 w-48 rounded-lg" />
				<Skeleton className="h-4 w-72 mt-2 rounded-lg" />
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{Array.from({ length: 12 }).map((_, i) => (
					<div key={i} className="rounded-2xl border overflow-hidden">
						<Skeleton className="aspect-[16/9] w-full rounded-none" />
						<div className="p-4 space-y-3">
							<Skeleton className="h-5 w-3/4 rounded-lg" />
							<Skeleton className="h-3 w-full rounded-lg" />
							<Skeleton className="h-3 w-1/2 rounded-lg" />
							<div className="flex gap-1.5 pt-1">
								<Skeleton className="h-4 w-14 rounded-full" />
								<Skeleton className="h-4 w-16 rounded-full" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	),
	errorComponent: ({ error }) => (
		<div className="container mx-auto px-4 py-16 text-center">
			<div className="max-w-md mx-auto">
				<div className="size-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
					<span className="text-2xl">!</span>
				</div>
				<h2 className="text-lg font-semibold mb-2">Failed to load credentials</h2>
				<p className="text-sm text-muted-foreground">
					{error?.message || "Something went wrong. Please try again later."}
				</p>
			</div>
		</div>
	),
});

function RouteComponent() {
	const { credentials } = useLoaderData({ from: "/credentials/" });

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Page header */}
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">Credentials</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Browse your saved credentials, keys, and secrets
				</p>
			</div>

			{/* Credentials grid */}
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
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{credentials.map((cred) => (
						<CredentialCard key={cred.id} credential={cred} />
					))}
				</div>
			)}

			{/* Simple load-more button (infinite scroll will replace this later) */}
			{credentials.length > 0 && credentials.length >= 12 && (
				<div className="mt-10 text-center">
					<p className="text-xs text-muted-foreground/50">
						Scroll-based loading coming soon
					</p>
				</div>
			)}
		</div>
	);
}
