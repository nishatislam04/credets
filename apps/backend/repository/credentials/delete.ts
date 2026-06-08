import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";
import { AppError } from "@backend/err/base";
import { DatabaseError } from "@backend/err/database";
import { NotFoundError } from "@backend/err/not-found";

export async function deleteCredentialRepo(
	credentialId: string,
): Promise<{ title: string }> {
	logAlways(credentialId, "repo: starting delete transaction");

	try {
		return await sql.begin(async (sql) => {
			const [existing] = await sql`
				SELECT title FROM credentials WHERE id = ${credentialId}
			`;

			if (!existing) {
				throw new NotFoundError("Credential");
			}

			await sql`DELETE FROM credentials WHERE id = ${credentialId}`;

			return { title: existing.title as string };
		});
	} catch (error) {
		logAlways(error, "repo: delete query failed");

		if (error instanceof AppError) {
			throw error;
		}

		throw new DatabaseError(error);
	}
}
