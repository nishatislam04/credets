import { log } from "@backend/utils/logger";
import { permanentDeleteCredentialRepo } from "../../repository/credentials/permanent-delete";

/**
 * Permanently delete a credential from the database (hard delete).
 * This also removes associated credential_images rows.
 */
export async function permanentDeleteCredentialService(
	credentialId: string,
): Promise<{ title: string }> {
	log.info("service: starting permanent-delete", { credentialId });

	try {
		const result = await permanentDeleteCredentialRepo(credentialId);

		log.info(
			"service: credential permanently deleted successfully",
			{ credentialId },
		);
		return result;
	} catch (error) {
		log.error("service: error in permanentDeleteCredentialService", {
			err: {
				message:
					error instanceof Error ? error.message : "unknown error",
			},
		});
		throw error;
	}
}
