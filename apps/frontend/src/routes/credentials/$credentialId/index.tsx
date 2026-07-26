import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileQuestion, TriangleAlert } from "lucide-react";
import { Skeleton } from "#/components/ui/skeleton";
import { getCredential, NotFoundError } from "./-actions/getCredential";

export const Route = createFileRoute("/credentials/$credentialId/")({
	loader: async ({ params }) => {
		const credential = await getCredential(params.credentialId);
		// Add cache-busting version to thumbnail URL so the browser
		// re-fetches the image when the credential is updated (the S3 key
		// is deterministic so the URL never changes between updates).
		if (credential.thumbnail_url && credential.updated_at) {
			credential.thumbnail_url = `${credential.thumbnail_url}?v=${Date.parse(credential.updated_at)}`;
		}
		return credential;
	},
	pendingComponent: () => (
		<div className="mx-auto w-full max-w-5xl px-4 py-10">
			<Skeleton className="mb-8 h-6 w-24 rounded-lg" />
			<div className="mb-3 flex items-start gap-4">
				<Skeleton className="size-20 shrink-0 rounded-xl" />
				<div className="min-w-0 flex-1 space-y-2">
					<Skeleton className="h-9 w-3/4 rounded-lg" />
					<Skeleton className="h-5 w-48 rounded-lg" />
				</div>
			</div>
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<Skeleton className="h-40 w-full rounded-xl" />
					<Skeleton className="h-52 w-full rounded-xl" />
					<Skeleton className="h-48 w-full rounded-xl" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-32 w-full rounded-xl" />
					<Skeleton className="h-28 w-full rounded-xl" />
				</div>
			</div>
		</div>
	),
	errorComponent: ({ error }) => {
		const isNotFound = error instanceof NotFoundError;

		if (isNotFound) {
			return (
				<div className="mx-auto w-full max-w-md px-4 py-32 text-center">
					<div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-muted/50 ring-1 ring-border/30">
						<FileQuestion className="size-10 text-muted-foreground/40" />
					</div>
					<h2 className="mb-2 text-2xl font-bold tracking-tight">
						Credential not found
					</h2>
					<p className="mb-8 text-sm text-muted-foreground/70 leading-relaxed max-w-sm mx-auto">
						The credential you&rsquo;re looking for doesn&rsquo;t exist or may
						have been deleted. Check the URL or browse your credentials list.
					</p>
					<Link
						to="/credentials"
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
					>
						<ArrowLeft className="size-4" />
						Back to credentials
					</Link>
				</div>
			);
		}

		return (
			<div className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
				<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10">
					<TriangleAlert className="size-8 text-destructive" />
				</div>
				<h2 className="mb-2 text-lg font-semibold">
					Failed to load credential
				</h2>
				<p className="mb-6 text-sm text-muted-foreground">
					{error?.message || "Something went wrong. Please try again later."}
				</p>
				<Link
					to="/credentials"
					className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
				>
					<ArrowLeft className="size-3.5" />
					Back to credentials
				</Link>
			</div>
		);
	},
});
