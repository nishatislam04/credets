import { logAlways } from "@backend/utils/logger";
import { permanentDeleteCredentialRepo } from "../../repository/credentials/permanent-delete";

/**
 * Permanently delete a credential from the database (hard delete).
 * This also removes associated credential_images rows.
 */
export async function permanentDeleteCredentialService(
	credentialId: string,
): Promise<{ title: string }> {
	logAlways(credentialId, "service: starting permanent-delete");

	try {
		const result = await permanentDeleteCredentialRepo(credentialId);

		logAlways(
			credentialId,
			"service: credential permanently deleted successfully",
		);
		return result;
	} catch (error) {
		logAlways(error, "service: error in permanentDeleteCredentialService");
		throw error;
	}
}
