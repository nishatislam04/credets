import { encrypt } from "@backend/utils/encrypt";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";

/**
 * this is our POST endpoint to create credentials
 */
export async function credentialCreate(req: BunRequest) {
	console.log("credentials create req", req);
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

	// Extract files
	const thumbnail = formData.get("thumbnail") as File | null;

	// Extract images array (Bun returns multiple entries with same key)
	const images: File[] = [];
	for (const [key, value] of formData.entries()) {
		if (key.startsWith("images[") && value instanceof File) {
			images.push(value);
		}
	}

	// Parse data JSON string
	let data = [];
	const dataStr = formData.get("data")?.toString();
	if (dataStr) {
		try {
			data = JSON.parse(dataStr);
		} catch (e) {
			console.error("Invalid JSON in data field", e);
		}
	}

	// Log or process files
	console.log("Received:", { title, short_description, long_description, notes, tags });
	console.log("Thumbnail:", thumbnail?.name, thumbnail?.size);
	console.log("Images count:", images.length);

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
