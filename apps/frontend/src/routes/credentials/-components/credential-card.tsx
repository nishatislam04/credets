import { CalendarDays, ImageIcon, ChevronRight } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent } from "#/components/ui/card";
import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

interface Credential {
	id: string;
	title: string;
	short_description?: string | null;
	thumbnail_image_data?: string | null;
	thumbnail_format?: string | null;
	thumbnail_width?: number | null;
	thumbnail_height?: number | null;
	tags?: string[] | null;
	created_at: string;
}

interface CredentialCardProps {
	credential: Credential;
}

export function CredentialCard({ credential }: CredentialCardProps) {
	const {
		id,
		title,
		short_description,
		thumbnail_image_data,
		thumbnail_format,
		tags,
		created_at,
	} = credential;

	const imageSrc =
		thumbnail_image_data && thumbnail_format
			? `data:image/${thumbnail_format};base64,${thumbnail_image_data}`
			: null;

	const tagList = Array.isArray(tags) ? tags : [];

	const formattedDate = created_at
		? new Date(created_at).toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			})
		: "";

	return (
		<Link
			to="/credentials/$credentialId"
			params={{ credentialId: id }}
			className="group block"
		>
			<Card className="overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 flex flex-col h-full bg-card">
				{/* Thumbnail */}
				<div className="relative w-full aspect-[16/9] bg-gradient-to-br from-muted/80 to-muted overflow-hidden">
					{imageSrc ? (
						<img
							src={imageSrc}
							alt={title}
							className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="size-14 rounded-full bg-muted-foreground/10 flex items-center justify-center">
								<ImageIcon className="size-6 text-muted-foreground/40" />
							</div>
						</div>
					)}

					{/* Gradient overlay at bottom of image for text readability */}
					<div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/60 to-transparent" />
				</div>

				<CardContent className="flex flex-col grow p-4 pt-3 space-y-2.5">
					{/* Title */}
					<h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
						{title}
					</h3>

					{/* Short description */}
					{short_description && (
						<p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
							{short_description}
						</p>
					)}

					{/* Spacer */}
					<div className="grow" />

					{/* Tags */}
					{tagList.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{tagList.slice(0, 3).map((tag: string) => (
								<Badge
									key={tag}
									variant="secondary"
									className="text-[10px] px-1.5 py-0 h-4 rounded-full font-normal"
								>
									{tag}
								</Badge>
							))}
							{tagList.length > 3 && (
								<span className="text-[10px] text-muted-foreground/60 self-center">
									+{tagList.length - 3}
								</span>
							)}
						</div>
					)}

					{/* Footer */}
					<div
						className={cn(
							"flex items-center justify-between pt-2 border-t border-border/40",
							!tagList.length && "pt-2",
						)}
					>
						<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
							<CalendarDays className="size-3" />
							<span>{formattedDate}</span>
						</div>
						<ChevronRight className="size-3.5 text-muted-foreground/30 transition-all duration-200 group-hover:text-primary/60 group-hover:translate-x-0.5" />
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
