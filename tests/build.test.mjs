import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const requiredArtifacts = [
  "index.html",
  "clock/index.html",
  "api/defaults",
  "favicon.ico",
  "assets/og-image.png",
  "assets/css/styles.css",
  "assets/css/tokens.css",
  "assets/css/base.css",
  "assets/css/clock.css",
  "assets/css/builder.css",
  "assets/js/config.js",
  "assets/js/clock.js"
];

test("build creates required Cloudflare static assets", () => {
  // 専用の一時ディレクトリへビルドして検証する。共有 dist/ を奪い合わないので
  // 並列テスト実行でも race にならず、本番ビルドの dist/ にも触れない。
  const outDir = mkdtempSync(join(tmpdir(), "obs-clock-build-"));
  try {
    const result = spawnSync(process.execPath, ["scripts/build.mjs"], {
      encoding: "utf8",
      env: { ...process.env, DIST_DIR: outDir }
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);

    for (const artifact of requiredArtifacts) {
      const path = join(outDir, artifact);
      assert.equal(existsSync(path), true, `${path} should exist`);
      assert.equal(statSync(path).isFile(), true, `${path} should be a file`);
      assert.ok(statSync(path).size > 0, `${path} should not be empty`);
    }

    // social metadata の width/height と実PNGがずれるとカード側で不自然なcropになるため、
    // PNGシグネチャとIHDRの実寸を外部画像ライブラリなしで固定する。
    const socialImage = readFileSync(join(outDir, "assets/og-image.png"));
    assert.equal(socialImage.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(socialImage.readUInt32BE(16), 1200);
    assert.equal(socialImage.readUInt32BE(20), 630);

    assert.deepEqual(JSON.parse(readFileSync(join(outDir, "api/defaults"), "utf8")), {
      timezone: null,
      country: null,
      source: "static"
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
