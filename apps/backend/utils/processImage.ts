type ProcessImageType = {
	file: File | null | undefined;
	resizeInWidth: number;
	outputQuality: number;
};

export async function processImage({
	file,
	resizeInWidth,
	outputQuality,
}: ProcessImageType) {
	if (!file || file === undefined) return null;

	const inputBuffer = await file.arrayBuffer();
	const image = new Bun.Image(inputBuffer);
	const { width: originalW, height: originalH } = await image.metadata();

	let newWidth = originalW;
	let newHeight = originalH;

	const MAX_SIZE = resizeInWidth;
	if (originalW > MAX_SIZE || originalH > MAX_SIZE) {
		const scale = Math.min(MAX_SIZE / originalW, MAX_SIZE / originalH);
		newWidth = Math.round(originalW * scale);
		newHeight = Math.round(originalH * scale);
	}

	const compressed = await image
		.resize(resizeInWidth, { fit: "inside", withoutEnlargement: true })
		.webp({ quality: outputQuality })
		.bytes();

	return {
		buffer: Buffer.from(compressed),
		format: "webp",
		width: newWidth,
		height: newHeight,
	};
}
