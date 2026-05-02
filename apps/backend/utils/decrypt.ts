import * as Iron from "iron-webcrypto";

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
