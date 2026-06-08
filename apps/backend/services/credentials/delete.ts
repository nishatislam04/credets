import { logAlways } from "@backend/utils/logger";
import { credentialPrefix, deletePrefixFromS3 } from "@backend/utils/storage";
import { deleteCredentialRepo } from "../../repository/credentials/delete";

export async function deleteCredentialService(
	credentialId: string,
): Promise<{ title: string }> {
	logAlways(credentialId, "service: starting credential deletion");

	try {
		// 1. Delete all S3 objects (thumbnail + images) for this credential
		await deletePrefixFromS3(credentialPrefix(credentialId));

		// 2. Delete from DB
		const result = await deleteCredentialRepo(credentialId);

		logAlways(
			credentialId,
			"service: credential deletion completed successfully",
		);
		return result;
	} catch (error) {
		logAlways(error, "service: error in deleteCredentialService");
		throw error;
	}
}
