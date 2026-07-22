import type { CredentialListingsResponse } from "@credets/shared-types/credentials/listings";

export type { CredentialListItem } from "@credets/shared-types/credentials/listings";

export async function getCredentialsListings(
	cursor?: string | null,
	limit = 12,
): Promise<CredentialListingsResponse> {
	const params = new URLSearchParams({
		limit: String(limit),
	});
	if (cursor) params.set("cursor", cursor);

	const res = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/credentials?${params.toString()}`,
	);

	const json = await res.json();
	if (!json.success)
		throw new Error(json.message || "Failed to fetch credentials");

	return json.data as CredentialListingsResponse;
}
