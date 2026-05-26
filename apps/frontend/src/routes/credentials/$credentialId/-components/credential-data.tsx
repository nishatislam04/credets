import type { DataBlockEntry } from "@credets/shared-types/credentials/listings";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "#/components/ui/badge";

interface CredentialDataRendererProps {
	typeValue: string | null;
	data: unknown;
}

// ── Copy-on-click display (single line) ─────────────────────────────

function CopyDisplay({
	value,
	isSecret = false,
}: { value: string; isSecret?: boolean }) {
	const [copied, setCopied] = useState(false);
	const [revealed, setRevealed] = useState(false);
	const display = isSecret && !revealed ? "•".repeat(Math.min(value.length, 32)) : value;

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(value).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	}, [value]);

	return (
		<div
			className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-4 py-2.5 transition-colors hover:bg-blue-50/50"
			onClick={handleCopy}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") handleCopy();
			}}
		>
			<span className="flex-1 font-mono text-sm tracking-wide break-all select-all">
				{display}
			</span>
			<div className="flex shrink-0 items-center gap-1.5">
				{isSecret && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setRevealed((v) => !v);
						}}
						className="cursor-pointer rounded-md border-0 bg-transparent p-1 text-muted-foreground/40 transition-colors hover:bg-muted/60 hover:text-foreground"
						aria-label={revealed ? "Hide" : "Reveal"}
					>
						{revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
					</button>
				)}
				{copied ? (
					<Check className="size-3.5 text-emerald-500" />
				) : (
					<Copy className="size-3.5 text-muted-foreground/30" />
				)}
			</div>
		</div>
	);
}

// ── Copy-on-click display (multi-line / textarea style) ────────────

function MultiLineDisplay({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(value).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	}, [value]);

	return (
		<div
			className="min-h-[120px] cursor-pointer rounded-lg border bg-white px-4 py-3 transition-colors hover:bg-blue-50/50"
			onClick={handleCopy}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") handleCopy();
			}}
		>
			<div className="flex items-start justify-between gap-2">
				<pre className="flex-1 font-mono text-sm tracking-wide whitespace-pre-wrap break-all text-muted-foreground/80">
					{value}
				</pre>
				<div className="shrink-0 pt-0.5">
					{copied ? (
						<Check className="size-3.5 text-emerald-500" />
					) : (
						<Copy className="size-3.5 text-muted-foreground/30" />
					)}
				</div>
			</div>
		</div>
	);
}

// ── Section label ───────────────────────────────────────────────────

function BlockLabel({ children }: { children: string }) {
	return (
		<span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
			{children}
		</span>
	);
}

// ── Data normaliser: try to parse whatever shape we get ─────────────

function normaliseData(raw: unknown): {
	blocks: DataBlockEntry[] | null;
	flat: Record<string, unknown> | null;
} {
	let parsed = raw;

	if (typeof parsed === "string") {
		try {
			parsed = JSON.parse(parsed);
		} catch {
			return { blocks: null, flat: { value: parsed } };
		}
	}

	if (
		Array.isArray(parsed) &&
		parsed.length > 0 &&
		typeof parsed[0] === "object" &&
		parsed[0] !== null &&
		"type" in parsed[0]
	) {
		return { blocks: parsed as DataBlockEntry[], flat: null };
	}

	if (typeof parsed === "object" && parsed !== null) {
		return { blocks: null, flat: parsed as Record<string, unknown> };
	}

	return { blocks: null, flat: { value: String(parsed) } };
}

// ── Sensitive fields ────────────────────────────────────────────────

const SENSITIVE_FIELDS = new Set(["password", "key", "secret", "token"]);

// ── Block renderers ─────────────────────────────────────────────────

function SingleLabelBlock({ block }: { block: DataBlockEntry & { type: "single_label" } }) {
	return (
		<div className="px-6 py-5">
			<BlockLabel>Single Value</BlockLabel>
			<CopyDisplay value={block.value} />
		</div>
	);
}

function KeyValueBlock({ block }: { block: DataBlockEntry & { type: "key_value" } }) {
	const isSecret = SENSITIVE_FIELDS.has(block.key);
	return (
		<div className="px-6 py-5">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div>
					<BlockLabel>Key</BlockLabel>
					<CopyDisplay value={block.key} />
				</div>
				<div>
					<div className="mb-1.5 flex items-center gap-2">
						<BlockLabel>Value</BlockLabel>
						{isSecret && <span className="size-1.5 rounded-full bg-amber-400/60" />}
					</div>
					<CopyDisplay value={String(block.value)} isSecret={isSecret} />
				</div>
			</div>
		</div>
	);
}

function InformationBlock({ block }: { block: DataBlockEntry & { type: "information" } }) {
	return (
		<div className="px-6 py-5">
			<BlockLabel>Information</BlockLabel>
			<MultiLineDisplay value={block.value} />
		</div>
	);
}

function DataBlocksRenderer({ blocks }: { blocks: DataBlockEntry[] }) {
	return (
		<div className="divide-y divide-border/20">
			{blocks.map((block, i) => {
				switch (block.type) {
					case "single_label":
						return (
							<div key={i}>
								<SingleLabelBlock block={block} />
							</div>
						);
					case "key_value":
						return (
							<div key={i}>
								<KeyValueBlock block={block} />
							</div>
						);
					case "information":
						return (
							<div key={i}>
								<InformationBlock block={block} />
							</div>
						);
					default:
						return null;
				}
			})}
		</div>
	);
}

