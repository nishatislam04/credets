export function verifyCSRF(payload: string) {
	const isValid = Bun.CSRF.verify(payload, {
		secret: process.env.CSRF_SECRET_KEY,
	});

	return isValid;
}
