import { logAlways } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";
import { credentialsUpdateSchema } from "@credets/shared-schema/credentials/update";
import type { BunRequest } from "bun";
import { updateCredentialService } from "../../services/credentials/update";
import { parseAndValidateCredential } from "../../validation/credential/validator";

export async function credentialUpdate(req: BunRequest) {
	const result = await parseAndValidateCredential(req, credentialsUpdateSchema);

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

	try {
		await updateCredentialService({
			credentialId,
			title: validatedData.data.title ?? "",
			type: validatedData.data.type ?? "",
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

		const status =
			error instanceof Error && error.message === "Credential not found"
				? 404
				: 500;

		return ResponseFactory.error({
			error: error instanceof Error ? error.message : "Internal Error",
			message: "Failed to update credential",
			status,
			path: req,
		});
	}
}
