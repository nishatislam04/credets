import type { BunRequest } from "bun";
import { ResponseFactory } from "@backend/utils/response";
import { sql } from "@db/connection";

export async function typesListings() {
	const listings = await sql`SELECT id, label, value FROM types`;

	return ResponseFactory.success({
		data: listings,
		message: "types listings fetched",
		status: 200,
		path: { url: "/types/listings" } as BunRequest,
	});
}
