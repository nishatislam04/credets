export type ErrorResponse<T> = {
	success: false;
	error: string;
	message?: string;
	timestamp: string;
	details?: Record<string, unknown>;
	data?: T;
	path?: string;
	status?: number;
	type?: string;
	errors?: Record<string, { message: string }[]>;
};
