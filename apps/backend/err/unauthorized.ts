import { AppError } from "./base";

export class UnauthorizedError extends AppError {
	constructor(message = "Authentication required") {
		super(message, 401, "unauthorized");
		this.name = "UnauthorizedError";
	}
}
