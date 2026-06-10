import { AppError } from "@backend/err/base";
import { DatabaseError } from "@backend/err/database";
import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";

export interface CredentialDetailRow {
	id: string;
	title: string;
	short_description: string | null;
	long_description: string | null;
	thumbnail_url: string | null;
	// biome-ignore lint/suspicious/noExplicitAny: data is JSONB type
	data: any;
	notes: string | null;
	// biome-ignore lint/suspicious/noExplicitAny: tags is JSONB type
	tags: any;
	created_at: Date;
	updated_at: Date | null;
	type_label: string | null;
	type_value: string | null;
}

/** Lightweight result for the update S3 cleanup flow. */
export interface CredentialImageUrlRow {
	id: string;
	image_url: string | null;
}

export interface CredentialImageRow {
	id: string;
	image_url: string | null;
}

export async function getCredentialDetailRepo(credentialId: string) {
	logAlways(credentialId, "repo: fetching credential detail");

	try {
		const [credential] = await sql<CredentialDetailRow[]>`
			SELECT
				c.id, c.title, c.short_description, c.long_description,
				c.thumbnail_url,
				c.data, c.notes, c.tags, c.created_at, c.updated_at,
				t.label AS type_label, t.value AS type_value
			FROM credentials c
			LEFT JOIN types t ON c.types_id = t.id
			WHERE c.id = ${credentialId}
		`;

		if (!credential) {
			return { credential: null, images: [] };
		}

		const images = await sql<CredentialImageRow[]>`
			SELECT id, image_url
			FROM credential_images
			WHERE credential_id = ${credentialId}
		`;

		return { credential, images };
	} catch (error) {
		logAlways(error, "repo: fetch credential detail queries failed");

		if (error instanceof AppError) {
			throw error;
		}

		throw new DatabaseError(error);
	}
}

/**
 * Fetch only image IDs + URLs for a credential.
 * Used by the update service to determine which S3 objects to delete.
 */
export async function getCredentialImageUrlsRepo(
	credentialId: string,
): Promise<CredentialImageUrlRow[]> {
	logAlways(credentialId, "repo: fetching credential image URLs");

	try {
		return await sql<CredentialImageUrlRow[]>`
			SELECT id, image_url FROM credential_images
			WHERE credential_id = ${credentialId}
		`;
	} catch (error) {
		logAlways(error, "repo: fetch credential image URLs failed");

		if (error instanceof AppError) {
			throw error;
		}

		throw new DatabaseError(error);
	}
}
