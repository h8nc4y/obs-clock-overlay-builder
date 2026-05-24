import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const port = process.env.PORT || "4173";
const baseUrl = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${port}`;
const serveScript = fileURLToPath(new URL("./serve.mjs", import.meta.url));
const smokeScript = fileURLToPath(new URL("./http-smoke.mjs", import.meta.url));
let server;

try {
  server = spawn(process.execPath, [serveScript], {
    env: { ...process.env, PORT: port },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });

  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  await waitForServer(baseUrl);
  await runNodeScript(smokeScript, { ...process.env, SMOKE_BASE_URL: baseUrl });
  console.log("Release HTTP smoke passed.");
} finally {
  await stopProcess(server);
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

function runNodeScript(scriptPath, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      env,
      stdio: "inherit",
      windowsHide: true
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${scriptPath} failed with exit code ${code}`));
      }
    });
  });
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  const exited = waitForExit(child, 2_000);
  try {
    child.kill();
  } catch {
    // The server may have already exited.
  }
  await exited;
}

function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}
