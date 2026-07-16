import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLIC_BUILDER_URL,
  SHARE_HASHTAGS,
  buildShareLines,
  buildShareText,
  buildXIntentUrl,
  canvasFontStack,
  computeSideLabelLayout,
  computeStackedLayout,
  resolveShareText,
  templateDecoration
} from "../assets/js/share.js";
import { drawShareTime, hasSmallShareSeconds, measureShareTime } from "../assets/js/share-time.js";
import { cssStringLiteral, normalizeConfig } from "../assets/js/config.js";
import { tokenizeFlip } from "../assets/js/render.js";

test("buildShareText embeds the builder URL and promo hashtags", () => {
  const text = buildShareText(PUBLIC_BUILDER_URL);

  assert.ok(text.includes(PUBLIC_BUILDER_URL), "share text should carry the builder URL");
  for (const tag of SHARE_HASHTAGS) {
    assert.ok(text.includes(`#${tag}`), `share text should include #${tag}`);
  }
  // 配信者に刺さる宣伝文脈(無料で作れる)を含む。
  assert.match(text, /無料/);
  assert.match(text, /時計/);
});

test("buildShareText falls back to the canonical public URL when none is given", () => {
  assert.equal(PUBLIC_BUILDER_URL, "https://obs-clock-overlay-builder.h8nc4y.workers.dev");
  const text = buildShareText("");
  assert.ok(text.includes(PUBLIC_BUILDER_URL));
});

test("buildXIntentUrl builds an x.com intent with text, url and hashtags", () => {
  const href = buildXIntentUrl({
    text: "テスト投稿",
    url: PUBLIC_BUILDER_URL,
    hashtags: ["OBS", "配信素材"]
  });

  assert.ok(href.startsWith("https://x.com/intent/tweet?"));
  const params = new URL(href).searchParams;
  assert.equal(params.get("text"), "テスト投稿");
  assert.equal(params.get("url"), PUBLIC_BUILDER_URL);
  assert.equal(params.get("hashtags"), "OBS,配信素材");
});

test("buildXIntentUrl accepts a comma string for hashtags and strips leading #", () => {
  const href = buildXIntentUrl({ text: "x", hashtags: "#OBS, #配信素材 ,VTuber" });
  const params = new URL(href).searchParams;
  assert.equal(params.get("hashtags"), "OBS,配信素材,VTuber");
});

test("buildXIntentUrl dedupes hashtags and drops blanks", () => {
  const href = buildXIntentUrl({ text: "x", hashtags: ["OBS", "OBS", "", "  ", "VTuber"] });
  const params = new URL(href).searchParams;
  assert.equal(params.get("hashtags"), "OBS,VTuber");
});

test("buildXIntentUrl omits empty params instead of sending blanks", () => {
  const href = buildXIntentUrl({});
  const params = new URL(href).searchParams;
  assert.equal(params.get("text"), null);
  assert.equal(params.get("url"), null);
  assert.equal(params.get("hashtags"), null);
});

test("buildXIntentUrl percent-encodes the text so the link stays valid", () => {
  const href = buildXIntentUrl({ text: "a&b c", url: PUBLIC_BUILDER_URL });
  // & や空白がそのまま出るとリンクが壊れる。エンコードされていること。
  assert.ok(!href.includes("a&b c"));
  assert.equal(new URL(href).searchParams.get("text"), "a&b c");
});

test("canvasFontStack quotes the family and neutralizes breakout characters", () => {
  assert.equal(canvasFontStack("Roboto Mono"), '"Roboto Mono", system-ui, sans-serif');
  // 引用符やセミコロンを font プロパティへ持ち込ませない。
  assert.equal(canvasFontStack('a";b'), '"a  b", system-ui, sans-serif');
  assert.equal(canvasFontStack(""), '"system-ui", system-ui, sans-serif');
});

test("canvasFontStack slices to 80 chars and removes newlines", () => {
  // 81文字以上は引用符の中で80文字に丸める(font プロパティが暴れないように)。
  const long = "a".repeat(120);
  assert.equal(canvasFontStack(long), `"${"a".repeat(80)}", system-ui, sans-serif`);
  // 改行は空白へ置換され、家族名が複数行に割れない。
  assert.equal(canvasFontStack("a\nb"), '"a b", system-ui, sans-serif');
});

