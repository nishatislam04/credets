import * as Iron from "iron-webcrypto";

/**
 * only provide the sealed data to get the decrypted data
 *
 * @param {string} sealedData - the encrypted data as payload
 * @returns Promise<{unknown | string | {success: false, message: "encryption key is required" }}>
 */
export async function decrypt(
	sealedData: string,
): Promise<
	string | unknown | { success: false; message: "encryption key is required" }
> {
	const key = process.env.ENC_KEY;
	if (!key) return { success: false, message: "encryption key is required" };

	const unSealedValue = await Iron.unseal(sealedData, key, Iron.defaults);
	return unSealedValue;
}
