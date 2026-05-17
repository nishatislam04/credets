export function formatZodError(data) {
	const errors: Record<string, { message: string }[]> = {};

	for (const issue of data.error.issues) {
		const fieldName = issue.path.join(".");
		if (!errors[fieldName]) {
			errors[fieldName] = [];
		}
		errors[fieldName].push({ message: issue.message });
	}

	return errors;
}
