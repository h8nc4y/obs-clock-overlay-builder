import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_KEYWORD_REACTION_CONFIG,
  decodeKeywordReactionConfig,
  encodeKeywordReactionConfig,
  normalizeKeywordReactionConfig,
  parseKeywordReactionConfigFromQuery
} from "../assets/js/keyword-reaction-config.js";

test("default keyword reaction config is stable", () => {
  assert.deepEqual(DEFAULT_KEYWORD_REACTION_CONFIG, {
    schemaVersion: 1,
    overlayType: "keyword-reaction",
    displayPattern: "toast",
    reactionStyle: "spark",
    intensity: 1,
    keyword: "hello",
    matchMode: "contains"
  });
});

test("normalize falls back for unsupported schema overlay and enums", () => {
  assert.deepEqual(normalizeKeywordReactionConfig({ schemaVersion: 999, keyword: "future" }), DEFAULT_KEYWORD_REACTION_CONFIG);
  assert.deepEqual(
    normalizeKeywordReactionConfig({ overlayType: "other-overlay", keyword: "other" }),
    DEFAULT_KEYWORD_REACTION_CONFIG
  );

  const normalized = normalizeKeywordReactionConfig({
    displayPattern: "modal",
    reactionStyle: "explode",
    matchMode: "regex"
  });

  assert.equal(normalized.displayPattern, "toast");
  assert.equal(normalized.reactionStyle, "spark");
  assert.equal(normalized.matchMode, "contains");
});

test("future display patterns and reaction styles normalize within declared vocabulary", () => {
  const ticker = normalizeKeywordReactionConfig({
    displayPattern: "ticker",
    reactionStyle: "soft",
    matchMode: "exact"
  });
  const badge = normalizeKeywordReactionConfig({ displayPattern: "badge", reactionStyle: "none" });

  assert.equal(ticker.displayPattern, "ticker");
  assert.equal(ticker.reactionStyle, "soft");
  assert.equal(ticker.matchMode, "exact");
  assert.equal(badge.displayPattern, "badge");
  assert.equal(badge.reactionStyle, "none");
});

test("intensity clamps to safe range", () => {
  assert.equal(normalizeKeywordReactionConfig({ intensity: -10 }).intensity, 0);
  assert.equal(normalizeKeywordReactionConfig({ intensity: 99 }).intensity, 3);
  assert.equal(normalizeKeywordReactionConfig({ intensity: "2.5" }).intensity, 2.5);
  assert.equal(normalizeKeywordReactionConfig({ intensity: Number.NaN }).intensity, 1);
});

test("keyword is trimmed stringified and length limited by code point", () => {
  const normalized = normalizeKeywordReactionConfig({
    keyword: `\n ${"😀".repeat(90)} \t`
  });

  assert.equal(Array.from(normalized.keyword).length, 80);
  assert.equal(normalized.keyword, "😀".repeat(80));
});

test("empty and secret-like keyword values fall back to default", () => {
  const fakeOpenAiLikeValue = ["sk", "live-secret"].join("-");
  const fakePrivateKeyMarker = ["BEGIN", "PRIVATE", "KEY test"].join(" ");

  assert.equal(normalizeKeywordReactionConfig({ keyword: "   " }).keyword, DEFAULT_KEYWORD_REACTION_CONFIG.keyword);
  assert.equal(normalizeKeywordReactionConfig({ keyword: fakeOpenAiLikeValue }).keyword, DEFAULT_KEYWORD_REACTION_CONFIG.keyword);
  assert.equal(
    normalizeKeywordReactionConfig({ keyword: fakePrivateKeyMarker }).keyword,
    DEFAULT_KEYWORD_REACTION_CONFIG.keyword
  );
});

test("includes match mode is normalized to contains", () => {
  assert.equal(normalizeKeywordReactionConfig({ matchMode: "includes" }).matchMode, "contains");
});

test("encode decode round trip preserves normalized config", () => {
  const source = normalizeKeywordReactionConfig({
    displayPattern: "badge",
    reactionStyle: "pulse",
    intensity: 2,
    keyword: "配信中",
    matchMode: "exact"
  });
  const encoded = encodeKeywordReactionConfig(source);

  assert.match(encoded, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeKeywordReactionConfig(encoded), source);
});

test("compact c parameter round trips non-default fields", () => {
  const encoded = encodeKeywordReactionConfig(
    {
      reactionStyle: "soft",
      intensity: 0,
      keyword: "nice",
      matchMode: "exact"
    },
    { compact: true }
  );
  const decoded = decodeKeywordReactionConfig(encoded);

  assert.equal(decoded.displayPattern, "toast");
  assert.equal(decoded.reactionStyle, "soft");
  assert.equal(decoded.intensity, 0);
  assert.equal(decoded.keyword, "nice");
  assert.equal(decoded.matchMode, "exact");
});

test("invalid c parameter falls back to safe default", () => {
  assert.deepEqual(decodeKeywordReactionConfig("not-valid-config"), DEFAULT_KEYWORD_REACTION_CONFIG);
  assert.deepEqual(parseKeywordReactionConfigFromQuery("?c=not-valid-config"), DEFAULT_KEYWORD_REACTION_CONFIG);
});

test("unknown and secret-like fields are dropped from normalized output", () => {
  const normalized = normalizeKeywordReactionConfig({
    keyword: "hello",
    client_secret: "do-not-keep",
    refresh_token: "do-not-keep",
    rawComment: "copied real comment",
    viewerIdentifier: "viewer-123",
    payment: "private"
  });

  assert.deepEqual(Object.keys(normalized), [
    "schemaVersion",
    "overlayType",
    "displayPattern",
    "reactionStyle",
    "intensity",
    "keyword",
    "matchMode"
  ]);
  assert.equal("client_secret" in normalized, false);
  assert.equal("refresh_token" in normalized, false);
  assert.equal("rawComment" in normalized, false);
  assert.equal("viewerIdentifier" in normalized, false);
  assert.equal("payment" in normalized, false);
});

test("parse keyword reaction config from URLSearchParams URL and full URL", () => {
  const encoded = encodeKeywordReactionConfig({ keyword: "overlay", intensity: 3 });

  assert.equal(parseKeywordReactionConfigFromQuery(new URLSearchParams(`c=${encoded}`)).keyword, "overlay");
  assert.equal(parseKeywordReactionConfigFromQuery(new URL(`https://example.com/overlay/keyword-reaction/?c=${encoded}`)).intensity, 3);
  assert.equal(parseKeywordReactionConfigFromQuery(`https://example.com/overlay/keyword-reaction/?c=${encoded}#obs`).keyword, "overlay");
  assert.deepEqual(parseKeywordReactionConfigFromQuery("?keyword=ignored"), DEFAULT_KEYWORD_REACTION_CONFIG);
});
