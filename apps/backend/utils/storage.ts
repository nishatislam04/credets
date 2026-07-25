import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { log } from "./logger";

/** Lazily-initialized S3 client singleton. */
let _s3: S3Client | null = null;

function getS3Client(): S3Client {
	if (!_s3) {
		const endpoint = process.env.STORAGE_ENDPOINT;
		const region = process.env.STORAGE_REGION;
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

/** Derive the public object URL from the S3 endpoint + bucket + key. */
function getPublicUrl(key: string): string {
	const bucket = process.env.STORAGE_BUCKET;

	// If STORAGE_PUBLIC_URL is set, use it directly (e.g. http://localhost:9000 for MinIO)
	const publicBase = process.env.STORAGE_PUBLIC_URL;
	if (publicBase) {
		return `${publicBase.replace(/\/+$/, "")}/${bucket}/${key}`;
	}

	const baseUrl = process.env.STORAGE_ENDPOINT!.replace("/storage/v1/s3", "");
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

	log.info("storage: uploading file to S3", { key: bucketPath });

	await s3.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: bucketPath,
			Body: buffer,
			ContentType: contentType,
		}),
	);

	const url = getPublicUrl(bucketPath);
	log.info("storage: upload completed", { url });

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

/**
 * Derive the S3 object key from a public storage URL.
 * Handles both Supabase format and MinIO/local format.
 */
export function extractKeyFromUrl(publicUrl: string): string | null {
	const bucket = process.env.STORAGE_BUCKET;

	// Try Supabase format: {baseUrl}/storage/v1/object/public/{bucket}/{key}
	const supabaseMarker = `/storage/v1/object/public/${bucket}/`;
	const supabaseIdx = publicUrl.indexOf(supabaseMarker);
	if (supabaseIdx !== -1) {
		return publicUrl.slice(supabaseIdx + supabaseMarker.length);
	}

	// Try MinIO/local format: {baseUrl}/{bucket}/{key}
	const publicBase = process.env.STORAGE_PUBLIC_URL;
	if (publicBase) {
		const base = publicBase.replace(/\/+$/, "");
		const minioMarker = `${base}/${bucket}/`;
		if (publicUrl.startsWith(minioMarker)) {
			return publicUrl.slice(minioMarker.length);
		}
	}

	return null;
}

/**
 * Generate the S3 prefix for all objects belonging to a credential.
 * Used to list/delete all images + thumbnail at once.
 */
export function credentialPrefix(credentialId: string): string {
	return `credentials/${credentialId}/`;
}

/**
 * Delete a single object from S3.
 *
 * S3 delete is idempotent — deleting a non-existent key does NOT throw.
 */
export async function deleteFromS3(key: string): Promise<void> {
	const bucket = process.env.STORAGE_BUCKET;
	const s3 = getS3Client();

	log.info("storage: deleting file from S3", { key });

	await s3.send(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: key,
		}),
	);
}

/**
 * Delete all objects under a given prefix from S3.
 *
 * Uses ListObjectsV2 to find all keys, then batch-deletes them with
 * DeleteObjectsCommand (up to 1,000 per call — handles pagination
 * automatically via ContinuationToken).
 *
 * Best practice for credential cleanup: call with `credentialPrefix(id)`.
 */
export async function deletePrefixFromS3(prefix: string): Promise<void> {
	const bucket = process.env.STORAGE_BUCKET;
	const s3 = getS3Client();

	log.info("storage: deleting prefix from S3", { prefix });

	let isTruncated = true;
	let continuationToken: string | undefined;

	while (isTruncated) {
		const listResponse = await s3.send(
			new ListObjectsV2Command({
				Bucket: bucket,
				Prefix: prefix,
				ContinuationToken: continuationToken,
			}),
		);

		const objects = listResponse.Contents;
		if (!objects || objects.length === 0) break;

		const keys = objects
			.filter((obj): obj is typeof obj & { Key: string } => obj.Key != null)
			.map((obj) => ({ Key: obj.Key }));

		if (keys.length > 0) {
			await s3.send(
				new DeleteObjectsCommand({
					Bucket: bucket,
					Delete: { Objects: keys },
				}),
			);
			log.info(
				"storage: batch delete completed",
				{ count: keys.length },
			);
		}

		isTruncated = listResponse.IsTruncated ?? false;
		continuationToken = listResponse.NextContinuationToken;
	}
}
