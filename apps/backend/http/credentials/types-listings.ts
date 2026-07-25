import type { BunRequest } from "bun";
import { ResponseFactory } from "@backend/utils/response";
import { getTypesListingsRepo } from "../../repository/credentials/types-listings";

export async function typesListingsWithCredentials(req: BunRequest) {
	try {
		const items = await getTypesListingsRepo();

		return ResponseFactory.success({
			data: { items },
			message: "types listings fetched",
			status: 200,
			path: req,
		});
	} catch (error) {
		return ResponseFactory.error({
			error: "An unexpected error occurred",
			type: "internal-error",
			message: "Failed to fetch types listings",
			status: 500,
			path: req,
			details: {
				originError: error instanceof Error ? error.message : "unknown error",
			},
		});
	}
}
