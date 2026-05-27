import { sql } from "./connection";

// Helper to generate random between min and max
const randomInt = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to pick random item from array
const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ── Data block generator helpers ────────────────────────────────────

type DataBlock =
	| { type: "single_label"; value: string }
	| { type: "key_value"; key: string; value: string }
	| { type: "information"; value: string };

function singleLabel(value: string): DataBlock {
	return { type: "single_label", value };
}

function keyValue(key: string, value: string): DataBlock {
	return { type: "key_value", key, value };
}

function information(value: string): DataBlock {
	return { type: "information", value };
}

// Generate titles based on type
const generateTitle = (type: string, index: number): string => {
	const titles = {
		credentials: [
			`GitHub Account ${index}`,
			`Netflix Profile ${index}`,
			`AWS Console ${index}`,
			`Bank Account ${index}`,
			`Work Email ${index}`,
			`Slack Workspace ${index}`,
		],
		key: [
			`SSH Key ${index}`,
			`License Key ${index}`,
			`Encryption Key ${index}`,
			`PGP Key ${index}`,
			`Signing Key ${index}`,
			`Root CA ${index}`,
		],
		api: [
			`OpenAI Token ${index}`,
			`Stripe API Key ${index}`,
			`GitHub PAT ${index}`,
			`Twilio Credentials ${index}`,
			`SendGrid API ${index}`,
			`Cloudflare Token ${index}`,
		],
		media: [
			`Tutorial Video ${index}`,
			`Design Assets ${index}`,
			`Code Reference ${index}`,
			`Brand Kit ${index}`,
			`Podcast Episode ${index}`,
			`Documentation Repo ${index}`,
		],
		game_loadout: [
			`Competitive Loadout ${index}`,
			`Raid Build ${index}`,
			`PvP Setup ${index}`,
			`Speedrun Config ${index}`,
			`Ranked Loadout ${index}`,
			`Casual Build ${index}`,
		],
		misc: [
			`Server Config ${index}`,
			`Network Setup ${index}`,
			`Dev Environment ${index}`,
			`Backup Script ${index}`,
			`Docker Compose ${index}`,
			`CI/CD Pipeline ${index}`,
		],
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

// ── Credential generators producing DataBlockEntry[] ────────────────

const generators = {
	credentials: (_i: number) => ({
		type: "credentials" as const,
		data: randomPick<DataBlock[]>([
			[
				singleLabel("P@ssw0rd!23"),
				keyValue("Email / Username", `user${_i}@example.com`),
				keyValue("Website", "github.com"),
				information("2FA enabled via authenticator app. Recovery codes stored in safe."),
			],
			[
				singleLabel("Str34m3r!Pass"),
				keyValue("Email", `streamer${_i}@email.com`),
				keyValue("Plan", "Premium 4K"),
				keyValue("Payment Method", "Visa ending in 4242"),
				information(`Shared with 2 family members. Last billed ${randomPick(["Jan", "Feb", "Mar", "Apr"])} 2026.`),
			],
			[
				keyValue("Service", "AWS Console"),
				keyValue("Account ID", `${randomInt(1000, 9999)}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`),
				keyValue("Region", randomPick(["us-east-1", "eu-west-1", "ap-southeast-1"])),
				singleLabel(randomPick(["admin", "developer", "readonly"])),
				information("Production account — handle with care. MFA enforced. Access reviewed quarterly."),
			],
			[
				keyValue("Bank", randomPick(["Chase", "Bank of America", "Wells Fargo", "Citibank"])),
				keyValue("Account Type", randomPick(["checking", "savings"])),
				singleLabel(`****${randomInt(1000, 9999)}`),
				information("Primary checking account. Direct deposit set up for payroll. Paperless statements."),
			],
			[
				keyValue("Email", `user${_i}@work-email.com`),
				singleLabel("W0rkP@ss!456"),
				keyValue("Mail Server", "outlook.office365.com"),
				keyValue("Port", "587 (TLS)"),
				information("Company email account. Requires app password for third-party clients. MFA via Microsoft Authenticator."),
			],
		]),
		tags: randomPick([null, ["work", "personal"], ["important", "frequent"], ["archive"], ["security"]]),
		notes: randomPick([null, "Update password every 90 days", "Shared with team", "Requires 2FA", "VIP account"]),
	}),

	key: (_i: number) => ({
		type: "key" as const,
		data: randomPick<DataBlock[]>([
			[
				keyValue("Type", "SSH — RSA"),
				keyValue("Bits", "4096"),
				singleLabel("SHA256:abc123def456ghi789"),
				keyValue("Purpose", "Server authentication"),
				information(`Generated on server ${randomPick(["A", "B", "C", "D"])}. Public key deployed to all production instances.`),
			],
			[
				keyValue("Software", randomPick(["Adobe CC", "IntelliJ IDEA", "Figma Pro", "Docker Desktop"])),
				singleLabel("XXXX-XXXX-XXXX-XXXX"),
				keyValue("Seats", String(randomInt(1, 5))),
				keyValue("Expires", `202${randomInt(5, 9)}-${String(randomInt(1, 12)).padStart(2, "0")}`),
				information("Volume license managed through company portal. Auto-renewal enabled."),
			],
			[
				keyValue("Algorithm", randomPick(["AES-256-GCM", "RSA-4096", "ChaCha20-Poly1305", "Ed25519"])),
				keyValue("Purpose", randomPick(["data-at-rest", "data-in-transit", "backup-encryption", "code-signing"])),
				keyValue("Rotation", `${randomPick([30, 60, 90, 180])} days`),
				singleLabel("enc-key-prod-v2"),
				information("Root key stored in hardware security module (HSM). Child keys derived for each service."),
			],
			[
				keyValue("Type", "GPG — ECC"),
				keyValue("Key ID", `0x${Array(16).fill(0).map(() => Math.random().toString(16).slice(2, 3)).join("").toUpperCase()}`),
				singleLabel(`user${_i}@example.com`),
				keyValue("Trust Level", randomPick(["ultimate", "full", "marginal"])),
				information("Code signing key for package publishing. Subkeys used for daily operations."),
			],
		]),
		tags: randomPick([null, ["security", "encryption"], ["production", "infrastructure"], ["ssh", "gpg"]]),
		notes: randomPick([null, "Store in secure vault", "Rotate annually", "Backup stored offline"]),
	}),

	api: (_i: number) => ({
		type: "api" as const,
		data: randomPick<DataBlock[]>([
			[
				keyValue("Service", randomPick(["OpenAI", "Stripe", "Twilio", "SendGrid", "GitHub"])),
				singleLabel(`${randomPick(["sk-", "pk_", "ghp_", "SG."])}${Array(24).fill(0).map(() => Math.random().toString(36).slice(2, 3)).join("")}`),
				keyValue("Environment", randomPick(["production", "development", "staging"])),
				keyValue("Rate Limit", `${randomInt(100, 10000)} req/min`),
				information("Production token with restricted scopes. Rotated monthly. Monitor usage via dashboard."),
			],
			[
				keyValue("Platform", randomPick(["Google Cloud", "Azure", "Hetzner", "DigitalOcean", "Cloudflare"])),
				keyValue("Token Type", randomPick(["OAuth2", "API Key", "Service Account", "PAT"])),
				keyValue("Scopes", randomPick(["read,write", "admin", "read,write,delete", "read-only"])),
				keyValue("Project", `project-${randomPick(["alpha", "beta", "gamma", "prod", "staging"])}`),
				information(`Created for CI/CD pipeline integration. Expires in ${randomInt(30, 365)} days. Revoke immediately if leaked.`),
			],
			[
				keyValue("Endpoint", "https://api.example.com/v2"),
				singleLabel("auth-token-prod"),
				keyValue("Auth Method", "Bearer Token"),
				keyValue("Webhook URL", "https://myapp.com/webhooks"),
				information("All requests must include the token in the Authorization header. Webhook signature verified via HMAC-SHA256."),
			],
		]),
		tags: randomPick([null, ["api", "integration"], ["third-party", "production"], ["automation"]]),
		notes: randomPick([null, "Keep secret!", "Don't commit to git", "Rotate quarterly"]),
	}),

	media: (_i: number) => ({
		type: "media" as const,
		data: randomPick<DataBlock[]>([
			[
				singleLabel("How to Build a REST API"),
				keyValue("Type", randomPick(["video", "article", "tutorial", "course"])),
				keyValue("Author", randomPick(["TechLead", "CodeMaster", "DevGuru", "SysAdminPro"])),
				keyValue("Duration", randomPick(["15 min", "45 min", "1 hr 30 min", "2 hr"])),
				information("Excellent walkthrough covering RESTful design principles, authentication patterns, and testing strategies. References OpenAPI 3.1 spec."),
			],
			[
				singleLabel("Brand Kit — Q1 2026"),
				keyValue("Collection", randomPick(["Logos", "Icons", "Typography", "Color Palette"])),
				keyValue("Format", randomPick(["SVG", "PNG", "EPS", "FIG"])),
				keyValue("Source", randomPick(["Dribbble", "Figma Community", "Internal"])),
				information("Official brand assets with usage guidelines. Do not modify colors or proportions without design team approval."),
			],
			[
				singleLabel("Docker Deep Dive"),
				keyValue("Type", "article"),
				keyValue("Author", "Nigel Poulton"),
				keyValue("URL", "https://example.com/docker-deep-dive"),
				information("Comprehensive guide covering container internals, multi-stage builds, Docker Compose, and production best practices. Includes Kubernetes comparison."),
			],
			[
				singleLabel("React Performance Tips"),
				keyValue("Type", randomPick(["video", "article", "tutorial"])),
				keyValue("Tags", "react, performance, optimization"),
				information("Covers memoization, code splitting, virtual scrolling, bundle analysis, and common anti-patterns. Code examples in React 19."),
			],
		]),
		tags: randomPick([null, ["media", "assets", "design"], ["tutorial", "reference"], ["video", "tech"]]),
		notes: randomPick([null, "Watch later", "Important resource", "Share with the team"]),
	}),

	game_loadout: (_i: number) => ({
		type: "game_loadout" as const,
		data: randomPick<DataBlock[]>([
			[
				singleLabel(randomPick(["Dust II", "Mirage", "Inferno", "Overpass"])),
				keyValue("Primary", randomPick(["AK-47", "M4A4", "AWP", "SG 553"])),
				keyValue("Secondary", randomPick(["Deagle", "USP-S", "Glock-18", "Five-SeveN"])),
				keyValue("Sensitivity", `${randomInt(1, 5)}.${randomInt(0, 9)}`),
				keyValue("Crosshair", randomPick(["dot", "cross", "circle", "dynamic"])),
				information(`${randomPick(["Aggressive", "Tactical", "Support", "Entry Fragger"])} playstyle. Default nade binds configured. Radar set to 3.5x zoom.`),
			],
			[
				singleLabel("Elden Ring — Faith Build"),
				keyValue("Level", String(randomInt(100, 200))),
				keyValue("Main Weapon", randomPick(["Blasphemous Blade", "Sacred Relic Sword", "Golden Halberd", "Godslayer's Greatsword"])),
				keyValue("Stats", `VIG ${randomInt(40, 60)} | MND ${randomInt(20, 40)} | END ${randomInt(25, 40)} | FTH ${randomInt(60, 80)}`),
				information("NG+3 playthrough. Talismans: Erdtree's Favor +2, Shard of Alexander, Fire Scorpion Charm, Dragoncrest Greatshield."),
			],
			[
				singleLabel(randomPick(["Platinum", "Diamond", "Ascendant", "Immortal"])),
				keyValue("Agent", randomPick(["Jett", "Reyna", "Sova", "Killjoy", "Chamber"])),
				keyValue("Primary", randomPick(["Vandal", "Phantom", "Operator", "Guardian"])),
				keyValue("Secondary", randomPick(["Sheriff", "Ghost", "Classic"])),
				keyValue("DPI / Sens", `${randomPick([400, 800, 1600])} / 0.${randomInt(2, 8)}`),
				information(`Crosshair: 1-4-2-2 cyan with outlines. Minimap: 1.2x zoom. Practice routine: ${randomInt(10, 30)} min aim labs + ${randomInt(10, 20)} min deathmatch.`),
			],
			[
				singleLabel(randomPick(["Strength", "Dexterity", "Quality", "Sorcery"])),
				keyValue("Level", String(randomInt(80, 150))),
				keyValue("Armor Set", randomPick(["Banished Knight", "Veteran's", "Bull-Goat", "Raging Wolf"])),
				keyValue("Talismans", randomPick(["Green Turtle + Erdtree", "Dragoncrest + Arsenal", "Claw + Prosthesis"])),
				information("PvP-focused build at RL150. Poise breakpoint at 51. Invasion hotspot: Liurnia / Leyndell."),
			],
		]),
		tags: randomPick([null, ["gaming", "loadout"], ["competitive", "ranked"], ["pve", "build"]]),
		notes: randomPick([null, "Current main loadout", "Testing new build", "Optimized for ranked"]),
	}),

	misc: (_i: number) => ({
		type: "misc" as const,
		data: randomPick<DataBlock[]>([
			[
				singleLabel("SSL Certificate Renewal"),
				keyValue("Priority", randomPick(["low", "medium", "high", "urgent"])),
				keyValue("Domain", "*.example.com"),
				information("Need to update SSL certificates before end of month. Issued by Let's Encrypt. Use certbot renew --dry-run first to test. Includes wildcard cert for all subdomains."),
			],
			[
				singleLabel("Database Backup Config"),
				keyValue("Schedule", "Every Sunday 03:00 AM"),
				keyValue("Retention", "30 days"),
				keyValue("Storage", "S3 bucket — backup.credet.app"),
				information("Automated pg_dump of all databases. Encrypted with GPG before upload. Health check notification sent to Slack on completion/failure. Restore tested monthly."),
			],
			[
				singleLabel("Server Inventory"),
				keyValue("Region", randomPick(["us-east-1", "eu-west-2", "ap-southeast-1"])),
				keyValue("Provider", randomPick(["AWS EC2", "Hetzner Cloud", "DigitalOcean", "OVH"])),
				keyValue("OS", randomPick(["Ubuntu 24.04 LTS", "Debian 12", "Fedora 40", "AlmaLinux 9"])),
				information(`Total ${randomInt(3, 12)} instances across ${randomInt(1, 3)} regions. Monitoring via Grafana + Prometheus. Patching window: every 2nd Tuesday.`),
			],
			[
				singleLabel("CI/CD Pipeline Config"),
				keyValue("Provider", randomPick(["GitHub Actions", "GitLab CI", "Jenkins", "CircleCI"])),
				keyValue("Stages", "lint → typecheck → test → build → deploy"),
				keyValue("Environments", "dev → staging → production"),
				information("Deploys automatically on merge to main. Production deploys require manual approval. Rollback via git revert + redeploy."),
			],
		]),
		tags: randomPick([null, ["note", "reminder", "devops"], ["config", "infrastructure"], ["automation"]]),
		notes: randomPick([null, "Review later", "Needs update", "Share with team", "Critical — do not delete"]),
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

		// Insert batch one by one
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
