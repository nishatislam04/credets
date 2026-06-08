import { AppError } from "@backend/err/base";
import { log } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";
import type { BunRequest } from "bun";
import type { CursorPayload } from "../../repository/credentials/listings";
import { getCredentialsListingsService } from "../../services/credentials/listings";

export async function credentialListings(req: BunRequest) {
	try {
		const url = new URL(req.url);

		const rawLimit = parseInt(url.searchParams.get("limit") || "12", 10);
		const cursorParam = url.searchParams.get("cursor");
		const limit = Number.isNaN(rawLimit)
			? 12
			: Math.min(24, Math.max(1, rawLimit));

		// Decode cursor (base64-encoded JSON { createdAt, id })
		let cursor: CursorPayload | null = null;
		if (cursorParam) {
			try {
				const decoded = Buffer.from(cursorParam, "base64").toString("utf-8");
				cursor = JSON.parse(decoded) as CursorPayload;
			} catch {
				// Invalid cursor — ignore, start from the beginning
			}
		}

		// Call Service Layer
		const result = await getCredentialsListingsService({ limit, cursor });

		log(result.credentials, "http: credentials listings fetched successfully");

		return ResponseFactory.success({
			data: {
				credentials: result.credentials,
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			},
			path: req,
			message: "credentials listings fetched",
			status: 200,
		});
	} catch (error) {
		log(error, "http: error in credentialListings controller");

		if (error instanceof AppError) {
			return ResponseFactory.error({
				error: error.message,
				type: error.type,
				message: "Failed to fetch credentials listings",
				status: error.status,
				path: req,
				data: {},
			});
		}

		return ResponseFactory.error({
			error: "An unexpected error occurred",
			type: "internal-error",
			message: "Failed to fetch credentials listings",
			status: 500,
			path: req,
			data: {},
			details: {
				originError: error instanceof Error ? error.message : "unknown error",
			},
		});
	}
}
