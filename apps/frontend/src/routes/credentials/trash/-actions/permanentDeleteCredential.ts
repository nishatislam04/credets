interface PermanentDeleteResponse {
	success: boolean;
	message?: string;
}

export async function permanentDeleteCredentialAction({
	credentialId,
	csrfToken,
}: {
	credentialId: string;
	csrfToken: string;
}) {
	const res = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/credentials/${credentialId}/permanent-delete`,
		{
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ _csrf: csrfToken }),
		},
	);

	const data = (await res.json()) as PermanentDeleteResponse;

	if (!res.ok || !data.success) {
		throw new Error(data.message || "Failed to permanently delete credential");
	}

	return data;
}
