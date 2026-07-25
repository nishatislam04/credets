import { AppError } from "@backend/err/base";
import { logger } from "@backend/utils/logger";
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
			: Math.min(12, Math.max(1, rawLimit));

		const cursorResult = parseCursorParam(cursorParam, req);
		if (cursorResult instanceof Response) return cursorResult;

		const result = await getCredentialsListingsService({ limit, cursorResult });

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
		logger(error, "http: error in credentialListings controller");

		if (error instanceof AppError) {
			return ResponseFactory.error({
				error: error.message,
				type: error.type,
				message: error.message || "Failed to fetch credentials listings",
				status: error.status,
				path: req,
				data: {},
			});
		}

		return ResponseFactory.error({
			error: "An unexpected error occurred",
			type: "internal-error",
			message:
				error instanceof Error
					? error.message
					: "Failed to fetch credentials listings",
			status: 500,
			path: req,
			data: {},
			details: {
				originError: error instanceof Error ? error.message : "unknown error",
			},
		});
	}
}

function parseCursorParam(
	cursorParam: string | null,
	req: BunRequest,
): CursorPayload | null | Response {
	if (!cursorParam) return null;

	let decoded: string;
	try {
		decoded = Buffer.from(cursorParam, "base64").toString("utf-8");
	} catch {
		return ResponseFactory.error({
			error: "bad request",
			message: "Invalid cursor format: must be a valid base64-encoded string",
			status: 400,
			path: req,
		});
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(decoded);
	} catch {
		return ResponseFactory.error({
			error: "bad request",
			message: "Invalid cursor payload: must be valid JSON",
			status: 400,
			path: req,
		});
	}

	if (
		!parsed ||
		typeof parsed !== "object" ||
		!("createdAt" in parsed) ||
		!("id" in parsed)
	) {
		return ResponseFactory.error({
			error: "bad request",
			message:
				"Invalid cursor payload: must contain 'createdAt' and 'id' fields",
			status: 400,
			path: req,
		});
	}

	return parsed as CursorPayload;
}
