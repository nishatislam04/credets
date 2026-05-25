import type { DataBlockEntry } from "@credets/shared-types/credentials/listings";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "#/components/ui/badge";

interface CredentialDataRendererProps {
	typeValue: string | null;
	data: unknown;
}

// ── Copy button with feedback ───────────────────────────────────────

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	}, [text]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-all duration-150 cursor-pointer border-0 bg-transparent text-muted-foreground/40 hover:text-foreground hover:bg-muted/50"
			aria-label={copied ? "Copied" : "Copy to clipboard"}
		>
			{copied ? (
				<>
					<Check className="size-3" />
					<span>Copied</span>
				</>
			) : (
				<>
					<Copy className="size-3" />
					<span>Copy</span>
				</>
			)}
		</button>
	);
}

// ── Code-value display (monospace block with copy) ─────────────────

function CodeValue({ value, isSecret = false }: { value: string; isSecret?: boolean }) {
	const [revealed, setRevealed] = useState(false);
	const display = isSecret && !revealed ? "•".repeat(Math.min(value.length, 32)) : value;

	return (
		<div className="flex items-center gap-2 rounded-lg bg-muted/40 px-4 py-2.5 ring-1 ring-border/20 font-mono text-sm tracking-wide">
			<span className="flex-1 break-all select-all">{display}</span>
			<div className="flex shrink-0 items-center gap-1">
				{isSecret && (
					<button
						type="button"
						onClick={() => setRevealed((v) => !v)}
						className="rounded-md p-1 text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer border-0 bg-transparent"
						aria-label={revealed ? "Hide" : "Reveal"}
					>
						{revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
					</button>
				)}
				<CopyButton text={value} />
			</div>
		</div>
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

// ── Block renderers (code-style blocks) ─────────────────────────────

function SingleLabelBlock({ block }: { block: DataBlockEntry & { type: "single_label" } }) {
	return (
		<div className="px-6 py-5">
			<span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
				Single Value
			</span>
			<CodeValue value={block.value} />
		</div>
	);
}

function KeyValueBlock({ block }: { block: DataBlockEntry & { type: "key_value" } }) {
	const isSecret = SENSITIVE_FIELDS.has(block.key);
	return (
		<div className="px-6 py-5">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
						Key
					</span>
					<CodeValue value={block.key} />
				</div>
				<div>
					<div className="mb-1.5 flex items-center gap-2">
						<span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
							Value
						</span>
						{isSecret && <span className="size-1.5 rounded-full bg-amber-400/60" />}
					</div>
					<CodeValue value={String(block.value)} isSecret={isSecret} />
				</div>
			</div>
		</div>
	);
}

function InformationBlock({ block }: { block: DataBlockEntry & { type: "information" } }) {
	return (
		<div className="px-6 py-5">
			<span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
				Information
			</span>
			<CodeValue value={block.value} />
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
							<div key={i} className="transition-colors hover:bg-muted/10">
								<SingleLabelBlock block={block} />
							</div>
						);
					case "key_value":
						return (
							<div key={i} className="transition-colors hover:bg-muted/10">
								<KeyValueBlock block={block} />
							</div>
						);
					case "information":
						return (
							<div key={i} className="transition-colors hover:bg-muted/10">
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
					<div key={key} className="px-6 py-4 transition-colors hover:bg-muted/10">
						<div className="mb-1.5 flex items-center gap-2">
							<span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
								{fieldLabel(key)}
							</span>
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
							<CodeValue value={strValue} isSecret={isSensitive} />
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
			className={`rounded-xl border bg-gradient-to-br ${accent.gradient} ${accent.border} overflow-hidden`}
		>
			{hasBlocks ? <DataBlocksRenderer blocks={blocks!} /> : <FlatObjectRenderer data={flat!} />}
		</div>
	);
}
