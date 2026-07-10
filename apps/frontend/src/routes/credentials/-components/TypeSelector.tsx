import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
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
 * Each level uses a shadcn combobox at 30% width.
 * Clicking "+" below the combobox adds a new level underneath.
 * Pressing Enter on a novel input registers it as a new type immediately.
 * Clearing a type that has children shows a confirmation AlertDialog.
 */
export function TypeSelector({ types, onTypesChange }: TypeSelectorProps) {
	const [expandedLevels, setExpandedLevels] = useState(0);
	const [focusLevel, setFocusLevel] = useState<number | null>(null);
	const levelsToShow = Math.max(1, types.length + 1, expandedLevels + 1);

	const handleLevelChange = useCallback(
		(levelIndex: number, entry: TypePathEntry | null) => {
			if (!entry) {
				onTypesChange(types.slice(0, levelIndex));
				return;
			}
			const newTypes = [...types.slice(0, levelIndex), entry];
			onTypesChange(newTypes);
			// Request focus on the next level after a type is committed
			setFocusLevel(levelIndex + 1);
		},
		[types, onTypesChange],
	);

	const handleAddLevel = useCallback(() => {
		setExpandedLevels((prev) => prev + 1);
	}, []);

	return (
		<div className="flex flex-col items-start gap-3 w-full">
			{Array.from({ length: levelsToShow }).map((_, levelIndex) => {
				const childCount = Math.max(0, types.length - levelIndex - 1);
				const shouldFocus = focusLevel === levelIndex;
				return (
					<TypeLevel
						key={crypto.randomUUID()}
						levelIndex={levelIndex}
						parentValue={levelIndex > 0 ? types[levelIndex - 1]?.value : undefined}
						currentType={types[levelIndex] ?? null}
						onChange={(entry) => handleLevelChange(levelIndex, entry)}
						onFocused={() => setFocusLevel(null)}
						shouldFocus={shouldFocus}
						childCount={childCount}
						isLastVisible={levelIndex === levelsToShow - 1}
						onAddLevel={handleAddLevel}
					/>
				);
			})}
		</div>
	);
}

// ── Individual type level ───────────────────────────────────────────

interface TypeLevelProps {
	levelIndex: number;
	parentValue: string | undefined;
	currentType: TypePathEntry | null;
	onChange: (entry: TypePathEntry | null) => void;
	shouldFocus?: boolean;
	onFocused?: () => void;
	childCount: number;
	isLastVisible: boolean;
	onAddLevel: () => void;
}

