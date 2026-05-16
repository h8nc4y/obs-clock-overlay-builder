import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["assets", "functions", "scripts", "tests"];
const files = roots.flatMap((root) => listFiles(root)).filter((file) => /\.(mjs|js)$/.test(file));
let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(result.stderr || result.stdout);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Checked ${files.length} JavaScript files.`);

function listFiles(root) {
  try {
    const stats = statSync(root);
    if (stats.isFile()) {
      return [root];
    }
  } catch {
    return [];
  }

  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      return listFiles(path);
    }
    return entry.isFile() ? [path] : [];
  });
}
