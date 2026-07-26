import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ErrorBoundary } from "#/components/error-boundary";
import { ThemeProvider } from "#/hooks/theme-provider";
import { Toaster } from "@/components/ui/toast";

import "../styles.css";

const showDevtools = import.meta.env.DEV || import.meta.env.MODE === "staging";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24, // 24hr
			staleTime: 1000 * 60 * 60 * 20, // 20hr
		},
	},
});

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ title: "Credets" },
			{
				name: "description",
				content: "Personal credential manager",
			},
			{
				name: "robots",
				content: "noindex, nofollow",
			},
			{
				property: "og:title",
				content: "Credets",
			},
			{
				property: "og:description",
				content: "Personal credential manager",
			},
			{
				property: "og:type",
				content: "website",
			},
		],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
			<HeadContent />
			<ErrorBoundary>
				<QueryClientProvider client={queryClient}>
					<Outlet />
				</QueryClientProvider>
			</ErrorBoundary>
			<Toaster offset="5rem" />
			{showDevtools && <TanStackRouterDevtools position="bottom-right" />}
		</ThemeProvider>
	);
}
