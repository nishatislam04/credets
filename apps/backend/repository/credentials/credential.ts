import { AppError } from "@backend/err/base";
import { DatabaseError } from "@backend/err/database";
import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";

export interface CredentialDetailRow {
	id: string;
	title: string;
	short_description: string | null;
	long_description: string | null;
	thumbnail_image_data: Buffer | null;
	thumbnail_format: string | null;
	thumbnail_width: number | null;
	thumbnail_height: number | null;
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

export interface CredentialImageRow {
	id: string;
	image_data: Buffer | null;
	format: string | null;
	width: number | null;
	height: number | null;
	byte_size: number | null;
	sort_order: number | null;
}

export async function getCredentialDetailRepo(credentialId: string) {
	logAlways(credentialId, "repo: fetching credential detail");

	try {
		const [credential] = await sql<CredentialDetailRow[]>`
			SELECT
				c.id, c.title, c.short_description, c.long_description,
				c.thumbnail_image_data, c.thumbnail_format,
				c.thumbnail_width, c.thumbnail_height,
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
			SELECT id, image_data, format, width, height, byte_size, sort_order
			FROM credential_images
			WHERE credential_id = ${credentialId}
			ORDER BY sort_order ASC, created_at ASC
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
