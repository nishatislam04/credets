import { formatZodError } from "@backend/types/formatZodError";
import { encrypt } from "@backend/utils/encrypt";
import { processImage } from "@backend/utils/processImage";
import { credentialsCreateSchema } from "@credets/shared-schema/credentials/create";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";
import { verifyCSRF } from "../csrf/verifyCSRF";

export async function credentialCreate(req: BunRequest) {
	const formData = await req.formData();
	const _csrf = formData.get("_csrf")?.toString() || "";

	const isValidCsrf = verifyCSRF(_csrf);
	if (!isValidCsrf)
		return new Response(
			JSON.stringify({
				success: false,
				type: "csrf-expired",
				message: "csrf token expired",
			}),
			{
				status: 500,
				headers: {
					"content-type": "application/json",
				},
			},
		);

	const title = formData.get("title")?.toString() || "";
	const short_description = formData.get("short_description")?.toString() || "";
	const long_description = formData.get("long_description")?.toString() || "";
	const type = formData.get("type")?.toString() || "";
	const notes = formData.get("notes")?.toString() || "";
	const tags = formData.get("tags")?.toString() || "";
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

		return new Response(
			JSON.stringify({ success: false, type: "form-validation", errors }),
			{
				status: 400,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": process.env.FRONTEND_APP!,
				},
			},
		);
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

	return new Response(
		JSON.stringify({ success: true, message: "a new credentials added" }),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": process.env.FRONTEND_APP!,
			},
		},
	);

	// try {
	// 	const key = Bun.env.ENC_KEY;
	// 	if (!key) return new Response("key is required to encrypt");

	// 	const validatedData = "nishat islam 004.";
	// 	const sealed = await encrypt(validatedData);

	// 	const password = await Bun.password.hash("nishatislam3108200204");

	// 	const createUserTest =
	// 		await sql`INSERT INTO users(name, username, email, password, special_password) VALUES('nishat', 'nishat004', 'nishat@email.com', ${password}, ${sealed})`;

	// 	console.log("created user", createUserTest);
	// 	return new Response("credentials create page");
	// } catch (err) {
	// 	console.log("credentialCreate error: ", err);
	// }
}
