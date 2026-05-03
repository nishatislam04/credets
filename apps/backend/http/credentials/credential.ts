import { ResponseFactory } from "@backend/utils/response";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";

export async function credentialPage(req: BunRequest) {
	try {
		const { credentialId } = req.params;
		const [credential] =
			await sql`SELECT id, title, short_description long_description, thumbnail, data, images, notes, tags, created_at FROM credentials WHERE id=${credentialId}`;
		const parsedCredential = {
			...credential,
			data: credential.data ? JSON.parse(credential.data) : null,
			images: credential.images ? JSON.parse(credential.images) : null,
			thumbnail: credential.thumbnail ? JSON.parse(credential.thumbnail) : null,
			tags: credential.tags ? JSON.parse(credential.tags) : null,
			created_at: credential.created_at.toLocaleString(),
		};

		return ResponseFactory.success({
			data: parsedCredential,
			path: req,
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
