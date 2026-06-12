import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxList,
	ComboboxItem,
	ComboboxEmpty,
} from "#/components/ui/combobox";
import { getTypeChildren, type TypeChild } from "#/routes/credentials/-actions/getTypeChildren";
import { getTypesListings } from "#/routes/credentials/create/-actions/getTypesListings";

export interface TypePathEntry {
	value: string;
	label: string;
}

interface TypeSelectorProps {
	types: TypePathEntry[];
	onTypesChange: (types: TypePathEntry[]) => void;
}

interface ComboboxItemOption {
	id: string;
	value: string;
	label: string;
	isNew?: boolean;
}

/**
 * TypeSelector allows users to select or create hierarchical types.
 * Each level uses a shadcn combobox. Clicking "+" adds a new level.
 * Changing a parent level resets all deeper levels.
 */
export function TypeSelector({ types, onTypesChange }: TypeSelectorProps) {
	// Track how many levels the user has expanded via the "+" button
	const [expandedLevels, setExpandedLevels] = useState(0);

	// How many combobox instances to show
	const levelsToShow = Math.max(1, types.length + 1, expandedLevels + 1);

	const handleLevelChange = useCallback(
		(levelIndex: number, entry: TypePathEntry | null) => {
			if (!entry) {
				onTypesChange(types.slice(0, levelIndex));
				return;
			}
			const newTypes = [...types.slice(0, levelIndex), entry];
			onTypesChange(newTypes);
		},
		[types, onTypesChange],
	);

	const handleAddLevel = useCallback(() => {
		setExpandedLevels((prev) => prev + 1);
	}, []);

	return (
		<div className="flex flex-col gap-2">
			{Array.from({ length: levelsToShow }).map((_, levelIndex) => (
				<TypeLevel
					key={levelIndex}
					levelIndex={levelIndex}
					parentValue={levelIndex > 0 ? types[levelIndex - 1]?.value : undefined}
					currentType={types[levelIndex] ?? null}
					onChange={(entry) => handleLevelChange(levelIndex, entry)}
					isLastVisible={levelIndex === levelsToShow - 1}
					onAddLevel={handleAddLevel}
				/>
			))}
		</div>
	);
}

// ── Individual type level ───────────────────────────────────────────

interface TypeLevelProps {
	levelIndex: number;
	parentValue: string | undefined;
	currentType: TypePathEntry | null;
	onChange: (entry: TypePathEntry | null) => void;
	isLastVisible: boolean;
	onAddLevel: () => void;
}

function TypeLevel({
	levelIndex,
	parentValue,
	currentType,
	onChange,
	isLastVisible,
	onAddLevel,
}: TypeLevelProps) {
	const [inputValue, setInputValue] = useState("");

	// ── Fetch options for this level ──
	const { data: options = [], isLoading: isOptionsLoading } = useQuery({
		queryKey: levelIndex === 0 ? ["types_listings"] : ["type_children", parentValue],
		queryFn: async () => {
			if (levelIndex === 0) {
				const res = await getTypesListings();
				return (res?.data ?? []) as TypeChild[];
			}
			if (!parentValue) return [];
			return getTypeChildren(parentValue);
		},
		enabled: levelIndex === 0 || !!parentValue,
	});

	// ── Build items for the combobox ──
	// Existing items from the API + optional "Create" item for custom input
	const items = useMemo<ComboboxItemOption[]>(() => {
		const existingItems: ComboboxItemOption[] = options.map((opt) => ({
			id: opt.id,
			value: opt.value,
			label: opt.label,
			isNew: false,
		}));

		const trimmed = inputValue.trim();
		if (trimmed.length > 0) {
			const isDuplicate = existingItems.some(
				(item) =>
					item.label.toLowerCase() === trimmed.toLowerCase() ||
					item.value.toLowerCase() === trimmed.toLowerCase(),
			);
			if (!isDuplicate) {
				const slugValue = trimmed
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "_")
					.replace(/^_|_$/g, "");
				existingItems.push({
					id: `__create__${slugValue}`,
					value: `__create__${slugValue}`,
					label: `Create "${trimmed}"`,
					isNew: true,
				});
			}
		}

		return existingItems;
	}, [options, inputValue]);

	// Handle item selection
	const handleValueChange = useCallback(
		(newValue: string | null) => {
			if (!newValue) {
				onChange(null);
				setInputValue("");
				return;
			}

			const item = items.find((i) => i.value === newValue);
			if (!item) return;

			if (item.isNew) {
				// Extract the actual label from "Create \"label\"" format
				const match = item.label.match(/^Create "(.+)"$/);
				const actualLabel = match ? match[1] : item.label;
				const slugValue = actualLabel
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "_")
					.replace(/^_|_$/g, "");
				onChange({ value: slugValue, label: actualLabel });
				setInputValue(actualLabel);
			} else {
				onChange({ value: item.value, label: item.label });
				setInputValue(item.label);
			}
		},
		[items, onChange],
	);

	return (
		<div className="flex items-center gap-2">
			<div className="flex-1">
				<Combobox
					value={currentType?.value ?? null}
					onValueChange={handleValueChange}
					onInputValueChange={(val: string) => setInputValue(val)}
				>
					<ComboboxInput
						placeholder={
							levelIndex === 0
								? "Select or type a new type..."
								: "Select or type a new sub-type..."
						}
						showClear={!!currentType}
						showTrigger={true}
					/>
					<ComboboxContent>
						<ComboboxList>
							{isOptionsLoading && items.length === 0 && (
								<div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
							)}
							{!isOptionsLoading && items.length === 0 && (
								<ComboboxEmpty>No options found. Type to create a new one.</ComboboxEmpty>
							)}
							{items.map((item) => (
								<ComboboxItem key={item.id} value={item.value}>
									{item.isNew ? (
										<span className="flex items-center gap-2">
											<Plus className="size-3.5" />
											<span className="italic">{item.label}</span>
										</span>
									) : (
										item.label
									)}
								</ComboboxItem>
							))}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			</div>

			{/* Plus button to add next level - only on last visible level when a type is selected */}
			{isLastVisible && !!currentType && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={onAddLevel}
					aria-label="Add sub-type"
					className="shrink-0"
				>
					<Plus className="size-4" />
				</Button>
			)}
		</div>
	);
}
