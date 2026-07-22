import { AppError } from "./base";

export class TooManyRequestsError extends AppError {
	constructor(message = "Too many requests, please try again later") {
		super(message, 429, "too-many-requests");
		this.name = "TooManyRequestsError";
	}
}
