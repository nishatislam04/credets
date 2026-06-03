type ProcessImageType = {
	file: File | null | undefined;
	resizeInWidth: number;
	outputQuality: number;
};

/**
 * Resizes an image to fit within `resizeInWidth` (maintaining aspect ratio)
 * and converts it to WebP format.
 *
 * Uses Bun's built-in Image API (statically linked codecs for JPEG, PNG, WebP,
 * GIF, BMP — identical output across platforms).
 */
export async function processImage({
	file,
	resizeInWidth,
	outputQuality,
}: ProcessImageType) {
	if (!file) return null;

	const inputBuffer = await file.arrayBuffer();

	// Get original dimensions
	const meta = await new Bun.Image(inputBuffer).metadata();
	const { width: originalW, height: originalH } = meta;

	let newWidth = originalW;
	let newHeight = originalH;

	const MAX_SIZE = resizeInWidth;
	if (originalW > MAX_SIZE || originalH > MAX_SIZE) {
		const scale = Math.min(MAX_SIZE / originalW, MAX_SIZE / originalH);
		newWidth = Math.round(originalW * scale);
		newHeight = Math.round(originalH * scale);
	}

	// Build processing pipeline
	let pipeline = new Bun.Image(inputBuffer);

	// Resize only if needed
	if (newWidth !== originalW || newHeight !== originalH) {
		pipeline = pipeline.resize(newWidth, undefined, {
			fit: "inside",
		});
	}

	// Convert to WebP and get output bytes
	const webpBuffer = await pipeline.webp({ quality: outputQuality }).bytes();

	return {
		buffer: webpBuffer,
		format: "webp" as const,
		width: newWidth,
		height: newHeight,
		byteSize: webpBuffer.byteLength,
	};
}
