import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";

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
				throw new Error("Credential not found");
			}

			await sql`DELETE FROM credentials WHERE id = ${credentialId}`;

			return { title: existing.title as string };
		});
	} catch (error) {
		logAlways(error, "repo: delete query failed");
		throw error;
	}
}
