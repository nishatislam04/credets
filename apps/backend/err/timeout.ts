import { AppError } from "./base";

export class TimeoutError extends AppError {
	constructor(message = "Operation timed out after 30s") {
		super(message, 504, "timeout");
		this.name = "TimeoutError";
	}
}
