import { log } from "@backend/utils/logger";

export async function generateCSRF() {
	try {
		const csrfToken = Bun.CSRF.generate(process.env.CSRF_SECRET_KEY, {
			expiresIn: 1800000, // 30 min
		});

		if (!csrfToken)
			return new Response(
				JSON.stringify({
					success: false,
					type: "generate-csrf",
					message: "something went wrong while generating csrf token on server",
				}),
			);

		return new Response(JSON.stringify({ success: true, data: { token: csrfToken } }), {
			status: 200,
			headers: {
				"content-type": "application/json",
				"Access-Control-Allow-Origin": process.env.FRONTEND_APP!,
			},
		});
	} catch (error) {
		log(error instanceof Error ? error.message : error, "generate csrf token");
		throw new Error("something went wrong while generating csrf token on server");
	}
}
