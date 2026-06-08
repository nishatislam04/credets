import { logAlways } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";
import type { BunRequest } from "bun";
import { getCredentialDetailService } from "../../services/credentials/credential";

export async function credentialPage(req: BunRequest) {
	try {
		const { credentialId } = req.params;

		if (!credentialId) {
			return ResponseFactory.error({
				error: "bad request",
				message: "Credential ID is required",
				status: 400,
				path: req,
				data: {},
			});
		}

		const parsed = await getCredentialDetailService(credentialId);

		if (!parsed) {
			return ResponseFactory.error({
				error: "not found",
				message: "credential not found",
				status: 404,
				path: req,
				data: {},
			});
		}

		return ResponseFactory.success({
			data: parsed,
			path: req,
			message: "credential fetched",
			status: 200,
		});
	} catch (error) {
		logAlways(error, "http: error in credentialPage controller");
		return ResponseFactory.error({
			error: "database error",
			message: "failed to fetch credential",
			status: 500,
			path: req,
			details: {
				originError: error instanceof Error ? error.message : "unknown error",
			},
			data: {},
		});
	}
}
