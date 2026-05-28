import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { GooeyToaster } from "@/components/ui/goey-toaster";
import { ThemeProvider } from "@/hooks/useTheme.tsx";

import "../styles.css";

export const Route = createRootRoute({
	component: RootComponent,
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 0, // turning off client side full cache system
			staleTime: 0, // turning off client side full cache system
		},
	},
});

function RootComponent() {
	return (
		<ThemeProvider>
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
