import { Link } from "@tanstack/react-router";
import { LoaderIcon, Plus } from "lucide-react";
import { ThemeToggle } from "#/components/theme-toggle";
import { Skeleton } from "#/components/ui/skeleton";

export function TopHeader({
	isLoading,
	credentialsLength,
	isRefetching,
}: {
	isLoading: boolean;
	credentialsLength: number;
	isRefetching: boolean;
}) {
	if (credentialsLength === 0) return null;

	return (
		<div className="mb-8 flex items-start justify-between">
			<div>
				<header className="">
					<section className="flex">
						<h1 className="text-2xl font-bold tracking-tight">Credentials</h1>
						<ThemeToggle />
					</section>
					<p className="text-sm text-muted-foreground mt-1">
						Browse your saved credentials, keys, and secrets
					</p>
				</header>

				{/* skeleon load the credential length */}
				{isLoading && <Skeleton className="h-4 w-18 mt-3" />}
				{/* Show count + spinner when credentials exist and not initial loading */}
				{credentialsLength > 0 && !isLoading && (
					<div className="flex items-center gap-2 mt-2">
						<p className="text-xs text-muted-foreground/50">
							{credentialsLength} credential
							{credentialsLength !== 1 ? "s" : ""}
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
	);
}
