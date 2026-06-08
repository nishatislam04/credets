import { AppError } from "./base";

/**
 * Friendly mappings for common PostgreSQL error codes.
 *
 * Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const PG_ERROR_MAP: Record<string, { status: number; message: string }> = {
	"23505": { status: 409, message: "Resource already exists" }, // unique_violation
	"23503": { status: 400, message: "Referenced resource does not exist" }, // foreign_key_violation
	"23502": { status: 400, message: "Required field is missing" }, // not_null_violation
	"23514": { status: 400, message: "Value does not meet requirements" }, // check_violation
	"22P02": { status: 400, message: "Invalid input format" }, // invalid_text_representation
	"08006": { status: 503, message: "Database connection lost" }, // connection_failure
	"08001": { status: 503, message: "Unable to connect to database" }, // sqlclient_unable_to_establish_sqlconnection
	"57014": { status: 504, message: "Query timed out" }, // query_canceled
	"53300": { status: 503, message: "Too many connections" }, // too_many_connections
	"40P01": { status: 500, message: "Database deadlock detected" }, // deadlock_detected
};

export class DatabaseError extends AppError {
	public readonly pgCode: string | undefined;
	public readonly pgDetail: string | undefined;
	public readonly pgTable: string | undefined;
	public readonly pgConstraint: string | undefined;

	constructor(originalError: unknown) {
		// Extract PG-specific fields from Bun SQL errors
		const pgCode =
			originalError && typeof originalError === "object" && "code" in originalError
				? String((originalError as Record<string, unknown>).code)
				: undefined;

		const pgDetail =
			originalError && typeof originalError === "object" && "detail" in originalError
				? String((originalError as Record<string, unknown>).detail)
				: undefined;

		const pgTable =
			originalError && typeof originalError === "object" && "table" in originalError
				? String((originalError as Record<string, unknown>).table)
				: undefined;

		const pgConstraint =
			originalError && typeof originalError === "object" && "constraint" in originalError
				? String((originalError as Record<string, unknown>).constraint)
				: undefined;

		// Look up a friendly message, or fall back to generic
		const mapped = pgCode ? PG_ERROR_MAP[pgCode] : undefined;
		const status = mapped?.status ?? 500;
		const message = mapped?.message ?? "A database error occurred";

		super(message, status, "database-error");
		this.name = "DatabaseError";
		this.pgCode = pgCode;
		this.pgDetail = pgDetail;
		this.pgTable = pgTable;
		this.pgConstraint = pgConstraint;
	}
}