test("font sanitizers keep the same hostile family safe for CSS and Canvas", () => {
  const hostile = 'Bad"; color:red;\\evil\nFont😀';

  const cssLiteral = cssStringLiteral(hostile);
  assert.equal(cssLiteral.includes("\n"), false);
  assert.equal(JSON.parse(cssLiteral), 'Bad"; color:red;\\evil Font😀');

  const canvasStack = canvasFontStack(hostile);
  const canvasFamily = canvasStack.replace(/^"/, "").replace(/", system-ui, sans-serif$/, "");
  assert.equal(canvasStack.endsWith('", system-ui, sans-serif'), true);
  assert.equal(canvasFamily.includes('"'), false);
  assert.equal(canvasFamily.includes(";"), false);
  assert.equal(canvasFamily.includes("\\"), false);
  assert.equal(canvasFamily.includes("\n"), false);
  assert.match(canvasFamily, /Bad\s+color:red\s+evil\s+Font😀/);
});

function createTextCtx(widths = {}) {
  const calls = [];
  return {
    calls,
    font: "",
    textAlign: "center",
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    shadowColor: "",
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    measureText(text) {
      calls.push({ type: "measureText", text, font: this.font });
      return { width: widths[text] ?? String(text).length * 10 };
    },
    fillText(text, x, y) {
      calls.push({ type: "fillText", text, x, y, font: this.font, align: this.textAlign });
    },
    strokeText(text, x, y) {
      calls.push({
        type: "strokeText",
        text,
        x,
        y,
        font: this.font,
        align: this.textAlign,
        lineWidth: this.lineWidth
      });
    }
  };
}

const shareTimeFormatted = {
  time: "12:34:56",
  timeMain: "12:34",
  timeDigitsMain: "12:34",
  meridiemText: "",
  secondsText: "56"
};

test("hasSmallShareSeconds only enables the split seconds path when seconds are visible", () => {
  const enabled = normalizeConfig({ showSeconds: true, smallSeconds: true });

  assert.equal(hasSmallShareSeconds(enabled, shareTimeFormatted), true);
  assert.equal(hasSmallShareSeconds(normalizeConfig({ showSeconds: false, smallSeconds: true }), shareTimeFormatted), false);
  assert.equal(hasSmallShareSeconds(normalizeConfig({ showSeconds: true, smallSeconds: false }), shareTimeFormatted), false);
  assert.equal(hasSmallShareSeconds(enabled, { ...shareTimeFormatted, secondsText: "" }), false);
});

test("measureShareTime mirrors live small-seconds width constants", () => {
  const config = normalizeConfig({ showSeconds: true, smallSeconds: true, fontWeight: 700 });
  const ctx = createTextCtx({ "12:34": 250, "56": 40, "12:34:56": 330 });

  assert.equal(measureShareTime(ctx, config, shareTimeFormatted, 100, '"Roboto Mono", monospace'), 294);
  assert.deepEqual(
    ctx.calls.filter((call) => call.type === "measureText").map((call) => ({ text: call.text, font: call.font })),
    [
      { text: "12:34", font: '700 100px "Roboto Mono", monospace' },
      { text: "56", font: '700 50px "Roboto Mono", monospace' }
    ]
  );

  const fullCtx = createTextCtx({ "12:34:56": 330 });
  const fullConfig = normalizeConfig({ showSeconds: true, smallSeconds: false, fontWeight: 700 });
  assert.equal(measureShareTime(fullCtx, fullConfig, shareTimeFormatted, 100, '"Roboto Mono", monospace'), 330);
});

test("measureShareTime adds a meridiem segment sized by meridiemSize with 0.12em gap, leading or trailing", () => {
  const px = 100;
  const trailingFormatted = { ...shareTimeFormatted, secondsText: "", meridiemText: "AM" };
  const fontStack = '"Roboto Mono", monospace';

  const trailingConfig = normalizeConfig({ hour12: true, meridiemFirst: false, meridiemSize: 0.5, fontWeight: 700 });
  const trailingCtx = createTextCtx({ "12:34": 250, AM: 60 });
  const trailingWidth = measureShareTime(trailingCtx, trailingConfig, trailingFormatted, px, fontStack);
  assert.equal(trailingWidth, 250 + px * 0.12 + 60);
  assert.deepEqual(
    trailingCtx.calls.filter((call) => call.type === "measureText").map((call) => ({ text: call.text, font: call.font })),
    [
      { text: "12:34", font: '700 100px "Roboto Mono", monospace' },
      { text: "AM", font: '700 50px "Roboto Mono", monospace' }
    ]
  );

  const leadingConfig = normalizeConfig({ hour12: true, meridiemFirst: true, meridiemSize: 0.5, fontWeight: 700 });
  const leadingCtx = createTextCtx({ "12:34": 250, AM: 60 });
  const leadingWidth = measureShareTime(leadingCtx, leadingConfig, trailingFormatted, px, fontStack);
  assert.equal(leadingWidth, 60 + px * 0.12 + 250);
  assert.deepEqual(
    leadingCtx.calls.filter((call) => call.type === "measureText").map((call) => call.text),
    ["AM", "12:34"]
  );
});

