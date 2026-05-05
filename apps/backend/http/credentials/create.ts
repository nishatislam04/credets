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

	const body = await req.json();

	const response = new Response(JSON.stringify({ success: true, data: body }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
	response.headers.set(
		"Access-Control-Allow-Origin",
		process.env.FRONTEND_APP!,
	);
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
