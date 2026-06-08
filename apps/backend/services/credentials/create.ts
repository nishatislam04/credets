import { logAlways } from "@backend/utils/logger";
import { processImage } from "@backend/utils/processImage";
import { createCredentialRepo } from "../../repository/credentials/create";

export interface CreateCredentialServiceInput {
	title: string;
	type: string;
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

	try {
		// 1. Process thumbnail
		const thumbnailResult = await processImage({
			file: input.thumbnail,
			outputQuality: 50,
			resizeInWidth: 800,
		});

		// 2. Process other images
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

		// 3. Construct DB Repository Payload
		const dbPayload = {
			title: input.title,
			type: input.type,
			short_description: input.short_description || null,
			long_description: input.long_description || null,
			notes: input.notes || null,
			data: JSON.stringify(input.data),
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
						buffer: thumbnailResult.buffer,
						format: thumbnailResult.format,
						width: thumbnailResult.width,
						height: thumbnailResult.height,
					}
				: null,
			images: validImages.map((img) => ({
				buffer: img.buffer,
				format: img.format,
				width: img.width,
				height: img.height,
				byteSize: img.byteSize,
			})),
		};

		// 4. Call Repository Layer
		const result = await createCredentialRepo(dbPayload);

		logAlways(result.id, "service: credential creation completed successfully");
		return result;
	} catch (error) {
		logAlways(error, "service: error in createCredentialService");
		throw error;
	}
}