test("measureShareTime combines a leading meridiem with trailing small seconds", () => {
  const config = normalizeConfig({
    hour12: true,
    meridiemFirst: true,
    showSeconds: true,
    smallSeconds: true,
    meridiemSize: 0.5,
    fontWeight: 700
  });
  const formatted = { ...shareTimeFormatted, meridiemText: "PM", secondsText: "56" };
  const ctx = createTextCtx({ "12:34": 250, "56": 40, PM: 60 });

  const width = measureShareTime(ctx, config, formatted, 100, '"Roboto Mono", monospace');
  assert.equal(width, 60 + 100 * 0.12 + 250 + 100 * 0.04 + 40);
  assert.deepEqual(
    ctx.calls.filter((call) => call.type === "measureText").map((call) => call.text),
    ["PM", "12:34", "56"]
  );
});

test("drawShareTime baseline-aligns centered small seconds as a half-size slot", () => {
  // 小秒の契約を CSS の `vertical-align: baseline` に合わせ、共有Canvasでも分と秒の底辺をそろえる。
  const config = normalizeConfig({
    showSeconds: true,
    smallSeconds: true,
    fontWeight: 700,
    strokeWidth: 4,
    textColor: "#ffffff",
    strokeColor: "#101828"
  });
  const ctx = createTextCtx({ "12:34": 250, "56": 40 });

  drawShareTime(ctx, config, shareTimeFormatted, {
    x: 500,
    y: 200,
    px: 100,
    fontStack: '"Roboto Mono", monospace',
    align: "center",
    strokeScale: 2
  });

  assert.equal(ctx.textAlign, "center", "textAlign should be restored after left-aligned segment drawing");
  assert.deepEqual(
    ctx.calls.filter((call) => call.type === "fillText"),
    [
      { type: "fillText", text: "12:34", x: 353, y: 200, font: '700 100px "Roboto Mono", monospace', align: "left" },
      { type: "fillText", text: "56", x: 607, y: 200, font: '700 50px "Roboto Mono", monospace', align: "left" }
    ]
  );
  assert.deepEqual(
    ctx.calls.filter((call) => call.type === "strokeText").map((call) => ({
      text: call.text,
      x: call.x,
      y: call.y,
      font: call.font,
      lineWidth: call.lineWidth
    })),
    [
      { text: "12:34", x: 353, y: 200, font: '700 100px "Roboto Mono", monospace', lineWidth: 8 },
      { text: "56", x: 607, y: 200, font: '700 50px "Roboto Mono", monospace', lineWidth: 4 }
    ]
  );
});

test("drawShareTime places a trailing meridiem after the digits with a 0.12em gap", () => {
  const config = normalizeConfig({ hour12: true, meridiemFirst: false, meridiemSize: 0.5, fontWeight: 700 });
  const formatted = { ...shareTimeFormatted, secondsText: "", meridiemText: "PM" };
  const ctx = createTextCtx({ "12:34": 250, PM: 60 });

  drawShareTime(ctx, config, formatted, {
    x: 500,
    y: 200,
    px: 100,
    fontStack: '"Roboto Mono", monospace',
    align: "center",
    strokeScale: 1
  });

  const totalWidth = 250 + 100 * 0.12 + 60;
  const left = 500 - totalWidth / 2;
  assert.deepEqual(
    ctx.calls.filter((call) => call.type === "fillText"),
    [
      { type: "fillText", text: "12:34", x: left, y: 200, font: '700 100px "Roboto Mono", monospace', align: "left" },
      {
        type: "fillText",
        text: "PM",
        x: left + 250 + 100 * 0.12,
        y: 200,
        font: '700 50px "Roboto Mono", monospace',
        align: "left"
      }
    ]
  );
});

