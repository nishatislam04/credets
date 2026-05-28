import { verifyCSRF } from "@backend/http/csrf/verifyCSRF";
import { formatZodError } from "@backend/types/formatZodError";
import { ResponseFactory } from "@backend/utils/response";
import { credentialsUpdateSchema } from "@credets/shared-schema/credentials/update";
import type { BunRequest } from "bun";

export async function updateCredentialValidation(req: BunRequest) {
	const formData = await req.formData();
	const _csrf = formData.get("_csrf")?.toString() || "";

	const isValidCsrf = verifyCSRF(_csrf);
	if (!isValidCsrf)
		return ResponseFactory.error({
			error: "csrf token expired",
			type: "csrf-expired",
			message: "csrf token expired",
			status: 500,
			path: req,
		});

	const title = formData.get("title")?.toString() || "";
	const short_description = formData.get("short_description")?.toString() || "";
	const long_description = formData.get("long_description")?.toString() || "";
	const type = formData.get("type")?.toString() || "";
	const notes = formData.get("notes")?.toString() || "";
	const tags = formData.get("tags")?.toString() || "";
	const data = JSON.parse(formData.get("data")?.toString() || "[]");
	const thumbnail = formData.get("thumbnail") as File | null;

	const images: File[] = [];
	for (const [key, value] of formData.entries()) {
		if (key.startsWith("images[") && value instanceof File) {
			images.push(value);
		}
	}

	const existing_images_keep = formData.get("existing_images_keep")?.toString() || null;

	const validateDisData = {
		_csrf,
		title,
		type,
		short_description,
		long_description,
		thumbnail,
		images,
		tags,
		notes,
		data,
		existing_images_keep,
	};

	const validatedData = credentialsUpdateSchema.safeParse(validateDisData);

	if (!validatedData.success) {
		const errors = formatZodError(validatedData);

		return ResponseFactory.error({
			error: "Form validation failed",
			type: "form-validation",
			message: "Form validation failed",
			status: 400,
			path: req,
			errors,
		});
	}

	return ResponseFactory.success({
		data: {},
		type: "form-validation",
		message: "Form validation passed",
		status: 200,
		path: req,
	});
}
