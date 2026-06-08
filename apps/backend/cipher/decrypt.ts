import { getKey } from "./key";

/**
 * Decrypt a ciphertext string previously produced by `encrypt()`.
 *
 * Input format: `base64(iv).base64(ciphertext + tag)`
 *
 * @param sealed - ciphertext in the format produced by encrypt()
 * @returns the original plaintext string
 */
export async function decrypt(sealed: string): Promise<string> {
	const key = await getKey();

	const dot = sealed.indexOf(".");
	if (dot === -1) {
		throw new Error("Decryption failed: malformed ciphertext");
	}

	const ivBase64 = sealed.slice(0, dot);
	const dataBase64 = sealed.slice(dot + 1);

	const iv = Uint8Array.from(atob(ivBase64), (c) => c.codePointAt(0)!);
	const combined = Uint8Array.from(atob(dataBase64), (c) => c.codePointAt(0)!);

	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		key,
		combined,
	);

	return new TextDecoder().decode(decrypted);
}