test("drawShareTime places a leading meridiem before the digits with a 0.12em gap", () => {
  const config = normalizeConfig({ hour12: true, meridiemFirst: true, meridiemSize: 0.5, fontWeight: 700 });
  const formatted = { ...shareTimeFormatted, secondsText: "", meridiemText: "AM" };
  const ctx = createTextCtx({ "12:34": 250, AM: 60 });

  drawShareTime(ctx, config, formatted, {
    x: 500,
    y: 200,
    px: 100,
    fontStack: '"Roboto Mono", monospace',
    align: "center",
    strokeScale: 1
  });

  const totalWidth = 60 + 100 * 0.12 + 250;
  const left = 500 - totalWidth / 2;
  assert.deepEqual(
    ctx.calls.filter((call) => call.type === "fillText"),
    [
      { type: "fillText", text: "AM", x: left, y: 200, font: '700 50px "Roboto Mono", monospace', align: "left" },
      {
        type: "fillText",
        text: "12:34",
        x: left + 60 + 100 * 0.12,
        y: 200,
        font: '700 100px "Roboto Mono", monospace',
        align: "left"
      }
    ]
  );
});

test("drawShareTime combines a leading meridiem with trailing small seconds in one pass", () => {
  const config = normalizeConfig({
    hour12: true,
    meridiemFirst: true,
    showSeconds: true,
    smallSeconds: true,
    meridiemSize: 0.5,
    fontWeight: 700
  });
  const formatted = { ...shareTimeFormatted, meridiemText: "PM", secondsText: "56" };
  const ctx = createTextCtx({ "12:34": 250, "56": 40, PM: 60 });

  drawShareTime(ctx, config, formatted, {
    x: 500,
    y: 200,
    px: 100,
    fontStack: '"Roboto Mono", monospace',
    align: "center",
    strokeScale: 1
  });

  const totalWidth = 60 + 100 * 0.12 + 250 + 100 * 0.04 + 40;
  const left = 500 - totalWidth / 2;
  assert.deepEqual(
    ctx.calls.filter((call) => call.type === "fillText").map((call) => call.text),
    ["PM", "12:34", "56"]
  );
  assert.deepEqual(
    ctx.calls.filter((call) => call.type === "fillText").map((call) => call.x),
    [left, left + 60 + 100 * 0.12, left + 60 + 100 * 0.12 + 250 + 100 * 0.04]
  );
});

// 装飾なしテンプレ(影のみ)はすべての装飾フィールドが null。
const EMPTY_DECORATION = {
  timeUnderline: null,
  badge: null,
  brackets: null,
  motif: null,
  topBar: null
};

test("templateDecoration draws a red underline and filled LIVE badge with dot for studio-live", () => {
  assert.deepEqual(templateDecoration("studio-live"), {
    timeUnderline: { color: "#ff3b5c", px: 3 },
    badge: { mode: "fill", fill: "#ff3b5c", ink: "#ffffff", dot: true },
    brackets: null,
    motif: null,
    topBar: null
  });
});

test("templateDecoration draws a cyan underline and outline badge (no dot) for night-studio", () => {
  assert.deepEqual(templateDecoration("night-studio"), {
    timeUnderline: { color: "#5fd0e0", px: 2 },
    badge: { mode: "outline", dot: false },
    brackets: null,
    motif: null,
    topBar: null
  });
});

test("templateDecoration draws corner brackets (not an underline) for neon-hud", () => {
  assert.deepEqual(templateDecoration("neon-hud"), {
    timeUnderline: null,
    badge: null,
    brackets: { color: "#48ffe2", px: 2 },
    motif: null,
    topBar: null
  });
});

test("templateDecoration draws a bubbles motif (not an underline) for soda", () => {
  assert.deepEqual(templateDecoration("soda"), {
    timeUnderline: null,
    badge: null,
    brackets: null,
    motif: { kind: "bubbles" },
    topBar: null
  });
});

test("templateDecoration draws a three-color dots motif for pastel-pop", () => {
  assert.deepEqual(templateDecoration("pastel-pop"), {
    timeUnderline: null,
    badge: null,
    brackets: null,
    motif: { kind: "dots" },
    topBar: null
  });
});

