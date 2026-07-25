import type { FavouriteListingsResponse } from "@credets/shared-types/credentials/listings";

export async function getFavouriteListings(
	cursor?: string | null,
	limit = 12,
): Promise<FavouriteListingsResponse> {
	const params = new URLSearchParams({
		limit: String(limit),
	});
	if (cursor) params.set("cursor", cursor);

	const res = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/credentials/favourite?${params.toString()}`,
	);

	const json = await res.json();
	if (!json.success)
		throw new Error(json.message || "Failed to fetch favourite listings");

	return json.data as FavouriteListingsResponse;
}
