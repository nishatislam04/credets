import { AppError } from "@backend/err/base";
import { logAlways } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";
import { credentialsCreateSchema } from "@credets/shared-schema/credentials/create";
import type { BunRequest } from "bun";
import { createCredentialService } from "../../services/credentials/create";
import { parseAndValidateCredential } from "../../validation/credential/validator";

export async function credentialCreate(req: BunRequest) {
	const result = await parseAndValidateCredential(req, credentialsCreateSchema);

	if (!result.success) {
		return result.errorResponse;
	}

	const { validatedData, images, formData } = result;

	// Extract types_path from formdata
	const typesPathRaw = formData.get("types_path")?.toString() || null;
	const types_path: Array<{ value: string; label: string }> = typesPathRaw
		? (() => {
				try {
					return JSON.parse(typesPathRaw);
				} catch {
					return [];
				}
			})()
		: [];

	const is_draft = validatedData.data.is_draft ?? false;
	const is_favourite = validatedData.data.is_favourite ?? false;

	try {
		const createdResult = await createCredentialService({
			title: validatedData.data.title,
			type: validatedData.data.type,
			types_path,
			is_draft,
			is_favourite,
			short_description: validatedData.data.short_description ?? undefined,
			long_description: validatedData.data.long_description ?? undefined,
			notes: validatedData.data.notes ?? undefined,
			tags: validatedData.data.tags ?? undefined,
			data: validatedData.data.data,
			thumbnail: validatedData.data.thumbnail ?? null,
			images,
		});

		logAlways(
			validatedData.data.title,
			"http: credential created successfully",
		);

		return ResponseFactory.success({
			data: { id: createdResult.id },
			type: "resource-create",
			message: "A new credentials added",
			status: 200,
			path: req,
		});
	} catch (error) {
		logAlways(error, "http: error in credentialCreate controller");

		if (error instanceof AppError) {
			return ResponseFactory.error({
				error: error.message,
				type: error.type,
				message: "Failed to create credential",
				status: error.status,
				path: req,
			});
		}

		return ResponseFactory.error({
			error: "An unexpected error occurred",
			type: "internal-error",
			message: "Failed to create credential",
			status: 500,
			path: req,
			details: {
				originError: error instanceof Error ? error.message : "unknown error",
			},
		});
	}
}