test("templateDecoration draws a sakura motif for sakura", () => {
  assert.deepEqual(templateDecoration("sakura"), {
    timeUnderline: null,
    badge: null,
    brackets: null,
    motif: { kind: "sakura" },
    topBar: null
  });
});

test("templateDecoration draws a top gradient bar and aqua filled badge (no dot) for aqua-deck", () => {
  assert.deepEqual(templateDecoration("aqua-deck"), {
    timeUnderline: null,
    badge: { mode: "fill", fill: "#aedded", ink: "#1b3a45", dot: false },
    brackets: null,
    motif: null,
    topBar: { from: "#aedded", to: "#5fd0e0", px: 4 }
  });
});

test("templateDecoration returns empty decoration data for plain digital templates", () => {
  for (const id of ["mono-compact", "minimal-clear", "milk-tea"]) {
    assert.deepEqual(templateDecoration(id), EMPTY_DECORATION, `${id} should have no decoration`);
  }
});

test("templateDecoration returns empty decoration data for unknown templates", () => {
  assert.deepEqual(templateDecoration("unknown-template"), EMPTY_DECORATION);
  assert.deepEqual(templateDecoration(""), EMPTY_DECORATION);
  assert.deepEqual(templateDecoration(undefined), EMPTY_DECORATION);
});

// 回帰: 既定の投稿文から intent を組むと、本文に URL/ハッシュタグが既に入っているので
// url= / hashtags= を付けてはいけない(付けると X が本文末へ二重追記し、URL/タグが重複する)。
test("buildXIntentUrl from the default share text carries the URL exactly once and no duplicate params", () => {
  const text = buildShareText(PUBLIC_BUILDER_URL);
  const href = buildXIntentUrl({ text });
  const params = new URL(href).searchParams;

  // intent には text だけ。url= / hashtags= は付かない。
  assert.equal(params.get("url"), null);
  assert.equal(params.get("hashtags"), null);
  assert.equal([...params.keys()].length, 1);
  assert.ok(!href.includes("&url="));
  assert.ok(!href.includes("&hashtags="));

  // 本文(デコード済み)にビルダーURLがちょうど1回だけ含まれる。
  const decoded = params.get("text");
  const occurrences = decoded.split(PUBLIC_BUILDER_URL).length - 1;
  assert.equal(occurrences, 1, "builder URL should appear exactly once in the tweet body");
  // ハッシュタグも本文側に1組だけ。
  for (const tag of SHARE_HASHTAGS) {
    assert.equal(decoded.split(`#${tag}`).length - 1, 1, `#${tag} should appear exactly once`);
  }
});

test("normalizeHashtags (via buildXIntentUrl) strips leading #, inner whitespace and newlines", () => {
  // 先頭の連続 # を落とす。
  assert.equal(
    new URL(buildXIntentUrl({ text: "x", hashtags: "##OBS" })).searchParams.get("hashtags"),
    "OBS"
  );
  // 内部の空白・改行はタグから除く。
  assert.equal(
    new URL(buildXIntentUrl({ text: "x", hashtags: "O\nB S" })).searchParams.get("hashtags"),
    "OBS"
  );
  // カンマ区切り文字列も各要素を正規化する。
  assert.equal(
    new URL(buildXIntentUrl({ text: "x", hashtags: "#a,##b, c d" })).searchParams.get("hashtags"),
    "a,b,cd"
  );
});

test("resolveShareText returns the edited text or falls back to the default", () => {
  // 空・空白のみは既定文へフォールバック。
  assert.equal(resolveShareText("", PUBLIC_BUILDER_URL), buildShareText(PUBLIC_BUILDER_URL));
  assert.equal(resolveShareText("   \n  ", PUBLIC_BUILDER_URL), buildShareText(PUBLIC_BUILDER_URL));
  assert.equal(resolveShareText(null, PUBLIC_BUILDER_URL), buildShareText(PUBLIC_BUILDER_URL));
  assert.equal(resolveShareText(undefined, PUBLIC_BUILDER_URL), buildShareText(PUBLIC_BUILDER_URL));
  // 編集済みはそのまま返す(trim はされない先頭末尾以外は維持)。
  assert.equal(resolveShareText("好きな投稿文", PUBLIC_BUILDER_URL), "好きな投稿文");
});

