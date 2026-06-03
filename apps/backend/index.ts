import type { BunRequest } from "bun";
import { logAlways } from "./utils/logger";
import { credentialCreate } from "./http/credentials/create";
import { credentialPage } from "./http/credentials/credential";
import { credentailDelete } from "./http/credentials/delete";
import { credentialListings } from "./http/credentials/listings";
import { credentialUpdate } from "./http/credentials/update";
import { generateCSRF } from "./http/csrf/generateCSRF";
import { typesListings } from "./http/types/listings";
import { ResponseFactory } from "./utils/response";
// import indexHtml from "./index.html";
import { createCredentialValidation } from "./validation/credential/create";
import { updateCredentialValidation } from "./validation/credential/update";

Bun.serve({
	development: true,
	port: process.env.PORT || "8000",
	idleTimeout: 35,
	routes: {
		"/healthz": () =>
			ResponseFactory.success({
				data: { status: "ok" },
				message: "Server is healthy",
				status: 200,
				path: { url: "/healthz" } as BunRequest,
			}),
		// "/": indexHtml,

		// csrf
		"/get-csrf": () => generateCSRF(),

		// credentials
		"/credentials": (req) => credentialListings(req),
		"/credentials/:credentialId": (req) => credentialPage(req),
		"/credentials/create": (req) => credentialCreate(req),
		"/credentials/:credentialId/update": (req) => credentialUpdate(req),
		"/credentials/:credentialId/delete": (req) => credentailDelete(req),

		"/credentials/create/validation": (req) => createCredentialValidation(req),
		"/credentials/:credentialId/update/validation": (req) =>
			updateCredentialValidation(req),

		// types
		"/types/listings": () => typesListings(),
	},

	error(error) {
		const message =
			error instanceof Error ? error.message : "Internal server error";
		logAlways(error, "server error");
		return new Response(message, {
			status: 500,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
			},
		});
	},
});

logAlways(
	{ port: process.env.PORT || "8000", env: Bun.env.NODE_ENV || "development" },
	"server started",
);
