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

	return new Response(JSON.stringify({ success: true, data: { title } }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": process.env.FRONTEND_APP!,
		},
	});
	// try {
	// 	const key = Bun.env.ENC_KEY;
	// 	if (!key) return new Response("key is required to encrypt");

	// 	const payload = "nishat islam 004.";
	// 	const sealed = await encrypt(payload);

	// 	const password = await Bun.password.hash("nishatislam3108200204");

	// 	const createUserTest =
	// 		await sql`INSERT INTO users(name, username, email, password, special_password) VALUES('nishat', 'nishat004', 'nishat@email.com', ${password}, ${sealed})`;

	// 	console.log("created user", createUserTest);
	// 	return new Response("credentials create page");
	// } catch (err) {
	// 	console.log("credentialCreate error: ", err);
	// }
}
