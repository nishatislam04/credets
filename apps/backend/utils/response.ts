import type { ErrorResponse } from "../types/error-response";
import type { SuccessResponse } from "../types/success-response";

type SuccessParamsType<T> = {
	data: T;
	message: string;
	path?: string;
	status?: number;
};

type ErrorParamsType<T> = {
	error: string;
	message: string;
	status: number;
	path?: string;
	details?: Record<string, unknown>;
	data?: T;
};

export class ResponseFactory {
	static success<T>(params: SuccessParamsType<T>): Response {
		const { data, message, path, status } = params;
		const response: SuccessResponse<T> = {
			success: true,
			data,
			message,
			timestamp: new Date().toISOString(),
			path: path || "unknown",
		};

		return Response.json({ ...response, status });
	}

	static error<T>(params: ErrorParamsType<T>): Response {
		const { error, message, status = 400, path, details, data } = params;
		const response: ErrorResponse<T> = {
			success: false,
			error,
			message,
			timestamp: new Date().toISOString(),
			details,
			data,
			path: path || "unknown",
		};

		return Response.json({ ...response, status });
	}
}
