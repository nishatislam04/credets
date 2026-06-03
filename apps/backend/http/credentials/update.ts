import { formatZodError } from "@backend/types/formatZodError";
import { logAlways } from "@backend/utils/logger";
import { processImage } from "@backend/utils/processImage";
import { ResponseFactory } from "@backend/utils/response";
import { credentialsUpdateSchema } from "@credets/shared-schema/credentials/update";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";
import { verifyCSRF } from "../csrf/verifyCSRF";

export async function credentialUpdate(req: BunRequest) {
	const formData = await req.formData();
	const _csrf = formData.get("_csrf")?.toString() || "";

	const isValidCsrf = verifyCSRF(_csrf);
	if (!isValidCsrf)
		return ResponseFactory.error({
			error: "csrf token expired",
			type: "csrf-expired",
			message: "csrf token expired",
			status: 500,
			path: req,
		});

	const { credentialId } = req.params;

	// Check credential exists
	const [existingCredential] =
		await sql`SELECT id FROM credentials WHERE id = ${credentialId}`;
	if (!existingCredential) {
		return ResponseFactory.error({
			error: "credential not found",
			type: "not-found",
			message: "credential not found",
			status: 404,
			path: req,
		});
	}

	const title = formData.get("title")?.toString() || "";
	const short_description = formData.get("short_description")?.toString() || "";
	const long_description = formData.get("long_description")?.toString() || "";
	const type = formData.get("type")?.toString() || "";
	const notes = formData.get("notes")?.toString() || null;
	const tags = formData.get("tags")?.toString() || null;
	const data = JSON.parse(formData.get("data")?.toString() || "[]");
	const existing_images_keep_raw =
		formData.get("existing_images_keep")?.toString() || null;

	// Extract thumbnail
	const thumbnail = formData.get("thumbnail") as File | null;

	// Extract new images
	const images: File[] = [];
	for (const [key, value] of formData.entries()) {
		if (key.startsWith("images[") && value instanceof File) {
			images.push(value);
		}
	}

	const validateDisData = {
		_csrf,
		title,
		type,
		short_description,
		long_description,
		thumbnail,
		images,
		tags,
		notes,
		data,
		existing_images_keep: existing_images_keep_raw,
	};

	const validatedData = credentialsUpdateSchema.safeParse(validateDisData);

	if (!validatedData.success) {
		const errors = formatZodError(validatedData);

		return ResponseFactory.error({
			error: "Form validation failed",
			type: "form-validation",
			message: "Form validation failed",
			status: 400,
			path: req,
			errors,
		});
	}

	// Process thumbnail if a new file was provided
	let thumbnail_image_data = null;
	let thumbnail_format = null;
	let thumbnail_width = null;
	let thumbnail_height = null;

	if (validatedData.data.thumbnail) {
		const thumbnailResult = await processImage({
			file: validatedData.data.thumbnail,
			outputQuality: 50,
			resizeInWidth: 800,
		});
		thumbnail_image_data = thumbnailResult?.buffer ?? null;
		thumbnail_format = thumbnailResult?.format ?? null;
		thumbnail_width = thumbnailResult?.width ?? null;
		thumbnail_height = thumbnailResult?.height ?? null;
	}

	// Process new images
	const processedImages = await Promise.all(
		images.map((file) =>
			processImage({
				file,
				outputQuality: 75,
				resizeInWidth: 1400,
			}),
		),
	);

	const validImages = processedImages.filter(
		(img): img is NonNullable<typeof img> => img !== null,
	);

	const processedData = JSON.stringify(validatedData.data.data);

	const processedTags = validatedData.data.tags
		? JSON.stringify(
				validatedData.data.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0),
			)
		: null;

	// Resolve type_id from the type value
	const [typeRow] =
		await sql`SELECT id FROM types WHERE value=${validatedData.data.type}`;
	if (!typeRow) {
		return ResponseFactory.error({
			error: "Invalid type selected",
			type: "form-validation",
			message: "Invalid type selected",
			status: 400,
			path: req,
		});
	}

	// Build update payload — only include thumbnail fields if a new file was provided
	const updateFields: Record<string, unknown> = {
		title: validatedData.data.title,
		short_description: validatedData.data.short_description || null,
		long_description: validatedData.data.long_description || null,
		data: processedData,
		notes: validatedData.data.notes || null,
		tags: processedTags,
		types_id: typeRow.id,
	};

	// Handle remove_thumbnail flag
	const removeThumbnail = formData.get("remove_thumbnail")?.toString() === "true";

	if (thumbnail_image_data) {
		updateFields.thumbnail_image_data = thumbnail_image_data;
		updateFields.thumbnail_format = thumbnail_format;
		updateFields.thumbnail_width = thumbnail_width;
		updateFields.thumbnail_height = thumbnail_height;
	} else if (removeThumbnail) {
		// Explicitly set thumbnail fields to null when removal is requested
		updateFields.thumbnail_image_data = null;
		updateFields.thumbnail_format = null;
		updateFields.thumbnail_width = null;
		updateFields.thumbnail_height = null;
	}

	// Update the credential record
	await sql`UPDATE credentials SET ${sql(updateFields)} WHERE id = ${credentialId}`;

	// ── Handle images ────────────────────────────────────────────────

	// Parse existing_images_keep — these are the IDs of existing images to retain
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

	// Delete images for this credential that are NOT in the keep list.
	// sql.array() binds a PostgreSQL array parameter; PostgreSQL infers the type from context.
	if (existingImagesKeep.length > 0) {
		await sql`
			DELETE FROM credential_images
			WHERE credential_id = ${credentialId}
				AND id != ALL(${sql.array(existingImagesKeep)})
		`;
	} else {
		// If no images to keep, delete all existing images
		await sql`
			DELETE FROM credential_images
			WHERE credential_id = ${credentialId}
		`;
	}

	// Insert new images
	if (validImages.length > 0) {
		const credentialImagesPayload = validImages.map((image) => ({
			image_data: image.buffer,
			format: image.format,
			width: image.width,
			height: image.height,
			byte_size: image.byteSize,
			credential_id: credentialId,
		}));

		await sql`INSERT INTO credential_images ${sql(credentialImagesPayload)}`;
	}

	logAlways(credentialId, "credential updated");

	return ResponseFactory.success({
		data: {},
		type: "resource-update",
		message: "Credential updated successfully",
		status: 200,
		path: req,
	});
}
