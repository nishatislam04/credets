import { AppError } from "@backend/err/base";
import { DatabaseError } from "@backend/err/database";
import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";

export interface CursorPayload {
	createdAt: string;
	id: string;
}	export interface CredentialRow {
	id: string;
	title: string;
	short_description: string | null;
	thumbnail_url: string | null;
	tags: string;
	created_at: Date;
	type_label: string | null;
	type_value: string | null;
}

export async function getCredentialsListingsRepo(
	limit: number,
	cursor: CursorPayload | null,
): Promise<CredentialRow[]> {
	logAlways(cursor, `repo: fetching credentials listings with limit: ${limit}`);

	try {
		if (cursor) {
			return await sql<CredentialRow[]>`
				SELECT
					c.id, c.title, c.short_description,
					c.thumbnail_url,
					c.tags, c.created_at,
					t.label AS type_label, t.value AS type_value
				FROM credentials c
				LEFT JOIN types t ON c.types_id = t.id
				WHERE
					(c.created_at < ${cursor.createdAt}::timestamptz)
					OR (c.created_at = ${cursor.createdAt}::timestamptz AND c.id::text < ${cursor.id})
				ORDER BY c.created_at DESC, c.id DESC
				LIMIT ${limit + 1}
			`;
		}

		return await sql<CredentialRow[]>`
			SELECT
				c.id, c.title, c.short_description,
				c.thumbnail_url,
				c.tags, c.created_at,
				t.label AS type_label, t.value AS type_value
			FROM credentials c
			LEFT JOIN types t ON c.types_id = t.id
			ORDER BY c.created_at DESC, c.id DESC
			LIMIT ${limit + 1}
		`;
	} catch (error) {
		logAlways(error, "repo: credentials listings query failed");

		if (error instanceof AppError) {
			throw error;
		}

		throw new DatabaseError(error);
	}
}
