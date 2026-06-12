import { createReactPlugin } from "@tanstack/devtools-utils/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel, formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import {
	TanStackRouterDevtools,
	TanStackRouterDevtoolsPanel,
} from "@tanstack/react-router-devtools";
import { GooeyToaster } from "@/components/ui/goey-toaster";

import "../styles.css";

export const Route = createRootRoute({
	component: RootComponent,
});

// Create the plugins with the utility
const [RouterPlugin] = createReactPlugin({
	name: "TanStack Router",
	Component: TanStackRouterDevtoolsPanel,
});

const [FormPlugin] = createReactPlugin({
	name: "TanStack Form",
	Component: FormDevtoolsPanel,
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
			<TanStackRouterDevtools position="bottom-right" />
			{/*<TanStackDevtools plugins={[formDevtoolsPlugin()]} />*/}
		</ThemeProvider>
	);
}
