import { createLazyFileRoute, Link } from "@tanstack/react-router";
import {
	Activity,
	FileText,
	FolderTree,
	Plus,
	RefreshCw,
	Trash2,
	Star,
	FileEdit,
	BarChart3,
	TrendingUp,
	PieChart,
	LayoutDashboard,
	Moon,
	Sun,
	Shield,
	User,
} from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart as RePieChart,
	Pie,
	Cell,
	LineChart,
	Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useTheme } from "#/hooks/theme-provider";

// ─── Mock Data ─────────────────────────────────────────────────

const STATS = [
	{
		label: "Total Credentials",
		value: 247,
		icon: FileText,
		color: "text-sky-500",
		bg: "bg-sky-500/10",
	},
	{
		label: "Active Types",
		value: 18,
		icon: FolderTree,
		color: "text-amber-500",
		bg: "bg-amber-500/10",
	},
	{
		label: "Draft Items",
		value: 12,
		icon: FileEdit,
		color: "text-violet-500",
		bg: "bg-violet-500/10",
	},
	{
		label: "Favourited",
		value: 34,
		icon: Star,
		color: "text-yellow-500",
		bg: "bg-yellow-500/10",
	},
	{
		label: "Trashed",
		value: 8,
		icon: Trash2,
		color: "text-rose-500",
		bg: "bg-rose-500/10",
	},
	{
		label: "Passwords",
		value: 56,
		icon: Shield,
		color: "text-emerald-500",
		bg: "bg-emerald-500/10",
	},
];

const MONTHLY_DATA = [
	{ month: "Feb", credentials: 28, drafts: 5 },
	{ month: "Mar", credentials: 42, drafts: 8 },
	{ month: "Apr", credentials: 35, drafts: 3 },
	{ month: "May", credentials: 51, drafts: 11 },
	{ month: "Jun", credentials: 44, drafts: 7 },
	{ month: "Jul", credentials: 47, drafts: 9 },
];

const TYPE_DISTRIBUTION = [
	{ name: "Game Account", value: 68, color: "#3b82f6" },
	{ name: "Social Media", value: 52, color: "#8b5cf6" },
	{ name: "Work Creds", value: 41, color: "#f59e0b" },
	{ name: "Payment", value: 35, color: "#10b981" },
	{ name: "Email", value: 28, color: "#ef4444" },
	{ name: "API Keys", value: 23, color: "#06b6d4" },
];

const ACTIVITY_DATA = [
	{ day: "Mon", views: 42, updates: 12 },
	{ day: "Tue", views: 58, updates: 18 },
	{ day: "Wed", views: 35, updates: 9 },
	{ day: "Thu", views: 61, updates: 22 },
	{ day: "Fri", views: 47, updates: 15 },
	{ day: "Sat", views: 29, updates: 7 },
	{ day: "Sun", views: 18, updates: 4 },
];

const QUICK_LINKS = [
	{
		label: "All Credentials",
		to: "/credentials",
		icon: FileText,
		description: "Browse all your stored credentials",
	},
	{
		label: "Create New",
		to: "/credentials/create",
		icon: Plus,
		description: "Add a new credential entry",
	},
	{
		label: "Types",
		to: "/credentials/types",
		icon: FolderTree,
		description: "Manage type hierarchies",
	},
	{
		label: "Drafts",
		to: "/credentials/draft",
		icon: FileEdit,
		description: "Continue where you left off",
	},
	{
		label: "Favourites",
		to: "/credentials/favourite",
		icon: Star,
		description: "Your starred credentials",
	},
	{
		label: "Trash",
		to: "/credentials/trash",
		icon: Trash2,
		description: "Recently deleted items",
	},
];

// ─── Tooltip Components ────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-xl border bg-popover px-4 py-3 shadow-lg text-sm backdrop-blur-sm">
			<p className="font-medium text-foreground mb-1">{label}</p>
			{payload.map((entry: any, idx: number) => (
				<p
					key={idx}
					className="text-muted-foreground"
					style={{ color: entry.color }}
				>
					{entry.name}:{" "}
					<span className="font-semibold text-foreground">{entry.value}</span>
				</p>
			))}
		</div>
	);
}

