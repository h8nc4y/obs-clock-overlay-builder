import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("color swatches keep touch-friendly dimensions", () => {
  const css = readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8");
  const swatchBlock = css.match(/\.swatch\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";

  assert.match(swatchBlock, /width:\s*40px;/);
  assert.match(swatchBlock, /height:\s*40px;/);
  assert.match(swatchBlock, /min-height:\s*40px;/);
  assert.match(css, /@media \(pointer:\s*coarse\)\s*\{[\s\S]*?\.swatch\s*\{[\s\S]*?width:\s*44px;/);
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

test("clock page reserves visual safe inset for glow-heavy templates", () => {
  const css = readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8");
  const clockHtml = readFileSync(new URL("../clock/index.html", import.meta.url), "utf8");
  const clockPageBlock = css.match(/\.clock-page\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";
  const clockRootBlock = css.match(/\.clock-page #clockRoot\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";

  assert.match(clockHtml, /<html lang="ja" class="clock-page-root">/);
  assert.match(clockHtml, /<body class="clock-page">/);
  assert.match(css, /html\.clock-page-root\s*\{[\s\S]*?background:\s*transparent;/);
  assert.match(clockPageBlock, /--clock-visual-safe-inset:\s*18px;/);
  assert.match(clockPageBlock, /background:\s*transparent;/);
  assert.match(clockRootBlock, /padding:\s*var\(--clock-visual-safe-inset\);/);
});

test("editor live preview reserves visual safe inset around clock widget", () => {
  const css = readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8");
  const previewStageBlock = css.match(/\.preview-stage\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";

  assert.match(previewStageBlock, /padding:\s*var\(--clock-visual-safe-inset,\s*18px\);/);
  assert.match(previewStageBlock, /overflow:\s*auto;/);
  assert.match(previewStageBlock, /overscroll-behavior:\s*contain;/);
});

test("editor live preview contains oversized clock inside the preview column", () => {
  const css = readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8");
  const previewPanelBlock =
    css.match(/\.preview-panel\s*\{\s*background:\s*var\(--panel-strong\);(?<body>[^}]+)\}/)?.groups?.body ?? "";
  const previewShellBlock = css.match(/\.preview-shell\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";
  const previewStageBlock = css.match(/\.preview-stage\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";
  const previewClockBlock = css.match(/\.preview-stage \.clock-widget\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";

  assert.match(previewPanelBlock, /min-width:\s*0;/);
  assert.match(previewPanelBlock, /max-width:\s*100%;/);
  assert.match(previewShellBlock, /min-width:\s*0;/);
  assert.match(previewShellBlock, /max-width:\s*100%;/);
  assert.match(previewStageBlock, /inline-size:\s*100%;/);
  assert.match(previewStageBlock, /min-width:\s*0;/);
  assert.match(previewStageBlock, /max-width:\s*100%;/);
  assert.match(previewClockBlock, /flex:\s*0 0 auto;/);
  assert.match(previewClockBlock, /max-width:\s*none;/);
});

test("editor refresh keeps preview and OBS URL first in the task flow", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const css = readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8");

  assert.ok(html.indexOf('class="preview-column"') < html.indexOf('class="control-surface"'));
  assert.ok(html.indexOf('id="copyUrl"') < html.indexOf('id="previewShell"'));
  assert.match(html, /<label class="field url-field" for="generatedUrl">/);
  assert.match(html, /<span>生成URL<\/span>/);
  assert.match(html, /<button id="copyUrl" type="button">OBS URLをコピー<\/button>/);
  assert.match(css, /grid-template-areas:\s*"preview controls";/);
});

test("editor refresh has keyboard and responsive layout safeguards", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const css = readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8");

  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main id="builderMain" class="builder-layout" tabindex="-1">/);
  assert.match(css, /button,\s*\n\.button-like\s*\{[\s\S]*?min-height:\s*44px;/);
  assert.match(css, /@media \(pointer:\s*coarse\)\s*\{[\s\S]*?min-height:\s*48px;/);
  assert.match(css, /@media \(max-width:\s*820px\)\s*\{[\s\S]*?\.form-grid/);
  assert.match(css, /@media \(max-width:\s*520px\)\s*\{[\s\S]*?flex:\s*0 0 auto;/);
});

test("editor refresh does not add risky HTML sinks", () => {
  const changedSources = [
    readFileSync(new URL("../index.html", import.meta.url), "utf8"),
    readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8"),
    readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8")
  ].join("\n");

  assert.doesNotMatch(changedSources, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
});
