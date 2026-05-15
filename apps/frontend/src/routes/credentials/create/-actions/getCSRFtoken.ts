export async function getCSRFtoken() {
	try {
		const res = await fetch(`${import.meta.env.VITE_BACKEND_APP}/get-csrf`);

		if (!res.ok) throw new Error("network error");

		const data = await res.json();
		if (!data.success) throw new Error(data.message);

		return data;
	} catch (error) {
		if (error instanceof Error) throw error;

		throw new Error("failed to fetch csrf token");
	}
}
