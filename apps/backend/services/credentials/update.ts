import type { BunRequest, Server } from "bun";

export function credentialUpdate(req: BunRequest, server: Server<unknown>) {
	console.log("credentials update page -req", req);
	console.log("credentials update page -server", server);
	return new Response("credentials update page");
}
