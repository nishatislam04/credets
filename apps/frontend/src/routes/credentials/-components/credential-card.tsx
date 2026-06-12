import type { CredentialListItem } from "@credets/shared-types/credentials/listings";
import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, ImageIcon } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent } from "#/components/ui/card";
import { TYPE_COLORS, TAG_COLORS, hashString } from "../-utils/colors";

interface CredentialCardProps {
	credential: CredentialListItem;
}

export function CredentialCard({ credential }: CredentialCardProps) {
	const {
		id,
		title,
		short_description,
		thumbnail_url,
		tags,
		created_at,
		type_label,
		type_value,
	} = credential;

	const tagList = Array.isArray(tags) ? tags : [];

	const formattedDate = created_at
		? new Date(created_at).toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			})
		: "";

	const typeValue = type_value ?? "";
	const colorIndex = hashString(typeValue) % TYPE_COLORS.length;
	const typeColor = TYPE_COLORS[colorIndex];

	return (
		<Link to="/credentials/$credentialId" params={{ credentialId: id }} className="group block">
			<Card className="overflow-hidden rounded-xl border shadow-xs transition-all duration-200 hover:shadow-sm hover:border-primary/15 hover:bg-muted/20 flex flex-row bg-card py-2">
				{/* ── Left: Thumbnail ── */}
				<div className="shrink-0 flex items-center justify-center px-4 py-4 md:px-5 md:py-5">
					{thumbnail_url ? (
						<img
							src={thumbnail_url}
							alt={title}
							className="size-20 md:size-23 rounded-full object-cover ring-1 ring-border/40"
						/>
					) : (
						<div className="size-20 md:size-23 rounded-full bg-linear-to-br from-muted-foreground/10 to-muted-foreground/5 ring-1 ring-border/30 flex items-center justify-center">
							<ImageIcon className="size-5 md:size-6 text-muted-foreground/30" />
						</div>
					)}
				</div>

				{/* ── Right: Content ── */}
				<CardContent className="flex flex-col min-w-0 grow gap-1.5 px-0 py-4 pr-4 md:pr-5">
					{/* Row 1: Title + Type badge */}
					<div className="flex items-center gap-2 min-w-0">
						<h3 className="font-semibold text-lg md:text-xl leading-snug truncate group-hover:text-primary transition-colors duration-200">
							{title || "title not found"}
						</h3>
						{type_label && (
							<Badge
								variant="outline"
								className={`
									shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0 h-5 text-[10px] font-medium uppercase tracking-wider border-0
									${typeColor.bg} ${typeColor.text}
								`}
							>
								<span className={`inline-block size-1.5 rounded-full ${typeColor.dot}`} />
								{type_label || "label not found"}
							</Badge>
						)}
					</div>

					{/* Row 2: Short description */}
					<p className="text-xs leading-relaxed text-muted-foreground/80 line-clamp-2 overflow-hidden mt-4 whitespace-pre-wrap">
						{short_description || "no description provided"}
					</p>

					<div className="flex justify-between">
						{/* Row 3: Tags — using TAG_COLORS for consistent styling with detail page */}
						{tagList.length > 0 && (
							<div className="flex flex-wrap items-center gap-1 mt-2">
								{tagList.slice(0, 5).map((tag: string) => {
									const color = TAG_COLORS[tag.length % TAG_COLORS.length];
									return (
										<span
											key={tag}
											className={`inline-flex items-center rounded-full px-2 py-0 h-4 text-[10px] font-medium transition-colors duration-150 border-0 ${color.bg} ${color.text}`}
										>
											#{tag}
										</span>
									);
								})}
								{tagList.length > 5 && (
									<span className="text-[10px] text-muted-foreground/50 ml-0.5">
										+{tagList.length - 5}
									</span>
								)}
							</div>
						)}

						{/* Row 4: Date + Chevron */}
						<div className="flex items-center justify-between ml-auto">
							<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
								<CalendarDays className="size-3" />
								<span>{formattedDate}</span>
							</div>
							<ChevronRight className="size-3.5 text-muted-foreground/20 transition-all duration-200 group-hover:text-primary/40 group-hover:translate-x-0.5" />
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
