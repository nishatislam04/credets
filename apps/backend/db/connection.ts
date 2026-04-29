import { SQL } from "bun";

export const sql: SQL = new SQL({
	host: "localhost",
	port: 5432,
	user: process.env.DB_USER || "nishat",
	password: process.env.DB_PASSWORD || "nishat004",
	database: process.env.DB_NAME || "credets_db",
});
