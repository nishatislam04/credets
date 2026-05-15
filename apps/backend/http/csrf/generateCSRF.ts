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
			},
		});
	} catch (error) {
		console.log("generate csrf token: ", error instanceof Error && error.message);
		throw new Error("something went wrong while generating csrf token on server");
	}
}
