export interface TypeNode {
	id: string;
	label: string;
	value: string;
	parent_id: string | null;
}

export interface CredentialWithTypes {
	credential: { id: string; title: string };
	typePath: TypeNode[];
}

export interface TypesListingsResponse {
	items: CredentialWithTypes[];
}

export async function getTypesListings(): Promise<TypesListingsResponse> {
	const res = await fetch(
		`${import.meta.env.VITE_BACKEND_APP}/credentials/types-listings`,
	);

	const json = await res.json();
	if (!json.success)
		throw new Error(json.message || "Failed to fetch types listings");

	return json.data as TypesListingsResponse;
}
