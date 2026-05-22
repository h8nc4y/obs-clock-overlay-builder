import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("color swatches keep touch-friendly dimensions", () => {
  const css = readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8");
  const swatchBlock = css.match(/\.swatch\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";

  assert.match(swatchBlock, /width:\s*36px;/);
  assert.match(swatchBlock, /height:\s*36px;/);
  assert.match(swatchBlock, /min-height:\s*36px;/);
});

test("font helper explains OBS-side fallback plainly", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /OBSを動かすPCに無い場合は近い標準フォントで表示されます。/);
  assert.match(html, /日本語名で表示される場合も、URLにはOBSで使う実際のフォント名を保存します。/);
});

test("v0.1.1 backlog keeps release candidates separate from manual checks", () => {
  const backlog = readFileSync(new URL("../docs/v0.1.1-backlog.md", import.meta.url), "utf8");

  assert.match(backlog, /## v0\.1\.1候補/);
  assert.match(backlog, /## 後続version候補/);
  assert.match(backlog, /## 人間確認待ち/);
  assert.match(backlog, /Issue #12はcloseしません。/);
});
