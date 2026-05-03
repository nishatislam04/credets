import type { ErrorParamsType } from "@backend/types/error-param-type-response";
import type { ErrorResponse } from "@backend/types/error-response";
import type { SuccessParamsType } from "@backend/types/success-param-type-response";
import type { SuccessResponse } from "@backend/types/success-response";
import type { BunRequest } from "bun";

/**
 * this is the class we will use to send the response from backend to frontend
 * we have here both the success and error response api
 */
export class ResponseFactory {
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
		const { data, message = "success message", path, status } = params;

		const response: SuccessResponse<T> = {
			success: true,
			data,
			message,
			timestamp: new Date().toISOString(),
			path: path.url || "unknown",
			status: status || 200,
		};

		return Response.json({ ...response });
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
		} = params;
		// const url = new URL(path as BunRequest)
		const response: ErrorResponse<T> = {
			success: false,
			error,
			message,
			timestamp: new Date().toISOString(),
			details,
			data,
			path: path.url || "unknown",
		};

		return Response.json({ ...response, status });
	}
}
