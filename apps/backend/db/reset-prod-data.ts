import { sql } from "./connection";

async function resetDatabase() {
	console.log("💥 Dropping entire public schema...");

	await sql.unsafe(`DROP SCHEMA public CASCADE`);

	await sql.unsafe(`CREATE SCHEMA public`);

	// 3. (Optional) Grant default permissions if needed
	// await sql.unsafe(`GRANT ALL ON SCHEMA public TO public`);

	console.log("✅ Schema and all data dropped. Schema is now empty.");
	process.exit(0);
}

resetDatabase().catch((err) => {
	console.error("❌ Reset failed:", err);
	process.exit(1);
});
