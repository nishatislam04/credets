import type { ErrorParamsType } from "@backend/types/error-param-type-response";
import type { ErrorResponse } from "@backend/types/error-response";
import type { SuccessParamsType } from "@backend/types/success-param-type-response";
import type { SuccessResponse } from "@backend/types/success-response";

/** Shared response fields used across success and error responses. */
type TypeAndErrors = {
	type?: string;
	errors?: Record<string, { message: string }[]>;
};

/**
 * this is the class we will use to send the response from backend to frontend
 * we have here both the success and error response api
 */
export class ResponseFactory {
	/**
	 * Get CORS headers based on environment
	 * Allows your frontend origin to access the backend
	 */
	/**
	 * Get CORS + security headers.
	 * These are applied to every response the server sends.
	 */
	static getCorsHeaders(): Record<string, string> {
		const allowedOrigin =
			process.env.FRONTEND_APP || "https://credets.onrender.com";
		return {
			// ── CORS ────────────────────────────────────────────────
			"Access-Control-Allow-Origin": allowedOrigin,
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Credentials": "true",

			// ── Security ────────────────────────────────────────────
			"Strict-Transport-Security":
				"max-age=63072000; includeSubDomains; preload",
			"X-Content-Type-Options": "nosniff",
			"X-Frame-Options": "DENY",
			"Referrer-Policy": "strict-origin-when-cross-origin",
			"Permissions-Policy":
				"camera=(), microphone=(), geolocation=(), interest-cohort=()",
		};
	}
	/**
	 * Return a 204 No Content response with CORS headers for preflight
	 * (OPTIONS) requests.
	 *
	 * Browsers send an OPTIONS preflight before non-simple requests
	 * (e.g. DELETE, or POST/PUT with Content-Type: application/json).
	 * This method short-circuits those preflights with the correct CORS
	 * headers so the actual request is allowed through.
	 *
	 * ── Usage ─────────────────────────────────────────────────────
	 *
	 * At the top of any route handler that could receive a preflight:
	 *
	 * ```ts
	 * export async function myHandler(req: Request) {
	 *   // Short-circuit preflight before any logic
	 *   if (req.method === "OPTIONS") {
	 *     return ResponseFactory.preflight();
	 *   }
	 *
	 *   // … rest of your handler
	 * }
	 * ```
	 *
	 * When to use:
	 *   - Any endpoint the frontend calls with DELETE, PUT, or
	 *     POST + application/json (non-form/non-plain Content-Type)
	 *   - Basically, if fetch() sets a "Content-Type" header that
	 *     isn't formdata/text, the browser will preflight
	 *
	 * Why ResponseFactory.preflight() instead of writing headers inline:
	 *   - Single source of truth — change CORS config in one place
	 *   - Access-Control-Max-Age is set (86400s) so browsers cache
	 *     the preflight result for 24h, saving round-trips
	 *
	 * @returns {Response} 204 No Content with CORS headers
	 */
	static preflight(): Response {
		const headers = ResponseFactory.getCorsHeaders();
		headers["Access-Control-Max-Age"] = "86400";
		return new Response(null, { status: 204, headers });
	}

	/**
	 * success response api
	 *
	 * usage: ResponseFactory.success({
	 *	data: provideDataAsResponse,
	 *  path: req // must provide, pathname auto calculate internally
	 * });
	 *
	 * @param {SuccessParamsType<T>} params - the params payload
	 * @returns {Bun.Response}
	 */
	static success<T>(params: SuccessParamsType<T>): Response {
		const { data, message = "success message", path, status, type } = params;

		const response: SuccessResponse<T> & TypeAndErrors = {
			success: true,
			data,
			message,
			timestamp: new Date().toISOString(),
			path: path.url || "unknown",
			status: status || 200,
			type,
		};

		return Response.json(response, {
			status,
			headers: ResponseFactory.getCorsHeaders(),
		});
	}

	/**
	 * error response api
	 *
	 * usage: ResponseFactory.error({
	 *	error: "some error message",
	 *	message: "some other message",
	 *	path: req,
	 *	details: {
	 *		error instanceof Error ? error.message : "server error"
	 *	}
	 *
	 * })
	 *
	 * @param {ErrorParamsType} params - error params payload
	 * @returns {Bun.Response}
	 */
	static error<T>(params: ErrorParamsType<T>): Response {
		const {
			error = "database or server side error",
			message = "failed to fetch data or some else error occured",
			status = 500,
			path,
			details,
			data,
			type,
			errors,
		} = params;
		// const url = new URL(path as BunRequest)
		const response: ErrorResponse<T> & TypeAndErrors = {
			success: false,
			error,
			message,
			timestamp: new Date().toISOString(),
			details,
			data,
			path: path.url || "unknown",
			type,
			errors,
		};

		return Response.json(response, {
			status,
			headers: ResponseFactory.getCorsHeaders(),
		});
	}
}
