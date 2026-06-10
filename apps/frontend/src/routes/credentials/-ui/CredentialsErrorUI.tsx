export function CredentialsErrorUI({ error }: { error: Error }) {
	return (
		<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
			<p className="text-sm text-destructive/80 mb-2">
				{error instanceof Error ? error.message : "Failed to load credentials"}
			</p>
		</div>
	);
}
