import { sql } from "@db/connection";
import type { BunRequest, Server } from "bun";

export async function credentialListings(
	req: BunRequest,
	server: Server<unknown>,
) {
	// console.log("credentials listings -req", req);
	// console.log("credentials listings -server", server);
	const credentials =
		await sql`SELECT id, type, data, images, created_at FROM credentials LIMIT 3`;

	const data = credentials.map(
		(credential: {
			id: string;
			type: string;
			data: unknown;
			images: string | null;
			created_at: Date;
		}) => ({
			id: credential.id,
			type: credential.type,
			data: credential.data ? JSON.parse(credential.data) : null,
			images: credential.images ? JSON.parse(credential.images) : null,
			createdAt: credential.created_at.toLocaleDateString(),
		}),
	);

	console.log("parsed credentials", data);

	return new Response("credentials listings page");
}
