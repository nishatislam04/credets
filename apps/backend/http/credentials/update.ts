import { decrypt } from "@backend/utils/decrypt";
import { sql } from "@db/connection";

export async function credentialUpdate() {
	const inputPassword = "nishatislam3108200204";
	const inputSpecialPassword = "hello world";
	const inputDate = "3/5/26";

	// ! we will write date compare and equal logics here a bit later

	const key = Bun.env.ENC_KEY;
	if (!key) return new Response("key is required to encrypt");

	const fetchedUser =
		await sql`SELECT id, name, username, email, password, special_password FROM users WHERE username='nishat004'`;

	const decodeSpecialKey = await decrypt(fetchedUser[0].special_password);

	// console.log("fetched user", fetchedUser);
	// console.log("decode special key", decodeSpecialKey);
	return new Response("credentials update page");
}
