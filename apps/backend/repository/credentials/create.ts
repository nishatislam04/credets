import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";

export interface CreateCredentialRepoInput {
	title: string;
	type: string;
	short_description: string | null;
	long_description: string | null;
	notes: string | null;
	data: string;
	tags: string | null;
	thumbnail: {
		buffer: Uint8Array;
		format: string;
		width: number;
		height: number;
	} | null;
	images: Array<{
		buffer: Uint8Array;
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
				throw new Error(
					`DB Error: Credential type '${input.type}' does not exist`,
				);
			}

			const credentialPayload = {
				title: input.title,
				short_description: input.short_description,
				long_description: input.long_description,
				thumbnail_image_data: input.thumbnail?.buffer || null,
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
					image_data: img.buffer,
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
		throw error;
	}
}
