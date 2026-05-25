/** A single credential item returned in the listings response */
export type CredentialListItem = {
	id: string;
	title: string;
	short_description: string | null;
	thumbnail_image_data: string | null;
	thumbnail_format: string | null;
	thumbnail_width: number | null;
	thumbnail_height: number | null;
	tags: string[] | null;
	created_at: string;
};

/** Cursor-based pagination wrapper returned by the backend */
export type CredentialListingsResponse = {
	credentials: CredentialListItem[];
	nextCursor: string | null;
	hasMore: boolean;
};

/** @deprecated Use CredentialListItem instead */
export type CredentialType = {
	id: string;
	data: string | null;
	images: string | null;
	created_at: Date;
};
