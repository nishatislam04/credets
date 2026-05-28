import { credentialCreate } from "./http/credentials/create";
import { credentialPage } from "./http/credentials/credential";
import { credentailDelete } from "./http/credentials/delete";
import { credentialListings } from "./http/credentials/listings";
import { credentialUpdate } from "./http/credentials/update";
import { generateCSRF } from "./http/csrf/generateCSRF";
import { typesListings } from "./http/types/listings";
// import indexHtml from "./index.html";
import { createCredentialValidation } from "./validation/credential/create";
import { updateCredentialValidation } from "./validation/credential/update";

Bun.serve({
	development: true,
	port: process.env.PORT || "8000",
	idleTimeout: 35,
	routes: {
		"/healthz": () => new Response("OK", { status: 200 }),
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
		return new Response(`<pre>${error}\n${error.stack}</pre>`, {
			headers: {
				"Content-Type": "text/html",
			},
		});
	},
});
