import { AppError } from "./base";

export class InternalError extends AppError {
	constructor(message = "An unexpected error occurred") {
		super(message, 500, "internal-error");
		this.name = "InternalError";
	}
}
