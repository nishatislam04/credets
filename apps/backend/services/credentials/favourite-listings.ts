import { JsonParseError } from "@backend/err/json-parse";
import { logAlways } from "@backend/utils/logger";
import {
	type FavouriteRow,
	type CursorPayload,
	getFavouriteListingsRepo,
} from "../../repository/credentials/favourite-listings";

export interface GetFavouriteListingsInput {
	limit: number;
	cursorResult: CursorPayload | null;
}

export async function getFavouriteListingsService(
	input: GetFavouriteListingsInput,
) {
	try {
		const items = await getFavouriteListingsRepo(
			input.limit,
			input.cursorResult,
		);

		const hasMore = items.length > input.limit;
		const sliced = hasMore ? items.slice(0, input.limit) : items;

		let nextCursor: string | null = null;
		if (hasMore && sliced.length > 0) {
			const lastItem = sliced[sliced.length - 1]!;
			const cursorPayload: CursorPayload = {
				createdAt: lastItem.created_at.toISOString(),
				id: lastItem.id,
			};
			nextCursor = Buffer.from(JSON.stringify(cursorPayload)).toString(
				"base64",
			);
		}

		const parsed = sliced.map((row: FavouriteRow) => {
			let parsedTags: string[] = [];
			if (row.tags) {
				try {
					parsedTags = JSON.parse(row.tags);
				} catch {
					throw new JsonParseError(`Invalid JSON parse for ${row.id} tags`);
				}
			}

			return {
				id: row.id,
				title: row.title,
				short_description: row.short_description,
				version: row.version,
				thumbnail_url: row.thumbnail_url,
				tags: parsedTags,
				created_at: row.created_at.toISOString(),
				updated_at: row.updated_at ? row.updated_at.toISOString() : null,
				type_label: row.type_label,
				type_value: row.type_value,
				is_draft: row.is_draft,
			};
		});

		return { items: parsed, nextCursor, hasMore };
	} catch (error) {
		logAlways(error, "service: getFavouriteListingsService failed");
		throw error;
	}
}
