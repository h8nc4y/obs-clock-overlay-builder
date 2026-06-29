import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const roots = ["assets", "functions", "scripts", "tests", "worker"];

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const files = roots.flatMap((root) => listFiles(root)).filter((file) => /\.(mjs|js)$/.test(file));
  let failed = false;

  for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (result.status !== 0) {
      failed = true;
      process.stderr.write(formatCheckFailure(file, result));
    }
  }

  if (failed) {
    process.exit(1);
  }

  console.log(`Checked ${files.length} JavaScript files.`);
}

export function formatCheckFailure(file, result) {
  const output = result.stderr || result.stdout;
  if (output) {
    return output.endsWith("\n") ? output : `${output}\n`;
  }

  // 子プロセスを起動できない環境では stderr/stdout が空になるため、原因を失わず表示する。
  const reason = result.error?.message || result.signal || `exit status ${result.status ?? "unknown"}`;
  return `${file}: node --check failed: ${reason}\n`;
}

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
