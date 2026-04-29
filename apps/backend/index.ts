import indexHtml from "./index.html";
import { credentialCreate } from "./services/credentials/create";
import { credentialPage } from "./services/credentials/credential";
import { credentailDelete } from "./services/credentials/delete";
import { credentialListings } from "./services/credentials/listings";
import { credentialUpdate } from "./services/credentials/update";

Bun.serve({
	development: true,
	port: "8000",
	idleTimeout: 35,
	routes: {
		"/": indexHtml,
		"/credentials": (req, server) => credentialListings(req, server),
		"/credentials/:credentialId": (req, server) => credentialPage(req, server),

		"/credentials/create": (req, server) => credentialCreate(req, server),
		"/credentials/update": (req, server) => credentialUpdate(req, server),
		"/credentials/delete": (req, server) => credentailDelete(req, server),
	},

	fetch(req, server) {
		const address = server.requestIP(req);
		if (address) {
			return new Response(
				`Client IP: ${address.address}, Port: ${address.port}`,
			);
		}
		return new Response("Unknown client");
	},
	error(error) {
		return new Response(`<pre>${error}\n${error.stack}</pre>`, {
			headers: {
				"Content-Type": "text/html",
			},
		});
	},
});
