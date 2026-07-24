import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";
import { AppError } from "@backend/err/base";
import { BadRequestError } from "@backend/err/bad-request";
import { DatabaseError } from "@backend/err/database";
import { NotFoundError } from "@backend/err/not-found";

/** A single entry in the types hierarchy path */
export interface TypePathEntry {
	value: string;
	label: string;
}

/**
 * Walk the types_path hierarchy, creating any missing types along the way.
 * Returns the leaf type ID.
 */
async function resolveOrCreateTypePath(
	client: typeof sql,
	typesPath: TypePathEntry[],
): Promise<string> {
	let parentId: string | null = null;
	let leafId: string | null = null;

	for (const entry of typesPath) {
		// Try to find existing type under current parent
		const [existing] = parentId
			? await client`SELECT id FROM types WHERE parent_id = ${parentId}::uuid AND value = ${entry.value}`
			: await client`SELECT id FROM types WHERE parent_id IS NULL AND value = ${entry.value}`;

		if (existing) {
			leafId = existing.id;
			parentId = existing.id;
		} else {
			// Create new type
			const [created] = await client`
				INSERT INTO types (label, value, parent_id)
				VALUES (${entry.label}, ${entry.value}, ${parentId})
				RETURNING id
			`;
			leafId = created.id;
			parentId = created.id;
		}
	}

	if (!leafId) {
		throw new BadRequestError("Failed to resolve or create type hierarchy");
	}

	return leafId;
}	export interface UpdateCredentialRepoInput {
	credentialId: string;
	title: string;
	type: string;
	types_path: TypePathEntry[];
	short_description: string | null;
	long_description: string | null;
	notes: string | null;
	data: string;
	tags: string | null;
	thumbnail: {
		url: string;
		format: string;
		width: number;
		height: number;
	} | null;
	removeThumbnail: boolean;
	images: Array<{
		url: string;
		format: string;
		width: number;
		height: number;
		byteSize: number;
	}>;
	existingImagesKeep: string[];
}

export async function updateCredentialRepo(
	input: UpdateCredentialRepoInput,
): Promise<void> {
	logAlways(input.credentialId, "repo: starting db transaction for update");

	try {
		await sql.begin(async (sql) => {
			// 1. Verify credential exists
			const [existingCredential] =
				await sql`SELECT id FROM credentials WHERE id = ${input.credentialId}`;
			if (!existingCredential) {
				throw new NotFoundError("Credential");
			}

			// 2. Resolve types_id
			let typesId: string;
			if (input.types_path && input.types_path.length > 0) {
				typesId = await resolveOrCreateTypePath(sql, input.types_path);
			} else {
				// Fallback to old behavior for backward compat
				const [typeRow] =
					await sql`SELECT id FROM types WHERE value=${input.type}`;
				if (!typeRow) {
					throw new BadRequestError("Invalid type selected");
				}
				typesId = typeRow.id;
			}

			// 3. Build UPDATE SET clause as a raw parameterized query
			//    Using sql.unsafe() to avoid Bun's SQL helper/fragment checks
			//    which don't work correctly in UPDATE context.
			const setParts: string[] = [];
			const params: unknown[] = [];
			let idx = 1;

			setParts.push(`title = $${idx++}`);
			params.push(input.title);

			setParts.push(`short_description = $${idx++}`);
			params.push(input.short_description);

			setParts.push(`long_description = $${idx++}`);
			params.push(input.long_description);

			setParts.push(`data = $${idx++}`);
			params.push(input.data);

			setParts.push(`notes = $${idx++}`);
			params.push(input.notes);

			setParts.push(`version = version + 1`);

			setParts.push(`tags = $${idx++}`);
			params.push(input.tags);

			setParts.push(`types_id = $${idx++}`);
			params.push(typesId);

			if (input.thumbnail) {
				setParts.push(`thumbnail_url = $${idx++}`);
				params.push(input.thumbnail.url);
				setParts.push(`thumbnail_format = $${idx++}`);
				params.push(input.thumbnail.format);
				setParts.push(`thumbnail_width = $${idx++}`);
				params.push(input.thumbnail.width);
				setParts.push(`thumbnail_height = $${idx++}`);
				params.push(input.thumbnail.height);
			} else if (input.removeThumbnail) {
				setParts.push(`thumbnail_url = NULL`);
				setParts.push(`thumbnail_format = NULL`);
				setParts.push(`thumbnail_width = NULL`);
				setParts.push(`thumbnail_height = NULL`);
			}

			setParts.push(`updated_at = NOW()`);

			params.push(input.credentialId);
			const updateQuery = `UPDATE credentials SET ${setParts.join(", ")} WHERE id = $${idx}`;

			await sql.unsafe(updateQuery, params);

			// 5. Delete removed images
			//    Using sql.unsafe() to avoid Bun's SQL helper checks that reject
			//    helpers in DELETE context (only INSERT, UPDATE, IN are allowed).
			if (input.existingImagesKeep.length > 0) {
				const keepIds = input.existingImagesKeep
					.map((id, i) => `$${i + 1}::uuid`)
					.join(", ");
				const delParams = [...input.existingImagesKeep, input.credentialId];
				const delIdx = input.existingImagesKeep.length + 1;
				await sql.unsafe(
					`DELETE FROM credential_images WHERE credential_id = $${delIdx} AND id != ALL(ARRAY[${keepIds}])`,
					delParams,
				);
			} else {
				await sql.unsafe(
					"DELETE FROM credential_images WHERE credential_id = $1",
					[input.credentialId],
				);
			}

			// 6. Insert new images
			//    Build a multi-row INSERT manually to avoid Bun's sql(object) helper.
			if (input.images.length > 0) {
				const cols = ["image_url", "format", "width", "height", "byte_size", "credential_id"];
				const valueRows: string[] = [];
				const insertParams: unknown[] = [];
				let pi = 1;

				for (const img of input.images) {
					valueRows.push(`($${pi++}, $${pi++}, $${pi++}, $${pi++}, $${pi++}, $${pi++})`);
					insertParams.push(img.url, img.format, img.width, img.height, img.byteSize, input.credentialId);
				}

				await sql.unsafe(
					`INSERT INTO credential_images (${cols.join(", ")}) VALUES ${valueRows.join(", ")}`,
					insertParams,
				);
			}
		});
	} catch (error) {
		logAlways(error, "repo: db update transaction failed");

		if (error instanceof AppError) {
			throw error;
		}

		throw new DatabaseError(error);
	}
}
