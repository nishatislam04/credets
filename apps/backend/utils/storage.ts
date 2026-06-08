import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { logAlways } from "./logger";

/** Lazily-initialized S3 client singleton. */
let _s3: S3Client | null = null;

function getS3Client(): S3Client {
	if (!_s3) {
		const endpoint = process.env.STORAGE_ENDPOINT;
		const region = process.env.STORAGE_REGION || "ap-southeast-1";
		const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
		const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;

		if (!endpoint || !accessKeyId || !secretAccessKey) {
			throw new Error(
				"Missing S3 storage credentials. Check STORAGE_* env vars.",
			);
		}

		_s3 = new S3Client({
			region,
			endpoint,
			credentials: { accessKeyId, secretAccessKey },
			forcePathStyle: true, // Required for S3-compatible services like Supabase
		});
	}
	return _s3;
}

/** Derive the Supabase public object URL from the S3 endpoint + bucket + key. */
function getPublicUrl(key: string): string {
	const endpoint = process.env.STORAGE_ENDPOINT!;
	const bucket = process.env.STORAGE_BUCKET || "credentials";

	// Endpoint: https://{project}.storage.supabase.co/storage/v1/s3
	// Public URL: https://{project}.storage.supabase.co/storage/v1/object/public/{bucket}/{key}
	const baseUrl = endpoint.replace("/storage/v1/s3", "");
	return `${baseUrl}/storage/v1/object/public/${bucket}/${key}`;
}

export interface S3UploadResult {
	url: string;
	key: string;
}

/**
 * Upload a buffer to Supabase Storage (S3-compatible) and return its public URL + key.
 *
 * @param bucketPath - object key, e.g. `credentials/{id}/images/{uuid}.webp`
 * @param buffer     - raw image bytes
 * @param contentType - MIME type, e.g. `image/webp`
 */
export async function uploadToS3(
	bucketPath: string,
	buffer: Uint8Array,
	contentType: string,
): Promise<S3UploadResult> {
	const bucket = process.env.STORAGE_BUCKET || "credentials";
	const s3 = getS3Client();

	logAlways(bucketPath, "storage: uploading file to S3");

	await s3.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: bucketPath,
			Body: buffer,
			ContentType: contentType,
		}),
	);

	const url = getPublicUrl(bucketPath);
	logAlways(url, "storage: upload completed — public URL");

	return { url, key: bucketPath };
}

/**
 * Generate a unique S3 object key for a credential image.
 *
 * @param credentialId - the credential's UUID
 * @param filename - optional unique suffix (e.g. UUID or sort-order)
 */
export function credentialImageKey(
	credentialId: string,
	filename: string,
): string {
	return `credentials/${credentialId}/images/${filename}`;
}

/**
 * Generate the S3 object key for a credential thumbnail.
 */
export function credentialThumbnailKey(credentialId: string): string {
	return `credentials/${credentialId}/thumbnail.webp`;
}
