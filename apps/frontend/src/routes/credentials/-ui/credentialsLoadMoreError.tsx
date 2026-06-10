export function CredentialsLoadMoreError({
	loadMoreError,
	loadMore,
}: {
	loadMoreError: string | null;
	loadMore: () => void;
}) {
	return (
		<>
			<div className="text-center py-6">
				<p className="text-sm text-destructive/80 mb-2">{loadMoreError}</p>
				<button
					type="button"
					onClick={() => loadMore()}
					className="text-xs text-muted-foreground underline hover:text-foreground transition-colors cursor-pointer"
				>
					Try again
				</button>
			</div>
		</>
	);
}
