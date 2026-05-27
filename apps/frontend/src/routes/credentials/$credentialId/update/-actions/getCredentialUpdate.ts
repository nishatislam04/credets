import type { CredentialDetail } from "@credets/shared-types/credentials/listings";

interface ApiResponse {
	success: boolean;
	message?: string;
	data: CredentialDetail;
}

export async function getCredentialUpdate(
	credentialId: string,
): Promise<CredentialDetail> {
	const res = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/credentials/${credentialId}`,
	);

	if (!res.ok) throw new Error("Failed to fetch credential");

	const json = (await res.json()) as ApiResponse;
	if (!json.success)
		throw new Error(json.message || "Failed to fetch credential");

	return json.data;
}
