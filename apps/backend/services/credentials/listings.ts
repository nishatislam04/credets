import { JsonParseError } from "@backend/err/json-parse";
import { logAlways } from "@backend/utils/logger";
import {
	type CredentialRow,
	type CursorPayload,
	getCredentialsListingsRepo,
} from "../../repository/credentials/listings";

export interface GetCredentialsListingsServiceInput {
	limit: number;
	cursorResult: CursorPayload | null;
}

export async function getCredentialsListingsService(
	input: GetCredentialsListingsServiceInput,
) {
	try {
		const credentials = await getCredentialsListingsRepo(
			input.limit,
			input.cursorResult,
		);

		// If we fetched limit+1 rows, there are more results
		const hasMore = credentials.length > input.limit;
		const items = hasMore ? credentials.slice(0, input.limit) : credentials;

		// Build next cursor from the last item
		let nextCursor: string | null = null;
		if (hasMore && items.length > 0) {
			const lastItem = items[items.length - 1]!;
			const cursorPayload: CursorPayload = {
				createdAt: lastItem.created_at.toISOString(),
				id: lastItem.id,
			};
			nextCursor = Buffer.from(JSON.stringify(cursorPayload)).toString(
				"base64",
			);
		}

		// Serialise rows into plain JSON-safe objects
		const parsedCredentials = items.map((cred: CredentialRow) => {
			let parsedTags: string[] = [];
			if (cred.tags) {
				try {
					parsedTags = JSON.parse(cred.tags);
				} catch {
					throw new JsonParseError(`Invalid JSON parse for ${cred.id} tags`);
				}
			}
			return {
				id: cred.id,
				title: cred.title,
				short_description: cred.short_description,
				version: cred.version,
				thumbnail_url: cred.thumbnail_url,
				tags: parsedTags,
				created_at: cred.created_at.toISOString(),
				updated_at: cred.updated_at ? cred.updated_at.toISOString() : null,
				type_label: cred.type_label,
				type_value: cred.type_value,
			};
		});

		return {
			credentials: parsedCredentials,
			nextCursor,
			hasMore,
		};
	} catch (error) {
		logAlways(error, "service: getCredentialsListingsService failed");
		throw error;
	}
}
