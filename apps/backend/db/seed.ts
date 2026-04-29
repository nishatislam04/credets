import { sql } from "./connection";

// Helper to generate random between min and max
const randomInt = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to pick random item from array
const randomPick = <T>(arr: T[]): T =>
	arr[Math.floor(Math.random() * arr.length)];

// Real image URLs from Unsplash (free to use)
const images = {
	tech: [
		"https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
		"https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
		"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
	],
	keys: [
		"https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800",
		"https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=800",
	],
	notes: [
		"https://images.unsplash.com/photo-1517842645767-c639042777db?w=800",
		"https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
	],
	games: [
		"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
		"https://images.unsplash.com/photo-1552820728-8b83bb6b2cf2?w=800",
	],
	media: [
		"https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800",
		"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
	],
	api: [
		"https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
		"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
	],
};

// Credential generators by type
const generators = {
	credentials: (i: number) => ({
		type: "credentials" as const,
		data: randomPick([
			{
				website: "github.com",
				email: `user${i}@email.com`,
				username: `dev_user_${i}`,
				password: `P@ss${randomInt(1000, 9999)}!`,
				notes: "2FA enabled via authenticator app",
			},
			{
				website: "netflix.com",
				email: `streamer${i}@email.com`,
				plan: "Premium",
				last_billed: new Date(
					2024,
					randomInt(0, 11),
					randomInt(1, 28),
				).toISOString(),
				shared_with: ["family@email.com", "friend@email.com"],
			},
			{
				service: "AWS Console",
				account_id: `1234-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
				region: randomPick(["us-east-1", "eu-west-1", "ap-southeast-1"]),
				role: randomPick(["admin", "developer", "readonly"]),
				notes: "Production account - handle with care",
			},
			{
				bank: randomPick([
					"Chase",
					"Bank of America",
					"Wells Fargo",
					"Citibank",
				]),
				account_type: randomPick(["checking", "savings"]),
				routing_number: `****${randomInt(1000, 9999)}`,
				last_four: `****${randomInt(1000, 9999)}`,
				notes: "Primary account",
			},
		]),
		images: randomPick([
			null,
			[randomPick(images.tech)],
			[randomPick(images.tech), randomPick(images.notes)],
		]),
	}),

	key: (i: number) => ({
		type: "key" as const,
		data: randomPick([
			{
				name: `SSH Key - Server ${randomPick(["A", "B", "C", "D"])}`,
				type: "ssh-private",
				key_fingerprint: `SHA256:${Array(12)
					.fill(0)
					.map(() => Math.random().toString(36).substring(2, 4))
					.join(":")}`,
				bits: randomPick([2048, 4096]),
				encrypted: true,
			},
			{
				name: `License Key - Software ${i}`,
				software: randomPick([
					"Adobe CC",
					"IntelliJ IDEA",
					"Figma Pro",
					"Docker Desktop",
				]),
				key: `${Array(4)
					.fill(0)
					.map(() =>
						Array(4)
							.fill(0)
							.map(() =>
								Math.random().toString(36).substring(2, 6).toUpperCase(),
							)
							.join("-"),
					)
					.join("-")}`,
				expires: `202${randomInt(4, 9)}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`,
				seats: randomInt(1, 5),
			},
			{
				name: `Encryption Key - ${randomPick(["Backup", "Database", "Files"])}`,
				algorithm: randomPick(["AES-256", "RSA-4096", "ChaCha20"]),
				purpose: randomPick([
					"data-at-rest",
					"data-in-transit",
					"backup-encryption",
				]),
				rotation_period_days: randomPick([30, 60, 90, 180]),
			},
		]),
		images: randomPick([null, [randomPick(images.keys)]]),
	}),

	api: (i: number) => ({
		type: "api" as const,
		data: randomPick([
			{
				service: randomPick([
					"OpenAI",
					"Stripe",
					"Twilio",
					"SendGrid",
					"GitHub",
				]),
				key_prefix: randomPick(["sk-", "pk_", "ghp_", "SG."]),
				key_suffix: `****${randomInt(1000, 9999)}`,
				environment: randomPick(["production", "development", "staging"]),
				rate_limit: `${randomInt(100, 10000)} req/min`,
				webhook_url: "https://api.myapp.com/webhooks",
			},
			{
				platform: randomPick([
					"Google Cloud",
					"Azure",
					"Hetzner",
					"DigitalOcean",
				]),
				token_type: randomPick(["OAuth2", "API Key", "Service Account"]),
				scopes: randomPick([
					["read", "write"],
					["admin"],
					["read", "write", "delete"],
				]),
				project: `project-${randomPick(["alpha", "beta", "gamma", "prod"])}`,
				created_at: new Date(
					2024,
					randomInt(0, 11),
					randomInt(1, 28),
				).toISOString(),
			},
		]),
		images: randomPick([null, [randomPick(images.api)]]),
	}),

	media: (i: number) => ({
		type: "media" as const,
		data: randomPick([
			{
				title: randomPick([
					"How to Build a REST API",
					"Docker Deep Dive",
					"React Performance Tips",
					"Database Optimization Guide",
					"Kubernetes for Beginners",
					"Machine Learning Basics",
				]),
				type: randomPick(["video", "article", "podcast", "tutorial"]),
				url: `https://example.com/${randomPick(["tutorials", "guides", "videos"])}/${Date.now()}-${i}`,
				duration_minutes: randomPick([null, 15, 45, 90, 120]),
				author: randomPick([
					"TechLead",
					"CodeMaster",
					"DevGuru",
					"SysAdminPro",
				]),
				tags: randomPick([
					["programming"],
					["devops"],
					["database"],
					["frontend"],
				]),
			},
			{
				collection: randomPick([
					"Wallpapers",
					"Memes",
					"Design Inspiration",
					"Code Snippets",
				]),
				count: randomInt(10, 500),
				format: randomPick(["jpg", "png", "gif", "svg", "mp4"]),
				source: randomPick(["Reddit", "Twitter", "Pinterest", "Dribbble"]),
				notes: "Saved for later reference",
			},
		]),
		images: [[randomPick(images.media), randomPick(images.media)]],
	}),

	game_loadout: (i: number) => ({
		type: "game_loadout" as const,
		data: randomPick([
			{
				game: randomPick([
					"CS2",
					"Valorant",
					"Apex Legends",
					"Fortnite",
					"Warzone",
				]),
				loadout_name: randomPick([
					"Aggressive",
					"Tactical",
					"Sniper",
					"Support",
				]),
				primary_weapon: randomPick([
					"AK-47",
					"M4A4",
					"Vandal",
					"R-301",
					"SCAR",
				]),
				secondary_weapon: randomPick([
					"Deagle",
					"Glock",
					"USP",
					"Ghost",
					"Sheriff",
				]),
				sensitivity: `${randomInt(1, 10)}.${randomInt(0, 9)}`,
				crosshair: randomPick(["dot", "cross", "circle"]),
				rank: randomPick([
					"Silver",
					"Gold",
					"Platinum",
					"Diamond",
					"Ascendant",
					"Immortal",
				]),
			},
			{
				game: randomPick(["Elden Ring", "Dark Souls", "Sekiro", "Bloodborne"]),
				build: randomPick([
					"Strength",
					"Dexterity",
					"Intelligence",
					"Faith",
					"Quality",
				]),
				level: randomInt(50, 200),
				main_weapon: randomPick([
					"Moonveil",
					"Rivers of Blood",
					"Dark Moon Greatsword",
					"Blasphemous Blade",
				]),
				stats: {
					vigor: randomInt(20, 60),
					endurance: randomInt(20, 40),
					strength: randomInt(10, 99),
					dexterity: randomInt(10, 99),
				},
			},
		]),
		images: [[randomPick(images.games), randomPick(images.games)]],
	}),

	misc: (i: number) => ({
		type: "misc" as const,
		data: randomPick([
			{
				title: `Quick Note ${i}`,
				content: randomPick([
					"Need to update SSL certificates before end of month",
					"Remember to backup database every Sunday",
					"Schedule meeting with team about new architecture",
					"Check server logs for unusual activity",
					"Update dependencies to latest versions",
				]),
				priority: randomPick(["low", "medium", "high", "urgent"]),
				tags: randomPick(["reminder", "todo", "meeting", "maintenance"]),
			},
			{
				category: randomPick(["WiFi", "Server IPs", "Ports", "Configurations"]),
				entries: Array(randomInt(2, 5))
					.fill(0)
					.map((_, j) => ({
						key: `item_${j + 1}`,
						value: `${randomPick(["192.168.1.", "10.0.0."])}${randomInt(1, 254)}`,
					})),
				notes: "Network configuration",
			},
		]),
		images: randomPick([
			null,
			[randomPick(images.notes)],
			[randomPick(images.tech), randomPick(images.notes)],
		]),
	}),
};

