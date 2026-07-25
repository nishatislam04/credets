import type { BunRequest } from "bun";
import { AppError } from "@backend/err/base";
import { log } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";
import { updateTypeLabelRepo } from "../../repository/types/update";

export async function typeUpdate(req: BunRequest) {
	try {
		const { typeId } = req.params;

		if (!typeId) {
			return ResponseFactory.error({
				error: "bad request",
				message: "Type ID is required",
				status: 400,
				path: req,
			});
		}

		const body = await req.json() as { label?: string };
		const { label } = body;

		if (!label || typeof label !== "string" || label.trim().length === 0) {
			return ResponseFactory.error({
				error: "bad request",
				message: "A non-empty label is required",
				status: 400,
				path: req,
			});
		}

		await updateTypeLabelRepo(typeId, label.trim());

		log.info("http: type label updated", { typeId, label: label.trim() });

		return ResponseFactory.success({
			data: {},
			type: "resource-update",
			message: "Type label updated successfully",
			status: 200,
			path: req,
		});
	} catch (error) {
		log.error("http: error in typeUpdate controller", {
			err: {
				message: error instanceof Error ? error.message : "unknown error",
			},
		});

		if (error instanceof AppError) {
			return ResponseFactory.error({
				error: error.message,
				type: error.type,
				message: "Failed to update type",
				status: error.status,
				path: req,
			});
		}

		return ResponseFactory.error({
			error: "An unexpected error occurred",
			type: "internal-error",
			message: "Failed to update type",
			status: 500,
			path: req,
		});
	}
}
