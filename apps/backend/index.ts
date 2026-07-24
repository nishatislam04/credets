import { sql } from "@db/connection";
import type { BunRequest } from "bun";
import { AppError } from "./err/base";
import { credentialCreate } from "./http/credentials/create";
import { credentialPage } from "./http/credentials/credential";
import { credentailDelete } from "./http/credentials/delete";
import { credentialListings } from "./http/credentials/listings";
import { trashListings } from "./http/credentials/trash-listings";
import { credentialToggle } from "./http/credentials/toggle";
import { credentialUpdate } from "./http/credentials/update";
import { generateCSRF } from "./http/csrf/generateCSRF";
import { typesChildren } from "./http/types/children";
import { typesListings } from "./http/types/listings";
import { logAlways } from "./utils/logger";
import { ResponseFactory } from "./utils/response";
// import indexHtml from "./index.html";
import { createCredentialValidation } from "./validation/credential/create";
import { updateCredentialValidation } from "./validation/credential/update";

Bun.serve({
	development: Bun.env.NODE_ENV !== "production",
	port: process.env.PORT || "8000",
	idleTimeout: 35,
	routes: {
		"/healthz": async () => {
			try {
				await sql`SELECT 1`; // Verify DB is reachable
				return ResponseFactory.success({
					data: { status: "ok", db: "connected" },
					message: "Server is healthy",
					status: 200,
					path: { url: "/healthz" } as BunRequest,
				});
			} catch (_) {
				return new Response("Database unavailable", { status: 503 });
			}
		},
		// "/": indexHtml,

		// csrf
		"/get-csrf": () => generateCSRF(),

		// credentials
		"/credentials": (req) => credentialListings(req),
		"/credentials/:credentialId": (req) => credentialPage(req),
		"/credentials/create": (req) => credentialCreate(req),
		"/credentials/:credentialId/update": (req) => credentialUpdate(req),
		"/credentials/:credentialId/delete": (req) => credentailDelete(req),
		"/credentials/:credentialId/toggle": (req) => credentialToggle(req),
		"/credentials/trash": (req) => trashListings(req),

		"/credentials/create/validation": (req) => createCredentialValidation(req),
		"/credentials/:credentialId/update/validation": (req) =>
			updateCredentialValidation(req),

		// types
		"/types/listings": () => typesListings(),
		"/types/children": (req) => typesChildren(req),
	},

	error(error) {
		logAlways(error, "server error");

		const status = error instanceof AppError ? error.status : 500;
		const type = error instanceof AppError ? error.type : "internal-error";
		const message =
			error instanceof AppError
				? error.message
				: "An unexpected error occurred";

		return Response.json(
			{
				success: false,
				error: message,
				type,
				message: "Server error",
				timestamp: new Date().toISOString(),
				status,
			},
			{
				status,
				headers: ResponseFactory.getCorsHeaders(),
			},
		);
	},
});

logAlways(
	{ port: process.env.PORT || "8000", env: Bun.env.NODE_ENV || "development" },
	"server started",
);
