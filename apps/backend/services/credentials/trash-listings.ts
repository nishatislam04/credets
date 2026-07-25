import { JsonParseError } from "@backend/err/json-parse";
import { log } from "@backend/utils/logger";
import {
	type TrashRow,
	type CursorPayload,
	type TrashImageRow,
	getTrashListingsRepo,
	getTrashImagesRepo,
} from "../../repository/credentials/trash-listings";

export interface GetTrashListingsInput {
	limit: number;
	cursorResult: CursorPayload | null;
}

export async function getTrashListingsService(
	input: GetTrashListingsInput,
) {
	try {
		const items = await getTrashListingsRepo(
			input.limit,
			input.cursorResult,
		);

		const hasMore = items.length > input.limit;
		const sliced = hasMore ? items.slice(0, input.limit) : items;

		// Fetch images for all returned items in one query
		const credentialIds = sliced.map((row) => row.id);
		const imageRows = await getTrashImagesRepo(credentialIds);

		// Group images by credential_id for fast lookup
		const imageMap = new Map<string, TrashImageRow[]>();
		for (const img of imageRows) {
			const existing = imageMap.get(img.credential_id);
			if (existing) {
				existing.push(img);
			} else {
				imageMap.set(img.credential_id, [img]);
			}
		}

		let nextCursor: string | null = null;
		if (hasMore && sliced.length > 0) {
			const lastItem = sliced[sliced.length - 1]!;
			const cursorPayload: CursorPayload = {
				deletedAt: lastItem.deleted_at.toISOString(),
				id: lastItem.id,
			};
			nextCursor = Buffer.from(JSON.stringify(cursorPayload)).toString(
				"base64",
			);
		}

		const parsed = sliced.map((row: TrashRow) => {
			let parsedTags: string[] = [];
			if (row.tags) {
				try {
					parsedTags = JSON.parse(row.tags);
				} catch {
					throw new JsonParseError(`Invalid JSON parse for ${row.id} tags`);
				}
			}

			const images = imageMap.get(row.id) ?? [];

			return {
				id: row.id,
				title: row.title,
				short_description: row.short_description,
				long_description: row.long_description,
				notes: row.notes,
				version: row.version,
				thumbnail_url: row.thumbnail_url,
				tags: parsedTags,
				created_at: row.created_at.toISOString(),
				updated_at: row.updated_at ? row.updated_at.toISOString() : null,
				deleted_at: row.deleted_at.toISOString(),
				type_label: row.type_label,
				type_value: row.type_value,
				is_draft: row.is_draft,
				is_favourite: row.is_favourite,
				images: images.map((img) => ({
					id: img.id,
					image_url: img.image_url,
				})),
			};
		});

		return { items: parsed, nextCursor, hasMore };
	} catch (error) {
		log.error("service: getTrashListingsService failed", {
			err: {
				message:
					error instanceof Error ? error.message : "unknown error",
			},
		});
		throw error;
	}
}
