import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const requiredArtifacts = [
  "index.html",
  "clock/index.html",
  "overlay/keyword-reaction/index.html",
  "api/defaults",
  "favicon.ico",
  "assets/css/styles.css",
  "assets/css/tokens.css",
  "assets/css/base.css",
  "assets/css/clock.css",
  "assets/css/overlay.css",
  "assets/css/builder.css",
  "assets/js/config.js",
  "assets/js/clock.js"
];

test("build creates required Cloudflare static assets", () => {
  const result = spawnSync(process.execPath, ["scripts/build.mjs"], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr || result.stdout);

  for (const artifact of requiredArtifacts) {
    const path = join("dist", artifact);
    assert.equal(existsSync(path), true, `${path} should exist`);
    assert.equal(statSync(path).isFile(), true, `${path} should be a file`);
    assert.ok(statSync(path).size > 0, `${path} should not be empty`);
  }

  assert.deepEqual(JSON.parse(readFileSync(join("dist", "api/defaults"), "utf8")), {
    timezone: null,
    country: null,
    source: "static"
  });
});
