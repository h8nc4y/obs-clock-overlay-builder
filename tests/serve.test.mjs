import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer, request } from "node:http";
import test from "node:test";
import { fileURLToPath } from "node:url";

const serveScript = fileURLToPath(new URL("../scripts/serve.mjs", import.meta.url));
const expectedSecurityHeaders = {
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; form-action 'self'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer"
};

const malformedPaths = [
  { name: "invalid percent escape", path: "/%ZZ" },
  { name: "truncated percent escape", path: "/%" },
  { name: "invalid UTF-8 escape", path: "/%C0%AF" }
];

for (const malformedPath of malformedPaths) {
  test(`local server rejects ${malformedPath.name} without terminating`, async () => {
    const fixture = await startLocalServer();
    try {
      // malformed path は固定400へ閉じ、入力値を本文へ反射させず、通常面と同じ防御ヘッダを返す。
      const rejected = await requestPath(fixture.port, malformedPath.path);
      assert.equal(rejected.status, 400);
      assert.equal(rejected.body, "Bad request");
      assert.doesNotMatch(rejected.body, new RegExp(escapeRegExp(malformedPath.path)));
      assert.equal(rejected.headers["content-type"], "text/plain; charset=utf-8");
      for (const [name, value] of Object.entries(expectedSecurityHeaders)) {
        assert.equal(rejected.headers[name], value);
      }

      // 例外をrequest境界で処理できていれば、同じprocessが次の正常GETを処理できる。
      assert.equal(fixture.child.exitCode, null, fixture.stderr());
      const healthy = await requestPath(fixture.port, "/");
      assert.equal(healthy.status, 200);
      assert.match(healthy.body, /OBS時計URLビルダー/);
    } finally {
      await fixture.close();
    }
  });
}

test("local server decodes a request path exactly once and keeps traversal fail-closed", async () => {
  const fixture = await startLocalServer();
  try {
    // 既存契約: 単一encodeの区切りは通常pathとして扱うが、二重decodeはしない。
    assert.equal((await requestPath(fixture.port, "/assets%2Fjs%2Fconfig.js")).status, 200);
    assert.equal((await requestPath(fixture.port, "/assets%252Fjs%252Fconfig.js")).status, 404);

    // NULやencoded traversalはrepo外へ抜けず、固定した存在しないpathとして閉じる。
    const rejectedPaths = [
      "/%00",
      "/..%5C..%5Ccodex-serve-outside-root-sentinel.txt",
      "/%2e%2e%2F%2e%2e%2Fcodex-serve-outside-root-sentinel.txt"
    ];
    for (const rejectedPath of rejectedPaths) {
      assert.equal((await requestPath(fixture.port, rejectedPath)).status, 404);
    }

    assert.equal(fixture.child.exitCode, null, fixture.stderr());
  } finally {
    await fixture.close();
  }
});

async function startLocalServer() {
  const port = await reserveEphemeralPort();
  const child = spawn(process.execPath, [serveScript], {
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  try {
    await waitForStartup(child, () => stdout, () => stderr);
  } catch (error) {
    // startup失敗時もprocessを残さず、元の診断を維持してtestへ返す。
    await stopChild(child);
    throw error;
  }
  return {
    child,
    port,
    stderr: () => stderr,
    close: () => stopChild(child)
  };
}

function reserveEphemeralPort() {
  // test runner間の固定port競合を避けるため、OSに空きportを一度割り当ててもらう。
  const probe = createServer();
  return new Promise((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (!address || typeof address === "string") {
        probe.close();
        reject(new Error("ephemeral port probe did not expose a TCP port"));
        return;
      }
      const { port } = address;
      probe.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

function waitForStartup(child, stdout, stderr) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`local server startup timed out: ${stderr() || stdout()}`));
    }, 5_000);
    const onStdout = () => {
      if (stdout().includes("Local server:")) {
        cleanup();
        resolve();
      }
    };
    const onExit = (code) => {
      cleanup();
      reject(new Error(`local server exited during startup (${code}): ${stderr() || stdout()}`));
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      clearTimeout(timeout);
      child.stdout.off("data", onStdout);
      child.off("exit", onExit);
      child.off("error", onError);
    };
    child.stdout.on("data", onStdout);
    child.once("exit", onExit);
    child.once("error", onError);
    onStdout();
  });
}

function requestPath(port, path) {
  return new Promise((resolve, reject) => {
    const client = request({ host: "127.0.0.1", port, path, method: "GET" }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolve({ status: response.statusCode, headers: response.headers, body });
      });
    });
    client.setTimeout(2_000, () => client.destroy(new Error(`request timed out: ${path}`)));
    client.once("error", reject);
    client.end();
  });
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  const exited = waitForExit(child, 2_000);
  child.kill();
  if (!(await exited)) {
    // 通常終了が効かない場合だけ強制終了し、test runnerへ孤児processを残さない。
    const forceExited = waitForExit(child, 2_000);
    child.kill("SIGKILL");
    if (!(await forceExited)) {
      throw new Error("local server did not stop within 4000ms");
    }
  }
}

function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      child.off("exit", onExit);
      resolve(false);
    }, timeoutMs);
    const onExit = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    child.once("exit", onExit);
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
