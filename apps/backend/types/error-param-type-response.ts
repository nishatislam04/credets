export type ErrorParamsType<T> = {
	error: string;
	message: string;
	status: number;
	path?: string;
	details?: Record<string, unknown>;
	data?: T;
};
