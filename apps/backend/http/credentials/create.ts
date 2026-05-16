import { encrypt } from "@backend/utils/encrypt";
import { credentialsCreateSchema } from "@credets/shared-schema/credentials/create";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";
import { verifyCSRF } from "../csrf/verifyCSRF";

/**
 * this is our POST endpoint to create credentials
 */

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
		const errors: Record<string, { message: string }[]> = {};

		for (const issue of validatedData.error.issues) {
			const fieldName = issue.path.join(".");
			if (!errors[fieldName]) {
				errors[fieldName] = [];
			}
			errors[fieldName].push({ message: issue.message });
		}

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

	const payload = validatedData.data;
	console.log("payload: ", payload);
	// TODO: process tags
	function proccessTags(payload: string | undefined) {
		if (payload === undefined) return null;
		if (payload.length === 0) return null;
		if (payload.length === 1) return JSON.stringify(payload);
		return JSON.stringify(payload.split(",").map((p) => p.trim()));
	}
	const processedTags = proccessTags(payload.tags);
	console.log(processedTags);
	// TODO: process thumbnail
	async function processThumbnail(
		payload: File | null | undefined,
	): Promise<{ buffer: Buffer } | null> {
		if (payload === null || payload === undefined) return null;

		const inputBuffer = await payload.arrayBuffer();

		const compressed = await new Bun.Image(inputBuffer)
			.resize(800, 800, {
				fit: "inside",
				withoutEnlargement: true,
			})
			.webp({ quality: 50 })
			.bytes();

		return compressed;
	}
	const thumbnailBuffer = await processThumbnail(payload.thumbnail);

	const thumbnailSafeBuffer = thumbnailBuffer
		? Buffer.from(thumbnailBuffer.buffer)
		: null;
	// TODO: process images

	await sql`INSERT INTO credentials (title, short_description, long_description, thumbnail, thumbnail_file_type, data, images, notes, tags, user_id, types_id) VALUES (${payload.title}, ${payload.short_description}, ${payload.long_description}, ${thumbnailSafeBuffer}, 'webp', ${payload.data}, ${payload.images}, ${payload.notes}, ${processedTags}, '325a740b-91fd-4496-9724-ff116149416b', '4fd1898c-6889-4982-a832-1953b4421b97')`;

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
