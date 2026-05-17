import { createCredentialFormdata } from "../-utils/createCredentialFormdata";

export async function createCredentialValidation(value) {
	try {
		const formdata = createCredentialFormdata(value);

		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_APP}/credentials/create/validation`,
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
