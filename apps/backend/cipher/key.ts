const ALGORITHM = "AES-GCM" as const;

/** Lazily-derived AES-256 key, cached after first use. */
let _key: CryptoKey | null = null;

/**
 * Derive (and cache) a 256-bit AES key from the ENC_KEY env var.
 *
 * ENC_KEY must be a 64-character hex string (32 bytes → AES-256).
 */
export async function getKey(): Promise<CryptoKey> {
	if (_key) return _key;

	const raw = process.env.ENC_KEY;
	if (!raw) {
		throw new Error("ENC_KEY is required for encryption");
	}

	// Hex string → Uint8Array (32 bytes)
	const rawBytes = new Uint8Array(raw.length / 2);
	for (let i = 0; i < raw.length; i += 2) {
		rawBytes[i / 2] = Number.parseInt(raw.slice(i, i + 2), 16);
	}

	_key = await crypto.subtle.importKey("raw", rawBytes, ALGORITHM, false, [
		"encrypt",
		"decrypt",
	]);

	return _key;
}
