export class AppError extends Error {
	public readonly status: number;
	public readonly type: string;

	constructor(message: string, status: number, type: string) {
		super(message);
		this.name = "AppError";
		this.status = status;
		this.type = type;
	}
}
