import { KeyRound, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CredentialsEmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-24">
			{/* Large icon with gradient background */}
			<div className="relative mb-8">
				<div className="size-32 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center ring-1 ring-primary/20">
					<KeyRound className="size-14 text-primary/60" />
				</div>
				{/* Decorative dots */}
				<span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary/30 animate-pulse" />
				<span className="absolute -bottom-2 -left-1 size-2 rounded-full bg-primary/20" />
			</div>

			{/* Title */}
			<h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
				No credentials yet
			</h2>

			{/* Description */}
			<p className="text-base text-muted-foreground/70 max-w-md text-center leading-relaxed mb-10">
				Your credential vault is empty. Create your first entry to securely
				store and organize your logins, keys, and secrets in one place.
			</p>

			{/* CTA */}
			<Link
				to="/credentials/create"
				className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
			>
				<Plus className="size-5" />
				Create your first credential
			</Link>

			{/* Hint */}
			<p className="mt-6 text-xs text-muted-foreground/40">
				You can store logins, API keys, notes, and more
			</p>
		</div>
	);
}
