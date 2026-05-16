import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["."];
const allowed = /\.(html|css|js|mjs|md|json)$/;
const ignoredDirectories = new Set([".git", "node_modules"]);
const ignoredDirectoryPatterns = [
  /^chrome-.*-profile/,
  /^edge-.*-profile/,
  /^browser-localappdata$/,
  /^browser-temp$/
];
const files = roots.flatMap((root) => listFiles(root)).filter((file) => allowed.test(file));
const problems = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  if (!text.endsWith("\n")) {
    problems.push(`${file}: missing final newline`);
  }
  const lines = text.split(/\n/);
  lines.forEach((line, index) => {
    if (/[ \t]$/.test(line)) {
      problems.push(`${file}:${index + 1}: trailing whitespace`);
    }
  });
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(`Format check passed for ${files.length} text files.`);

function listFiles(root) {
  const stats = statSync(root);
  if (stats.isFile()) {
    return [root];
  }
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (ignoredDirectories.has(entry.name) || ignoredDirectoryPatterns.some((pattern) => pattern.test(entry.name))) {
      return [];
    }
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      return listFiles(path);
    }
    return entry.isFile() ? [path] : [];
  });
}
