import type { CredentialDetail } from "@credets/shared-types/credentials/listings";
import { createUpdateCredentialFormdata } from "./updateCredentialFormdata";

interface ApiResponse {
	success: boolean;
	type?: string;
	message?: string;
	errors?: Record<string, string[]>;
	data?: CredentialDetail;
}

interface UpdatePayload {
	_csrf: string;
	credentialId: string;
	title: string;
	type: string;
	short_description?: string | null;
	long_description?: string | null;
	thumbnail: File | null;
	data: Array<{
		type: string;
		value?: string;
		key?: string;
	}>;
	notes?: string | null;
	tags?: string | null;
	removeThumbnail?: boolean;
	newImages: File[];
	existingImagesKeep: string[];
}

export async function updateCredentialAction(value: UpdatePayload) {
	try {
		const formdata = createUpdateCredentialFormdata(value);

		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_APP}/credentials/${value.credentialId}/update`,
			{
				method: "POST",
				body: formdata,
			},
		);

		const result = (await response.json()) as ApiResponse;

		if (!result.success) {
			if (result.type === "csrf-expired") {
				throw new Error("Session expired. Please refresh the page and try again.");
			}
			if (result.type === "form-validation" && result.errors) {
				throw new Error("Validation failed. Please fix the form errors.");
			}
			throw new Error(result.message || "Failed to update credential");
		}

		return result;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error("Something went wrong on the server while updating the credential");
	}
}
