import { formatZodError } from "@backend/types/formatZodError";
import { logAlways } from "@backend/utils/logger";
import { processImage } from "@backend/utils/processImage";
import { ResponseFactory } from "@backend/utils/response";
import { credentialsCreateSchema } from "@credets/shared-schema/credentials/create";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";
import { verifyCSRF } from "../csrf/verifyCSRF";

export async function credentialCreate(req: BunRequest) {
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

	const title = formData.get("title")?.toString() || "";
	const short_description = formData.get("short_description")?.toString() || "";
	const long_description = formData.get("long_description")?.toString() || "";
	const type = formData.get("type")?.toString() || "";
	const notes = formData.get("notes")?.toString() || null;
	const tags = formData.get("tags")?.toString() || null;
	const data = JSON.parse(formData.get("data")?.toString() || "[]");
	// Extract files
	const thumbnail = formData.get("thumbnail") as File | null;

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
	};

	const validatedData = credentialsCreateSchema.safeParse(validateDisData);

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
