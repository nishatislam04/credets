import type { BunRequest } from "bun";
import { ResponseFactory } from "@backend/utils/response";
import { getChildTypesRepo } from "../../repository/types/children";
import { AppError } from "@backend/err/base";
import { logAlways } from "@backend/utils/logger";

export async function typesChildren(req: BunRequest) {
	try {
		const url = new URL(req.url);
		const parentValue = url.searchParams.get("parent_value");

		if (!parentValue) {
			return ResponseFactory.error({
				error: "bad request",
				message: "parent_value query parameter is required",
				status: 400,
				path: req,
			});
		}

		const children = await getChildTypesRepo(parentValue);

		return ResponseFactory.success({
			data: children,
			message: "child types fetched",
			status: 200,
			path: req,
		});
	} catch (error) {
		logAlways(error, "http: error in typesChildren controller");

		if (error instanceof AppError) {
			return ResponseFactory.error({
				error: error.message,
				type: error.type,
				message: "Failed to fetch child types",
				status: error.status,
				path: req,
			});
		}

		return ResponseFactory.error({
			error: "An unexpected error occurred",
			type: "internal-error",
			message: "Failed to fetch child types",
			status: 500,
			path: req,
		});
	}
}
