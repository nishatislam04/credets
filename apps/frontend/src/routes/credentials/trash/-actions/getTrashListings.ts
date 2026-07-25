import type { TrashListingsResponse } from "@credets/shared-types/credentials/listings";

export async function getTrashListings(
	cursor?: string | null,
	limit = 12,
): Promise<TrashListingsResponse> {
	const params = new URLSearchParams({
		limit: String(limit),
	});
	if (cursor) params.set("cursor", cursor);

	const res = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/credentials/trash?${params.toString()}`,
	);

	const json = await res.json();
	if (!json.success)
		throw new Error(json.message || "Failed to fetch trash listings");

	return json.data as TrashListingsResponse;
}
