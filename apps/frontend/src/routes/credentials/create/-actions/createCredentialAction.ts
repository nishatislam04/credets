import { createCredentialFormdata } from "../-utils/createCredentialFormdata";

/**
 * this func will only be used, when we want to create a credential in submit handler
 */
export async function createCredentialAction(value) {
	try {
		const formdata = createCredentialFormdata(value);

		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_APP}/credentials/create`,
			{
				method: "POST",
				body: formdata,
			},
		);
		return await response.json();
	} catch (_) {
		throw new Error("something went wrong on server while creating resource");
	}
}
