import { ResponseFactory } from "@backend/utils/response";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";

export async function credentialPage(req: BunRequest) {
	try {
		const { credentialId } = req.params;

		// Fetch the credential with its type info
		const [credential] = await sql`
			SELECT
				c.id, c.title, c.short_description, c.long_description,
				c.thumbnail_image_data, c.thumbnail_format,
				c.thumbnail_width, c.thumbnail_height,
				c.data, c.notes, c.tags, c.created_at, c.updated_at,
				t.label AS type_label, t.value AS type_value
			FROM credentials c
			LEFT JOIN types t ON c.types_id = t.id
			WHERE c.id = ${credentialId}
		`;

		if (!credential) {
			return ResponseFactory.error({
				error: "not found",
				message: "credential not found",
				status: 404,
				path: req,
				data: {},
			});
		}

		// Fetch associated images ordered by sort_order
		const images = await sql`
			SELECT id, image_data, format, width, height, byte_size, sort_order
			FROM credential_images
			WHERE credential_id = ${credentialId}
			ORDER BY sort_order ASC, created_at ASC
		`;

		// Serialise
		const parsed = {
			id: credential.id,
			title: credential.title,
			short_description: credential.short_description,
			long_description: credential.long_description,
			type_label: credential.type_label,
			type_value: credential.type_value,
			thumbnail_image_data:
				credential.thumbnail_image_data != null
					? Buffer.from(credential.thumbnail_image_data).toString("base64")
					: null,
			thumbnail_format: credential.thumbnail_format,
			thumbnail_width: credential.thumbnail_width,
			thumbnail_height: credential.thumbnail_height,
			// data is JSONB — ensure it's always returned as a parsed object/array
			data:
				typeof credential.data === "string"
					? JSON.parse(credential.data)
					: credential.data,
			notes: credential.notes,
			// tags is JSONB — ensure it's always returned as a parsed array
			tags:
				typeof credential.tags === "string"
					? JSON.parse(credential.tags)
					: credential.tags,
			created_at: credential.created_at.toISOString(),
			updated_at: credential.updated_at?.toISOString() ?? null,
			images: images.map(
				(img: {
					id: string;
					image_data: Buffer | null;
					format: string | null;
					width: number | null;
					height: number | null;
					byte_size: number | null;
					sort_order: number | null;
				}) => ({
					id: img.id,
					image_data:
						img.image_data != null
							? Buffer.from(img.image_data).toString("base64")
							: null,
					format: img.format,
					width: img.width,
					height: img.height,
					byte_size: img.byte_size,
					sort_order: img.sort_order,
				}),
			),
		};

		return ResponseFactory.success({
			data: parsed,
			path: req,
			message: "credential fetched",
			status: 200,
		});
	} catch (error) {
		return ResponseFactory.error({
			error: "database error",
			message: "failed to fetch credential",
			status: 500,
			path: req,
			details: {
				originError:
					error instanceof Error ? error.message : "unknown error",
			},
			data: {},
		});
	}
}
