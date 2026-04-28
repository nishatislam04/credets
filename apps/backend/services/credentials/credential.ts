import type { BunRequest, Server } from "bun";
import { ResponseFactory } from "../../utils/response";

export function credentialPage(req: BunRequest, server: Server<unknown>) {
	try {
		console.log("credential single page -req", req);
		console.log("credential single page -server", server);

		const { credentialId } = req.params;
		const credentialData = {
			id: credentialId,
			name: "AWS Access Key",
			type: "api-key",
			createdAt: "2024-01-01T00:00:00Z",
			lastUsed: "2024-01-15T10:30:00Z",
		};

		return ResponseFactory.success({
			data: credentialData,
			message: "credentail retrieved success",
			path: req.url,
			status: 202,
		});
	} catch (error) {
		return ResponseFactory.error({
			error: "database error",
			message: "failed to fetch credentials",
			status: 500,
			path: req.url,
			details: {
				origininError: error instanceof Error ? error.message : "unknown error",
			},
			data: {},
		});
	}
}
