import type { BunRequest } from "bun";
import { InternalError } from "@backend/err/internal";
import { log } from "@backend/utils/logger";
import { ResponseFactory } from "@backend/utils/response";

const req = { url: "/get-csrf" } as BunRequest;

export async function generateCSRF() {
	try {
		const csrfToken = Bun.CSRF.generate(process.env.CSRF_SECRET_KEY, {
			expiresIn: 1800000, // 30 min
		});

		if (!csrfToken)
			return ResponseFactory.error({
				error: "something went wrong while generating csrf token on server",
				type: "generate-csrf",
				message: "something went wrong while generating csrf token on server",
				status: 500,
				path: req,
			});

		return ResponseFactory.success({
			data: { token: csrfToken },
			message: "csrf token generated",
			status: 200,
			path: req,
		});
	} catch (error) {
		log.error("generate csrf token", {
			err: {
				message:
					error instanceof Error
						? error.message
						: String(error),
			},
		});
		throw new InternalError("something went wrong while generating csrf token on server");
	}
}
