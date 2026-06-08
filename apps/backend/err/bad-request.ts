import { AppError } from "./base";

export class BadRequestError extends AppError {
	constructor(message: string) {
		super(message, 400, "bad-request");
		this.name = "BadRequestError";
	}
}
