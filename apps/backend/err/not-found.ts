import { AppError } from "./base";

export class NotFoundError extends AppError {
	constructor(resource: string) {
		super(`${resource} not found`, 404, "not-found");
		this.name = "NotFoundError";
	}
}
