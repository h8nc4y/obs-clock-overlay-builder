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

test("keyword reaction overlay runtime skeleton is transparent and config-aware", () => {
  const css = readFileSync(new URL("../assets/css/styles.css", import.meta.url), "utf8");
  const overlayHtml = readFileSync(new URL("../overlay/keyword-reaction/index.html", import.meta.url), "utf8");
  const overlayRuntime = readFileSync(new URL("../assets/js/keyword-reaction-overlay.js", import.meta.url), "utf8");
  const overlayEventHelper = readFileSync(new URL("../assets/js/keyword-reaction-event.js", import.meta.url), "utf8");
  const overlayEventIntakeHelper = readFileSync(
    new URL("../assets/js/keyword-reaction-event-intake.js", import.meta.url),
    "utf8"
  );
  const overlayIntakeQueueHelper = readFileSync(
    new URL("../assets/js/keyword-reaction-intake-queue.js", import.meta.url),
    "utf8"
  );
  const overlayInternalDispatchHelper = readFileSync(
    new URL("../assets/js/keyword-reaction-internal-dispatch.js", import.meta.url),
    "utf8"
  );
  const overlayQueueHelper = readFileSync(new URL("../assets/js/keyword-reaction-queue.js", import.meta.url), "utf8");
  const redirects = readFileSync(new URL("../_redirects", import.meta.url), "utf8");
  const overlayPageBlock = css.match(/\.keyword-reaction-page\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";
  const overlaySurfaceBlock = css.match(/\.keyword-reaction-surface\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";
  const overlayStatusBlock = css.match(/\.keyword-reaction-status\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";
  const overlayDemoBlock = css.match(/\.keyword-reaction-demo-toast\s*\{(?<body>[^}]+)\}/)?.groups?.body ?? "";

  assert.match(overlayHtml, /<html lang="ja" class="keyword-reaction-page-root">/);
  assert.match(overlayHtml, /<body class="keyword-reaction-page">/);
  assert.match(overlayHtml, /aria-label="キーワード反応オーバーレイ"/);
  assert.match(overlayHtml, /id="keywordReactionOverlayStatus"/);
  assert.match(overlayHtml, /id="keywordReactionOverlayDemo"/);
  assert.match(overlayHtml, /hidden aria-hidden="true" inert/);
  assert.match(overlayHtml, /<script type="module" src="\.\.\/\.\.\/assets\/js\/keyword-reaction-overlay\.js"><\/script>/);
  assert.match(css, /html\.keyword-reaction-page-root\s*\{[\s\S]*?background:\s*transparent;/);
  assert.match(overlayPageBlock, /margin:\s*0;/);
  assert.match(overlayPageBlock, /background:\s*transparent;/);
  assert.match(overlayPageBlock, /overflow:\s*hidden;/);
  assert.match(overlaySurfaceBlock, /pointer-events:\s*none;/);
  assert.match(overlayStatusBlock, /white-space:\s*pre-line;/);
  assert.match(css, /\.keyword-reaction-status\[hidden\]\s*\{[\s\S]*?display:\s*none;/);
  assert.match(overlayDemoBlock, /justify-self:\s*end;/);
  assert.match(overlayDemoBlock, /width:\s*min\(320px,\s*calc\(100vw - 36px\)\);/);
  assert.match(overlayDemoBlock, /pointer-events:\s*none;/);
  assert.match(css, /\.keyword-reaction-demo-toast\[hidden\]\s*\{[\s\S]*?display:\s*none;/);
  assert.match(redirects, /\/overlay\/keyword-reaction\s+\/overlay\/keyword-reaction\/index\.html\s+200/);
  assert.match(overlayRuntime, /parseKeywordReactionConfigFromQuery/);
  assert.match(overlayRuntime, /buildDemoKeywordReactionEvent/);
  assert.match(overlayRuntime, /textContent/);
  assert.match(overlayRuntime, /debug"\)\s*===\s*"1"/);
  assert.match(overlayRuntime, /demo"\)\s*===\s*"1"/);
  assert.match(overlayRuntime, /Keyword reaction overlay ready/);
  assert.match(overlayEventHelper, /キーワード反応デモ/);
  assert.match(overlayEventIntakeHelper, /KEYWORD_REACTION_LOCAL_EVENT_SOURCE_TYPES/);
  assert.match(overlayEventIntakeHelper, /normalizeKeywordReactionEvent/);
  assert.match(overlayRuntime, /from "\.\/keyword-reaction-intake-queue\.js"/);
  assert.match(overlayRuntime, /\benqueueKeywordReactionLocalInput\b/);
  assert.match(overlayRuntime, /from "\.\/keyword-reaction-queue\.js"/);
  assert.doesNotMatch(overlayRuntime, /\benqueueKeywordReactionEvent\b/);
  assert.match(overlayRuntime, /\bdequeueKeywordReactionEvent\b/);
  assert.match(overlayIntakeQueueHelper, /\benqueueKeywordReactionEvent\b/);
  assert.match(overlayInternalDispatchHelper, /KEYWORD_REACTION_INTERNAL_EVENT_NAME/);
  assert.match(overlayInternalDispatchHelper, /validateKeywordReactionLocalEventInput/);
  assert.match(overlayInternalDispatchHelper, /EventTarget/);
  assert.match(overlayInternalDispatchHelper, /CustomEvent/);
  assert.match(overlayQueueHelper, /DEFAULT_KEYWORD_REACTION_QUEUE_LIMIT\s*=\s*5/);
  assert.match(overlayRuntime, /setTimeout/);
  assert.match(overlayRuntime, /clearTimeout/);
  assert.doesNotMatch(overlayHtml, /Keyword reaction overlay ready/);
  assert.doesNotMatch(overlayHtml, /キーワード反応デモ/);
  assert.doesNotMatch(overlayRuntime, /setInterval|while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/);
  assert.doesNotMatch(overlayRuntime, /localStorage|fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/);
  assert.doesNotMatch(overlayRuntime, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
  assert.doesNotMatch(overlayEventHelper, /localStorage|fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/);
  assert.doesNotMatch(overlayEventHelper, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
  assert.doesNotMatch(
    overlayEventIntakeHelper,
    /postMessage|BroadcastChannel|localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/
  );
  assert.doesNotMatch(
    overlayEventIntakeHelper,
    /document|window|innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/
  );
  assert.doesNotMatch(
    overlayInternalDispatchHelper,
    /postMessage|BroadcastChannel|localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/
  );
  assert.doesNotMatch(
    overlayInternalDispatchHelper,
    /document|window|innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/
  );
  assert.doesNotMatch(overlayInternalDispatchHelper, /setTimeout|setInterval|while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/);
});

test("editor includes separated manual keyword reaction toast controls", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /id="keywordReactionExperiment"/);
  assert.match(html, /Candidate A 実験/);
  assert.match(html, /キーワード反応オーバーレイ実験/);
  assert.match(html, /人工テキスト入力/);
  assert.match(html, /YouTube連携や実データ取得は行いません。/);
  assert.match(html, /id="keywordReactionManualText"/);
  assert.match(html, /id="keywordReactionKeyword"/);
  assert.match(html, /id="keywordReactionMatchMode"/);
  assert.match(html, /value="contains"/);
  assert.match(html, /value="exact"/);
  assert.match(html, /id="keywordReactionIntensity"/);
  assert.match(html, /value="0"/);
  assert.match(html, /value="1"/);
  assert.match(html, /value="2"/);
  assert.match(html, /value="3"/);
  assert.match(html, /id="keywordReactionStyle"/);
  assert.match(html, /id="testKeywordReaction"/);
  assert.match(html, /id="keywordReactionGeneratedUrl"/);
  assert.match(html, /id="copyKeywordReactionUrl"/);
  assert.match(html, /id="keywordReactionStatus"/);
  assert.match(html, /id="keywordReactionToastText"/);
});

test("editor keyword reaction preview keeps manual input out of generated URLs", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const builder = readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8");
  const configHelper = readFileSync(new URL("../assets/js/keyword-reaction-config.js", import.meta.url), "utf8");

  assert.match(html, /人工テキストは生成URLへ入りません。/);
  assert.match(html, /\/overlay\/keyword-reaction\/\?c=/);
  assert.match(builder, /keywordReactionConfigToUrl/);
  assert.match(builder, /keywordReactionToastText\.textContent/);
  assert.match(configHelper, /function keywordReactionConfigToUrl/);
  assert.doesNotMatch(configHelper, /manualText[^\n]*searchParams|searchParams[^\n]*manualText/);
});

test("editor keyword reaction preview uses normalized config as source of truth", () => {
  const builder = readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8");
  const previewBody =
    builder.match(/function testKeywordReactionPreview\(\) \{(?<body>[\s\S]*?)\n\}\n\nfunction applyKeywordReactionToastConfig/)?.groups
      ?.body ?? "";

  assert.match(previewBody, /const keyword = config\.keyword;/);
  assert.doesNotMatch(previewBody, /elements\.keywordReactionKeyword\.value/);
  assert.match(previewBody, /keywordReactionMatches\(\{\s*manualText,\s*keyword,\s*matchMode:\s*config\.matchMode\s*\}\)/);
  assert.match(previewBody, /keywordReactionKeywordUsedSafeFallback\(config\)/);
  assert.match(builder, /function keywordReactionKeywordUsedSafeFallback\(config\)/);
  assert.match(builder, /キーワードは安全な既定値に戻しました。生成URLには入力テキストは含まれません。/);
  assert.doesNotMatch(previewBody, /keywordReactionStatus\.textContent\s*=\s*elements\.keywordReactionKeyword/);
});

test("editor includes built-in artificial fixture playback controls", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const builder = readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8");

  assert.match(html, /id="keywordReactionFixture"/);
  assert.match(html, /人工fixture再生/);
  assert.match(html, /人工デモデータ/);
  assert.match(html, /YouTube連携ではありません。/);
  assert.match(html, /id="playKeywordReactionFixture"/);
  assert.match(html, /id="stopKeywordReactionFixture"/);
  assert.match(html, /id="resetKeywordReactionFixture"/);
  assert.match(html, /id="keywordReactionFixtureStatus"/);
  assert.match(builder, /keyword-reaction-fixture\.js/);
  assert.match(builder, /getBuiltinKeywordReactionFixture/);
  assert.match(builder, /validateKeywordReactionFixture/);
  assert.match(builder, /buildFixturePlaybackSchedule/);
});

test("editor fixture playback keeps event data out of generated URLs and cleans timers", () => {
  const builder = readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8");
  const fixtureHelper = readFileSync(new URL("../assets/js/keyword-reaction-fixture.js", import.meta.url), "utf8");

  assert.match(builder, /keywordReactionFixtureTimers/);
  assert.match(builder, /setTimeout/);
  assert.match(builder, /clearTimeout/);
  assert.match(builder, /function stopKeywordReactionFixturePlayback/);
  assert.match(builder, /function resetKeywordReactionFixturePlayback/);
  assert.match(builder, /keywordReactionToastText\.textContent\s*=\s*event\.displayText/);
  assert.doesNotMatch(builder, /keywordReactionConfigToUrl\([^)]*fixture/);
  assert.doesNotMatch(builder, /keywordReactionGeneratedUrl\.value\s*=.*displayText/);
  assert.match(fixtureHelper, /fixture event data/);
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
    readFileSync(new URL("../assets/js/builder.js", import.meta.url), "utf8"),
    readFileSync(new URL("../assets/js/keyword-reaction-config.js", import.meta.url), "utf8"),
    readFileSync(new URL("../assets/js/keyword-reaction-fixture.js", import.meta.url), "utf8"),
    readFileSync(new URL("../assets/js/keyword-reaction-event.js", import.meta.url), "utf8"),
    readFileSync(new URL("../assets/js/keyword-reaction-event-intake.js", import.meta.url), "utf8"),
    readFileSync(new URL("../assets/js/keyword-reaction-intake-queue.js", import.meta.url), "utf8"),
    readFileSync(new URL("../assets/js/keyword-reaction-internal-dispatch.js", import.meta.url), "utf8"),
    readFileSync(new URL("../assets/js/keyword-reaction-overlay.js", import.meta.url), "utf8")
  ].join("\n");

  assert.doesNotMatch(changedSources, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
});
