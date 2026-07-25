import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";

export function TopHeader({ credentialId }: { credentialId: string }) {
	const router = useRouter();

	return (
		<div className="mb-8 flex items-center justify-between">
			<button
				type="button"
				onClick={() => router.history.back()}
				className="group inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors"
			>
				<ArrowLeft className="size-6 transition-transform duration-200 group-hover:-translate-x-0.5" />
			</button>
			<Link
				to="/credentials/$credentialId/update"
				params={{ credentialId }}
				className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3.5 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 shadow-sm transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-md active:scale-[0.97]"
			>
				<Pencil className="size-3" />
				Update
			</Link>
		</div>
	);
}
