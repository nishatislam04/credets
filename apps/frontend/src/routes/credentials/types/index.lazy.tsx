import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import {
	AlertTriangle,
	Check,
	File,
	Folder,
	Pencil,
	RefreshCw,
	Search,
	Tags,
} from "lucide-react";
import { useState } from "react";
import { cn } from "#/lib/utils";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from "#/components/ui/dialog";
import { toast } from "#/components/ui/toast";
import { Input } from "#/components/ui/input";
import { Skeleton } from "#/components/ui/skeleton";
import { CredentialsShell } from "../-components/credentials-shell";
import {
	getTypesListings,
	type CredentialWithTypes,
	type TypeNode,
} from "./-actions/getTypesListings";
import { updateTypeLabel } from "./-actions/updateTypeLabel";

export const Route = createLazyFileRoute("/credentials/types/")({
	component: RouteComponent,
});

// ─── Type Tree Visual ───────────────────────────────────────────

function TypeTreeInline({ path }: { path: TypeNode[] }) {
	if (!path || path.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-1.5 text-sm">
			{path.map((node, idx) => {
				const isLeaf = idx === path.length - 1;
				return (
					<div key={node.id} className="flex items-center gap-1.5">
						{idx > 0 && (
							<span className="text-muted-foreground/30 text-xs">▸</span>
						)}
						<div
							className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
								isLeaf
									? "bg-primary/10 text-primary ring-1 ring-primary/20"
									: "bg-muted/60 text-muted-foreground ring-1 ring-border/40"
							}`}
						>
							{isLeaf ? (
								<File className="size-3 shrink-0" />
							) : (
								<Folder className="size-3 shrink-0 text-amber-500" />
							)}
							<span>{node.label}</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

// ─── Edit Dialog ────────────────────────────────────────────────

function TypeEditDialog({
	credentialWithTypes,
	open,
	onOpenChange,
	onUpdated,
}: {
	credentialWithTypes: CredentialWithTypes;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdated: () => void;
}) {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editLabel, setEditLabel] = useState("");
	const [saving, setSaving] = useState(false);

	const handleSave = async (typeId: string) => {
		if (!editLabel.trim()) return;
		setSaving(true);
		try {
			await updateTypeLabel(typeId, editLabel.trim());
			toast.success("Type label updated", {
				description: `"${editLabel.trim()}" saved`,
			});
			setEditingId(null);
			onUpdated();
		} catch {
			toast.error("Failed to update", {
				description: "Could not update the type label",
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogTitle className="text-xl font-bold tracking-tight">
					Edit types for &ldquo;{credentialWithTypes.credential.title}&rdquo;
				</DialogTitle>

				<div className="mt-2 space-y-3">
					{credentialWithTypes.typePath.map((node, idx) => {
						const isEditing = editingId === node.id;
						const isLast = idx === credentialWithTypes.typePath.length - 1;
						return (
							<div
								key={node.id}
								className={cn(
									"flex items-center gap-3 rounded-lg border bg-card py-3 transition-colors",
									isLast
										? "border-primary/30 bg-primary/[0.03] ring-1 ring-primary/10"
										: "",
								)}
								style={{
									paddingLeft: `${12 + idx * 24}px`,
									paddingRight: "16px",
								}}
							>
								{isEditing ? (
									<>
										<div className="flex-1">
											<Input
												value={editLabel}
												onChange={(e) => setEditLabel(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleSave(node.id);
													if (e.key === "Escape") setEditingId(null);
												}}
												autoFocus
												className="w-full"
												disabled={saving}
											/>
										</div>
										<button
											type="button"
											onClick={() => handleSave(node.id)}
											disabled={saving || !editLabel.trim()}
											className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-40 cursor-pointer border-0"
										>
											<Check className="size-3.5" />
										</button>
									</>
								) : (
									<>
										<div className="flex size-8 items-center justify-center rounded-lg bg-muted/80 shrink-0">
											<Folder className="size-4 text-amber-500" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-foreground">
												{node.label}
											</p>
										</div>
										<button
											type="button"
											onClick={() => {
												setEditingId(node.id);
												setEditLabel(node.label);
											}}
											className="flex size-7 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-accent hover:text-foreground cursor-pointer border-0"
											aria-label={`Edit ${node.label}`}
										>
											<Pencil className="size-3.5" />
										</button>
									</>
								)}
							</div>
						);
					})}
				</div>

				<div className="flex justify-center mt-6">
					<DialogClose className="rounded-lg border bg-card px-6 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer">
						Close
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ─── Card ───────────────────────────────────────────────────────

function TypesCard({
	item,
	onClick,
}: {
	item: CredentialWithTypes;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full cursor-pointer border-0 bg-transparent text-left group"
		>
			<div className="rounded-xl border bg-card px-5 py-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-xs">
				{/* Credential title */}
				<h3 className="font-semibold text-base leading-snug tracking-tight mb-2.5 group-hover:text-primary transition-colors duration-200">
					{item.credential.title}
				</h3>

				{/* Type tree */}
				<TypeTreeInline path={item.typePath} />
			</div>
		</button>
	);
}

// ─── States ─────────────────────────────────────────────────────

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-24">
			<div className="size-28 rounded-full bg-gradient-to-br from-amber-200/50 via-amber-100/30 to-muted flex items-center justify-center ring-1 ring-amber-200/40 dark:from-amber-900/30 dark:via-amber-800/20 dark:ring-amber-700/30">
				<Tags className="size-12 text-amber-400/60 dark:text-amber-500/50" />
			</div>
			<h2 className="text-2xl font-bold tracking-tight text-foreground mt-6 mb-2">
				No types assigned
			</h2>
			<p className="text-sm text-muted-foreground/60 max-w-sm text-center leading-relaxed">
				Credentials with types will appear here. Assign a type when creating or
				editing a credential.
			</p>
		</div>
	);
}

function ErrorUI({ error }: { error: Error }) {
	return (
		<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
			<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
				<AlertTriangle className="size-6 text-destructive" />
			</div>
			<p className="text-sm text-destructive/80 mb-1 font-medium">
				Failed to load types
			</p>
			<p className="text-xs text-destructive/60">
				{error instanceof Error ? error.message : "Something went wrong"}
			</p>
		</div>
	);
}

// ─── Main Component ─────────────────────────────────────────────

function RouteComponent() {
	const [selected, setSelected] = useState<CredentialWithTypes | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data, isLoading, isError, error, isRefetching, refetch } = useQuery({
		queryKey: ["types-listings"],
		queryFn: () => getTypesListings(),
	});

	const items = data?.items ?? [];

	const handleCardClick = (item: CredentialWithTypes) => {
		setSelected(item);
		setDialogOpen(true);
	};

	const handleUpdated = () => {
		queryClient.invalidateQueries({ queryKey: ["types-listings"] });
	};

	return (
		<CredentialsShell>
			<div className="mx-auto w-full max-w-3xl px-4 py-8">
				{/* Page header */}
				<div className="mb-6">
					<h1 className="text-2xl font-bold tracking-tight">Types</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Browse credentials grouped by their type hierarchy
					</p>
				</div>

				{/* Actions toolbar */}
				<div className="mb-6 rounded-xl border bg-card p-3 md:p-5">
					<div className="flex flex-col gap-4">
						{/* Search row */}
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
							<Input
								type="text"
								placeholder="Search types..."
								className="w-full pl-10"
							/>
						</div>

						{/* Separator */}
						<hr className="border-t border-border/40" />

						<div className="flex flex-wrap items-center gap-3">
							<button
								type="button"
								onClick={() => refetch()}
								disabled={isRefetching}
								className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground/70 shadow-xs transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<RefreshCw
									className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`}
								/>
								Refresh
							</button>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									className="size-4 rounded border-border text-primary focus:ring-primary/30"
								/>
								<span className="text-xs text-muted-foreground/70 select-none">
									Select all
								</span>
							</label>{" "}
							<p className="ml-auto text-xs text-muted-foreground/40">
								{items.length} credential{items.length !== 1 ? "s" : ""}
							</p>
						</div>
					</div>
				</div>

				{/* Loading state */}
				{isLoading && (
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="h-24 w-full rounded-xl" />
						))}
					</div>
				)}

				{/* Error state */}
				{!isLoading && isError && <ErrorUI error={error as Error} />}

				{/* Empty state */}
				{!isLoading && !isError && items.length === 0 && <EmptyState />}

				{/* Items list */}
				{!isLoading && !isError && items.length > 0 && (
					<div className="space-y-3">
						{items.map((item) => (
							<TypesCard
								key={item.credential.id}
								item={item}
								onClick={() => handleCardClick(item)}
							/>
						))}
					</div>
				)}
			</div>

			{/* Edit dialog */}
			{selected && (
				<TypeEditDialog
					credentialWithTypes={selected}
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					onUpdated={handleUpdated}
				/>
			)}
		</CredentialsShell>
	);
}
