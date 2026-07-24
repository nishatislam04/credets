import { logAlways } from "@backend/utils/logger";
import { deleteCredentialRepo } from "../../repository/credentials/delete";

/**
 * Soft-delete a credential: marks it as deleted in the database without
 * removing data from S3, so it can be restored later from the trash.
 */
export async function deleteCredentialService(
	credentialId: string,
): Promise<{ title: string }> {
	logAlways(credentialId, "service: starting credential soft-deletion");

	try {
		// Soft delete: mark as deleted in DB (does NOT delete from S3)
		const result = await deleteCredentialRepo(credentialId);

		logAlways(
			credentialId,
			"service: credential soft-deleted successfully",
		);
		return result;
	} catch (error) {
		logAlways(error, "service: error in deleteCredentialService");
		throw error;
	}
}
