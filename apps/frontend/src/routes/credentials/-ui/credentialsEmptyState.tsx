export function CredentialsEmptyState() {
	return (
		<>
			<div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
				<span className="text-2xl text-muted-foreground/40">~</span>
			</div>
			<h3 className="text-base font-medium text-muted-foreground">No credentials yet</h3>
			<p className="text-sm text-muted-foreground/60 mt-1">
				Create your first credential to get started
			</p>
		</>
	);
}
