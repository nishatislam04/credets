import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";

// ── Suppress console.* in production (keep console.error for debugging) ─
if (import.meta.env.PROD) {
	const noop = () => {};
	console.log = noop;
	console.warn = noop;
	console.info = noop;
	console.debug = noop;
	// console.error intentionally left intact for production debugging
}

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
