import { verifyCSRF } from "@backend/http/csrf/verifyCSRF";
import { formatZodError } from "@backend/types/formatZodError";
import { ResponseFactory } from "@backend/utils/response";
import type { BunRequest } from "bun";
import type { ZodSchema } from "zod";

export type ValidationSuccess<T> = {
	success: true;
	validatedData: { data: T };
	images: File[];
	// biome-ignore lint/suspicious/noExplicitAny: formData type varies between undici and global DOM types
	formData: any;
};

export type ValidationFailure = {
	success: false;
	errorResponse: Response;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Reusable utility to parse and validate credential Form Data against a given Zod schema.
 * Handles CSRF verification, extracts file streams/fields, and structures errors.
 */
export async function parseAndValidateCredential<T>(
	req: BunRequest,
	schema: ZodSchema<T>,
): Promise<ValidationResult<T>> {
	const formData = await req.formData();
	const _csrf = formData.get("_csrf")?.toString() || "";

	const isValidCsrf = verifyCSRF(_csrf);
	if (!isValidCsrf) {
		return {
			success: false,
			errorResponse: ResponseFactory.error({
				error: "csrf token expired",
				type: "csrf-expired",
				message: "csrf token expired",
				status: 500,
				path: req,
			}),
		};
	}

	const title = formData.get("title")?.toString() || "";
	const short_description = formData.get("short_description")?.toString() || "";
	const long_description = formData.get("long_description")?.toString() || "";
	const type = formData.get("type")?.toString() || "";
	const notes = formData.get("notes")?.toString() || null;
	const tags = formData.get("tags")?.toString() || null;
	const data = JSON.parse(formData.get("data")?.toString() || "[]");
	// Extract files
	const thumbnail = formData.get("thumbnail") as File | null;

	const images: File[] = [];
	for (const [key, value] of formData.entries()) {
		if (key.startsWith("images[") && value instanceof File) {
			images.push(value);
		}
	}

	const validateDisData: Record<string, unknown> = {
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
	};

	// For update routes, the keep parameter can be passed
	const existing_images_keep_raw =
		formData.get("existing_images_keep")?.toString() || null;
	if (formData.has("existing_images_keep")) {
		validateDisData.existing_images_keep = existing_images_keep_raw;
	}

	const validatedData = schema.safeParse(validateDisData);

	if (!validatedData.success) {
		const errors = formatZodError(validatedData);

		return {
			success: false,
			errorResponse: ResponseFactory.error({
				error: "Form validation failed",
				type: "form-validation",
				message: "Form validation failed",
				status: 400,
				path: req,
				errors,
			}),
		};
	}

	return {
		success: true,
		validatedData,
		images,
		formData,
	};
}