test("tokenizeFlip keeps each digit as a card in single grouping", () => {
  assert.deepEqual(tokenizeFlip("12:34:56", "single"), [
    { digit: true, value: "1" },
    { digit: true, value: "2" },
    { digit: false, value: ":" },
    { digit: true, value: "3" },
    { digit: true, value: "4" },
    { digit: false, value: ":" },
    { digit: true, value: "5" },
    { digit: true, value: "6" }
  ]);
});

test("tokenizeFlip groups continuous digit runs into pair cards", () => {
  assert.deepEqual(tokenizeFlip("12:34:56", "pair"), [
    { digit: true, value: "12" },
    { digit: false, value: ":" },
    { digit: true, value: "34" },
    { digit: false, value: ":" },
    { digit: true, value: "56" }
  ]);
  assert.deepEqual(tokenizeFlip("09:05", "pair"), [
    { digit: true, value: "09" },
    { digit: false, value: ":" },
    { digit: true, value: "05" }
  ]);
});

test("tokenizeFlip treats every non-digit as a grouping boundary", () => {
  assert.deepEqual(tokenizeFlip("12:34 PM", "pair"), [
    { digit: true, value: "12" },
    { digit: false, value: ":" },
    { digit: true, value: "34" },
    { digit: false, value: " " },
    { digit: false, value: "P" },
    { digit: false, value: "M" }
  ]);
});

const formattedShareClock = {
  time: "12:34",
  date: "2026/06/14",
  weekday: "日"
};

function shareLineSummary(lines) {
  return lines.map((line) => ({
    text: line.text,
    size: line.size,
    isTime: line.isTime === true
  }));
}

test("buildShareLines places top and left labels above the date and time", () => {
  for (const labelPosition of ["top", "left"]) {
    const config = normalizeConfig({
      label: "LIVE",
      labelPosition,
      showDate: true,
      showWeekday: true,
      fontSize: 42,
      dateSize: 14,
      labelSize: 12
    });

    assert.deepEqual(shareLineSummary(buildShareLines(config, formattedShareClock)), [
      { text: "LIVE", size: 12, isTime: false },
      { text: "2026/06/14  日", size: 14, isTime: false },
      { text: "12:34", size: 42, isTime: true }
    ]);
  }
});

test("buildShareLines places bottom and right labels below the time", () => {
  for (const labelPosition of ["bottom", "right"]) {
    const config = normalizeConfig({
      label: "LIVE",
      labelPosition,
      showDate: true,
      showWeekday: false,
      fontSize: 42,
      dateSize: 14,
      labelSize: 12
    });

    assert.deepEqual(shareLineSummary(buildShareLines(config, formattedShareClock)), [
      { text: "2026/06/14", size: 14, isTime: false },
      { text: "12:34", size: 42, isTime: true },
      { text: "LIVE", size: 12, isTime: false }
    ]);
  }
});

test("buildShareLines hides labels and omits date or weekday lines when disabled", () => {
  const hiddenLabel = normalizeConfig({
    label: "LIVE",
    labelPosition: "hidden",
    showDate: true,
    showWeekday: true,
    fontSize: 42,
    dateSize: 14,
    labelSize: 12
  });
  assert.deepEqual(shareLineSummary(buildShareLines(hiddenLabel, formattedShareClock)), [
    { text: "2026/06/14  日", size: 14, isTime: false },
    { text: "12:34", size: 42, isTime: true }
  ]);

  const noDateOrWeekday = normalizeConfig({
    label: "LIVE",
    labelPosition: "top",
    showDate: false,
    showWeekday: false,
    fontSize: 42,
    dateSize: 14,
    labelSize: 12
  });
  assert.deepEqual(shareLineSummary(buildShareLines(noDateOrWeekday, formattedShareClock)), [
    { text: "LIVE", size: 12, isTime: false },
    { text: "12:34", size: 42, isTime: true }
  ]);

  const weekdayOnly = normalizeConfig({
    label: "",
    labelPosition: "top",
    showDate: false,
    showWeekday: true,
    fontSize: 42,
    dateSize: 14,
    labelSize: 12
  });
  assert.deepEqual(shareLineSummary(buildShareLines(weekdayOnly, formattedShareClock)), [
    { text: "日", size: 14, isTime: false },
    { text: "12:34", size: 42, isTime: true }
  ]);
});

