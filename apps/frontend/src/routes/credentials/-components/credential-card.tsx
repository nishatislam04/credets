import { CalendarDays, ImageIcon, ChevronRight } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent } from "#/components/ui/card";
import { Link } from "@tanstack/react-router";

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
	type_label?: string | null;
	type_value?: string | null;
}

interface CredentialCardProps {
	credential: Credential;
}

/** Deterministic colours per type value */
const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
	credentials: {
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-700 dark:text-blue-300",
		dot: "bg-blue-500",
	},
	key: {
		bg: "bg-amber-100 dark:bg-amber-900/30",
		text: "text-amber-700 dark:text-amber-300",
		dot: "bg-amber-500",
	},
	api: {
		bg: "bg-purple-100 dark:bg-purple-900/30",
		text: "text-purple-700 dark:text-purple-300",
		dot: "bg-purple-500",
	},
	media: {
		bg: "bg-rose-100 dark:bg-rose-900/30",
		text: "text-rose-700 dark:text-rose-300",
		dot: "bg-rose-500",
	},
	game_loadout: {
		bg: "bg-emerald-100 dark:bg-emerald-900/30",
		text: "text-emerald-700 dark:text-emerald-300",
		dot: "bg-emerald-500",
	},
	misc: {
		bg: "bg-slate-100 dark:bg-slate-800/50",
		text: "text-slate-700 dark:text-slate-300",
		dot: "bg-slate-400",
	},
};

const defaultTypeColor = TYPE_COLORS.misc;

export function CredentialCard({ credential }: CredentialCardProps) {
	const {
		id,
		title,
		short_description,
		thumbnail_image_data,
		thumbnail_format,
		tags,
		created_at,
		type_label,
		type_value,
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

	const typeColor = TYPE_COLORS[type_value ?? ""] ?? defaultTypeColor;

	return (
		<Link
			to="/credentials/$credentialId"
			params={{ credentialId: id }}
			className="group block"
		>
			<Card className="overflow-hidden rounded-xl border shadow-xs transition-all duration-200 hover:shadow-sm hover:border-primary/15 hover:bg-muted/20 flex flex-row bg-card">
				{/* ── Left: Thumbnail ── */}
				<div className="shrink-0 flex items-center justify-center px-4 py-4 md:px-5 md:py-5">
					{imageSrc ? (
						<img
							src={imageSrc}
							alt={title}
							className="size-12 md:size-14 rounded-full object-cover ring-1 ring-border/40"
						/>
					) : (
						<div className="size-12 md:size-14 rounded-full bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5 ring-1 ring-border/30 flex items-center justify-center">
							<ImageIcon className="size-5 md:size-6 text-muted-foreground/30" />
						</div>
					)}
				</div>

				{/* ── Right: Content ── */}
				<CardContent className="flex flex-col min-w-0 grow gap-1.5 px-0 py-4 pr-4 md:pr-5">
					{/* Row 1: Title + Type badge */}
					<div className="flex items-center gap-2 min-w-0">
						<h3 className="font-semibold text-sm md:text-base leading-snug truncate group-hover:text-primary transition-colors duration-200">
							{title}
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
								{type_label}
							</Badge>
						)}
					</div>

					{/* Row 2: Short description */}
					{short_description && (
						<p className="text-xs leading-relaxed text-muted-foreground/80 line-clamp-2 overflow-hidden">
							{short_description}
						</p>
					)}

					{/* Row 3: Tags */}
					{tagList.length > 0 && (
						<div className="flex flex-wrap items-center gap-1 mt-0.5">
							{tagList.slice(0, 5).map((tag: string) => (
								<button
									key={tag}
									type="button"
									className="inline-flex items-center rounded-full bg-muted/60 px-2 py-0 h-4 text-[10px] font-medium text-muted-foreground/70 transition-colors duration-150 hover:bg-muted hover:text-foreground cursor-pointer border-0"
									title={`Search by tag: ${tag}`}
									onClick={(e) => {
										// Don't navigate to the credential detail when clicking a tag
										e.stopPropagation();
										// Search functionality TBD
									}}
								>
									#{tag}
								</button>
							))}
							{tagList.length > 5 && (
								<span className="text-[10px] text-muted-foreground/50 ml-0.5">
									+{tagList.length - 5}
								</span>
							)}
						</div>
					)}

					{/* Row 4: Date + Chevron */}
					<div className="flex items-center justify-between mt-0.5">
						<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
							<CalendarDays className="size-3" />
							<span>{formattedDate}</span>
						</div>
						<ChevronRight className="size-3.5 text-muted-foreground/20 transition-all duration-200 group-hover:text-primary/40 group-hover:translate-x-0.5" />
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
