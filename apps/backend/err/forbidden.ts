import { AppError } from "./base";

export class ForbiddenError extends AppError {
	constructor(message = "Access denied") {
		super(message, 403, "forbidden");
		this.name = "ForbiddenError";
	}
}