// 共有カードの left/right(横並び)レイアウト。ライブ(clock.css)では label が
// main(日付+時刻)ブロックの真横・縦中央に並ぶ。computeSideLabelLayout が main とラベルを
// 横に並べ、グループをステージ中央へ置くことを座標で確かめる。
// stage は SHARE_IMAGE と同じ前提(幅1200・カードは内側)で代表値を使う。
const SIDE_LABEL_INPUT = {
  mainW: 300,
  mainH: 120,
  labelW: 60,
  labelH: 30,
  widgetGap: 14,
  mainGap: 8,
  padX: 80,
  padY: 50,
  maxW: 1120,
  maxH: 595,
  stageCx: 600,
  stageCy: 340
};

test("computeStackedLayout returns unscaled centered panel values when content fits", () => {
  const layout = computeStackedLayout({
    lineSizesPx: [32, 100],
    panelContentWidth: 420,
    padX: 60,
    padY: 40,
    gap: 12,
    maxW: 1000,
    maxH: 600,
    stageCx: 600,
    stageCy: 340
  });

  assert.equal(layout.fit, 1);
  assert.equal(layout.fitGap, 12);
  assert.equal(layout.fitPadY, 40);
  assert.equal(layout.panelW, 540);
  assert.equal(layout.panelH, 224);
  assert.equal(layout.panelX, 330);
  assert.equal(layout.panelY, 228);
});

test("computeStackedLayout scales vertical dimensions when the stacked group is too tall", () => {
  const layout = computeStackedLayout({
    lineSizesPx: [240, 200],
    panelContentWidth: 300,
    padX: 40,
    padY: 50,
    gap: 20,
    maxW: 1000,
    maxH: 280,
    stageCx: 600,
    stageCy: 340
  });

  assert.equal(layout.fit, 0.5);
  assert.equal(layout.fitGap, 10);
  assert.equal(layout.fitPadY, 25);
  assert.equal(layout.panelW, 380);
  assert.equal(layout.panelH, 280);
  assert.equal(layout.panelX, 410);
  assert.equal(layout.panelY, 200);
});

test("computeStackedLayout clamps panel width without changing the vertical fit", () => {
  const layout = computeStackedLayout({
    lineSizesPx: [40, 120],
    panelContentWidth: 1200,
    padX: 80,
    padY: 40,
    gap: 12,
    maxW: 800,
    maxH: 600,
    stageCx: 600,
    stageCy: 340
  });

  assert.equal(layout.fit, 1);
  assert.equal(layout.panelW, 800);
  assert.equal(layout.panelH, 252);
  assert.equal(layout.panelX, 200);
  assert.equal(layout.panelY, 214);
});

test("computeSideLabelLayout (right) places the label to the right of the main block, both vertically centered", () => {
  const layout = computeSideLabelLayout({ ...SIDE_LABEL_INPUT, isLeft: false });

  // 縦は余裕があるので縮小しない。
  assert.equal(layout.fit, 1);
  // グループ幅 = main + gap + label。左端はステージ中央を基準に対称配置。
  const groupW = SIDE_LABEL_INPUT.mainW + SIDE_LABEL_INPUT.widgetGap + SIDE_LABEL_INPUT.labelW;
  assert.equal(layout.groupLeft, SIDE_LABEL_INPUT.stageCx - groupW / 2);
  // right: main が左端から始まり、ラベルは main の右(main幅 + gap の先)に中心を置く。
  assert.equal(layout.mainLeft, layout.groupLeft);
  assert.equal(
    layout.labelCx,
    layout.groupLeft + SIDE_LABEL_INPUT.mainW + SIDE_LABEL_INPUT.widgetGap + SIDE_LABEL_INPUT.labelW / 2
  );
  // ラベルは main より右にある(=時刻の右隣)。
  assert.ok(layout.labelCx > layout.mainLeft + SIDE_LABEL_INPUT.mainW);
  // main もラベルも同じ縦中央(=ステージ中央)。これがライブの align-items:center の再現。
  assert.equal(layout.centerY, SIDE_LABEL_INPUT.stageCy);
  // パネルはグループ+左右パディングで、ステージ中央に置かれる。
  assert.equal(layout.panel.w, groupW + SIDE_LABEL_INPUT.padX * 2);
  assert.equal(layout.panel.x, SIDE_LABEL_INPUT.stageCx - layout.panel.w / 2);
  assert.equal(layout.panel.h, SIDE_LABEL_INPUT.mainH + SIDE_LABEL_INPUT.padY * 2);
});

