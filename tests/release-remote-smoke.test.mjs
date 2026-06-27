import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import test from "node:test";
import { fileURLToPath } from "node:url";

const smokeScript = fileURLToPath(new URL("../scripts/release-remote-smoke.mjs", import.meta.url));
const securityHeaders = {
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; form-action 'self'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer"
};

test("remote release smoke fails when HTML security headers are missing", async () => {
  // 本番配信の回帰を検出するため、本文とContent-Typeが正しくてもCSP等が欠けたら落とす。
  const server = await serveFixture({ includeSecurityHeaders: false });
  try {
    const result = await runSmoke(server.baseUrl);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /expected content-security-policy/i);
  } finally {
    await server.close();
  }
});

test("remote release smoke accepts the OBS-embeddable security header contract", async () => {
  // frame-ancestors はOBS埋め込み維持のため意図的に要求しない。
  const server = await serveFixture({ includeSecurityHeaders: true });
  try {
    const result = await runSmoke(server.baseUrl);
    assert.equal(result.code, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Remote release smoke passed/);
  } finally {
    await server.close();
  }
});

function serveFixture({ includeSecurityHeaders }) {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const htmlHeaders = {
      "content-type": "text/html; charset=utf-8",
      ...(includeSecurityHeaders ? securityHeaders : {})
    };

    if (url.pathname === "/" || url.pathname === "/clock/" || url.pathname === "/clock") {
      response.writeHead(200, htmlHeaders);
      response.end(url.pathname === "/" ? "OBS時計URLビルダー" : '<div id="clockRoot"></div>');
      return;
    }

    if (url.pathname === "/api/defaults") {
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(JSON.stringify({ timezone: null, country: null, source: "static" }));
      return;
    }

    if (url.pathname === "/favicon.ico") {
      response.writeHead(200, { "content-type": "image/svg+xml" });
      response.end("<svg></svg>");
      return;
    }

    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("fixture server did not expose a TCP port"));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((error) => (error ? closeReject(error) : closeResolve()));
          })
      });
    });
  });
}

function runSmoke(baseUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [smokeScript], {
      env: { ...process.env, SMOKE_BASE_URL: baseUrl },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("release remote smoke fixture timed out"));
    }, 5_000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("exit", (code) => {
      clearTimeout(timeout);
      resolve({ code, stdout, stderr });
    });
  });
}
