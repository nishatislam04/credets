import { sql } from "@db/connection";

export interface CredentialWithTypesRow {
	id: string;
	title: string;
	types_id: string | null;
}

export interface TypeNode {
	id: string;
	label: string;
	value: string;
	parent_id: string | null;
}

/**
 * Fetches all non-deleted, non-draft credentials that have a type assigned,
 * along with their full type hierarchy.
 */
export async function getTypesListingsRepo(): Promise<
	Array<{
		credential: { id: string; title: string };
		typePath: TypeNode[];
	}>
> {
	const credentials = await sql<CredentialWithTypesRow[]>`
		SELECT id, title, types_id
		FROM credentials
		WHERE types_id IS NOT NULL
			AND is_deleted = false
			AND is_draft = false
		ORDER BY created_at DESC
	`;

	if (credentials.length === 0) return [];

	// Build a set of all type IDs we need (leaf + all ancestors)
	const allTypeIds = new Set<string>();
	const leafIds = new Set<string>();

	for (const cred of credentials) {
		if (cred.types_id) {
			leafIds.add(cred.types_id);
			allTypeIds.add(cred.types_id);
		}
	}

	// Walk up the parent chain for each leaf to collect all ancestor IDs
	for (const leafId of leafIds) {
		let currentId: string | null = leafId;
		const visited = new Set<string>();
		while (currentId && !visited.has(currentId)) {
			visited.add(currentId);
			const pRows = await sql<{ parent_id: string | null }[]>`
				SELECT parent_id FROM types WHERE id = ${currentId}::uuid
			`;
			/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
			const pid = pRows[0]?.parent_id;
			if (pid) {
				allTypeIds.add(pid);
				currentId = pid;
			} else {
				break;
			}
		}
	}

	// Fetch all relevant types in one query
	// Bun's SQL client doesn't auto-serialize JS arrays for ANY() clauses.
	// Must format as a PostgreSQL array literal: {uuid1,uuid2,...}
	const idsLiteral = `{${[...allTypeIds].join(",")}}`;
	const allTypes = await sql<TypeNode[]>`
		SELECT id, label, value, parent_id
		FROM types
		WHERE id = ANY(${idsLiteral}::uuid[])
	`;

	// Build a lookup map
	const typeMap = new Map<string, TypeNode>();
	for (const t of allTypes) {
		typeMap.set(t.id, t);
	}

	// Build the full type path for each credential (leaf → root)
	const result: Array<{
		credential: { id: string; title: string };
		typePath: TypeNode[];
	}> = [];

	for (const cred of credentials) {
		if (!cred.types_id) continue;

		const path: TypeNode[] = [];
		let currentId: string | null = cred.types_id;
		const visited = new Set<string>();

		while (currentId && !visited.has(currentId)) {
			visited.add(currentId);
			const node = typeMap.get(currentId);
			if (!node) break;
			path.unshift(node); // prepend so root is first
			currentId = node.parent_id;
		}

		result.push({
			credential: { id: cred.id, title: cred.title },
			typePath: path,
		});
	}

	return result;
}