test("computeSideLabelLayout (left) places the label to the left of the main block", () => {
  const layout = computeSideLabelLayout({ ...SIDE_LABEL_INPUT, isLeft: true });

  // left: ラベルが先頭(グループ左端に中心)、main はその右(ラベル幅 + gap の先)。
  assert.equal(layout.labelCx, layout.groupLeft + SIDE_LABEL_INPUT.labelW / 2);
  assert.equal(layout.mainLeft, layout.groupLeft + SIDE_LABEL_INPUT.labelW + SIDE_LABEL_INPUT.widgetGap);
  // ラベルは main より左にある。
  assert.ok(layout.labelCx < layout.mainLeft);
  // 縦中央は right と同じ。
  assert.equal(layout.centerY, SIDE_LABEL_INPUT.stageCy);
});

test("computeSideLabelLayout shrinks every dimension by fit when the group is too tall", () => {
  // main を上限より高くして fit<1 を強制する。
  const tall = { ...SIDE_LABEL_INPUT, mainH: 700, isLeft: false };
  const layout = computeSideLabelLayout(tall);

  const fullHeight = tall.mainH + tall.padY * 2;
  const expectedFit = tall.maxH / fullHeight;
  assert.ok(Math.abs(layout.fit - expectedFit) < 1e-9);
  assert.ok(layout.fit < 1);
  // パネル高さは収まり係数を掛けて上限内へ収まる。
  assert.ok(Math.abs(layout.panel.h - fullHeight * expectedFit) < 1e-9);
  assert.ok(layout.panel.h <= tall.maxH + 1e-9);
  // 行間も fit 適用済みで返る(描画側がそのまま積めるように)。
  assert.ok(Math.abs(layout.fitMainGap - tall.mainGap * expectedFit) < 1e-9);
});

test("computeSideLabelLayout clamps panel width to maxW and applies an independent horizontal fit", () => {
  // group がとても広く padding 込みで maxW を超えるケース。幅はクランプされ、横方向だけ hfit が効く。
  const wide = { ...SIDE_LABEL_INPUT, mainW: 1100, labelW: 200, isLeft: false };
  const layout = computeSideLabelLayout(wide);

  assert.equal(layout.fit, 1); // 縦は収まるので字は縮めない。
  assert.ok(layout.hfit < 1);
  assert.equal(layout.panel.w, wide.maxW); // 幅だけ上限でクランプ。
});

test("computeSideLabelLayout keeps a huge right label inside the clamped panel", () => {
  const wide = { ...SIDE_LABEL_INPUT, mainW: 120, labelW: 1600, widgetGap: 60, isLeft: false };
  const layout = computeSideLabelLayout(wide);
  const minX = layout.panel.x + wide.padX;
  const maxX = layout.panel.x + layout.panel.w - wide.padX;
  const fittedMainW = wide.mainW * layout.fit * layout.hfit;
  const fittedLabelW = wide.labelW * layout.fit * layout.hfit;

  assert.ok(layout.mainLeft >= minX - 1e-9);
  assert.ok(layout.mainLeft + fittedMainW <= maxX + 1e-9);
  assert.ok(layout.labelCx - fittedLabelW / 2 >= minX - 1e-9);
  assert.ok(layout.labelCx + fittedLabelW / 2 <= maxX + 1e-9);
});

test("computeSideLabelLayout keeps a huge left label inside the clamped panel", () => {
  const wide = { ...SIDE_LABEL_INPUT, mainW: 120, labelW: 1600, widgetGap: 60, isLeft: true };
  const layout = computeSideLabelLayout(wide);
  const minX = layout.panel.x + wide.padX;
  const maxX = layout.panel.x + layout.panel.w - wide.padX;
  const fittedMainW = wide.mainW * layout.fit * layout.hfit;
  const fittedLabelW = wide.labelW * layout.fit * layout.hfit;

  assert.ok(layout.labelCx - fittedLabelW / 2 >= minX - 1e-9);
  assert.ok(layout.labelCx + fittedLabelW / 2 <= maxX + 1e-9);
  assert.ok(layout.mainLeft >= minX - 1e-9);
  assert.ok(layout.mainLeft + fittedMainW <= maxX + 1e-9);
});
