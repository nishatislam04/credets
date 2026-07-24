import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";
import { AppError } from "@backend/err/base";
import { BadRequestError } from "@backend/err/bad-request";
import { DatabaseError } from "@backend/err/database";

/** A single entry in the types hierarchy path */
export interface TypePathEntry {
	value: string;
	label: string;
}	export interface CreateCredentialRepoInput {
	id: string;
	title: string;
	type: string;
	types_path: TypePathEntry[];
	is_draft: boolean;
	is_favourite: boolean;
	short_description: string | null;
	long_description: string | null;
	notes: string | null;
	version: number;
	data: string;
	tags: string | null;
	thumbnail: {
		url: string;
		format: string;
		width: number;
		height: number;
	} | null;
	images: Array<{
		url: string;
		format: string;
		width: number;
		height: number;
		byteSize: number;
	}>;
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

export async function createCredentialRepo(
	input: CreateCredentialRepoInput,
): Promise<{ id: string }> {
	logAlways(input.title, "repo: starting db transaction for create");

	try {
		return await sql.begin(async (sql) => {
			const [{ id: user_id }] = await sql`SELECT id FROM users LIMIT 1`;

			let typesId: string;
			if (input.types_path && input.types_path.length > 0) {
				typesId = await resolveOrCreateTypePath(sql, input.types_path);
			} else {
				// Fallback to old behavior for backward compat
				const [typeRow] =
					await sql`SELECT id FROM types WHERE value=${input.type}`;
				if (!typeRow) {
					throw new BadRequestError(
						`Credential type '${input.type}' does not exist`,
					);
				}
				typesId = typeRow.id;
			}

			const credentialPayload = {
				id: input.id,
				title: input.title,
				is_draft: input.is_draft,
				is_favourite: input.is_favourite,
				short_description: input.short_description,
				long_description: input.long_description,
				version: input.version,
				thumbnail_url: input.thumbnail?.url || null,
				thumbnail_format: input.thumbnail?.format || null,
				thumbnail_width: input.thumbnail?.width || null,
				thumbnail_height: input.thumbnail?.height || null,
				data: input.data,
				notes: input.notes,
				tags: input.tags,
				user_id,
				types_id: typesId,
			};

			const [{ id: credential_id }] = await sql`
				INSERT INTO credentials ${sql(credentialPayload)} RETURNING id
			`;

			if (input.images.length > 0) {
				const imagesPayload = input.images.map((img) => ({
					image_url: img.url,
					format: img.format,
					width: img.width,
					height: img.height,
					byte_size: img.byteSize,
					credential_id,
				}));
				await sql`INSERT INTO credential_images ${sql(imagesPayload)}`;
			}

			return { id: credential_id };
		});
	} catch (error) {
		logAlways(error, "repo: db insert query failed");

		if (error instanceof AppError) {
			throw error;
		}

		throw new DatabaseError(error);
	}
}
