import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="p-8">
			<p>main page updated</p>
		</div>
	);
}
