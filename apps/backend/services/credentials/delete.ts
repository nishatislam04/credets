import type { BunRequest, Server } from "bun";

export function credentailDelete(req: BunRequest, server: Server<unknown>) {
	console.log("credential delete page -req", req);
	console.log("credential delete page -server", server);
	return new Response("credentials delete request");
}
