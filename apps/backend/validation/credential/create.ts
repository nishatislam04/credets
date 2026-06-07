import { ResponseFactory } from "@backend/utils/response";
import { credentialsCreateSchema } from "@credets/shared-schema/credentials/create";
import type { BunRequest } from "bun";
import { parseAndValidateCredential } from "./validator";

export async function createCredentialValidation(req: BunRequest) {
	const result = await parseAndValidateCredential(req, credentialsCreateSchema);

	if (!result.success) {
		return result.errorResponse;
	}

	return ResponseFactory.success({
		data: {},
		type: "form-validation",
		message: "Form validation passed",
		status: 200,
		path: req,
	});
}
