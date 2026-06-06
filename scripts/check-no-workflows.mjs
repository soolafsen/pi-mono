import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const workflowDir = ".github/workflows";
const shouldFix = process.argv.includes("--fix");

function listFiles(dir) {
	const entries = readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...listFiles(path));
		} else if (entry.isFile()) {
			files.push(path.replaceAll("\\", "/"));
		}
	}
	return files;
}

if (!existsSync(workflowDir)) {
	process.exit(0);
}

const workflowFiles = listFiles(workflowDir);
if (workflowFiles.length === 0) {
	process.exit(0);
}

if (shouldFix) {
	rmSync(workflowDir, { force: true, recursive: true });
	console.error("Removed forbidden GitHub Actions workflows from this local-only fork.");
	for (const file of workflowFiles) {
		console.error(`  ${file}`);
	}
	process.exit(0);
}

console.error("GitHub Actions workflows are forbidden in this local-only fork.");
console.error("Remove these files before committing or completing a merge:");
for (const file of workflowFiles) {
	console.error(`  ${file}`);
}
process.exit(1);
