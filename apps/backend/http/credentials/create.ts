import { logAlways } from "@backend/utils/logger";
import { processImage } from "@backend/utils/processImage";
import { ResponseFactory } from "@backend/utils/response";
import { credentialsCreateSchema } from "@credets/shared-schema/credentials/create";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";
import { parseAndValidateCredential } from "../../validation/credential/validator";

export async function credentialCreate(req: BunRequest) {
	const result = await parseAndValidateCredential(req, credentialsCreateSchema);

	if (!result.success) {
		return result.errorResponse;
	}

	const { validatedData, images } = result;

	const thumbnailResult = await processImage({
		file: validatedData.data.thumbnail,
		outputQuality: 50,
		resizeInWidth: 800,
	});
	const {
		buffer: thumbnail_image_data = null,
		format: thumbnail_format = null,
		width: thumbnail_width = null,
		height: thumbnail_height = null,
	} = thumbnailResult ?? {};

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

	const processedTags = JSON.stringify(
		validatedData.data.tags?.split(",").map((tag) => tag.trim()),
	);

	const [{ id: user_id }] = await sql`SELECT id FROM users`;
	const [{ id: types_id }] =
		await sql`SELECT id FROM types WHERE value=${validatedData.data.type}`;

	const credentialPayload = {
		title: validatedData.data.title,
		short_description: validatedData.data.short_description,
		long_description: validatedData.data.long_description,
		thumbnail_image_data,
		thumbnail_format,
		thumbnail_width,
		thumbnail_height,
		data: processedData,
		notes: validatedData.data.notes,
		tags: processedTags,
		user_id,
		types_id,
	};

	const [{ id: credential_id }] =
		await sql`INSERT INTO credentials ${sql(credentialPayload)} RETURNING id`;

	const credentialImagesPayload = validImages.map((image) => {
		return {
			image_data: image.buffer,
			format: image.format,
			width: image.width,
			height: image.height,
			byte_size: image.byteSize,
			credential_id,
		};
	});

	if (validImages.length > 0)
		await sql`INSERT INTO credential_images ${sql(credentialImagesPayload)}`;

	logAlways(validatedData.data.title, "credential created");

	return ResponseFactory.success({
		data: {},
		type: "resource-create",
		message: "A new credentials added",
		status: 200,
		path: req,
	});
}
