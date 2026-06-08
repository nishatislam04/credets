import { logAlways } from "@backend/utils/logger";
import { sql } from "@db/connection";
import { AppError } from "@backend/err/base";
import { BadRequestError } from "@backend/err/bad-request";
import { DatabaseError } from "@backend/err/database";
import { NotFoundError } from "@backend/err/not-found";	export interface UpdateCredentialRepoInput {
	credentialId: string;
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
			const [typeRow] =
				await sql`SELECT id FROM types WHERE value=${input.type}`;
			if (!typeRow) {
				throw new BadRequestError("Invalid type selected");
			}

			// 3. Build update payload
			const updateFields: Record<string, unknown> = {
				title: input.title,
				short_description: input.short_description,
				long_description: input.long_description,
				data: input.data,
				notes: input.notes,
				tags: input.tags,
				types_id: typeRow.id,
			};

			if (input.thumbnail) {
				updateFields.thumbnail_url = input.thumbnail.url;
				updateFields.thumbnail_format = input.thumbnail.format;
				updateFields.thumbnail_width = input.thumbnail.width;
				updateFields.thumbnail_height = input.thumbnail.height;
			} else if (input.removeThumbnail) {
				updateFields.thumbnail_url = null;
				updateFields.thumbnail_format = null;
				updateFields.thumbnail_width = null;
				updateFields.thumbnail_height = null;
			}

			// 4. Update core credential
			await sql`
				UPDATE credentials SET ${sql(updateFields)} WHERE id = ${input.credentialId}
			`;

			// 5. Delete removed images
			if (input.existingImagesKeep.length > 0) {
				await sql`
					DELETE FROM credential_images
					WHERE credential_id = ${input.credentialId}
						AND id != ALL(${sql.array(input.existingImagesKeep)})
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
