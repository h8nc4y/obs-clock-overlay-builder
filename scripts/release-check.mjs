import { spawn } from "node:child_process";

const checks = [
  "npm run lint",
  "npm run typecheck",
  "npm run format:check",
  "npm run test",
  "npm run build",
  "npm run cf:dry-run",
  "git diff --check"
];

for (const command of checks) {
  await run(command);
}

console.log("Release preflight checks passed.");

function run(command) {
  return new Promise((resolve, reject) => {
    const child = spawnShell(command, {
      env: {
        ...process.env,
        WRANGLER_WRITE_LOGS: process.env.WRANGLER_WRITE_LOGS ?? "false"
      },
      stdio: "inherit"
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} failed with exit code ${code}`));
      }
    });
  });
}

function spawnShell(command, options) {
  if (process.platform === "win32") {
    return spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", command], options);
  }
  return spawn("sh", ["-c", command], options);
}
