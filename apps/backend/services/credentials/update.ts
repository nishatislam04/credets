import { encrypt } from "@backend/cipher/encrypt";
import { logAlways } from "@backend/utils/logger";
import { processImage } from "@backend/utils/processImage";
import {
	credentialImageKey,
	credentialThumbnailKey,
	deleteFromS3,
	extractKeyFromUrl,
	uploadToS3,
} from "@backend/utils/storage";
import { getCredentialImageUrlsRepo } from "../../repository/credentials/credential";
import { updateCredentialRepo, type TypePathEntry } from "../../repository/credentials/update";	export interface UpdateCredentialServiceInput {
	credentialId: string;
	title: string;
	type: string;
	types_path: TypePathEntry[];
	short_description?: string;
	long_description?: string;
	notes?: string;
	tags?: string;
	is_draft?: boolean;
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
		// 1. Clean up old S3 objects before processing + uploading new ones
		//    (order matters: old images must be deleted before new ones are uploaded
		//     so the S3 keys are freed if we need to overwrite)

		// 1a. Delete old thumbnail from S3 if it's being replaced or removed
		if (input.thumbnail || input.removeThumbnail) {
			await deleteFromS3(credentialThumbnailKey(input.credentialId));
		}

		// 1b. Fetch current images, determine which ones are being removed,
		//     and delete them from S3
		const currentImages = await getCredentialImageUrlsRepo(input.credentialId);
		const removedImages = currentImages.filter(
			(img) =>
				img.image_url && !input.existingImagesKeep.includes(img.id),
		);
		await Promise.all(
			removedImages.map(async (img) => {
				const key = extractKeyFromUrl(img.image_url!);
				if (key) {
					await deleteFromS3(key);
				}
			}),
		);

		// 2. Process new thumbnail if provided
		let thumbnailResult = null;
		if (input.thumbnail) {
			thumbnailResult = await processImage({
				file: input.thumbnail,
				outputQuality: 75,
				resizeInWidth: 800,
			});
		}

		// 3. Process new images
		const processedImages = await Promise.all(
			input.images.map((file) =>
				processImage({
					file,
					outputQuality: 85,
					resizeInWidth: 1400,
				}),
			),
		);

		const validImages = processedImages.filter(
			(img): img is NonNullable<typeof img> => img !== null,
		);

		// 4. Upload new images to S3
		let thumbnailUrl: string | null = null;
		if (thumbnailResult) {
			const result = await uploadToS3(
				credentialThumbnailKey(input.credentialId),
				thumbnailResult.buffer,
				"image/webp",
			);
			thumbnailUrl = result.url;
		}

		const imageUploads = await Promise.all(
			validImages.map(async (img, index) => {
				const key = credentialImageKey(
					input.credentialId,
					`${Date.now()}-${index}.webp`,
				);
				const result = await uploadToS3(key, img.buffer, "image/webp");
				return { url: result.url, ...img };
			}),
		);

		// 5. Format data fields
		const processedData = await encrypt(JSON.stringify(input.data));
		const processedTags = input.tags
			? JSON.stringify(
					input.tags
						.split(",")
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0),
				)
			: null;

		// 6. Call Repository Layer
		await updateCredentialRepo({
			credentialId: input.credentialId,
			title: input.title,
			type: input.type,
			types_path: input.types_path,
			short_description: input.short_description || null,
			long_description: input.long_description || null,
			notes: input.notes || null,
			data: processedData,
			tags: processedTags,
			thumbnail: thumbnailResult
				? {
						url: thumbnailUrl!,
						format: thumbnailResult.format,
						width: thumbnailResult.width,
						height: thumbnailResult.height,
					}
				: null,
			removeThumbnail: input.removeThumbnail,
			images: imageUploads.map((img) => ({
				url: img.url,
				format: img.format,
				width: img.width,
				height: img.height,
				byteSize: img.byteSize,
			})),
			existingImagesKeep: input.existingImagesKeep,
			is_draft: input.is_draft,
		});

		logAlways(input.credentialId, "service: credential update completed");
	} catch (error) {
		logAlways(error, "service: error in updateCredentialService");
		throw error;
	}
}
