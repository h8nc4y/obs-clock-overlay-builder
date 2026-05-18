import { spawn } from "node:child_process";

const port = process.env.PORT || "4173";
const baseUrl = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${port}`;
let server;

try {
  server = spawnShell("npm run dev", {
    env: { ...process.env, PORT: port },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  await waitForServer(baseUrl);
  await run("npm run http:smoke", { ...process.env, SMOKE_BASE_URL: baseUrl });
  console.log("Release HTTP smoke passed.");
} finally {
  if (server?.pid) {
    await stopProcessTree(server.pid);
  }
}

async function waitForServer(url) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Wait until the local dev server accepts connections.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function run(command, env) {
  return new Promise((resolve, reject) => {
    const child = spawnShell(command, {
      env,
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

function stopProcessTree(pid) {
  return new Promise((resolve) => {
    if (process.platform === "win32") {
      const child = spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `taskkill /pid ${pid} /t /f >NUL 2>NUL`], {
        stdio: "ignore"
      });
      child.on("exit", () => resolve());
      child.on("error", () => resolve());
      return;
    }
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // The server may have already exited.
    }
    resolve();
  });
}
