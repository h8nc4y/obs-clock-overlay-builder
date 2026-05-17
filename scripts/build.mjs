import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const requiredDeployEntries = ["index.html", "clock", "assets", "api"];
const optionalDeployEntries = ["_redirects", "_headers"];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const entry of requiredDeployEntries) {
  copyDeployEntry(entry, { required: true });
}

for (const entry of optionalDeployEntries) {
  copyDeployEntry(entry, { required: false });
}

console.log(`Built static assets in ${dist}`);

function copyDeployEntry(entry, { required }) {
  const source = join(root, entry);
  if (!existsSync(source)) {
    if (required) {
      throw new Error(`Required deploy entry is missing: ${entry}`);
    }
    return;
  }
  cpSync(source, join(dist, entry), { recursive: true });
}
