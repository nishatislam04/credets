import type { CredentialDetail } from "@credets/shared-types/credentials/listings";
import { Check, Copy, FileText, Info, Tag, FolderTree } from "lucide-react";
import { useState } from "react";
import { Badge } from "#/components/ui/badge";
import { TAG_COLORS } from "../../-utils/colors";
import { TypeTree } from "../-components/TypeTree";

export function Sidebar({ credential }: { credential: CredentialDetail }) {
	const [copiedId, setCopiedId] = useState(false);
	const tagList = Array.isArray(credential.tags) ? credential.tags : [];

	return (
		<div className="space-y-12 mt-12 xl:mt-0">
			{/* ID reference — first */}
			<section>
				<div className="mb-2.5 flex items-center gap-2">
					<Info className="size-4.5" />
					<h2 className="text-base font-semibold uppercase tracking-wider">ID</h2>
				</div>
				<button
					className="flex cursor-pointer items-center gap-2 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-blue-50/50"
					onClick={() => {
						navigator.clipboard.writeText(credential.id).then(() => {
							setCopiedId(true);
							setTimeout(() => setCopiedId(false), 1500);
						});
					}}
					type="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							navigator.clipboard.writeText(credential.id).then(() => {
								setCopiedId(true);
								setTimeout(() => setCopiedId(false), 1500);
							});
						}
					}}
				>
					<code className="flex-1 text-[12px] font-mono text-muted-foreground/60 break-all select-all">
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
						<h2 className="text-base font-semibold uppercase tracking-wider">Type</h2>
					</div>
					<TypeTree path={credential.type_path} />
				</section>
			)}

			{/* Notes — third */}
			{credential.notes && (
				<section className="mt-4">
					<div className="mb-2.5 flex items-center gap-2">
						<FileText className="size-4.5" />
						<h2 className="text-base font-semibold uppercase tracking-wider">Notes</h2>
					</div>
					<div className="rounded-xl border bg-card px-4 py-3">
						<p className="text-sm leading-relaxed text-card-foreground/80 whitespace-pre-wrap">
							{credential.notes}
						</p>
					</div>
				</section>
			)}

			{/* Tags — last, colorful badges */}
			{tagList.length > 0 && (
				<section className="mt-4">
					<div className="mb-2.5 flex items-center gap-2">
						<Tag className="size-4.5" />
						<h2 className="text-base font-semibold uppercase tracking-wider">Tags</h2>
					</div>
					<div className="flex flex-wrap gap-1.5">
						{tagList.map((tag: string) => {
							const color = TAG_COLORS[tag.length % TAG_COLORS.length];
							return (
								<Badge
									key={tag}
									className={`rounded-full text-[10px] font-medium border-0 ${color.bg} ${color.text}`}
								>
									{tag}
								</Badge>
							);
						})}
					</div>
				</section>
			)}
		</div>
	);
}
