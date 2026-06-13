import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
// 既定の出力先は dist。並列テストが共有 dist/ を奪い合わないよう、
// DIST_DIR でビルド先を上書きできる(本番ビルドは未指定なので dist/ のまま)。
const dist = process.env.DIST_DIR ? resolve(process.env.DIST_DIR) : join(root, "dist");
const requiredDeployEntries = ["index.html", "clock", "assets", "api", "favicon.ico"];
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
