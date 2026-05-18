import { sql } from "./connection";

// Helper to generate random between min and max
const randomInt = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to pick random item from array
const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate titles based on type
const generateTitle = (type: string, index: number): string => {
	const titles = {
		credentials: [`Login ${index}`, `Account ${index}`, `Service ${index}`],
		key: [`API Key ${index}`, `SSH Key ${index}`, `License ${index}`],
		api: [`API Token ${index}`, `Service Account ${index}`, `Platform Key ${index}`],
		media: [`Media Asset ${index}`, `Content ${index}`, `Resource ${index}`],
		game_loadout: [`Loadout ${index}`, `Build ${index}`, `Character ${index}`],
		misc: [`Note ${index}`, `Config ${index}`, `Info ${index}`],
	};
	return randomPick(titles[type as keyof typeof titles] || [`Item ${index}`]);
};

// Generate short description
const generateShortDescription = (type: string): string => {
	const descriptions = {
		credentials: "Login credentials for online service",
		key: "Security key and access credentials",
		api: "API authentication and tokens",
		media: "Digital media and content assets",
		game_loadout: "Gaming configuration and loadout",
		misc: "Miscellaneous information and notes",
	};
	return descriptions[type as keyof typeof descriptions] || "Credential item";
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
				last_billed: new Date(2024, randomInt(0, 11), randomInt(1, 28)).toISOString(),
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
				bank: randomPick(["Chase", "Bank of America", "Wells Fargo", "Citibank"]),
				account_type: randomPick(["checking", "savings"]),
				routing_number: `****${randomInt(1000, 9999)}`,
				last_four: `****${randomInt(1000, 9999)}`,
				notes: "Primary account",
			},
		]),
		tags: randomPick([
			null,
			["work", "personal"],
			["important", "frequent"],
			["archive"],
		]),
		notes: randomPick([
			null,
			"Update password every 90 days",
			"Shared with team",
			"Requires 2FA",
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
							.map(() => Math.random().toString(36).substring(2, 6).toUpperCase())
							.join("-"),
					)
					.join("-")}`,
				expires: `202${randomInt(4, 9)}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`,
				seats: randomInt(1, 5),
			},
			{
				name: `Encryption Key - ${randomPick(["Backup", "Database", "Files"])}`,
				algorithm: randomPick(["AES-256", "RSA-4096", "ChaCha20"]),
				purpose: randomPick(["data-at-rest", "data-in-transit", "backup-encryption"]),
				rotation_period_days: randomPick([30, 60, 90, 180]),
			},
		]),
		tags: randomPick([null, ["security", "encryption"], ["production"]]),
		notes: randomPick([null, "Store in secure vault", "Rotate annually"]),
	}),

	api: (i: number) => ({
		type: "api" as const,
		data: randomPick([
			{
				service: randomPick(["OpenAI", "Stripe", "Twilio", "SendGrid", "GitHub"]),
				key_prefix: randomPick(["sk-", "pk_", "ghp_", "SG."]),
				key_suffix: `****${randomInt(1000, 9999)}`,
				environment: randomPick(["production", "development", "staging"]),
				rate_limit: `${randomInt(100, 10000)} req/min`,
				webhook_url: "https://api.myapp.com/webhooks",
			},
			{
				platform: randomPick(["Google Cloud", "Azure", "Hetzner", "DigitalOcean"]),
				token_type: randomPick(["OAuth2", "API Key", "Service Account"]),
				scopes: randomPick([["read", "write"], ["admin"], ["read", "write", "delete"]]),
				project: `project-${randomPick(["alpha", "beta", "gamma", "prod"])}`,
				created_at: new Date(2024, randomInt(0, 11), randomInt(1, 28)).toISOString(),
			},
		]),
		tags: randomPick([null, ["api", "integration"], ["third-party"]]),
		notes: randomPick([null, "Keep secret!", "Don't commit to git"]),
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
				author: randomPick(["TechLead", "CodeMaster", "DevGuru", "SysAdminPro"]),
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
		tags: randomPick([null, ["media", "assets"], ["tutorial"]]),
		notes: randomPick([null, "Watch later", "Important resource"]),
	}),

	game_loadout: (i: number) => ({
		type: "game_loadout" as const,
		data: randomPick([
			{
				game: randomPick(["CS2", "Valorant", "Apex Legends", "Fortnite", "Warzone"]),
				loadout_name: randomPick(["Aggressive", "Tactical", "Sniper", "Support"]),
				primary_weapon: randomPick(["AK-47", "M4A4", "Vandal", "R-301", "SCAR"]),
				secondary_weapon: randomPick(["Deagle", "Glock", "USP", "Ghost", "Sheriff"]),
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
				build: randomPick(["Strength", "Dexterity", "Intelligence", "Faith", "Quality"]),
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
		tags: randomPick([null, ["gaming", "loadout"], ["competitive"]]),
		notes: randomPick([null, "Current main loadout", "Testing new build"]),
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
		tags: randomPick([null, ["note", "reminder"], ["config"]]),
		notes: randomPick([null, "Review later", "Needs update"]),
	}),
};

async function seed() {
	console.log("🌱 Starting seed process...");
	console.log("🗑️  Clearing existing data...");

	// Clear existing data in correct order (respect foreign keys)
	await sql`DELETE FROM credential_images`;
	await sql`DELETE FROM credentials`;
	await sql`DELETE FROM session`;
	await sql`DELETE FROM users`;
	await sql`DELETE FROM types`;

	console.log("📂 Inserting credential types...");

	// Insert types with capitalized labels and lowercase values
	const typesData = [
		{
			label: "Credentials",
			value: "credentials",
			description: "Standard login credentials for websites, apps, and services",
		},
		{
			label: "Key",
			value: "key",
			description: "SSH keys, API keys, license keys, and encryption keys",
		},
		{
			label: "API",
			value: "api",
			description: "API tokens, service accounts, and platform credentials",
		},
		{
			label: "Media",
			value: "media",
			description: "Media assets, collections, and content references",
		},
		{
			label: "Game Loadout",
			value: "game_loadout",
			description: "Gaming configurations, loadouts, and character builds",
		},
		{
			label: "Misc",
			value: "misc",
			description: "Miscellaneous notes, configurations, and quick references",
		},
	];

	// Build a mapping from `value` (lowercase) to database `id`
	const typeMap = new Map<string, string>();

	for (const type of typesData) {
		const [inserted] = await sql`
			INSERT INTO types (label, value, description)
			VALUES (${type.label}, ${type.value}, ${type.description})
			ON CONFLICT (label) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description
			RETURNING id, value
		`;
		typeMap.set(inserted.value, inserted.id);
	}

	console.log("👤 Creating test user...");

	// Create test user with hashed passwords
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
	expiresAt.setDate(expiresAt.getDate() + 30);

	await sql`
		INSERT INTO session (user_id, token, expires_at)
		VALUES (${user.id}, ${sessionToken}, ${expiresAt})
	`;

	console.log("   Session token:", sessionToken);

	// Create credentials (no images, thumbnails left null)
	console.log("📦 Creating credentials...");

	const typeValues = ["credentials", "key", "api", "media", "game_loadout", "misc"];
	const batchSize = 50;
	let created = 0;
	const totalCredentials = 500;

	for (let i = 0; i < totalCredentials; i += batchSize) {
		const batch = [];
		const currentBatchSize = Math.min(batchSize, totalCredentials - i);

		for (let j = 0; j < currentBatchSize; j++) {
			const index = i + j + 1;
			const typeValue = typeValues[index % typeValues.length];
			const generator = generators[typeValue as keyof typeof generators];
			const credData = generator(index);
			const typeId = typeMap.get(typeValue);

			if (!typeId) {
				console.error(`Type not found for value: ${typeValue}`);
				continue;
			}

			batch.push({
				user_id: user.id,
				types_id: typeId,
				title: generateTitle(typeValue, index),
				short_description: generateShortDescription(typeValue),
				long_description: `Detailed information about this ${typeValue} item. Created for demonstration purposes.`,
				data: JSON.stringify(credData.data),
				tags: credData.tags ? JSON.stringify(credData.tags) : null,
				notes: credData.notes,
			});
		}

		// Insert batch one by one (or use batch insert if your SQL supports it)
		for (const cred of batch) {
			await sql`
				INSERT INTO credentials (
					user_id, types_id, title, short_description,
					long_description, data, tags, notes
				) VALUES (
					${cred.user_id}, ${cred.types_id}, ${cred.title}, ${cred.short_description},
					${cred.long_description}, ${cred.data},
					${cred.tags}, ${cred.notes}
				)
			`;
			created++;
		}

		console.log(`   Created ${created}/${totalCredentials} credentials...`);
	}

	console.log("\n✅ Seed completed successfully!");
	console.log("📊 Summary:");
	console.log("   - 1 User (john@example.com / TestPass123!)");
	console.log("   - 1 Active Session (30 days)");
	console.log(`   - ${totalCredentials} Credentials across all types`);
	console.log("   - 6 Credential Types (label capitalized, value lowercase)");
	console.log("   - No images or thumbnails inserted (as requested)");

	// Show distribution
	const distribution = await sql`
		SELECT t.label, COUNT(c.id) as count
		FROM credentials c
		JOIN types t ON c.types_id = t.id
		GROUP BY t.label
		ORDER BY t.label
	`;

	console.log("\n📈 Credentials Distribution:");
	for (const row of distribution) {
		console.log(`   - ${row.label}: ${row.count}`);
	}

	process.exit(0);
}

// Run seed
seed().catch((error) => {
	console.error("❌ Seed failed:", error);
	process.exit(1);
});
