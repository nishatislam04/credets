import { ResponseFactory } from "@backend/utils/response";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";

interface CursorPayload {
	createdAt: string;
	id: string;
}

/** Shape of a row returned by the credentials SQL query. */
interface CredentialRow {
	id: string;
	title: string;
	short_description: string | null;
	thumbnail_image_data: Buffer | null;
	thumbnail_format: string | null;
	thumbnail_width: number | null;
	thumbnail_height: number | null;
	tags: string;
	created_at: Date;
	type_label: string | null;
	type_value: string | null;
}

export async function credentialListings(req: BunRequest) {
	try {
		const url = new URL(req.url);

		const rawLimit = parseInt(url.searchParams.get("limit") || "12", 10);
		const cursorParam = url.searchParams.get("cursor");
		const limit = Number.isNaN(rawLimit)
			? 12
			: Math.min(24, Math.max(1, rawLimit));

		// Decode cursor (base64-encoded JSON { createdAt, id })
		let cursor: CursorPayload | null = null;
		if (cursorParam) {
			try {
				const decoded = Buffer.from(cursorParam, "base64").toString("utf-8");
				cursor = JSON.parse(decoded) as CursorPayload;
			} catch {
				// Invalid cursor — ignore, start from the beginning
			}
		}

		// Use composite cursor: (created_at, id) to handle duplicate timestamps
		// Items are ordered newest-first (DESC), so the cursor represents the last item
		// on the current page. The next page grabs rows that fall "before" it.
		let credentials: CredentialRow[] = [];
		if (cursor) {
			credentials = await sql`
				SELECT
					c.id, c.title, c.short_description,
					c.thumbnail_image_data, c.thumbnail_format, c.thumbnail_width, c.thumbnail_height,
					c.tags, c.created_at,
					t.label AS type_label, t.value AS type_value
				FROM credentials c
				LEFT JOIN types t ON c.types_id = t.id
				WHERE
					(c.created_at < ${cursor.createdAt}::timestamptz)
					OR (c.created_at = ${cursor.createdAt}::timestamptz AND c.id::text < ${cursor.id})
				ORDER BY c.created_at DESC, c.id DESC
				LIMIT ${limit + 1}
			`;
		} else {
			credentials = await sql`
				SELECT
					c.id, c.title, c.short_description,
					c.thumbnail_image_data, c.thumbnail_format, c.thumbnail_width, c.thumbnail_height,
					c.tags, c.created_at,
					t.label AS type_label, t.value AS type_value
				FROM credentials c
				LEFT JOIN types t ON c.types_id = t.id
				ORDER BY c.created_at DESC, c.id DESC
				LIMIT ${limit + 1}
			`;
		}

		// If we fetched limit+1 rows, there are more results
		const hasMore = credentials.length > limit;
		const items = hasMore ? credentials.slice(0, limit) : credentials;

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
		const parsedCredentials = items.map((cred: CredentialRow) => ({
			id: cred.id,
			title: cred.title,
			short_description: cred.short_description,
			thumbnail_image_data:
				cred.thumbnail_image_data != null
					? Buffer.from(cred.thumbnail_image_data).toString("base64")
					: null,
			thumbnail_format: cred.thumbnail_format,
			thumbnail_width: cred.thumbnail_width,
			thumbnail_height: cred.thumbnail_height,
			tags: JSON.parse(cred.tags) ?? [],
			created_at: cred.created_at.toISOString(),
			type_label: cred.type_label,
			type_value: cred.type_value,
		}));

		console.log(parsedCredentials);

		return ResponseFactory.success({
			data: {
				credentials: parsedCredentials,
				nextCursor,
				hasMore,
			},
			path: req,
			message: "credentials listings fetched",
			status: 200,
		});
	} catch (error) {
		return ResponseFactory.error({
			error: "database or server side error",
			data: {},
			message: "failed to fetch credentials listings",
			path: req,
			details: {
				originError:
					error instanceof Error ? error.message : "unknown server error",
			},
		});
	}
}

/* ── Previous offset-based pagination (kept for reference) ──────

import { ResponseFactory } from "@backend/utils/response";
import type { CredentialType } from "@credets/shared-types/listings";
import { sql } from "@db/connection";
import type { BunRequest } from "bun";

export async function credentialListings(req: BunRequest) {
	const url = new URL(req.url);
	const rawPage = parseInt(url.searchParams.get("page") || "1");
	const rawLimit = parseInt(url.searchParams.get("limit") || "10");
	const page = Number.isNaN(rawPage) ? 1 : rawPage;
	const limit = Number.isNaN(rawLimit) ? 10 : rawLimit;
	const validPage = Math.max(1, page);
	const validLimit = Math.min(10, Math.max(10, limit));
	const offset = (validPage - 1) * validLimit;
	const dateOptions = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	} as const;

	try {
		const totalCountResult = await sql\`SELECT COUNT(*) as count FROM credentials\`;
		const totalItems = parseInt(totalCountResult[0].count);
		const credentials =
			await sql\`SELECT id, data, images, created_at FROM credentials ORDER BY created_at DESC LIMIT \${validLimit} OFFSET \${offset}\`;
		const parseedCredentials = credentials.map((credential: CredentialType) => ({
			id: credential.id,
			data: credential.data ? JSON.parse(credential.data) : null,
			images: credential.images ? JSON.parse(credential.images) : null,
			created_at: credential.created_at.toLocaleDateString("en-BD", dateOptions),
		}));
		const totalPages = Math.ceil(totalItems / validLimit);
		const hasNextPage = validPage < totalPages;
		const hasPreviousPage = validPage > 1;

		const response = {
			success: true,
			data: parseedCredentials,
			pagination: {
				current_page: validPage,
				per_page: validLimit,
				total_items: totalItems,
				total_pages: totalPages,
				has_next_page: hasNextPage,
				has_previous_page: hasPreviousPage,
				links: {
					first: \`\${url.origin}\${url.pathname}?page=1&limit=\${validLimit}\`,
					previous: hasPreviousPage
						? \`\${url.origin}\${url.pathname}?page=\${validPage - 1}&limit=\${validLimit}\`
						: null,
					next: hasNextPage
						? \`\${url.origin}\${url.pathname}?page=\${validPage + 1}&limit=\${validLimit}\`
						: null,
					last: \`\${url.origin}\${url.pathname}?page=\${totalPages}&limit=\${validLimit}\`,
				},
			},
		};

		return ResponseFactory.success({
			data: response,
			path: req,
			message: "credentials listings",
			status: 200,
		});
	} catch (error) {
		return ResponseFactory.error({
			error: "database or server side error",
			data: {},
			message: "failed to fetch credentials listings",
			path: req,
			details: {
				originError: error instanceof Error ? error.message : "unknown server error",
			},
		});
	}
}
*/