function TypeLevel({
	levelIndex,
	parentValue,
	currentType,
	onChange,
	shouldFocus,
	onFocused,
	childCount,
	isLastVisible,
	onAddLevel,
}: TypeLevelProps) {
	const [inputValue, setInputValue] = useState("");
	const levelRef = useRef<HTMLDivElement>(null);

	// Auto-focus this level's input when shouldFocus becomes true
	useEffect(() => {
		if (shouldFocus && levelRef.current) {
			const input = levelRef.current.querySelector("input");
			if (input) {
				input.focus();
				onFocused?.();
			}
		}
	}, [shouldFocus, onFocused]);
	const [dialogOpen, setDialogOpen] = useState(false);

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
	const items = useMemo<ComboboxItemOption[]>(() => {
		const rawInput = inputValue.trim();
		const trimmed = rawInput.toLowerCase();

		// Filter options based on input value (search-as-you-type)
		const filtered = options.filter((opt) => {
			if (!trimmed) return true; // Show all when no input
			return opt.label.toLowerCase().includes(trimmed) || opt.value.toLowerCase().includes(trimmed);
		});

		const existing: ComboboxItemOption[] = filtered.map((opt) => ({
			id: opt.id,
			value: opt.value,
			label: opt.label,
			isNew: false,
		}));

		// Add "Create" option if typed text has no exact match among ALL options
		if (rawInput.length > 0) {
			const exactMatch = options.some(
				(opt) => opt.label.toLowerCase() === trimmed || opt.value.toLowerCase() === trimmed,
			);
			if (!exactMatch) {
				const slug = trimmed.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
				existing.push({
					id: `__create__${slug}`,
					value: `__create__${slug}`,
					label: `Create "${rawInput}"`,
					isNew: true,
				});
			}
		}

		return existing;
	}, [options, inputValue]);

	// ── Register a new type from the current typed input ──
	const commitInputAsType = useCallback(() => {
		const trimmed = inputValue.trim();
		if (!trimmed) return;
		const slug = trimmed
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "_")
			.replace(/^_|_$/g, "");
		onChange({ value: slug, label: trimmed });
		setInputValue(trimmed);
	}, [inputValue, onChange]);

	// ── Handle item selection from dropdown ──
	const handleValueChange = useCallback(
		(newValue: string | null) => {
			if (!newValue) {
				// Clear was triggered — this is handled by our custom X button / dialog
				return;
			}

			const item = items.find((i) => i.value === newValue);
			if (!item) return;

			if (item.isNew) {
				const slug = item.label
					.replace(/^Create "(.+)"$/, "$1")
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "_")
					.replace(/^_|_$/g, "");
				const label = item.label.replace(/^Create "(.+)"$/, "$1");
				onChange({ value: slug, label });
				setInputValue(label);
			} else {
				onChange({ value: item.value, label: item.label });
				setInputValue(item.label);
			}
		},
		[items, onChange],
	);

	// ── Handle clearing this level ──
	const handleClear = useCallback(() => {
		if (childCount > 0) {
			setDialogOpen(true);
		} else {
			onChange(null);
			setInputValue("");
		}
	}, [childCount, onChange]);

	// ── Confirm clear (from dialog) ──
	const handleConfirmClear = useCallback(() => {
		setDialogOpen(false);
		onChange(null);
		setInputValue("");
	}, [onChange]);

	return (
		<div ref={levelRef}>
			<div className="flex flex-col gap-1.5">
				{/* Row: combobox + X button side by side */}
				<div className="flex items-center gap-2">
					{/* Combobox at 30% width */}
					<div className="w-[30%] min-w-[200px]">
						<Combobox
							value={currentType?.value ?? null}
							onValueChange={handleValueChange}
							onInputValueChange={(val: string) => setInputValue(val)}
							filter={null}
						>
							<ComboboxInput
								placeholder={
									levelIndex === 0
										? "Select or type a new type..."
										: "Select or type a new sub-type..."
								}
								showClear={false}
								showTrigger={true}
								onKeyDown={(e: React.KeyboardEvent) => {
									if (e.key === "Enter" && inputValue.trim()) {
										e.preventDefault();
										const trimmed = inputValue.trim();
										// Check if input exactly matches an existing item
										const exactMatch = items.find(
											(item) =>
												!item.isNew &&
												(item.label.toLowerCase() === trimmed.toLowerCase() ||
													item.value.toLowerCase() === trimmed.toLowerCase()),
										);
										if (exactMatch) {
											onChange({ value: exactMatch.value, label: exactMatch.label });
											setInputValue(exactMatch.label);
										} else {
											commitInputAsType();
										}
									}
								}}
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

					{/* X clear button — side by side with combobox */}
					{!!currentType && childCount > 0 && (
						<AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
							<AlertDialogTrigger className="...">
								<X className="size-3.5" />
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogTitle>Remove this type?</AlertDialogTitle>
								<AlertDialogDescription>
									Removing "{currentType.label}" will also remove{" "}
									{childCount === 1 ? "the sub-type" : `${childCount} sub-types`} under it. This
									action cannot be undone.
								</AlertDialogDescription>
								<div className="flex justify-end gap-3 mt-2">
									<AlertDialogCancel className="...">Cancel</AlertDialogCancel>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={handleConfirmClear}
									>
										Remove
									</Button>
								</div>
							</AlertDialogContent>
						</AlertDialog>
					)}

					{/* Simple X clear button when no children */}
					{!!currentType && childCount === 0 && (
						<button
							type="button"
							onClick={handleClear}
							className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer border-0 bg-transparent"
							aria-label="Remove type"
						>
							<X className="size-3.5" />
						</button>
					)}
				</div>

				{/* Plus button — below the combobox row */}
				{isLastVisible && !!currentType && (
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						onClick={onAddLevel}
						aria-label="Add sub-type"
					>
						<Plus className="size-3.5" />
					</Button>
				)}
			</div>
		</div>
	);
}
