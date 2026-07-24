import { AppError } from "@backend/err/base";
import { DatabaseError } from "@backend/err/database";
import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";

export interface CursorPayload {
	createdAt: string;
	id: string;
}
export interface CredentialRow {
	id: string;
	title: string;
	short_description: string | null;
	thumbnail_url: string | null;
	tags: string | null;
	created_at: Date;
	updated_at: Date | null;
	type_label: string | null;
	type_value: string | null;
	version: number;
	is_draft: boolean;
	is_favourite: boolean;
}

export async function getCredentialsListingsRepo(
	limit: number,
	cursorResult: CursorPayload | null,
): Promise<CredentialRow[]> {
	try {
		if (cursorResult) {
			return await sql<CredentialRow[]>`
				SELECT
					credentials.id, credentials.title, credentials.short_description,
					credentials.thumbnail_url, credentials.version,
					credentials.tags, credentials.created_at, credentials.updated_at,
					t.label AS type_label, t.value AS type_value
				FROM credentials
				LEFT JOIN types t ON credentials.types_id = t.id
				WHERE
					credentials.is_draft = false
					AND credentials.is_deleted = false
					AND (
						(credentials.created_at < ${cursorResult.createdAt}::timestamptz)
						OR (credentials.created_at = ${cursorResult.createdAt}::timestamptz AND credentials.id < ${cursorResult.id}::uuid)
					)
					ORDER BY credentials.created_at DESC, credentials.id DESC
				LIMIT ${limit + 1}
			`;
		}

		return await sql<CredentialRow[]>`
			SELECT
				credentials.id, credentials.title, credentials.short_description,
				credentials.thumbnail_url, credentials.version,
				credentials.tags, credentials.created_at, credentials.updated_at,
				credentials.is_draft, credentials.is_favourite,
				t.label AS type_label, t.value AS type_value
			FROM credentials
			LEFT JOIN types t ON credentials.types_id = t.id
			WHERE credentials.is_draft = false
			AND credentials.is_deleted = false
			ORDER BY credentials.created_at DESC, credentials.id DESC
			LIMIT ${limit + 1}
		`;
	} catch (error) {
		logAlways(error, "repo: credentials listings query failed");

		if (error instanceof AppError) throw error;

		if (error instanceof DatabaseError) throw new DatabaseError(error);

		throw error;
	}
}
