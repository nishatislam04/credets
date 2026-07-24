import type { CredentialDetail } from "@credets/shared-types/credentials/listings";
import { useQueryClient } from "@tanstack/react-query";
import {
	Check,
	Copy,
	FileText,
	FolderTree,
	GitBranch,
	Info,
	Settings,
	Tag,
} from "lucide-react";
import { useState } from "react";
import {
	isContentEmpty,
	RichTextRenderer,
} from "#/components/ui/rich-text-renderer";
import { Switch } from "#/components/ui/switch";
import { TypeTree } from "../-components/TypeTree";
import { TagListColorShared } from "../-shared/tagListColorShared";
import { DeleteButton } from "./delete-dialog";

export function Sidebar({ credential }: { credential: CredentialDetail }) {
	const [copiedId, setCopiedId] = useState(false);
	const [isDraft, setIsDraft] = useState(credential.is_draft);
	const [isFavourite, setIsFavourite] = useState(credential.is_favourite);
	const [togglingField, setTogglingField] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const handleToggle = async (field: "is_draft" | "is_favourite", value: boolean) => {
		setTogglingField(field);
		// Optimistic update
		if (field === "is_draft") setIsDraft(value);
		if (field === "is_favourite") setIsFavourite(value);

		try {
			const res = await fetch(
				`${import.meta.env.VITE_BACKEND_APP}/credentials/${credential.id}/toggle`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ [field]: value }),
				},
			);

			if (!res.ok) {
				// Revert on failure
				if (field === "is_draft") setIsDraft(!value);
				if (field === "is_favourite") setIsFavourite(!value);
			} else {
				// Invalidate listings cache so the listing page shows updated state
				queryClient.invalidateQueries({ queryKey: ["credentials-listings"] });
			}
		} catch {
			// Revert on error
			if (field === "is_draft") setIsDraft(!value);
			if (field === "is_favourite") setIsFavourite(!value);
		} finally {
			setTogglingField(null);
		}
	};

	// const tagList = Array.isArray(credential.tags) ? credential.tags : [];

	return (
		<div className="space-y-12 mt-12 xl:mt-0">
			{/* Actions — always visible */}
			<section>
				<div className="mb-2.5 flex items-center gap-2">
					<Settings className="size-4.5" />
					<h2 className="text-base font-semibold uppercase tracking-wider">
						Actions
					</h2>
				</div>
				<div className="space-y-3 rounded-xl border bg-card px-4 py-3">
					{/* Draft toggle */}
					<label className="flex items-center gap-3 cursor-pointer">
						<Switch
							checked={isDraft}
							onCheckedChange={(checked) =>
								handleToggle("is_draft", checked)
							}
							disabled={togglingField === "is_draft"}
						/>
						<span className="text-sm text-muted-foreground/80">Draft</span>
					</label>
					{/* Favourite toggle */}
					<label className="flex items-center gap-3 cursor-pointer">
						<Switch
							checked={isFavourite}
							onCheckedChange={(checked) =>
								handleToggle("is_favourite", checked)
							}
							disabled={togglingField === "is_favourite"}
						/>
						<span className="text-sm text-muted-foreground/80">Favourite</span>
					</label>
				</div>
			</section>
			{/* Version — first */}
			<section className="mt-4">
				<div className="mb-2.5 flex items-center gap-2">
					<GitBranch className="size-4.5" />
					<h2 className="text-base font-semibold uppercase tracking-wider">
						Version
					</h2>
				</div>
				<div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3">
					<span className="inline-flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
						{credential.version}
					</span>
					<span className="text-sm text-muted-foreground/60">
						{credential.version === 0
							? "Initial version"
							: `Updated ${credential.version} time${credential.version === 1 ? "" : "s"}`}
					</span>
				</div>
			</section>

			{/* ID reference — second */}
			<section>
				<div className="mb-2.5 flex items-center gap-2">
					<Info className="size-4.5" />
					<h2 className="text-base font-semibold uppercase tracking-wider">
						ID
					</h2>
				</div>
				<button
					className="flex cursor-pointer items-center gap-2 rounded-xl border bg-card px-3  w-full xl:w-90 py-5 transition-colors"
					onClick={() => {
						navigator.clipboard.writeText(credential.id).then(() => {
							setCopiedId(true);
							setTimeout(() => setCopiedId(false), 1500);
						});
					}}
					type="button"
					tabIndex={0}
				>
					<code className="px-4 text-[12px] font-mono text-muted-foreground/60 break-all select-all">
						{credential.id}
					</code>
					{copiedId ? (
						<Check className="size-3.5 shrink-0 text-emerald-500" />
					) : (
						<Copy className="size-3.5 shrink-0 text-muted-foreground/30" />
					)}
				</button>
			</section>

			{/* Type hierarchy — second */}
			{credential.type_path && credential.type_path.length > 0 && (
				<section className="mt-4">
					<div className="mb-2.5 flex items-center gap-2">
						<FolderTree className="size-4.5" />
						<h2 className="text-base font-semibold uppercase tracking-wider">
							Type
						</h2>
					</div>
					<TypeTree path={credential.type_path} />
				</section>
			)}

			{/* Notes — third */}
			{!isContentEmpty(credential.notes) && (
				<section className="mt-4">
					<div className="mb-2.5 flex items-center gap-2">
						<FileText className="size-4.5" />
						<h2 className="text-base font-semibold uppercase tracking-wider">
							Notes
						</h2>
					</div>
					<div className="rounded-xl border bg-card px-4 py-3">
						<RichTextRenderer
							content={credential.notes}
							className="text-sm leading-relaxed text-card-foreground/80"
						/>
					</div>
				</section>
			)}

			{/* Tags — last, colorful badges */}
			{Array.isArray(credential.tags) && credential.tags.length > 0 && (
				<section className="mt-4">
					<div className="mb-2.5 flex items-center gap-2">
						<Tag className="size-4.5" />
						<h2 className="text-base font-semibold uppercase tracking-wider">
							Tags
						</h2>
					</div>
					<div className="flex flex-wrap gap-1.5">
						<TagListColorShared tags={credential.tags} />
					</div>
				</section>
			)}

			{/* Delete — always at the bottom */}
			<section className="pt-6 border-t border-border/40">
				<DeleteButton
					credentialId={credential.id}
					credentialTitle={credential.title}
				/>
			</section>
		</div>
	);
}
