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
  const builder = readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8");

  assert.match(html, /フォントファイルは同梱しないため、OBSを動かすPCに同じフォントが必要です。/);
  assert.match(html, /OBS側PCに無い名前は標準フォントへ置き換わります。/);
  assert.match(html, /別PCでは同じフォントが必要です。/);
  assert.match(html, /コピーしてOBSのブラウザソースへ貼ります。/);
  assert.match(html, /背景が透明で編集UIが出ないことを確認してからOBSへ貼ると安心です。/);
  assert.match(builder, /PC内フォント名を確認中\.\.\./);
  assert.match(builder, /読み込めるフォント名が見つかりませんでした。/);
  assert.match(builder, /OBS側PCで使えるフォント名を入れてください。/);
});

test("pages use embedded favicon to avoid browser 404 noise", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const clockHtml = readFileSync(new URL("../clock/index.html", import.meta.url), "utf8");
  const favicon = readFileSync(new URL("../favicon.ico", import.meta.url), "utf8");

  assert.match(html, /<link rel="icon" href="data:image\/svg\+xml,/);
  assert.match(clockHtml, /<link rel="icon" href="data:image\/svg\+xml,/);
  assert.match(favicon, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
});

test("v0.1.1 backlog keeps release candidates separate from manual checks", () => {
  const backlog = readFileSync(new URL("../docs/v0.1.1-backlog.md", import.meta.url), "utf8");

  assert.match(backlog, /## v0\.1\.1候補/);
  assert.match(backlog, /## 後続version候補/);
  assert.match(backlog, /## 人間確認待ち/);
  assert.match(backlog, /2026\/05\/26にIssue #12の人間確認コメントで完了扱いになりました。/);
  assert.match(backlog, /数値、支払い詳細、account識別子、個人情報はrepo docsへ記録しません。/);
});

test("copy fallback does not always select the generated URL field", () => {
  const builder = readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8");
  const copyTextBody = builder.match(/async function copyText\([^)]*\) \{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? "";

  assert.doesNotMatch(copyTextBody, /elements\.generatedUrl\.focus\(\);\s*elements\.generatedUrl\.select\(\);/);
  assert.match(copyTextBody, /fallback/i);
  assert.match(copyTextBody, /text/);
});
