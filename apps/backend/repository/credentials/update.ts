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
}

export interface UpdateCredentialRepoInput {
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

			// 3. Build update SET clause using nested SQL fragments
			//    Note: Can't use sql(object) in UPDATE context — Bun's SQL driver
			//    checks that the helper fragment starts with INSERT/UPDATE/IN,
			//    but sql(object) generates "(col1, col2, ...) = (...)" which starts
			//    with '(' and fails the check.
			let setClause = sql`
				title = ${input.title},
				short_description = ${input.short_description},
				long_description = ${input.long_description},
				data = ${input.data},
				notes = ${input.notes},
				tags = ${input.tags},
				types_id = ${typesId}
			`;

			if (input.thumbnail) {
				setClause = sql`
					${setClause},
					thumbnail_url = ${input.thumbnail.url},
					thumbnail_format = ${input.thumbnail.format},
					thumbnail_width = ${input.thumbnail.width},
					thumbnail_height = ${input.thumbnail.height}
				`;
			} else if (input.removeThumbnail) {
				setClause = sql`
					${setClause},
					thumbnail_url = NULL,
					thumbnail_format = NULL,
					thumbnail_width = NULL,
					thumbnail_height = NULL
				`;
			}

			setClause = sql`${setClause}, updated_at = NOW()`;

			// 4. Update core credential
			await sql`
				UPDATE credentials SET ${setClause}
				WHERE id = ${input.credentialId}
			`;

			// 5. Delete removed images
			if (input.existingImagesKeep.length > 0) {
				await sql`
					DELETE FROM credential_images
					WHERE credential_id = ${input.credentialId}
						AND id != ALL(${sql(input.existingImagesKeep)}::uuid[])
				`;
			} else {
				await sql`
					DELETE FROM credential_images
					WHERE credential_id = ${input.credentialId}
				`;
			}

			// 6. Insert new images
			if (input.images.length > 0) {
				const credentialImagesPayload = input.images.map((img) => ({
					image_url: img.url,
					format: img.format,
					width: img.width,
					height: img.height,
					byte_size: img.byteSize,
					credential_id: input.credentialId,
				}));

				await sql`INSERT INTO credential_images ${sql(credentialImagesPayload)}`;
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
