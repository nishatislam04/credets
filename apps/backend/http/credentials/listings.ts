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
	};

	try {
		const totalCountResult =
			await sql`SELECT COUNT(*) as count FROM credentials`;
		const totalItems = parseInt(totalCountResult[0].count);
		const credentials =
			await sql`SELECT id, data, images, created_at FROM credentials ORDER BY created_at DESC LIMIT ${validLimit} OFFSET ${offset}`;
		const parseedCredentials = credentials.map((credential) => ({
			id: credential.id,
			data: credential.data ? JSON.parse(credential.data) : null,
			images: credential.images ? JSON.parse(credential.images) : null,
			created_at: credential.created_at.toLocaleDateString(
				"en-BD",
				dateOptions,
			),
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
					first: `${url.origin}${url.pathname}?page=1&limit=${validLimit}`,
					previous: hasPreviousPage
						? `${url.origin}${url.pathname}?page=${validPage - 1}&limit=${validLimit}`
						: null,
					next: hasNextPage
						? `${url.origin}${url.pathname}?page=${validPage + 1}&limit=${validLimit}`
						: null,
					last: `${url.origin}${url.pathname}?page=${totalPages}&limit=${validLimit}`,
				},
			},
		};

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.log("error in credential listings", error);
	}

	return new Response("credentials listings page");
}
