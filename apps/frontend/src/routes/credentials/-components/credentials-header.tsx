import { Search, ChevronDown, AlignJustify } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Input } from "#/components/ui/input";
import { cn } from "#/lib/utils";
import { useSidebar } from "#/components/ui/sidebar";

const searchOptions = [
	{ value: "all", label: "All" },
	{ value: "credentials", label: "Credentials" },
	{ value: "types", label: "Types" },
	{ value: "favourite", label: "Favourite" },
	{ value: "trash", label: "Trash" },
] as const;

function MobileSidebarTrigger() {
	const { toggleSidebar } = useSidebar();

	return (
		<button
			type="button"
			onClick={toggleSidebar}
			className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground/60 shadow-xs transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-95"
			aria-label="Toggle sidebar"
		>
			<AlignJustify className="size-4" />
		</button>
	);
}

export function CredentialsHeader() {
	const [selectedOption, setSelectedOption] = useState("all");
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { isMobile } = useSidebar();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selectedLabel =
		searchOptions.find((o) => o.value === selectedOption)?.label ?? "All";

	return (
		<header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
				{/* Left: C. logo + mobile sidebar trigger */}
				<div className="flex shrink-0 items-center gap-2">
					{isMobile && <MobileSidebarTrigger />}
					<span className="text-4xl leading-none tracking-tighter font-caveat">
						C.
					</span>
				</div>

				{/* Right: Search bar with dropdown */}
				<div className="relative flex items-center" ref={dropdownRef}>
					<div className="relative flex items-center">
						{/* Search input */}
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
							<Input
								type="text"
								placeholder="global search"
								className="w-56 rounded-r-none border-r-0 pl-10 md:w-72"
							/>
						</div>

						{/* Dropdown button */}
						<button
							type="button"
							onClick={() => setIsOpen(!isOpen)}
							className="flex cursor-pointer items-center gap-1 rounded-r-lg border border-l-0 border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
						>
							{selectedLabel}
							<ChevronDown className="size-3.5" />
						</button>
					</div>

					{/* Dropdown menu */}
					{isOpen && (
						<div className="absolute right-0 top-full mt-2 w-44 animate-in fade-in slide-in-from-top-1 rounded-lg border bg-popover p-1.5 shadow-lg duration-150">
							{searchOptions.map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => {
										setSelectedOption(option.value);
										setIsOpen(false);
									}}
									className={cn(
										"flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-sm transition-colors",
										selectedOption === option.value
											? "bg-accent font-medium text-accent-foreground"
											: "text-muted-foreground hover:bg-accent/50",
									)}
								>
									{option.label}
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
