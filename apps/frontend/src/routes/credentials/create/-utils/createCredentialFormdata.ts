import type { CredentialCreateType } from "@credets/shared-types/credentials/create";
import { isDatablockEmpty } from "./isDatablockEmpty";

export function createCredentialFormdata(value: CredentialCreateType) {
	const formdata = new FormData();

	formdata.append("_csrf", value._csrf);
	formdata.append("type", value.type);
	formdata.append("title", value.title);
	if (value.types && value.types.length > 0) {
		formdata.append("types_path", JSON.stringify(value.types));
	}
	value.short_description &&
		formdata.append("short_description", value.short_description || "");
	value.long_description &&
		formdata.append("long_description", value.long_description || "");
	value.thumbnail && formdata.append("thumbnail", value.thumbnail);

	const cleanedDataBlock = value.data.filter((block) => !isDatablockEmpty(block));
	formdata.append("data", JSON.stringify(cleanedDataBlock));

	value.notes && formdata.append("notes", value.notes || "");
	value.tags && formdata.append("tags", value.tags || "");
	value.images?.length &&
		value.images.forEach((image, idx) => {
			formdata.append(`images[${idx}]`, image);
		});

	if (value.is_draft) {
		formdata.append("is_draft", "true");
	}

	return formdata;
}
