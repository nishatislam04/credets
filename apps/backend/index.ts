import type { BunRequest } from "bun";
import { ResponseFactory } from "./utils/response";
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

/** Escape HTML special characters to prevent XSS in rendered error pages. */
function escapeHtml(text: string): string {
	return text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

/** Read the error page template once at startup. */
const ERROR_PAGE_TEMPLATE = await Bun.file(`${import.meta.dir}/error-page.html`).text();

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
		const isDev = process.env.NODE_ENV !== "production";
		const message = error instanceof Error ? error.message : "Internal server error";
		const stack = error instanceof Error ? (error.stack ?? "") : "";

		const details = isDev
			? `<div class="details">
				<summary>Error details</summary>
				<pre>${escapeHtml(message)}

${escapeHtml(stack)}</pre>
			</div>`
			: `<div class="prod-msg">
				If the problem persists, please contact support with the time this occurred.
			</div>`;

		const page = ERROR_PAGE_TEMPLATE.replace("{{ERROR_DETAILS}}", details);

		return new Response(page, {
			status: 500,
			headers: {
				"Content-Type": "text/html; charset=utf-8",
			},
		});
	},
});
