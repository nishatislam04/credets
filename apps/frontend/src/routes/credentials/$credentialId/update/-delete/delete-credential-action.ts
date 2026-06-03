export async function deleteCredentialAction({
	credentialId,
	csrfToken,
}: {
	credentialId: string;
	csrfToken: string;
}) {
	const res = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/credentials/${credentialId}/delete`,
		{
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ _csrf: csrfToken }),
		},
	);

	const data = await res.json();

	if (!res.ok || !data.success) {
		throw new Error(data.message || "Failed to delete");
	}

	return data;
}
