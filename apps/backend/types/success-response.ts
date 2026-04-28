export type SuccessResponse<T> = {
	success: true;
	data: T;
	message?: string;
	status?: number;
	timestamp: string;
	path?: string;
};
