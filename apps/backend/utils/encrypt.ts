import * as Iron from "iron-webcrypto";

/**
 * only provide the payload to encrypt it
 * @param {string} dataToEncrypt - the payload
 * @returns {string | {success: false, message:"encryption key is required" }}
 */
export async function encrypt(
	dataToEncrypt: string,
): Promise<string | { success: false; message: "encryption key is required" }> {
	const key = process.env.ENC_KEY;
	if (!key) return { success: false, message: "encryption key is required" };

	const sealedValue = await Iron.seal(dataToEncrypt, key, Iron.defaults);
	return sealedValue;
}
