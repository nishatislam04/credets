import { AppError } from "./base";

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, 409, "conflict");
		this.name = "ConflictError";
	}
}
