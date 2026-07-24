import type { DraftListingsResponse } from "@credets/shared-types/credentials/listings";

export async function getDraftListings(
	cursor?: string | null,
	limit = 12,
): Promise<DraftListingsResponse> {
	const params = new URLSearchParams({
		limit: String(limit),
	});
	if (cursor) params.set("cursor", cursor);

	const res = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/credentials/draft?${params.toString()}`,
	);

	const json = await res.json();
	if (!json.success)
		throw new Error(json.message || "Failed to fetch draft listings");

	return json.data as DraftListingsResponse;
}
