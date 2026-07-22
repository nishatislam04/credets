import { AppError } from "./base";

export class JsonParseError extends AppError {
	constructor(context: string) {
		const message = `Failed to parse JSON for "${context}"`;

		super(message, 500, "json-parse-error");
		this.name = "JsonParseError";
	}
}
