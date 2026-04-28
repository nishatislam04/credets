import type { BunRequest, Server } from "bun";

export function credentialListings(req: BunRequest, server: Server<unknown>) {
	console.log("credentials listings -req", req);
	console.log("credentials listings -server", server);
	return new Response("the credentials listings");
}
