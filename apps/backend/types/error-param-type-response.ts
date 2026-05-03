import type { BunRequest } from "bun";

export type ErrorParamsType<T> = {
	error?: string;
	message?: string;
	status?: number;
	path: BunRequest;
	details?: { originError: string };
	data?: T;
};
