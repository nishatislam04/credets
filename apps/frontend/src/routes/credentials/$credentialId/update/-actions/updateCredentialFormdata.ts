import { isDatablockEmpty } from "#/routes/credentials/create/-utils/isDatablockEmpty";

interface UpdateFormValues {
	_csrf: string;
	credentialId: string;
	title: string;
	type: string;
	short_description?: string | null;
	long_description?: string | null;
	thumbnail: File | null;
	data: Array<{
		type: string;
		value?: string;
		key?: string;
	}>;
	notes?: string | null;
	tags?: string | null;
	/** New image files selected by the user */
	newImages: File[];
	/** IDs of existing images to keep */
	existingImagesKeep: string[];
}

export function createUpdateCredentialFormdata(value: UpdateFormValues) {
	const formdata = new FormData();

	formdata.append("_csrf", value._csrf);
	formdata.append("type", value.type);
	formdata.append("title", value.title);

	if (value.short_description) {
		formdata.append("short_description", value.short_description);
	}
	if (value.long_description) {
		formdata.append("long_description", value.long_description);
	}

	// Thumbnail — only append if a new file was selected
	if (value.thumbnail) {
		formdata.append("thumbnail", value.thumbnail);
	}

	// Clean and append data blocks
	const cleanedDataBlock = value.data.filter((block) => !isDatablockEmpty(block as any));
	formdata.append("data", JSON.stringify(cleanedDataBlock));

	if (value.notes) {
		formdata.append("notes", value.notes);
	}
	if (value.tags) {
		formdata.append("tags", value.tags);
	}

	// Existing images to keep
	if (value.existingImagesKeep.length > 0) {
		formdata.append("existing_images_keep", JSON.stringify(value.existingImagesKeep));
	}

	// New image files
	value.newImages.forEach((image, idx) => {
		formdata.append(`images[${idx}]`, image);
	});

	return formdata;
}
