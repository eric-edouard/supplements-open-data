import fs from "node:fs/promises";
import path from "node:path";

const SUPPLEMENTS_DIR = path.join(process.cwd(), "supplements");

async function listSupplements() {
	try {
		const items = await fs.readdir(SUPPLEMENTS_DIR, { withFileTypes: true });
		const slugs = items
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		console.log("📦 Supplements found:\n");
		for (const slug of slugs) {
			console.log("-", slug);
		}
	} catch (err) {
		console.error("❌ Failed to list supplements:", err);
	}
}

listSupplements();
