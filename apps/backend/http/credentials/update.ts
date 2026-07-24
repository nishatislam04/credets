import { AppError } from "@backend/err/base";
import { logAlways, logger } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";
import { credentialsUpdateSchema } from "@credets/shared-schema/credentials/update";
import type { BunRequest } from "bun";
import { updateCredentialService } from "../../services/credentials/update";
import { parseAndValidateCredential } from "../../validation/credential/validator";

export async function credentialUpdate(req: BunRequest) {
	const result = await parseAndValidateCredential(req, credentialsUpdateSchema);

	logger(result);

	if (!result.success) {
		return result.errorResponse;
	}

	const { validatedData, images, formData } = result;
	const { credentialId } = req.params;

	if (!credentialId) {
		return ResponseFactory.error({
			error: "bad request",
			message: "Credential ID is required",
			status: 400,
			path: req,
		});
	}

	// Extract thumbnail removal request
	const removeThumbnail =
		formData.get("remove_thumbnail")?.toString() === "true";

	// Extract existing_images_keep
	const existing_images_keep_raw =
		formData.get("existing_images_keep")?.toString() || null;
	const existingImagesKeep: string[] = existing_images_keep_raw
		? (() => {
				try {
					const parsed = JSON.parse(existing_images_keep_raw);
					return Array.isArray(parsed) ? parsed : [];
				} catch {
					return [];
				}
			})()
		: [];

	// Extract types_path
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

	// Extract is_draft from formdata (set by validator)
	// Note: must differentiate between "false" (publish) and null (not set)
	const isDraftRaw = formData.get("is_draft")?.toString() || null;
	let is_draft: boolean | undefined;
	if (isDraftRaw === "true" || isDraftRaw === "1") is_draft = true;
	else if (isDraftRaw === "false" || isDraftRaw === "0") is_draft = false;

	try {
		await updateCredentialService({
			credentialId,
			is_draft,
			title: validatedData.data.title ?? "",
			type: validatedData.data.type ?? "",
			types_path,
			short_description: validatedData.data.short_description ?? undefined,
			long_description: validatedData.data.long_description ?? undefined,
			notes: validatedData.data.notes ?? undefined,
			tags: validatedData.data.tags ?? undefined,
			data: validatedData.data.data ?? [],
			thumbnail: validatedData.data.thumbnail ?? null,
			removeThumbnail,
			images,
			existingImagesKeep,
		});

		logAlways(credentialId, "http: credential updated successfully");

		return ResponseFactory.success({
			data: {},
			type: "resource-update",
			message: "Credential updated successfully",
			status: 200,
			path: req,
		});
	} catch (error) {
		logAlways(error, "http: error in credentialUpdate controller");

		if (error instanceof AppError) {
			return ResponseFactory.error({
				error: error.message,
				type: error.type,
				message: "Failed to update credential",
				status: error.status,
				path: req,
			});
		}

		return ResponseFactory.error({
			error: "An unexpected error occurred",
			type: "internal-error",
			message: "Failed to update credential",
			status: 500,
			path: req,
			details: {
				originError: error instanceof Error ? error.message : "unknown error",
			},
		});
	}
}
