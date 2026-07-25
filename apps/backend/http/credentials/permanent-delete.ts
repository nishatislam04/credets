import { AppError } from "@backend/err/base";
import { verifyCSRF } from "@backend/http/csrf/verifyCSRF";
import { log } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";
import type { BunRequest } from "bun";
import { permanentDeleteCredentialService } from "../../services/credentials/permanent-delete";

export async function credentialPermanentDelete(req: Request) {
	// Handle CORS preflight
	if (req.method === "OPTIONS") {
		return ResponseFactory.preflight();
	}

	try {
		const url = new URL(req.url);
		const pathParts = url.pathname.split("/").filter(Boolean);
		// /credentials/:credentialId/permanent-delete → credentialId at index 1
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
		if (!body._csrf || !verifyCSRF(body._csrf)) {
			return ResponseFactory.error({
				error: "CSRF token is missing or invalid",
				message: "CSRF token is missing or invalid",
				status: 403,
				path: { url: req.url } as BunRequest,
			});
		}

		// Delegate to Service Layer
		const result = await permanentDeleteCredentialService(credentialId);

		log.info("http: credential permanently deleted", { title: result.title });

		return ResponseFactory.success({
			data: {},
			message: `Credential "${result.title}" has been permanently deleted`,
			type: "resource-delete",
			status: 200,
			path: { url: req.url } as BunRequest,
		});
	} catch (error) {
		log.error("http: error in credentialPermanentDelete controller", {
			err: {
				message:
					error instanceof Error ? error.message : "unknown error",
			},
		});

		if (error instanceof AppError) {
			return ResponseFactory.error({
				error: error.message,
				type: error.type,
				message: "Failed to permanently delete credential",
				status: error.status,
				path: { url: req.url } as BunRequest,
			});
		}

		return ResponseFactory.error({
			error: "An unexpected error occurred",
			type: "internal-error",
			message: "Failed to permanently delete credential",
			status: 500,
			path: { url: req.url } as BunRequest,
			details: {
				originError: error instanceof Error ? error.message : "unknown error",
			},
		});
	}
}
