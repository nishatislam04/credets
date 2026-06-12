import type { CredentialDetail } from "@credets/shared-types/credentials/listings";
import { CalendarDays, Clock, ImageIcon } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { hashString, TYPE_COLORS } from "../../-utils/colors";
import { formatDate } from "../-utils/formatDate";
import { formatTimeAgo } from "../-utils/formatTImeAgo";

export function Header({
	thumbnailUri,
	openLightbox,
	credential,
}: {
	thumbnailUri: string | null;
	openLightbox: (index: number) => void;
	credential: CredentialDetail;
}) {
	const typeValue = credential.type_value ?? "";
	const colorIndex = hashString(typeValue) % TYPE_COLORS.length;

	const typeColor = TYPE_COLORS[colorIndex];
	return (
		<div className="h-30 mb-10 flex items-start gap-5">
			{/* Thumbnail on the left */}
			{thumbnailUri ? (
				<button
					type="button"
					onClick={() => openLightbox(0)}
					className="group shrink-0 overflow-hidden rounded-xl ring-1 ring-border/40 transition-all duration-200 hover:ring-primary/30 hover:shadow-md cursor-pointer border-0"
				>
					<img
						src={thumbnailUri}
						alt={credential.title}
						className="size-24 object-cover transition-transform duration-300 sm:size-28"
					/>
				</button>
			) : (
				<div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-muted/60 ring-1 ring-border/60 sm:size-28">
					<ImageIcon className="size-8 text-muted-foreground/40" />
				</div>
			)}

			{/* Title + badge + dates on the right */}
			<div className="flex-1 min-h-full">
				<div className="flex flex-wrap items-center gap-3 mb-2">
					<h1 className="text-4xl font-bold tracking-tight leading-tight wrap-break-words">
						{credential.title}
					</h1>
					{credential.type_label && (
						<Badge
							variant="outline"
							className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border-0 ${typeColor.bg} ${typeColor.text}`}
						>
							<span className={`inline-block size-2 rounded-full ${typeColor.dot}`} />
							{credential.type_label}
						</Badge>
					)}
				</div>

				{/* Date row */}
				<div className="flex items-start gap-4 text-xs text-muted-foreground/60 mt-4 pb-4">
					<div className="flex items-center gap-1.5">
						<CalendarDays className="size-3.5" />
						<span>Created {formatDate(credential.created_at)}</span>
						<span className="text-muted-foreground/30">(</span>
						<Clock className="size-3" />
						<span>{formatTimeAgo(credential.created_at)}</span>
						<span className="text-muted-foreground/30">)</span>
					</div>
					{credential.updated_at && credential.updated_at !== credential.created_at && (
						<div className="flex items-center gap-1.5">
							<span className="text-muted-foreground/20">·</span>
							<span>Updated {formatTimeAgo(credential.updated_at)}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
