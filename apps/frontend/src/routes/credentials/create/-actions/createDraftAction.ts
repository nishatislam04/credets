import { createCredentialFormdata } from "../-utils/createCredentialFormdata";

/**
 * Submit the current form values as a draft, bypassing full validation.
 * This allows saving incomplete credentials (e.g. missing title/types).
 */
export async function createDraftAction(value: Record<string, unknown>) {
	const formdata = createCredentialFormdata({
		...value,
		is_draft: true,
	} as any);

	const response = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/credentials/create`,
		{
			method: "POST",
			body: formdata,
		},
	);

	const result = await response.json();

	if (!response.ok) {
		throw new Error(
			result?.message || "Failed to save draft. Please try again later.",
		);
	}

	return result;
}
