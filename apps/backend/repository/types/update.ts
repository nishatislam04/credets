import { sql } from "@db/connection";
import { NotFoundError } from "@backend/err/not-found";

export async function updateTypeLabelRepo(
	typeId: string,
	label: string,
): Promise<void> {
	const [existing] = await sql`
		SELECT id FROM types WHERE id = ${typeId}::uuid
	`;

	if (!existing) {
		throw new NotFoundError("Type");
	}

	await sql`
		UPDATE types SET label = ${label} WHERE id = ${typeId}::uuid
	`;
}
