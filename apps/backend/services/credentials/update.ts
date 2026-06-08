import { logAlways } from "@backend/utils/logger";
import { processImage } from "@backend/utils/processImage";
import { updateCredentialRepo } from "../../repository/credentials/update";

export interface UpdateCredentialServiceInput {
	credentialId: string;
	title: string;
	type: string;
	short_description?: string;
	long_description?: string;
	notes?: string;
	tags?: string;
	// biome-ignore lint/suspicious/noExplicitAny: data can contain arbitrary objects
	data: any[];
	thumbnail: File | null;
	removeThumbnail: boolean;
	images: File[];
	existingImagesKeep: string[];
}

export async function updateCredentialService(
	input: UpdateCredentialServiceInput,
): Promise<void> {
	logAlways(input.credentialId, "service: starting credential update");

	try {
		// 1. Process new thumbnail if provided
		let thumbnailResult = null;
		if (input.thumbnail) {
			thumbnailResult = await processImage({
				file: input.thumbnail,
				outputQuality: 50,
				resizeInWidth: 800,
			});
		}

		// 2. Process new images
		const processedImages = await Promise.all(
			input.images.map((file) =>
				processImage({
					file,
					outputQuality: 75,
					resizeInWidth: 1400,
				}),
			),
		);

		const validImages = processedImages.filter(
			(img): img is NonNullable<typeof img> => img !== null,
		);

		// 3. Format data fields
		const processedData = JSON.stringify(input.data);
		const processedTags = input.tags
			? JSON.stringify(
					input.tags
						.split(",")
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0),
				)
			: null;

		// 4. Call Repository Layer
		await updateCredentialRepo({
			credentialId: input.credentialId,
			title: input.title,
			type: input.type,
			short_description: input.short_description || null,
			long_description: input.long_description || null,
			notes: input.notes || null,
			data: processedData,
			tags: processedTags,
			thumbnail: thumbnailResult
				? {
						buffer: thumbnailResult.buffer,
						format: thumbnailResult.format,
						width: thumbnailResult.width,
						height: thumbnailResult.height,
					}
				: null,
			removeThumbnail: input.removeThumbnail,
			images: validImages.map((img) => ({
				buffer: img.buffer,
				format: img.format,
				width: img.width,
				height: img.height,
				byteSize: img.byteSize,
			})),
			existingImagesKeep: input.existingImagesKeep,
		});

		logAlways(input.credentialId, "service: credential update completed");
	} catch (error) {
		logAlways(error, "service: error in updateCredentialService");
		throw error;
	}
}
