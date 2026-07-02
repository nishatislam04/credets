import { decrypt } from "@backend/cipher/decrypt";
import { logAlways, logger } from "@backend/utils/logger";
import {
	getCredentialDetailRepo,
	getTypeHierarchyRepo,
} from "../../repository/credentials/credential";

export async function getCredentialDetailService(credentialId: string) {
	logger(credentialId, "service: starting getCredentialDetailService");

	try {
		const { credential, images } = await getCredentialDetailRepo(credentialId);

		if (!credential) {
			return null;
		}

		// Fetch the full type hierarchy (root → leaf)
		const typePath = await getTypeHierarchyRepo(credential.types_id);

		// Serialise
		const parsed = {
			id: credential.id,
			title: credential.title,
			short_description: credential.short_description,
			long_description: credential.long_description,
			version: credential.version,
			type_label: credential.type_label,
			type_value: credential.type_value,
			type_path: typePath,
			thumbnail_url: credential.thumbnail_url,
			data: await (async () => {
				const raw =
					typeof credential.data === "string"
						? credential.data
						: typeof credential.data === "object" && credential.data !== null
							? JSON.stringify(credential.data)
							: String(credential.data);
				const decrypted = await decrypt(raw);
				return JSON.parse(decrypted);
			})(),
			notes: credential.notes,
			tags: credential.tags ? JSON.parse(credential.tags) : [],
			created_at: credential.created_at.toISOString(),
			updated_at: credential.updated_at?.toISOString() ?? null,
			images: images.map((img) => ({
				id: img.id,
				image_url: img.image_url,
			})),
		};

		return parsed;
	} catch (error) {
		logAlways(error, "service: getCredentialDetailService failed");
		throw error;
	}
}
