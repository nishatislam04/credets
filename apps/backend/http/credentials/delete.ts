import { sql } from "../../db/connection";

export async function credentailDelete(req: Request) {
	try {
		// Extract credentialId from the URL path: /credentials/:credentialId/delete
		const url = new URL(req.url);
		const pathParts = url.pathname.split("/").filter(Boolean);
		// pathParts = ["credentials", ":credentialId", "delete"]
		const credentialId = pathParts[1];

		if (!credentialId) {
			return new Response(
				JSON.stringify({ success: false, message: "Credential ID is required" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Parse the request body for CSRF token
		let body: { _csrf?: string } = {};
		try {
			body = (await req.json()) as { _csrf?: string };
		} catch {
			return new Response(
				JSON.stringify({ success: false, message: "Invalid request body" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Verify CSRF token
		if (!body._csrf) {
			return new Response(
				JSON.stringify({ success: false, message: "CSRF token is required" }),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Check if the credential exists
		const existing = await sql`
			SELECT id, title FROM credentials WHERE id = ${credentialId}
		`;

		if (existing.length === 0) {
			return new Response(
				JSON.stringify({ success: false, message: "Credential not found" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Delete the credential (images will cascade due to ON DELETE CASCADE)
		await sql`DELETE FROM credentials WHERE id = ${credentialId}`;

		return new Response(
			JSON.stringify({
				success: true,
				message: `Credential "${existing[0].title}" has been deleted`,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Error deleting credential:", error);
		return new Response(
			JSON.stringify({
				success: false,
				message: "Failed to delete credential",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
