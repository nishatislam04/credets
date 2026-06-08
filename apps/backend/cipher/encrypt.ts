import { getKey } from "./key";

const IV_LENGTH = 12; // 96-bit nonce — standard for GCM

/**
 * Encrypt a plaintext string using AES-256-GCM.
 *
 * Output format: `base64(iv).base64(ciphertext + authTag)`
 * The IV is randomly generated for every call (required for GCM security).
 */
export async function encrypt(plaintext: string): Promise<string> {
	const key = await getKey();
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
	const encoded = new TextEncoder().encode(plaintext);

	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		encoded,
	);

	// `encrypted` = ciphertext + 16-byte GCM auth tag (appended by the API)
	const combined = new Uint8Array(encrypted);
	const ivBase64 = btoa(String.fromCodePoint(...iv));
	const dataBase64 = btoa(String.fromCodePoint(...combined));

	return `${ivBase64}.${dataBase64}`;
}
