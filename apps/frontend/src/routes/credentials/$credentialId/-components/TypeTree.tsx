import { File, Folder } from "lucide-react";

export interface TypeTreeEntry {
	label: string;
	value: string;
}

interface TypeTreeProps {
	path: TypeTreeEntry[];
}

/**
 * Renders the credential's type hierarchy as a file-system-style tree.
 * Root type is shown as a folder, children are indented like sub-directories
 * using dynamic padding, and the leaf type is shown as a file icon.
 */
export function TypeTree({ path }: TypeTreeProps) {
	if (!path || path.length === 0) return null;

	return (
		<div className="rounded-xl border bg-card px-4 py-3 font-mono text-[13px]">
			{path.map((entry, idx) => {
				const isLeaf = idx === path.length - 1;
				const depth = idx;

				return (
					<div
						key={entry.value}
						className="flex items-center gap-2 py-1"
						style={{ paddingLeft: `${depth * 20}px` }}
					>
						{isLeaf ? (
							<File className="size-3.5 shrink-0 text-blue-500" />
						) : (
							<Folder className="size-3.5 shrink-0 text-amber-500" />
						)}

						<span
							className={
								isLeaf
									? "font-medium text-foreground"
									: "text-muted-foreground"
							}
						>
							{entry.label}
						</span>

						{!isLeaf && (
							<span className="text-muted-foreground/30">▸</span>
						)}
					</div>
				);
			})}
		</div>
	);
}
