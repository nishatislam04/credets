import { CalendarDays, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Credential {
	id: string;
	title: string;
	short_description?: string | null;
	thumbnail_image_data?: string | null; // base64 string (without header)
	thumbnail_format?: string | null; // e.g. 'png', 'jpeg'
	thumbnail_width?: number | null;
	thumbnail_height?: number | null;
	tags?: string[]; // JSONB: array of strings or object
	created_at: string; // ISO timestamp
}

interface CredentialCardProps {
	credential: Credential;
}

export function CredentialCard({ credential }: CredentialCardProps) {
	const {
		title,
		short_description,
		thumbnail_image_data,
		thumbnail_format,
		tags,
		created_at,
	} = credential;

	// Build image source if thumbnail data exists
	const imageSrc =
		thumbnail_image_data && thumbnail_format
			? `data:image/${thumbnail_format};base64,${thumbnail_image_data}`
			: null;

	// Parse tags: could be string[], null, or JSON string
	const tagList = Array.isArray(tags) ? tags : [];

	// Format created date
	const formattedDate = created_at
		? new Date(created_at).toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			})
		: "";

	return (
		<Card className="overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] flex flex-col h-full">
			{/* Thumbnail area - responsive with aspect ratio */}
			<div className="relative w-full bg-muted aspect-video">
				{imageSrc ? (
					<img
						src={imageSrc}
						alt={title}
						className="absolute inset-0 w-full h-full object-cover"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
						<ImageIcon className="w-10 h-10 opacity-40" />
					</div>
				)}
			</div>

			<CardContent className="flex flex-col grow p-4 space-y-2">
				{/* Title */}
				<h3 className="font-semibold text-lg leading-tight line-clamp-2">{title}</h3>

				{/* Short description */}
				{short_description && (
					<p className="text-sm text-muted-foreground line-clamp-2">
						{short_description}
					</p>
				)}

				{/* Tags */}
				{tagList.length > 0 && (
					<div className="flex flex-wrap gap-1.5 pt-1">
						{tagList.map((tag: string) => (
							<Badge key={crypto.randomUUID()} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
					</div>
				)}

				{/* Created at */}
				<div className="flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
					<CalendarDays className="w-3.5 h-3.5" />
					<span>{formattedDate}</span>
				</div>
			</CardContent>
		</Card>
	);
}
