import assert from "node:assert/strict";
import test from "node:test";
import {
  SHARE_HASHTAGS,
  buildShareLines,
  buildShareText,
  buildXIntentUrl,
  canvasFontStack,
  resolveShareText,
  templateDecoration
} from "../assets/js/share.js";
import { normalizeConfig } from "../assets/js/config.js";
import { tokenizeFlip } from "../assets/js/render.js";

const BUILDER_URL = "https://obs-clock-overlay-builder.h8nc4y.workers.dev";

test("buildShareText embeds the builder URL and promo hashtags", () => {
  const text = buildShareText(BUILDER_URL);

  assert.ok(text.includes(BUILDER_URL), "share text should carry the builder URL");
  for (const tag of SHARE_HASHTAGS) {
    assert.ok(text.includes(`#${tag}`), `share text should include #${tag}`);
  }
  // 配信者に刺さる宣伝文脈(無料で作れる)を含む。
  assert.match(text, /無料/);
  assert.match(text, /時計/);
});

test("buildShareText falls back to the production URL when none is given", () => {
  const text = buildShareText("");
  assert.ok(text.includes(BUILDER_URL));
});

test("buildXIntentUrl builds an x.com intent with text, url and hashtags", () => {
  const href = buildXIntentUrl({
    text: "テスト投稿",
    url: BUILDER_URL,
    hashtags: ["OBS", "配信素材"]
  });

  assert.ok(href.startsWith("https://x.com/intent/tweet?"));
  const params = new URL(href).searchParams;
  assert.equal(params.get("text"), "テスト投稿");
  assert.equal(params.get("url"), BUILDER_URL);
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
  const href = buildXIntentUrl({ text: "a&b c", url: BUILDER_URL });
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
  const text = buildShareText(BUILDER_URL);
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
  const occurrences = decoded.split(BUILDER_URL).length - 1;
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
  assert.equal(resolveShareText("", BUILDER_URL), buildShareText(BUILDER_URL));
  assert.equal(resolveShareText("   \n  ", BUILDER_URL), buildShareText(BUILDER_URL));
  assert.equal(resolveShareText(null, BUILDER_URL), buildShareText(BUILDER_URL));
  assert.equal(resolveShareText(undefined, BUILDER_URL), buildShareText(BUILDER_URL));
  // 編集済みはそのまま返す(trim はされない先頭末尾以外は維持)。
  assert.equal(resolveShareText("好きな投稿文", BUILDER_URL), "好きな投稿文");
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
