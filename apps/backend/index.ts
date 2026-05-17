import { credentialCreate } from "./http/credentials/create";
import { credentialPage } from "./http/credentials/credential";
import { credentailDelete } from "./http/credentials/delete";
import { credentialListings } from "./http/credentials/listings";
import { credentialUpdate } from "./http/credentials/update";
import { generateCSRF } from "./http/csrf/generateCSRF";
import indexHtml from "./index.html";
import { createCredentialValidation } from "./validation/credential/create";

Bun.serve({
	development: true,
	port: "8000",
	idleTimeout: 35,
	routes: {
		"/": indexHtml,
		"/get-csrf": () => generateCSRF(),

		"/credentials": (req) => credentialListings(req),
		"/credentials/:credentialId": (req) => credentialPage(req),

		"/credentials/create": (req) => credentialCreate(req),
		"/credentials/update": () => credentialUpdate(),
		"/credentials/delete": (req, server) => credentailDelete(req, server),

		"/credentials/create/validation": (req) => createCredentialValidation(req),
	},

	async fetch(req, server) {
		const address = server.requestIP(req);
		if (address) {
			return new Response(`Client IP: ${address.address}, Port: ${address.port}`);
		}
		return new Response("Unknown client");
	},
	websocket: {
		// Required for this overload
		message: (ws, message) => {
			console.log(message);
		},
	},
	error(error) {
		return new Response(`<pre>${error}\n${error.stack}</pre>`, {
			headers: {
				"Content-Type": "text/html",
			},
		});
	},
});
