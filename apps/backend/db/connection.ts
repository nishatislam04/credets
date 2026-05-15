import { SQL } from "bun";

export const sql: SQL = new SQL({
	hostname: "localhost",
	port: 5432,
	username: process.env.DB_USER || "nishat",
	password: process.env.DB_PASSWORD || "nishat004",
	database: process.env.DB_NAME || "credets_db",

	// Pool configuration
	max: 10, // Maximum 10 concurrent connections
	idleTimeout: 30, // Close idle connections after 30s
	maxLifetime: 3600, // Max connection lifetime 1 hour
	connectionTimeout: 10, // Connection timeout 10s
});