// ── Flat object renderer (for seed data) ────────────────────────────

function fieldLabel(key: string): string {
	const labels: Record<string, string> = {
		website: "Website",
		email: "Email",
		username: "Username",
		password: "Password",
		service: "Service",
		account_id: "Account ID",
		region: "Region",
		role: "Role",
		plan: "Plan",
		last_billed: "Last Billed",
		shared_with: "Shared With",
		bank: "Bank",
		account_type: "Account Type",
		routing_number: "Routing Number",
		last_four: "Last Four",
		name: "Name",
		type: "Type",
		key_fingerprint: "Fingerprint",
		bits: "Bits",
		encrypted: "Encrypted",
		software: "Software",
		key: "Key",
		expires: "Expires",
		seats: "Seats",
		algorithm: "Algorithm",
		purpose: "Purpose",
		rotation_period_days: "Rotation Period",
		key_prefix: "Prefix",
		key_suffix: "Suffix",
		environment: "Environment",
		rate_limit: "Rate Limit",
		webhook_url: "Webhook URL",
		platform: "Platform",
		token_type: "Token Type",
		scopes: "Scopes",
		project: "Project",
		title: "Title",
		url: "URL",
		duration_minutes: "Duration",
		author: "Author",
		collection: "Collection",
		count: "Count",
		format: "Format",
		source: "Source",
		game: "Game",
		loadout_name: "Loadout",
		primary_weapon: "Primary Weapon",
		secondary_weapon: "Secondary Weapon",
		sensitivity: "Sensitivity",
		crosshair: "Crosshair",
		rank: "Rank",
		build: "Build",
		level: "Level",
		main_weapon: "Main Weapon",
		stats: "Stats",
		content: "Content",
		priority: "Priority",
		category: "Category",
		entries: "Entries",
		notes: "Notes",
	};
	return labels[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function FlatObjectRenderer({ data }: { data: Record<string, unknown> }) {
	const entries = Object.entries(data);
	if (entries.length === 0) return null;

	return (
		<div className="divide-y divide-border/20">
			{entries.map(([key, value]) => {
				const isSensitive = SENSITIVE_FIELDS.has(key);
				const strValue = String(value);
				return (
					<div key={key} className="px-6 py-4">
						<div className="mb-1.5 flex items-center gap-2">
							<BlockLabel>{fieldLabel(key)}</BlockLabel>
							{isSensitive && <span className="size-1.5 rounded-full bg-amber-400/60" />}
						</div>
						{typeof value === "string" &&
						(value.startsWith("http://") || value.startsWith("https://")) ? (
							<a
								href={value}
								target="_blank"
								rel="noopener noreferrer"
								className="font-mono text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
							>
								{value}
							</a>
						) : Array.isArray(value) ? (
							<div className="flex flex-wrap gap-1.5">
								{value.map((item, i) => (
									<Badge
										key={i}
										variant="secondary"
										className="rounded-full text-[10px] font-medium"
									>
										{String(item)}
									</Badge>
								))}
							</div>
						) : typeof value === "boolean" ? (
							<Badge
								variant={value ? "default" : "secondary"}
								className="rounded-full text-[10px] font-medium"
							>
								{value ? "Yes" : "No"}
							</Badge>
						) : (
							<CopyDisplay value={strValue} isSecret={isSensitive} />
						)}
					</div>
				);
			})}
		</div>
	);
}

// ── Theme accent per type ───────────────────────────────────────────

const TYPE_ACCENTS: Record<string, { gradient: string; border: string }> = {
	credentials: {
		gradient: "from-blue-500/5 to-blue-600/3",
		border: "border-blue-200/40 dark:border-blue-800/30",
	},
	key: {
		gradient: "from-amber-500/5 to-amber-600/3",
		border: "border-amber-200/40 dark:border-amber-800/30",
	},
	api: {
		gradient: "from-purple-500/5 to-purple-600/3",
		border: "border-purple-200/40 dark:border-purple-800/30",
	},
	media: {
		gradient: "from-rose-500/5 to-rose-600/3",
		border: "border-rose-200/40 dark:border-rose-800/30",
	},
	game_loadout: {
		gradient: "from-emerald-500/5 to-emerald-600/3",
		border: "border-emerald-200/40 dark:border-emerald-800/30",
	},
	misc: {
		gradient: "from-slate-500/5 to-slate-600/3",
		border: "border-slate-200/40 dark:border-slate-800/30",
	},
};

const fallbackAccent = {
	gradient: "from-slate-500/5 to-slate-600/3",
	border: "border-slate-200/40 dark:border-slate-800/30",
};

// ── Main exported component ─────────────────────────────────────────

export function CredentialDataRenderer({ typeValue, data }: CredentialDataRendererProps) {
	const accent = TYPE_ACCENTS[typeValue ?? ""] ?? fallbackAccent;

	const { blocks, flat } = useMemo(() => normaliseData(data), [data]);

	const hasBlocks = blocks !== null && blocks.length > 0;
	const hasFlat =
		flat !== null &&
		Object.keys(flat).length > 0 &&
		!(flat.value === "" && Object.keys(flat).length === 1);

	if (!hasBlocks && !hasFlat) {
		return (
			<div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground/50">
				No data stored for this credential.
			</div>
		);
	}

	return (
		<div
			className={`rounded-lg border bg-blue-50/40 ${accent.border} overflow-hidden`}
		>
			{hasBlocks ? <DataBlocksRenderer blocks={blocks!} /> : <FlatObjectRenderer data={flat!} />}
		</div>
	);
}
