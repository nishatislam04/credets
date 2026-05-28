import { join } from "path";
import { sql } from "./connection";

const schemaPath = join(import.meta.dir, "init.sql");
const schema = await Bun.file(schemaPath).text();
await sql.unsafe(schema);
console.log("Schema applied successfully.");
process.exit(0);
