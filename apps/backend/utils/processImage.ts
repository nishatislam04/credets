import { metadata, resize, toWebp } from "imgkit";

type ProcessImageType = {
	file: File | null | undefined;
	resizeInWidth: number;
	outputQuality: number;
};

/**
 * TODO: OPTIMIZE LATER
 * for now we keep this as simple as props
 * later we will add profile (thumbnail or images)
 * then additonal optioal options support when invoking
 */
export async function processImage({
	file,
	resizeInWidth,
	outputQuality,
}: ProcessImageType) {
	if (!file || file === undefined) return null;

	const inputBuffer = Buffer.from(await file.arrayBuffer());
	const info = await metadata(inputBuffer);
	const { width: originalW, height: originalH } = info;

	let newWidth = originalW;
	let newHeight = originalH;

	const MAX_SIZE = resizeInWidth;
	if (originalW > MAX_SIZE || originalH > MAX_SIZE) {
		const scale = Math.min(MAX_SIZE / originalW, MAX_SIZE / originalH);
		newWidth = Math.round(originalW * scale);
		newHeight = Math.round(originalH * scale);
	}

	// Resize if needed
	let resizedBuffer = inputBuffer;
	if (newWidth !== originalW || newHeight !== originalH) {
		resizedBuffer = await resize(inputBuffer, {
			width: newWidth,
			fit: "inside",
		});
	}

	// Convert to WebP
	const webpBuffer = await toWebp(resizedBuffer, { quality: outputQuality });

	return {
		buffer: webpBuffer,
		format: "webp",
		width: newWidth,
		height: newHeight,
		byteSize: webpBuffer.byteLength,
	};
}
