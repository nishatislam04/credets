import { Badge } from "#/components/ui/badge";
import { TAG_COLORS } from "../../-utils/colors";

export function TagListColorShared({
	tags,
	limit,
}: {
	tags: string[] | null;
	limit?: number;
}) {
	if (
		!Array.isArray(tags) ||
		tags === null ||
		tags.length === 0 ||
		tags.length < 0
	)
		return;

	if (limit) {
		return (
			<>
				{tags.slice(0, limit).map((tag: string) => (
					<Tag key={tag} tag={tag} />
				))}
				<RestTagsItems length={tags.length} limit={limit} />
			</>
		);
	} else return tags.map((tag: string) => <Tag key={tag} tag={tag} />);
}

function Tag({ tag }: { tag: string }) {
	const color = TAG_COLORS[tag.length % TAG_COLORS.length];
	return (
		<Badge
			className={`rounded-full text-[10px] font-medium border-0 ${color.bg} ${color.text}`}
		>
			{tag}
		</Badge>
	);
}

function RestTagsItems({ length, limit }: { length: number; limit: number }) {
	return (
		<span className="text-[10px] text-muted-foreground/50 ml-0.5">
			+{length - limit}
		</span>
	);
}
