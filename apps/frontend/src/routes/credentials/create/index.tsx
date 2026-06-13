import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LoaderIcon } from "lucide-react";
import { Item, ItemContent, ItemMedia, ItemTitle } from "#/components/ui/item";
import { getCSRFtoken } from "./-actions/getCSRFtoken";

export const Route = createFileRoute("/credentials/create/")({
	loader: async () => {
		const res = await getCSRFtoken();
		return res.data.token;
	},
	pendingComponent: () => (
		<Item>
			<ItemMedia variant="icon">
				<LoaderIcon />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>Preparing form...</ItemTitle>
			</ItemContent>
		</Item>
	),
	errorComponent: ({ error }) => (
		<div className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
			<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10">
				<span className="text-2xl text-destructive">!</span>
			</div>
			<h2 className="mb-2 text-lg font-semibold">Failed to load form</h2>
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
