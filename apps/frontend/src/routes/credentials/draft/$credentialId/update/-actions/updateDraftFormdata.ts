import { isDatablockEmpty } from "#/routes/credentials/create/-utils/isDatablockEmpty";

interface UpdateDraftFormValues {
	_csrf: string;
	credentialId: string;
	title: string;
	type: string;
	types?: Array<{ value: string; label: string }>;
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
	is_draft?: boolean;
	/** New image files selected by the user */
	newImages: File[];
	/** IDs of existing images to keep */
	existingImagesKeep: string[];
	/** Whether to remove the existing thumbnail */
	removeThumbnail?: boolean;
}

export function createUpdateDraftFormdata(value: UpdateDraftFormValues) {
	const formdata = new FormData();

	formdata.append("_csrf", value._csrf);
	formdata.append("type", value.type);
	formdata.append("title", value.title);
	if (value.types && value.types.length > 0) {
		formdata.append("types_path", JSON.stringify(value.types));
	}

	if (value.short_description) {
		formdata.append("short_description", value.short_description);
	}
	if (value.long_description) {
		formdata.append("long_description", value.long_description);
	}

	// Thumbnail — only append if a new file was selected
	if (value.thumbnail) {
		formdata.append("thumbnail", value.thumbnail);
	} else if (value.removeThumbnail) {
		formdata.append("remove_thumbnail", "true");
	}

	// Clean and append data blocks
	const cleanedDataBlock = value.data.filter(
		(block) => !isDatablockEmpty(block as any),
	);
	formdata.append("data", JSON.stringify(cleanedDataBlock));

	if (value.notes) {
		formdata.append("notes", value.notes);
	}
	if (value.tags) {
		formdata.append("tags", value.tags);
	}

	// is_draft — publish or keep as draft
	if (value.is_draft !== undefined) {
		formdata.append("is_draft", value.is_draft ? "true" : "false");
	}

	// Existing images to keep
	if (value.existingImagesKeep.length > 0) {
		formdata.append(
			"existing_images_keep",
			JSON.stringify(value.existingImagesKeep),
		);
	}

	// New image files
	value.newImages.forEach((image, idx) => {
		formdata.append(`images[${idx}]`, image);
	});

	return formdata;
}
