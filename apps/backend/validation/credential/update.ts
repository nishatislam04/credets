import { ResponseFactory } from "@backend/utils/response";
import { credentialsUpdateSchema } from "@credets/shared-schema/credentials/update";
import type { BunRequest } from "bun";
import { parseAndValidateCredential } from "./validator";

export async function updateCredentialValidation(req: BunRequest) {
	const result = await parseAndValidateCredential(req, credentialsUpdateSchema);

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
