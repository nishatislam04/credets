import type { BunRequest } from "bun";

export type SuccessParamsType<T> = {
	data: T;
	message?: string;
	path: BunRequest;
	status?: number;
};
