import { AppError } from "@backend/err/base";
import { log } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";

export async function credentialToggle(req: BunRequest) {
	try {
		const { credentialId } = req.params;

		if (!credentialId) {
			return ResponseFactory.error({
				error: "bad request",
				message: "Credential ID is required",
				status: 400,
				path: req,
			});
		}

		// Parse the JSON body
		const body = await req.json() as { is_draft?: boolean; is_favourite?: boolean };

		if (body.is_draft === undefined && body.is_favourite === undefined) {
			return ResponseFactory.error({
				error: "bad request",
				message: "At least one of 'is_draft' or 'is_favourite' must be provided",
				status: 400,
				path: req,
			});
		}

		// Build the SET clause dynamically
		const setParts: string[] = [];
		const params: unknown[] = [];
		let idx = 1;

		if (body.is_draft !== undefined) {
			setParts.push(`is_draft = $${idx++}`);
			params.push(body.is_draft);
		}

		if (body.is_favourite !== undefined) {
			setParts.push(`is_favourite = $${idx++}`);
			params.push(body.is_favourite);
		}

		setParts.push("updated_at = NOW()");

		params.push(credentialId);
		const updateQuery = `UPDATE credentials SET ${setParts.join(", ")} WHERE id = $${idx} RETURNING id`;

		const [updated] = await sql.unsafe(updateQuery, params);

		if (!updated) {
			return ResponseFactory.error({
				error: "not found",
				message: "Credential not found",
				status: 404,
				path: req,
			});
		}

		log.info("http: credential toggled successfully", { credentialId });

		return ResponseFactory.success({
			data: {},
			type: "resource-update",
			message: "Credential updated successfully",
			status: 200,
			path: req,
		});
	} catch (error) {
		log.error("http: error in credentialToggle controller", {
			err: {
				message:
					error instanceof Error ? error.message : "unknown error",
			},
		});

		if (error instanceof AppError) {
			return ResponseFactory.error({
				error: error.message,
				type: error.type,
				message: "Failed to update credential",
				status: error.status,
				path: req,
			});
		}

		return ResponseFactory.error({
			error: "An unexpected error occurred",
			type: "internal-error",
			message: "Failed to update credential",
			status: 500,
			path: req,
			details: {
				originError: error instanceof Error ? error.message : "unknown error",
			},
		});
	}
}
