import { AppError } from "./base";

export class ValidationError extends AppError {
	public readonly errors: Record<string, { message: string }[]>;

	constructor(
		message: string,
		errors: Record<string, { message: string }[]>,
	) {
		super(message, 422, "validation-error");
		this.name = "ValidationError";
		this.errors = errors;
	}
}