async function seed() {
	console.log("🌱 Starting seed process...");
	console.log("🗑️  Clearing existing data...");

	// Clear existing data in correct order (respect foreign keys)
	await sql`DELETE FROM credentials`;
	await sql`DELETE FROM session`;
	await sql`DELETE FROM users`;

	console.log("👤 Creating test user...");

	// Create test user with hashed password (using Bun's password hasher)
	const passwordHash = await Bun.password.hash("TestPass123!");
	const specialPasswordHash = await Bun.password.hash("SpecialPass456!");

	const [user] = await sql`
    INSERT INTO users (name, username, email, password, special_password)
    VALUES (
      'John Doe',
      'johndoe',
      'john@example.com',
      ${passwordHash},
      ${specialPasswordHash}
    )
    RETURNING id
  `;

	console.log(`   User created with ID: ${user.id}`);

	// Create session
	console.log("🔑 Creating session...");

	const sessionToken = crypto.randomUUID();
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

	await sql`
    INSERT INTO session (user_id, token, expires_at)
    VALUES (${user.id}, ${sessionToken}, ${expiresAt})
  `;

	console.log("   Session token:", sessionToken);

	// Create 500 credentials
	console.log("📦 Creating 500 credentials...");

	const types = [
		"credentials",
		"key",
		"api",
		"media",
		"game_loadout",
		"misc",
	] as const;
	const batchSize = 50;
	let created = 0;

	for (let i = 0; i < 500; i += batchSize) {
		const batch = [];
		const currentBatchSize = Math.min(batchSize, 500 - i);

		for (let j = 0; j < currentBatchSize; j++) {
			const index = i + j + 1;
			const type = types[index % types.length]; // Distribute types evenly
			const generator = generators[type];
			const credData = generator(index);

			batch.push({
				user_id: user.id,
				type: credData.type,
				data: JSON.stringify(credData.data),
				images: credData.images ? JSON.stringify(credData.images) : null,
			});
		}

		// Insert batch
		for (const cred of batch) {
			await sql`
        INSERT INTO credentials (user_id, type, data, images)
        VALUES (${cred.user_id}, ${cred.type}, ${cred.data}, ${cred.images || null})
      `;
			created++;
		}

		console.log(`   Created ${created}/500 credentials...`);
	}

	console.log("\n✅ Seed completed successfully!");
	console.log("📊 Summary:");
	console.log("   - 1 User (john@example.com / TestPass123!)");
	console.log("   - 1 Active Session (30 days)");
	console.log("   - 500 Credentials across all types");

	// Show distribution
	const distribution = await sql`
    SELECT type, COUNT(*) as count
    FROM credentials
    GROUP BY type
    ORDER BY type
  `;

	console.log("\n📈 Credentials Distribution:");
	distribution.forEach((row: any) => {
		console.log(`   - ${row.type}: ${row.count}`);
	});

	process.exit(0);
}

// Run seed
seed().catch((error) => {
	console.error("❌ Seed failed:", error);
	process.exit(1);
});
