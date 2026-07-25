export async function updateTypeLabel(
	typeId: string,
	label: string,
): Promise<void> {
	const res = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/types/${typeId}/update`,
		{
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ label }),
		},
	);

	const json = await res.json();
	if (!json.success)
		throw new Error(json.message || "Failed to update type label");
}
