import { encrypt } from "@backend/utils/encrypt";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";
import { z } from "zod";

/**
 * this is our POST endpoint to create credentials
 */
const singleLabelSchema = z.object({
	type: z.literal("single_label"),
	value: z.string().trim().min(1, "label value can not be empty").or(z.literal("")),
});

const keyValueSchema = z.object({
	type: z.literal("key_value"),
	key: z.string().min(1, "key is required"),
	value: z.string().trim().min(1, "value is required"),
});

const informationSchema = z.object({
	type: z.literal("information"),
	value: z.string().trim().min(1, "information text can not be empty"),
});

const dataBlockSchema = z.discriminatedUnion("type", [
	singleLabelSchema,
	keyValueSchema,
	informationSchema,
]);

export const credentialsCreateSchema = z.object({
	title: z
		.string()
		.trim()
		.min(4, "credentials title need to be at least 4 characters")
		.max(30, "credentials title can not be grater than 30 characters"),
	short_description: z
		.string()
		.min(5, "credentials short description can not be less than 5 characters")
		.max(50, "credentials short description can not be grater than 50 characters")
		.optional()
		.or(z.literal("")),
	long_description: z
		.string()
		.min(5, "credentials long description can not be less than 5 characters")
		.optional()
		.or(z.literal("")),
	thumbnail: z
		.file()
		.max(3_000_000, "Max 3mb")
		.mime(["image/jpg", "image/jpeg", "image/png", "image/webp"])
		.nullable()
		.optional(),
	data: z.array(dataBlockSchema),
	images: z.array(z.any()).default([]).nullable().optional(), // we are validating size on the element itself!
	notes: z.string().trim().optional(),
	tags: z.string().trim().optional(),
});

export async function credentialCreate(req: BunRequest) {
	// console.log("credentials create req", req);
	if (
		req.method === "OPTIONS" &&
		req.headers.get("origin") === process.env.FRONTEND_APP
	) {
		return new Response(null, {
			status: 204,
			headers: {
				"Access-Control-Allow-Origin": process.env.FRONTEND_APP!,
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
				"Access-Control-Allow-Credentials": "true",
			},
		});
	}

	const formData = await req.formData();
	// Extract fields
	const title = formData.get("title")?.toString() || "";
	const short_description = formData.get("short_description")?.toString() || "";
	const long_description = formData.get("long_description")?.toString() || "";
	const notes = formData.get("notes")?.toString() || "";
	const tags = formData.get("tags")?.toString() || "";
	const data = JSON.parse(formData.get("data")?.toString() || "[]");
	// Extract files
	const thumbnail = formData.get("thumbnail") as File | null;

	// Extract images array (Bun returns multiple entries with same key)
	const images: File[] = [];
	for (const [key, value] of formData.entries()) {
		if (key.startsWith("images[") && value instanceof File) {
			images.push(value);
		}
	}

	// ! validation
	const validateDisData = {
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
	// Log or process files
	console.log("Received string:", {
		title,
		short_description,
		long_description,
		notes,
		tags,
	});

	const response = new Response(JSON.stringify({ success: true, data: { title } }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
	response.headers.set("Access-Control-Allow-Origin", process.env.FRONTEND_APP!);
	return response;
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
