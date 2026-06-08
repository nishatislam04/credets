import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";
import { AppError } from "@backend/err/base";
import { BadRequestError } from "@backend/err/bad-request";
import { DatabaseError } from "@backend/err/database";	export interface CreateCredentialRepoInput {
	id: string;
	title: string;
	type: string;
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
	images: Array<{
		url: string;
		format: string;
		width: number;
		height: number;
		byteSize: number;
	}>;
}

export async function createCredentialRepo(
	input: CreateCredentialRepoInput,
): Promise<{ id: string }> {
	logAlways(input.title, "repo: starting db transaction for create");

	try {
		return await sql.begin(async (sql) => {
			const [{ id: user_id }] = await sql`SELECT id FROM users LIMIT 1`;
			const [typeRow] =
				await sql`SELECT id FROM types WHERE value=${input.type}`;

			if (!typeRow) {
				throw new BadRequestError(
					`Credential type '${input.type}' does not exist`,
				);
			}

			const credentialPayload = {
				id: input.id,
				title: input.title,
				short_description: input.short_description,
				long_description: input.long_description,
				thumbnail_url: input.thumbnail?.url || null,
				thumbnail_format: input.thumbnail?.format || null,
				thumbnail_width: input.thumbnail?.width || null,
				thumbnail_height: input.thumbnail?.height || null,
				data: input.data,
				notes: input.notes,
				tags: input.tags,
				user_id,
				types_id: typeRow.id,
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
