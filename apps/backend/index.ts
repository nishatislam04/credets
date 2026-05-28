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

		const extra = isDev
			? `<div class="details">
				<summary>Error details</summary>
				<pre>${escapeHtml(message)}

${escapeHtml(stack)}</pre>
			</div>`
			: `<div class="prod-msg">
				If the problem persists, please contact support with the time this occurred.
			</div>`;

		const page = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>500 — Server Error</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #0a0a0b;
			color: #e4e4e7;
			padding: 2rem;
		}
		.card {
			max-width: 640px;
			width: 100%;
			background: #18181b;
			border: 1px solid #27272a;
			border-radius: 12px;
			padding: 2.5rem;
		}
		.badge {
			display: inline-block;
			background: #ef4444;
			color: #fef2f2;
			font-size: 0.75rem;
			font-weight: 600;
			padding: 0.25rem 0.625rem;
			border-radius: 999px;
			letter-spacing: 0.025em;
			margin-bottom: 1rem;
		}
		h1 {
			font-size: 1.5rem;
			font-weight: 600;
			margin-bottom: 0.5rem;
		}
		p {
			color: #a1a1aa;
			line-height: 1.6;
			margin-bottom: 0.25rem;
		}
		.details { margin-top: 1.5rem; }
		.details summary {
			cursor: pointer;
			font-size: 0.875rem;
			color: #a1a1aa;
			user-select: none;
		}
		.details summary:hover { color: #e4e4e7; }
		pre {
			margin-top: 0.75rem;
			background: #09090b;
			border: 1px solid #27272a;
			border-radius: 8px;
			padding: 1rem;
			overflow-x: auto;
			font-family: "JetBrains Mono", "Fira Code", monospace;
			font-size: 0.8125rem;
			line-height: 1.5;
			color: #ef4444;
			white-space: pre-wrap;
			word-break: break-word;
		}
		.prod-msg {
			margin-top: 1.5rem;
			padding: 1rem;
			background: #09090b;
			border: 1px solid #27272a;
			border-radius: 8px;
			font-size: 0.875rem;
			color: #a1a1aa;
			line-height: 1.6;
		}
	</style>
</head>
<body>
	<div class="card">
		<span class="badge">500</span>
		<h1>Internal Server Error</h1>
		<p>Something went wrong on our end. Please try again later.</p>
		${extra}
	</div>
</body>
</html>`;

		return new Response(page.trimStart(), {
			status: 500,
			headers: {
				"Content-Type": "text/html; charset=utf-8",
			},
		});
	},
});
