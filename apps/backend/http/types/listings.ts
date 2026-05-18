import { sql } from "@db/connection";

export async function typesListings() {
	const listings = await sql`SELECT id, label, value FROM types`;

	return new Response(JSON.stringify({ success: true, data: listings }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": process.env.FRONTEND_APP!,
		},
	});
}
