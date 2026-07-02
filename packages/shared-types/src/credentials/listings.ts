/** A single credential item returned in the listings response */
export type CredentialListItem = {
	id: string;
	title: string;
	short_description: string | null;
	thumbnail_url: string | null;
	tags: string[] | null;
	created_at: string;
	updated_at: string | null;
	type_label: string | null;
	type_value: string | null;
	version: number;
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
	image_url: string | null;
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
	version: number;
	type_label: string | null;
	type_value: string | null;
	type_path: Array<{ label: string; value: string }>;
	thumbnail_url: string | null;
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
