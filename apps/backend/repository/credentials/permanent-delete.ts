import { log } from "@backend/utils/logger";
import { sql } from "@db/connection";
import { AppError } from "@backend/err/base";
import { DatabaseError } from "@backend/err/database";
import { NotFoundError } from "@backend/err/not-found";

export async function permanentDeleteCredentialRepo(
	credentialId: string,
): Promise<{ title: string }> {
	log.info("repo: starting permanent-delete transaction", {
		credentialId,
	});

	try {
		return await sql.begin(async (sql) => {
			const [existing] = await sql`
				SELECT title FROM credentials WHERE id = ${credentialId}
			`;

			if (!existing) {
				throw new NotFoundError("Credential");
			}

			// Delete associated images first
			await sql`
				DELETE FROM credential_images WHERE credential_id = ${credentialId}
			`;

			// Hard delete the credential
			await sql`
				DELETE FROM credentials WHERE id = ${credentialId}
			`;

			return { title: existing.title as string };
		});
	} catch (error) {
		log.error("repo: permanent-delete query failed", {
			err: {
				message:
					error instanceof Error ? error.message : "unknown error",
			},
		});

		if (error instanceof AppError) {
			throw error;
		}

		throw new DatabaseError(error);
	}
}
