import { log } from "@backend/utils/logger";
import { deleteCredentialRepo } from "../../repository/credentials/delete";

/**
 * Soft-delete a credential: marks it as deleted in the database without
 * removing data from S3, so it can be restored later from the trash.
 */
export async function deleteCredentialService(
	credentialId: string,
): Promise<{ title: string }> {
	log.info("service: starting credential soft-deletion", {
		credentialId,
	});

	try {
		// Soft delete: mark as deleted in DB (does NOT delete from S3)
		const result = await deleteCredentialRepo(credentialId);

		log.info(
			"service: credential soft-deleted successfully",
			{ credentialId },
		);
		return result;
	} catch (error) {
		log.error("service: error in deleteCredentialService", {
			err: {
				message:
					error instanceof Error ? error.message : "unknown error",
			},
		});
		throw error;
	}
}
