import { SQL } from "bun";

export const sql: SQL = new SQL({
	hostname: process.env.DB_HOST || "localhost",
	port: process.env.DB_PORT || 5432,
	username: process.env.DB_USER || "nishat",
	password: process.env.DB_PASSWORD || "nishat004",
	database: process.env.DB_NAME || "credets_db",
	tls: process.env.DB_TLS === "true", // Enable TLS via env var (default: false for local dev)

	// Pool configuration
	max: 5, // Max concurrent connections (lower for free tier Neon DB limit)
	idleTimeout: 10, // Close idle connections after 10s (quick cleanup on deploy)
	maxLifetime: 1800, // Max connection lifetime 30 min (rotate connections faster)
	connectionTimeout: 5, // Connection timeout 5s (fail fast, retry quickly)
});
