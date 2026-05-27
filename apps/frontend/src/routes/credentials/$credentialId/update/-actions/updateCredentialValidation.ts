import { createUpdateCredentialFormdata } from "./updateCredentialFormdata";

interface UpdateFormValues {
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
	newImages: File[];
	existingImagesKeep: string[];
}

export async function updateCredentialValidation(value: UpdateFormValues) {
	try {
		const formdata = createUpdateCredentialFormdata(value);

		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_APP}/credentials/${value.credentialId}/update/validation`,
			{
				method: "POST",
				body: formdata,
			},
		);
		return await response.json();
	} catch (_) {
		throw new Error("something went wrong on server while validating resource");
	}
}

export type { UpdateFormValues };
