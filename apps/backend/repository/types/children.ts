import { AppError } from "@backend/err/base";
import { DatabaseError } from "@backend/err/database";
import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";

export interface TypeChildRow {
	id: string;
	label: string;
	value: string;
	parent_id: string | null;
}

export async function getChildTypesRepo(
	parentValue: string,
): Promise<TypeChildRow[]> {
	logAlways(`Fetching children for parent: ${parentValue}`);

	try {
		const children = await sql<TypeChildRow[]>`
			SELECT t.id, t.label, t.value, t.parent_id
			FROM types t
			WHERE t.parent_id = (
				SELECT id FROM types WHERE value = ${parentValue}
			)
			ORDER BY t.label ASC
		`;

		return children;
	} catch (error) {
		logAlways(error, "repo: failed to fetch child types");

		if (error instanceof AppError) throw error;
		throw new DatabaseError(error);
	}
}
