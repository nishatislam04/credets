import { AppError } from "@backend/err/base";
import { DatabaseError } from "@backend/err/database";
import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";

export interface CursorPayload {
	deletedAt: string;
	id: string;
}

export interface TrashRow {
	id: string;
	title: string;
	short_description: string | null;
	long_description: string | null;
	notes: string | null;
	thumbnail_url: string | null;
	tags: string | null;
	created_at: Date;
	updated_at: Date | null;
	deleted_at: Date;
	type_label: string | null;
	type_value: string | null;
	version: number;
	is_draft: boolean;
	is_favourite: boolean;
}

export interface TrashImageRow {
	id: string;
	image_url: string | null;
	credential_id: string;
}

export async function getTrashImagesRepo(
	credentialIds: string[],
): Promise<TrashImageRow[]> {
	if (credentialIds.length === 0) return [];

	try {
		// Manually format as a PostgreSQL array literal: {uuid1,uuid2,...}
		// Bun's SQL client does not auto-serialize JS arrays for ANY/IN clauses.
		const idsLiteral = `{${credentialIds.join(",")}}`;

		return await sql<TrashImageRow[]>`
			SELECT id, image_url, credential_id
			FROM credential_images
			WHERE credential_id = ANY(${idsLiteral}::uuid[])
			ORDER BY sort_order ASC
		`;
	} catch (error) {
		logAlways(error, "repo: fetch trash images failed");
		if (error instanceof AppError) throw error;
		if (error instanceof DatabaseError) throw new DatabaseError(error);
		throw error;
	}
}

export async function getTrashListingsRepo(
	limit: number,
	cursorResult: CursorPayload | null,
): Promise<TrashRow[]> {
	try {
		if (cursorResult) {
			return await sql<TrashRow[]>`
				SELECT
					credentials.id, credentials.title,
					credentials.short_description, credentials.long_description,
					credentials.notes,
					credentials.thumbnail_url, credentials.version,
					credentials.tags, credentials.created_at, credentials.updated_at,
					credentials.deleted_at,
					credentials.is_draft, credentials.is_favourite,
					t.label AS type_label, t.value AS type_value
				FROM credentials
				LEFT JOIN types t ON credentials.types_id = t.id
				WHERE
					credentials.is_deleted = true
					AND (
						(credentials.deleted_at < ${cursorResult.deletedAt}::timestamptz)
						OR (credentials.deleted_at = ${cursorResult.deletedAt}::timestamptz AND credentials.id < ${cursorResult.id}::uuid)
					)
				ORDER BY credentials.deleted_at DESC, credentials.id DESC
				LIMIT ${limit + 1}
			`;
		}

		return await sql<TrashRow[]>`
			SELECT
				credentials.id, credentials.title,
				credentials.short_description, credentials.long_description,
				credentials.notes,
				credentials.thumbnail_url, credentials.version,
				credentials.tags, credentials.created_at, credentials.updated_at,
				credentials.deleted_at,
				credentials.is_draft, credentials.is_favourite,
				t.label AS type_label, t.value AS type_value
			FROM credentials
			LEFT JOIN types t ON credentials.types_id = t.id
			WHERE credentials.is_deleted = true
			ORDER BY credentials.deleted_at DESC, credentials.id DESC
			LIMIT ${limit + 1}
		`;
	} catch (error) {
		logAlways(error, "repo: trash listings query failed");

		if (error instanceof AppError) throw error;
		if (error instanceof DatabaseError) throw new DatabaseError(error);

		throw error;
	}
}
