import { credentialCreate } from "./http/credentials/create";
import { credentialPage } from "./http/credentials/credential";
import { credentailDelete } from "./http/credentials/delete";
import { credentialListings } from "./http/credentials/listings";
import { credentialUpdate } from "./http/credentials/update";
import indexHtml from "./index.html";

Bun.serve({
	development: true,
	port: "8000",
	idleTimeout: 35,
	routes: {
		"/": indexHtml,
		"/credentials": (req) => credentialListings(req),
		"/credentials/:credentialId": (req) => credentialPage(req),

		"/credentials/create": () => credentialCreate(),
		"/credentials/update": () => credentialUpdate(),
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
