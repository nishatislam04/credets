import { createFileRoute } from "@tanstack/react-router";
import { CredentialCard } from "./-components/credential-card";

export const Route = createFileRoute("/credentials/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{/*{credentials.map((cred) => (
					<CredentialCard key={cred.id} credential={cred} />
				))}*/}
			</div>
		</div>
	);
}
