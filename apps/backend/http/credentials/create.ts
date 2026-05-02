import { encrypt } from "@backend/utils/encrypt";
import { sql } from "@db/connection";

export async function credentialCreate() {
	try {
		const key = Bun.env.ENC_KEY;
		if (!key) return new Response("key is required to encrypt");

		const payload = "nishat islam 004.";
		const sealed = await encrypt(payload);

		const password = await Bun.password.hash("nishatislam3108200204");

		const createUserTest =
			await sql`INSERT INTO users(name, username, email, password, special_password) VALUES('nishat', 'nishat004', 'nishat@email.com', ${password}, ${sealed})`;

		console.log("created user", createUserTest);
		return new Response("credentials create page");
	} catch (err) {
		console.log("credentialCreate error: ", err);
	}
}
