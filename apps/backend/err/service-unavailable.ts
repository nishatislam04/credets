import { AppError } from "./base";

export class ServiceUnavailableError extends AppError {
	constructor(serviceName: string) {
		super(
			`External service "${serviceName}" is currently unavailable`,
			503,
			"service-unavailable",
		);
		this.name = "ServiceUnavailableError";
	}
}
