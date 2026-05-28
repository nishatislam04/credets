import { sql } from "./connection";

// List all tables that need to be cleared (order matters if foreign keys exist)
const tables = [
	"users",
	"session",
	"types",
	"credentials",
	"credential_images",
];

for (const table of tables) {
	await sql.unsafe(`TRUNCATE TABLE "${table}" CASCADE`);
}

console.log("All data wiped, schema preserved.");
process.exit(0);
