import type { BunRequest } from "bun";
import { log } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";
import { sql } from "../../db/connection";

export async function credentailDelete(req: Request) {
	try {
		// Extract credentialId from the URL path: /credentials/:credentialId/delete
		const url = new URL(req.url);
		const pathParts = url.pathname.split("/").filter(Boolean);
		// pathParts = ["credentials", ":credentialId", "delete"]
		const credentialId = pathParts[1];

		if (!credentialId) {
			return ResponseFactory.error({
				error: "Credential ID is required",
				message: "Credential ID is required",
				status: 400,
				path: { url: req.url } as BunRequest,
			});
		}

		// Parse the request body for CSRF token
		let body: { _csrf?: string } = {};
		try {
			body = (await req.json()) as { _csrf?: string };
		} catch {
			return ResponseFactory.error({
				error: "Invalid request body",
				message: "Invalid request body",
				status: 400,
				path: { url: req.url } as BunRequest,
			});
		}

		// Verify CSRF token
		if (!body._csrf) {
			return ResponseFactory.error({
				error: "CSRF token is required",
				message: "CSRF token is required",
				status: 403,
				path: { url: req.url } as BunRequest,
			});
		}

		// Check if the credential exists
		const existing = await sql`
			SELECT id, title FROM credentials WHERE id = ${credentialId}
		`;

		if (existing.length === 0) {
			return ResponseFactory.error({
				error: "Credential not found",
				message: "Credential not found",
				type: "not-found",
				status: 404,
				path: { url: req.url } as BunRequest,
			});
		}

		// Delete the credential (images will cascade due to ON DELETE CASCADE)
		await sql`DELETE FROM credentials WHERE id = ${credentialId}`;

		return ResponseFactory.success({
			data: {},
			message: `Credential "${existing[0].title}" has been deleted`,
			type: "resource-delete",
			status: 200,
			path: { url: req.url } as BunRequest,
		});
	} catch (error) {
		log(error, "delete credential error");
		return ResponseFactory.error({
			error: "Failed to delete credential",
			message: "Failed to delete credential",
			status: 500,
			path: { url: req.url } as BunRequest,
			details: {
				originError: error instanceof Error ? error.message : "unknown server error",
			},
		});
	}
}
