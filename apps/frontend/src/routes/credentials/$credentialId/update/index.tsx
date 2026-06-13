import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "#/components/ui/skeleton";
import { getCredentialUpdate } from "./-actions/getCredentialUpdate";
import { getCSRFtoken } from "#/routes/credentials/create/-actions/getCSRFtoken";

export const Route = createFileRoute("/credentials/$credentialId/update/")({
	loader: async ({ params }) => {
		const [credential, csrfRes] = await Promise.all([
			getCredentialUpdate(params.credentialId),
			getCSRFtoken(),
		]);
		// Cache-bust thumbnail URL so the browser re-fetches the image
		// when the credential is updated (S3 key is deterministic).
		if (credential.thumbnail_url && credential.updated_at) {
			credential.thumbnail_url = `${credential.thumbnail_url}?v=${Date.parse(credential.updated_at)}`;
		}
		return { credential, csrfToken: csrfRes.data.token };
	},
	pendingComponent: () => (
		<div className="mx-auto w-full max-w-3xl px-4 py-10">
			<Skeleton className="mb-8 h-6 w-24 rounded-lg" />
			<div className="space-y-6">
				<Skeleton className="h-12 w-full rounded-xl" />
				<Skeleton className="h-12 w-full rounded-xl" />
				<div className="grid grid-cols-2 gap-6">
					<Skeleton className="h-40 w-full rounded-xl" />
					<Skeleton className="h-40 w-full rounded-xl" />
				</div>
				<Skeleton className="h-64 w-full rounded-xl" />
				<Skeleton className="h-12 w-full rounded-xl" />
			</div>
		</div>
	),
	errorComponent: ({ error }) => (
		<div className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
			<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10">
				<span className="text-2xl text-destructive">!</span>
			</div>
			<h2 className="mb-2 text-lg font-semibold">Failed to load credential</h2>
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
	),
});
