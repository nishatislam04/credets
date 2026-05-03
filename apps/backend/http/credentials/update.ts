import { decrypt } from "@backend/utils/decrypt";
import { parseLocalDate } from "@backend/utils/parseLocalDate";
import { sql } from "@db/connection";
import { format } from "date-fns";

export async function credentialUpdate() {
	const inputSpecialPassword = "nishat islam 004. 3/5/2026";
	const [_, inputDate] = inputSpecialPassword.split(". ");
	if (!inputDate) return new Response("special password verification failed");
	const parsedLocalDate = parseLocalDate(inputDate);
	const serverDate = format(new Date(), "yyyy-MM-dd");
	const dateCheckPassed = parsedLocalDate === serverDate;
	if (dateCheckPassed) console.log("first step complete! date check pass");
	console.log("parsed local date", parsedLocalDate);

	const key = Bun.env.ENC_KEY;
	if (!key) return new Response("key is required to encrypt");

	const fetchedUser =
		await sql`SELECT id, name, username, email, password, special_password FROM users WHERE username='nishat004'`;

	const decodedSpecialPassword = await decrypt(fetchedUser[0].special_password);
	const serverFullSpecialPassword = `${decodedSpecialPassword} ${serverDate}`;

	console.log("serverfulldatepaswrd", serverFullSpecialPassword);

	const isFullPasswordMatch =
		serverFullSpecialPassword ===
		`${inputSpecialPassword.split(".")[0]}. ${parsedLocalDate}`;

	console.log("full password match", isFullPasswordMatch);
	return new Response("credentials update page");
}
