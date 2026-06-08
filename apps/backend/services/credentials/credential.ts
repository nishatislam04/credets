import { logAlways } from "@backend/utils/logger";
import { getCredentialDetailRepo } from "../../repository/credentials/credential";

export async function getCredentialDetailService(credentialId: string) {
	logAlways(credentialId, "service: starting getCredentialDetailService");

	try {
		const { credential, images } = await getCredentialDetailRepo(credentialId);

		if (!credential) {
			return null;
		}

		// Serialise
		const parsed = {
			id: credential.id,
			title: credential.title,
			short_description: credential.short_description,
			long_description: credential.long_description,
			type_label: credential.type_label,
			type_value: credential.type_value,
			thumbnail_url: credential.thumbnail_url,
			thumbnail_format: credential.thumbnail_format,
			thumbnail_width: credential.thumbnail_width,
			thumbnail_height: credential.thumbnail_height,
			data:
				typeof credential.data === "string"
					? JSON.parse(credential.data)
					: credential.data,
			notes: credential.notes,
			tags:
				typeof credential.tags === "string"
					? JSON.parse(credential.tags)
					: credential.tags,
			created_at: credential.created_at.toISOString(),
			updated_at: credential.updated_at?.toISOString() ?? null,
			images: images.map((img) => ({
				id: img.id,
				image_url: img.image_url,
				format: img.format,
				width: img.width,
				height: img.height,
				byte_size: img.byte_size,
				sort_order: img.sort_order,
			})),
		};

		return parsed;
	} catch (error) {
		logAlways(error, "service: getCredentialDetailService failed");
		throw error;
	}
}
