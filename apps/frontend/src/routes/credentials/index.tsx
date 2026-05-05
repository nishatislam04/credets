import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/credentials/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>credentials listings page</div>;
}
