import { logAlways } from "@backend/utils/logger";
import { deleteCredentialRepo } from "../../repository/credentials/delete";

export async function deleteCredentialService(
	credentialId: string,
): Promise<{ title: string }> {
	logAlways(credentialId, "service: starting credential deletion");

	try {
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