function PieTooltip({ active, payload }: any) {
	if (!active || !payload?.length) return null;
	const d = payload[0];
	return (
		<div className="rounded-xl border bg-popover px-4 py-3 shadow-lg text-sm backdrop-blur-sm">
			<p className="font-medium text-foreground">{d.name}</p>
			<p className="text-muted-foreground">
				{d.value} credentials ({Math.round((d.payload.percent || 0) * 100)}%)
			</p>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────

export const Route = createLazyFileRoute("/")({
	component: Dashboard,
});

function Dashboard() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
			{/* ── Top Bar ── */}
			<header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
							<LayoutDashboard className="size-5 text-primary" />
						</div>
						<div>
							<h1 className="text-lg font-bold tracking-tight">Credets</h1>
							<p className="text-xs text-muted-foreground/60 -mt-0.5">
								Dashboard
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<div className="hidden sm:flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground/60">
							<Activity className="size-3.5" />
							<span>Last sync: Just now</span>
						</div>
						<button
							type="button"
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background shadow-xs transition-all duration-200 hover:bg-accent hover:shadow-sm active:scale-95 cursor-pointer"
							aria-label="Toggle theme"
						>
							<Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						</button>
					</div>
				</div>
			</header>

			{/* ── Main Content ── */}
			<main className="mx-auto max-w-7xl px-6 py-8">
				{/* ── Welcome Section ── */}
				<div className="mb-10">
					<h2 className="text-3xl font-bold tracking-tight">
						Welcome back<span className="text-primary">.</span>
					</h2>
					<p className="mt-1 text-muted-foreground/70 max-w-xl">
						Here&rsquo;s an overview of your credential vault. Everything is
						encrypted and secure.
					</p>
				</div>

				{/* ── Stats Grid ── */}
				<div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
					{STATS.map((stat) => {
						const Icon = stat.icon;
						return (
							<Card
								key={stat.label}
								size="sm"
								className="group border-border/40 hover:border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
							>
								<CardContent className="flex flex-col gap-2 pt-4">
									<div
										className={`flex size-9 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
									>
										<Icon className="size-4" />
									</div>
									<div>
										<p className="text-2xl font-bold tracking-tight">
											{stat.value}
										</p>
										<p className="text-xs text-muted-foreground/60 truncate">
											{stat.label}
										</p>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* ── Charts Row ── */}
				<div className="mb-10 grid gap-6 lg:grid-cols-3">
					{/* Bar Chart - Monthly Activity */}
					<Card className="lg:col-span-2 border-border/40">
						<CardHeader className="flex-row items-center justify-between">
							<div className="flex items-center gap-2">
								<BarChart3 className="size-4 text-primary" />
								<CardTitle>Monthly Activity</CardTitle>
							</div>
							<div className="flex items-center gap-3 text-xs text-muted-foreground/50">
								<span className="flex items-center gap-1.5">
									<span className="size-2.5 rounded-sm bg-primary/60" />
									Credentials
								</span>
								<span className="flex items-center gap-1.5">
									<span className="size-2.5 rounded-sm bg-amber-400/60" />
									Drafts
								</span>
							</div>
						</CardHeader>
						<CardContent>
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={MONTHLY_DATA} barGap={4}>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="var(--border)"
											strokeOpacity={0.4}
										/>
										<XAxis
											dataKey="month"
											tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis
											tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
											axisLine={false}
											tickLine={false}
										/>
										<Tooltip
											content={<ChartTooltip />}
											cursor={{ fill: "var(--muted)", fillOpacity: 0.3 }}
										/>
										<Bar
											dataKey="credentials"
											name="Credentials"
											fill="var(--chart-1)"
											radius={[4, 4, 0, 0]}
											maxBarSize={40}
										/>
										<Bar
											dataKey="drafts"
											name="Drafts"
											fill="#fbbf24"
											radius={[4, 4, 0, 0]}
											maxBarSize={40}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* Pie Chart - Type Distribution */}
					<Card className="border-border/40">
						<CardHeader className="flex-row items-center justify-between">
							<div className="flex items-center gap-2">
								<PieChart className="size-4 text-primary" />
								<CardTitle>By Type</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<RePieChart>
										<Pie
											data={TYPE_DISTRIBUTION.map((d) => ({
												...d,
												percent: d.value / 247,
											}))}
											cx="50%"
											cy="50%"
											innerRadius={50}
											outerRadius={80}
											paddingAngle={2}
											dataKey="value"
											nameKey="name"
										>
											{TYPE_DISTRIBUTION.map((entry, idx) => (
												<Cell
													key={idx}
													fill={entry.color}
													stroke="transparent"
												/>
											))}
										</Pie>
										<Tooltip content={<PieTooltip />} />
									</RePieChart>
								</ResponsiveContainer>
							</div>
							<div className="mt-2 grid grid-cols-2 gap-1.5">
								{TYPE_DISTRIBUTION.map((entry) => (
									<div
										key={entry.name}
										className="flex items-center gap-2 text-xs"
									>
										<span
											className="size-2.5 shrink-0 rounded-full"
											style={{ backgroundColor: entry.color }}
										/>
										<span className="text-muted-foreground/70 truncate">
											{entry.name}
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* ── Second Row: Line Chart + Quick Stats ── */}
				<div className="mb-10 grid gap-6 lg:grid-cols-3">
					{/* Line Chart - Weekly Activity */}
					<Card className="lg:col-span-2 border-border/40">
						<CardHeader className="flex-row items-center justify-between">
							<div className="flex items-center gap-2">
								<TrendingUp className="size-4 text-primary" />
								<CardTitle>This Week</CardTitle>
							</div>
							<div className="flex items-center gap-3 text-xs text-muted-foreground/50">
								<span className="flex items-center gap-1.5">
									<span className="size-2.5 rounded-full bg-sky-500" />
									Views
								</span>
								<span className="flex items-center gap-1.5">
									<span className="size-2.5 rounded-full bg-violet-500" />
									Updates
								</span>
							</div>
						</CardHeader>
						<CardContent>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={ACTIVITY_DATA}>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="var(--border)"
											strokeOpacity={0.4}
										/>
										<XAxis
											dataKey="day"
											tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis
											tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
											axisLine={false}
											tickLine={false}
										/>
										<Tooltip content={<ChartTooltip />} />
										<Line
											type="monotone"
											dataKey="views"
											name="Views"
											stroke="#0ea5e9"
											strokeWidth={2.5}
											dot={{ r: 4, fill: "#0ea5e9" }}
											activeDot={{ r: 6 }}
										/>
										<Line
											type="monotone"
											dataKey="updates"
											name="Updates"
											stroke="#8b5cf6"
											strokeWidth={2.5}
											dot={{ r: 4, fill: "#8b5cf6" }}
											activeDot={{ r: 6 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* Quick summary card */}
					<Card className="border-border/40">
						<CardHeader className="flex-row items-center justify-between">
							<div className="flex items-center gap-2">
								<Activity className="size-4 text-primary" />
								<CardTitle>Summary</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-xl bg-gradient-to-br from-sky-500/10 to-sky-500/5 p-4 ring-1 ring-sky-500/10">
								<p className="text-xs text-sky-600/70 dark:text-sky-400/70 font-medium">
									Most active day
								</p>
								<p className="text-lg font-bold text-sky-600 dark:text-sky-400">
									Thursday
								</p>
								<p className="text-xs text-sky-600/50 dark:text-sky-400/50">
									61 views &middot; 22 updates
								</p>
							</div>
							<div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-4 ring-1 ring-amber-500/10">
								<p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-medium">
									Most used type
								</p>
								<p className="text-lg font-bold text-amber-600 dark:text-amber-400">
									Game Account
								</p>
								<p className="text-xs text-amber-600/50 dark:text-amber-400/50">
									68 credentials
								</p>
							</div>
							<div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 ring-1 ring-emerald-500/10">
								<p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">
									Storage used
								</p>
								<p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
									~3.2 MB
								</p>
								<p className="text-xs text-emerald-600/50 dark:text-emerald-400/50">
									Across all credentials
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* ── Quick Links ── */}
				<div>
					<div className="mb-5 flex items-center gap-2">
						<div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
							<RefreshCw className="size-3.5 text-primary" />
						</div>
						<h3 className="text-lg font-bold tracking-tight">
							Quick Navigation
						</h3>
					</div>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{QUICK_LINKS.map((link) => {
							const Icon = link.icon;
							return (
								<Link
									key={link.to}
									to={link.to as any}
									className="group rounded-xl border border-border/40 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md active:translate-y-0 active:shadow-xs"
								>
									<div className="flex items-center gap-4">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
											<Icon className="size-5" />
										</div>
										<div className="min-w-0">
											<p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
												{link.label}
											</p>
											<p className="text-xs text-muted-foreground/60 truncate">
												{link.description}
											</p>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				</div>

				{/* ── Footer ── */}
				<footer className="mt-16 border-t border-border/40 py-6">
					<div className="flex items-center justify-between text-xs text-muted-foreground/40">
						<div className="flex items-center gap-2">
							<User className="size-3" />
							<span>Minhajul Islam</span>
						</div>
						<p>Credets &mdash; Encrypted credential vault</p>
					</div>
				</footer>
			</main>
		</div>
	);
}
