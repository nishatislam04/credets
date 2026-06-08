import { logAlways } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";
import type { BunRequest } from "bun";
import { deleteCredentialService } from "../../services/credentials/delete";

export async function credentailDelete(req: Request) {
	// Handle CORS preflight — browser sends OPTIONS before DELETE
	if (req.method === "OPTIONS") {
		return ResponseFactory.preflight();
	}

	try {
		// Extract credentialId from the URL path: /credentials/:credentialId/delete
		const url = new URL(req.url);
		const pathParts = url.pathname.split("/").filter(Boolean);
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

		// Delegate to Service Layer
		const result = await deleteCredentialService(credentialId);

		logAlways(result.title, "http: credential deleted");

		return ResponseFactory.success({
			data: {},
			message: `Credential "${result.title}" has been deleted`,
			type: "resource-delete",
			status: 200,
			path: { url: req.url } as BunRequest,
		});
	} catch (error) {
		logAlways(error, "http: error in credentailDelete controller");

		const status =
			error instanceof Error && error.message === "Credential not found"
				? 404
				: 500;

		return ResponseFactory.error({
			error:
				error instanceof Error ? error.message : "Failed to delete credential",
			message: "Failed to delete credential",
			status,
			path: { url: req.url } as BunRequest,
			details: {
				originError:
					error instanceof Error ? error.message : "unknown server error",
			},
		});
	}
}
