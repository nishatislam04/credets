type DataJson = string | null;

type ImagesJson = string | null;

export type CredentialType = {
	id: string;
	data: DataJson;
	images: ImagesJson;
	created_at: Date;
};
