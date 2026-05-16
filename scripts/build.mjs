import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const deployEntries = ["index.html", "clock", "assets", "_redirects"];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const entry of deployEntries) {
  const source = join(root, entry);
  if (!existsSync(source)) {
    continue;
  }
  cpSync(source, join(dist, entry), { recursive: true });
}

console.log(`Built static assets in ${dist}`);
