import type { ZodError } from "zod";

/** Flattened field-level errors keyed by field path (e.g. "title", "images[0]"). */
export type FieldErrors = Record<string, { message: string }[]>;

/**
 * Format a ZodError into a flat record of field → messages[].
 */
export function formatZodError(data: { error: ZodError }): FieldErrors {
	const errors: FieldErrors = {};

	for (const issue of data.error.issues) {
		const fieldName = issue.path.join(".");
		if (!errors[fieldName]) {
			errors[fieldName] = [];
		}
		errors[fieldName].push({ message: issue.message });
	}

	return errors;
}
