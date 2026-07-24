import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "#/components/ui/sidebar";
import {
	Home,
	KeyRound,
	Tags,
	FileEdit,
	Heart,
	Trash2,
	Lock,
	User,
	Settings,
	LogOut,
	X,
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useSidebar } from "#/components/ui/sidebar";

const navItems = [
	{ label: "Home", icon: Home, to: "/" as const },
	{ label: "Credentials", icon: KeyRound, to: "/credentials" as const },
	{ label: "Types", icon: Tags, to: "#" },
	{ label: "Draft", icon: FileEdit, to: "/credentials/draft" as const },
	{ label: "Favorite", icon: Heart, to: "#" },
	{ label: "Trash", icon: Trash2, to: "/credentials/trash" as const },
	{ label: "Password", icon: Lock, to: "#" },
	{ label: "Profile", icon: User, to: "#" },
	{ label: "Settings", icon: Settings, to: "#" },
] as const;

export function CredentialsSidebar() {
	const location = useLocation();
	const { isMobile, setOpenMobile } = useSidebar();

	/**
	 * Determine if a nav item should be marked as active.
	 * For routes with `to: "#"`, they are never active.
	 * For typed routes, we check if the current path starts
	 * with the target path.
	 */
	const isActive = (itemTo: string) => {
		if (itemTo === "#") return false;
		const currentPath = location.pathname;
		// Match exactly or as a prefix (e.g. /credentials/123 matches /credentials)
		return (
			currentPath === itemTo ||
			(currentPath.startsWith(itemTo) && itemTo !== "/")
		);
	};

	return (
		<Sidebar collapsible="offcanvas">
			<SidebarHeader>
				<div className="flex items-center justify-between px-2 py-1">
					<div className="flex items-center gap-2">
						<span className="text-2xl font-bold leading-none tracking-tighter font-caveat">
							C.
						</span>
						<span className="text-sm font-medium text-muted-foreground">
							Credets
						</span>
					</div>
					{/* Close button — mobile only */}
					{isMobile && (
						<button
							type="button"
							onClick={() => setOpenMobile(false)}
							className="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
							aria-label="Close sidebar"
						>
							<X className="size-5" />
						</button>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup className="px-1">
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							{navItems.map((item) => {
								const active = isActive(item.to);

								const shared = (
									<>
										<item.icon className="size-5" />
										<span className="text-sm font-medium tracking-wide">
											{item.label}
										</span>
									</>
								);

								if (item.to === "#") {
									return (
										<SidebarMenuItem key={item.label}>
											<SidebarMenuButton
												size="lg"
												tooltip={item.label}
												className="rounded-xl py-3"
											>
												{shared}
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								}

								return (
									<SidebarMenuItem key={item.label}>
										<SidebarMenuButton
											render={<Link to={item.to} />}
											isActive={active}
											size="lg"
											tooltip={item.label}
											className="rounded-xl py-3"
										>
											{shared}
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="flex items-center gap-3 rounded-lg px-3 py-2">
							{/* Avatar */}
							<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
								<User className="size-5 text-sidebar-accent-foreground" />
							</div>
							{/* Name and email */}
							<div className="flex min-w-0 flex-1 flex-col">
								<span className="truncate text-sm font-medium text-sidebar-foreground">
									Minhajul Islam
								</span>
								<span className="truncate text-xs text-sidebar-foreground/50">
									nishatislam3108@gmail.com
								</span>
							</div>
							{/* Sign out button */}
							<button
								type="button"
								className="flex shrink-0 items-center justify-center rounded-md p-1 text-destructive/60 transition-colors hover:text-destructive"
								aria-label="Sign out"
							>
								<LogOut className="size-4" />
							</button>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
