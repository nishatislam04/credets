export interface TypeChild {
	id: string;
	label: string;
	value: string;
	parent_id: string | null;
}

export async function getTypeChildren(parentValue: string): Promise<TypeChild[]> {
	const res = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/types/children?parent_value=${encodeURIComponent(parentValue)}`,
	);

	if (!res.ok) throw new Error("Failed to fetch child types");

	const data = await res.json();
	if (!data.success) throw new Error(data.message || "Failed to fetch child types");

	return data.data as TypeChild[];
}
