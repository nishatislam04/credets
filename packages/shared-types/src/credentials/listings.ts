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
	type_label: string | null;
	type_value: string | null;
};

/** Cursor-based pagination wrapper returned by the backend */
export type CredentialListingsResponse = {
	credentials: CredentialListItem[];
	nextCursor: string | null;
	hasMore: boolean;
};

/** A single credential image returned by the detail endpoint */
export type CredentialImage = {
	id: string;
	image_data: string | null;
	format: string | null;
	width: number | null;
	height: number | null;
	byte_size: number | null;
	sort_order: number | null;
};

/** A single data block entry from the create form */
export type DataBlockEntry =
	| { type: "single_label"; value: string }
	| { type: "key_value"; key: string; value: string }
	| { type: "information"; value: string };

/** Full credential detail returned by GET /credentials/:id */
export type CredentialDetail = {
	id: string;
	title: string;
	short_description: string | null;
	long_description: string | null;
	type_label: string | null;
	type_value: string | null;
	thumbnail_image_data: string | null;
	thumbnail_format: string | null;
	thumbnail_width: number | null;
	thumbnail_height: number | null;
	/** Can be a flat object (seed) or an array of typed blocks (from create form) */
	data: Record<string, unknown> | DataBlockEntry[];
	notes: string | null;
	tags: string[] | null;
	created_at: string;
	updated_at: string | null;
	images: CredentialImage[];
};

/** @deprecated Use CredentialListItem instead */
export type CredentialType = {
	id: string;
	data: string | null;
	images: string | null;
	created_at: Date;
};
