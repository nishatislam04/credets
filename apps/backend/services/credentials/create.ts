import { randomUUID } from "crypto";
import { encrypt } from "@backend/cipher/encrypt";
import { logAlways } from "@backend/utils/logger";
import { processImage } from "@backend/utils/processImage";
import {
	credentialImageKey,
	credentialThumbnailKey,
	uploadToS3,
} from "@backend/utils/storage";
import {
	createCredentialRepo,
	type TypePathEntry,
} from "../../repository/credentials/create";

export interface CreateCredentialServiceInput {
	title: string;
	type: string;
	types_path: TypePathEntry[];
	short_description?: string;
	long_description?: string;
	notes?: string;
	tags?: string;
	// biome-ignore lint/suspicious/noExplicitAny: data can contain arbitrary objects
	data: any[];
	thumbnail: File | null;
	images: File[];
}

export async function createCredentialService(
	input: CreateCredentialServiceInput,
) {
	logAlways(input.title, "service: starting credential creation");

	// Generate credential ID upfront so we can construct S3 paths before DB insert
	const credentialId = randomUUID();

	try {
		// 1. Process thumbnail
		const thumbnailResult = await processImage({
			file: input.thumbnail,
			outputQuality: 75,
			resizeInWidth: 800,
		});

		// 2. Process other images
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

		// 3. Upload to S3
		let thumbnailUrl: string | null = null;
		if (thumbnailResult) {
			const result = await uploadToS3(
				credentialThumbnailKey(credentialId),
				thumbnailResult.buffer,
				"image/webp",
			);
			thumbnailUrl = result.url;
		}

		const imageUploads = await Promise.all(
			validImages.map(async (img, index) => {
				const key = credentialImageKey(credentialId, `${index}.webp`);
				const result = await uploadToS3(key, img.buffer, "image/webp");
				return { url: result.url, ...img };
			}),
		);

		// 4. Construct DB Repository Payload
		const dbPayload = {
			title: input.title,
			type: input.type,
			types_path: input.types_path,
			short_description: input.short_description || null,
			long_description: input.long_description || null,
			notes: input.notes || null,
			data: await encrypt(JSON.stringify(input.data)),
			tags: input.tags
				? JSON.stringify(
						input.tags
							.split(",")
							.map((tag) => tag.trim())
							.filter((tag) => tag.length > 0),
					)
				: null,
			thumbnail: thumbnailResult
				? {
						url: thumbnailUrl!,
						format: thumbnailResult.format,
						width: thumbnailResult.width,
						height: thumbnailResult.height,
					}
				: null,
			images: imageUploads.map((img) => ({
				url: img.url,
				format: img.format,
				width: img.width,
				height: img.height,
				byteSize: img.byteSize,
			})),
			id: credentialId,
		};

		// 5. Call Repository Layer
		const result = await createCredentialRepo(dbPayload);

		logAlways(result.id, "service: credential creation completed successfully");
		return result;
	} catch (error) {
		logAlways(error, "service: error in createCredentialService");
		throw error;
	}
}
