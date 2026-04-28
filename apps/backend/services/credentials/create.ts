import type { BunRequest, Server } from "bun";

export function credentialCreate(req: BunRequest, server: Server<unknown>) {
	console.log("credential create page -req", req);
	console.log("credential create page -server", server);
	return new Response("credentials create page");
}
