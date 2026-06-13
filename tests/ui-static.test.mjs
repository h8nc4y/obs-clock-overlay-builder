import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const CSS_BUNDLE_FILES = ["tokens.css", "base.css", "clock.css", "builder.css"];

function readBundledCss() {
  return CSS_BUNDLE_FILES.map((name) =>
    readFileSync(new URL(`../assets/css/${name}`, import.meta.url), "utf8")
  ).join("\n");
}

test("legacy styles.css shim keeps importing every split css file", () => {
  const shim = readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8");

  for (const name of CSS_BUNDLE_FILES) {
    assert.match(shim, new RegExp(`@import url\\("\\./${name.replace(".", "\\.")}"\\);`));
  }
});

test("color swatches keep touch-friendly dimensions", () => {
  const css = readBundledCss();
  const swatchBlock = css.match(/\.swatch\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";

  assert.match(swatchBlock, /width:\s*40px;/);
  assert.match(swatchBlock, /height:\s*40px;/);
  assert.match(swatchBlock, /min-height:\s*40px;/);
  assert.match(css, /@media \(pointer:\s*coarse\)\s*\{[\s\S]*?\.swatch\s*\{[\s\S]*?width:\s*44px;/);
});

test("font helper explains OBS-side fallback plainly", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const builder = readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8");

  // 完全一致だと文言の軽微な調整で false failure になり、同ファイルにある
  // セキュリティ系ガードへの信頼まで損なう。要点のキーワードが残っているかだけ確認する。
  assert.match(html, /フォントファイルは同梱しない/);
  assert.match(html, /標準フォント/);
  assert.match(html, /PC内フォント名を読む/);
  assert.match(html, /一覧が空/);
  assert.match(html, /OBSで実際に参照するフォント名/);
  assert.match(builder, /確認中/);
  assert.match(builder, /見つかりませんでした/);
  assert.match(builder, /URLに保存/);
});

test("pages use embedded favicon to avoid browser 404 noise", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const clockHtml = readFileSync(new URL("../clock/index.html", import.meta.url), "utf8");
  const favicon = readFileSync(new URL("../favicon.ico", import.meta.url), "utf8");

  assert.match(html, /<link rel="icon" href="data:image\/svg\+xml,/);
  assert.match(clockHtml, /<link rel="icon" href="data:image\/svg\+xml,/);
  assert.match(favicon, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
});

test("manual QA and ops docs cover current post-launch checks", () => {
  const manualQa = readFileSync(new URL("../docs/manual-qa.md", import.meta.url), "utf8");
  const postLaunchOps = readFileSync(new URL("../docs/post-launch-ops.md", import.meta.url), "utf8");
  const preReleaseQa = readFileSync(new URL("../docs/pre-release-qa.md", import.meta.url), "utf8");

  assert.match(manualQa, /プレビュー背景.*44px以上/);
  assert.match(manualQa, /hover.*focus-within/);
  assert.match(manualQa, /ブラウザから許可を求められたら/);
  assert.match(manualQa, /一覧が空/);
  assert.match(manualQa, /表示名ではなく、OBSで実際に参照するフォント名/);
  assert.match(postLaunchOps, /Issue #12/);
  assert.match(postLaunchOps, /dashboard確認結果は公開safeな要約だけ/);
  assert.match(postLaunchOps, /数値、支払い詳細、account識別子、個人情報/);
  assert.match(preReleaseQa, /PC内フォント読み込みの許可案内、空状態、実フォント名保存/);
});

test("copy fallback does not always select the generated URL field", () => {
  const builder = readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8");
  const copyTextBody = builder.match(/async function copyText\([^)]*\) \{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? "";

  assert.doesNotMatch(copyTextBody, /elements\.generatedUrl\.focus\(\);\s*elements\.generatedUrl\.select\(\);/);
  assert.match(copyTextBody, /fallback/i);
  assert.match(copyTextBody, /text/);
});

test("clock page reserves visual safe inset for glow-heavy templates", () => {
  const css = readBundledCss();
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
  const css = readBundledCss();
  const previewStageBlock = css.match(/\.preview-stage\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";

  assert.match(previewStageBlock, /padding:\s*var\(--clock-visual-safe-inset,\s*18px\);/);
  assert.match(previewStageBlock, /overflow:\s*auto;/);
  assert.match(previewStageBlock, /overscroll-behavior:\s*contain;/);
});

test("editor live preview contains oversized clock inside the preview column", () => {
  const css = readBundledCss();
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
  const css = readBundledCss();

  assert.ok(html.indexOf('class="preview-column"') < html.indexOf('class="control-surface"'));
  assert.ok(html.indexOf('id="copyUrl"') < html.indexOf('id="previewShell"'));
  assert.match(html, /<label class="field url-field" for="generatedUrl">/);
  assert.match(html, /<span>生成URL<\/span>/);
  assert.match(html, /<button id="copyUrl" type="button">OBS用URLをコピー<\/button>/);
  assert.match(css, /grid-template-areas:\s*"preview controls";/);
});

test("editor refresh has keyboard and responsive layout safeguards", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const css = readBundledCss();
  const previewToolbarLabelBlock =
    css.match(/\.preview-toolbar label\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";

  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main id="builderMain" class="builder-layout" tabindex="-1">/);
  assert.match(css, /button,\s*\n\.button-like\s*\{[\s\S]*?min-height:\s*44px;/);
  assert.match(css, /@media \(pointer:\s*coarse\)\s*\{[\s\S]*?min-height:\s*48px;/);
  assert.match(previewToolbarLabelBlock, /min-height:\s*44px;/);
  assert.match(previewToolbarLabelBlock, /padding:\s*0 10px;/);
  assert.match(css, /\.preview-toolbar label:focus-within\s*\{[\s\S]*?outline:\s*3px solid var\(--focus\);/);
  assert.match(css, /@media \(max-width:\s*820px\)\s*\{[\s\S]*?\.form-grid/);
  assert.match(css, /@media \(max-width:\s*520px\)\s*\{[\s\S]*?flex:\s*0 0 auto;/);
});

test("editor step flow exposes easy and advanced adjustment layers", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /テンプレートを選ぶ/);
  assert.match(html, /自分好みに調整する/);
  assert.match(html, /OBSに貼る/);
  assert.match(html, /id="adjustTabEasy"[^>]*aria-pressed="true"/);
  assert.match(html, /id="adjustTabAdvanced"[^>]*aria-pressed="false"/);
  assert.match(html, /id="easyControls"/);
  assert.match(html, /<div id="advancedControls" hidden>/);
  assert.ok(html.indexOf('id="templateGrid"') < html.indexOf('id="easyControls"'));
});

test("builder theme switcher stays editor-only and does not touch the clock surface", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const builder = readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8");
  const clockJs = readFileSync(new URL("../assets/js/clock.js", import.meta.url), "utf8");
  const clockHtml = readFileSync(new URL("../clock/index.html", import.meta.url), "utf8");
  const builderCss = readFileSync(new URL("../assets/css/builder.css", import.meta.url), "utf8");
  const clockCss = readFileSync(new URL("../assets/css/clock.css", import.meta.url), "utf8");

  assert.match(html, /id="uiTheme"/);
  assert.match(html, /value="white"/);
  assert.match(html, /value="booth"/);
  assert.match(html, /value="fanbox"/);
  assert.match(builder, /obs-clock-builder:theme/);
  assert.match(builder, /dataset\.theme/);
  assert.match(builderCss, /:root\[data-theme="booth"\]/);
  assert.match(builderCss, /:root\[data-theme="fanbox"\]/);
  assert.doesNotMatch(clockJs, /localStorage|dataset\.theme|data-theme/);
  assert.doesNotMatch(clockHtml, /builder\.css|uiTheme|data-theme/);
  assert.doesNotMatch(clockCss, /data-theme/);
});

test("editor refresh does not add risky HTML sinks", () => {
  const changedSources = [
    readFileSync(new URL("../index.html", import.meta.url), "utf8"),
    readBundledCss(),
    readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8")
  ].join("\n");

  assert.doesNotMatch(changedSources, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
});

test("labeled control groups expose an accessible name via role=group + aria-label", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  // aria-label on a bare <div> is ignored by assistive tech; each labeled group needs role="group".
  for (const label of ["プレビュー背景", "OBS推奨サイズ", "時計の種類", "調整モード切り替え"]) {
    assert.match(
      html,
      new RegExp(`role="group"[^>]*aria-label="${label}"|aria-label="${label}"[^>]*role="group"`),
      `group "${label}" should expose role="group" + aria-label`
    );
  }
});
