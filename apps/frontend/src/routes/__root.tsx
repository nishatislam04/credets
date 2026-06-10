import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { GooeyToaster } from "@/components/ui/goey-toaster";

import "../styles.css";

export const Route = createRootRoute({
	component: RootComponent,
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "#/hooks/theme-provider";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 15 * 60 * 1000, // 15min
			gcTime: 3 * 60 * 1000, // 3min
		},
	},
});

function RootComponent() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
			<QueryClientProvider client={queryClient}>
				<Outlet />
			</QueryClientProvider>
			<GooeyToaster />
			<TanStackDevtools
				config={{
					theme: "light",
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "TanStack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
					{
						name: "Tanstack Form",
						render: <FormDevtoolsPanel />,
					},
				]}
			/>
		</ThemeProvider>
	);
}
