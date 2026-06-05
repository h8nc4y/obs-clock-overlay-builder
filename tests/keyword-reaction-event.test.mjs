import assert from "node:assert/strict";
import test from "node:test";

import { keywordReactionConfigToUrl, parseKeywordReactionConfigFromQuery } from "../assets/js/keyword-reaction-config.js";
import {
  DEFAULT_KEYWORD_REACTION_EVENT,
  KEYWORD_REACTION_EVENT_LIMITS,
  KEYWORD_REACTION_EVENT_SCHEMA_VERSION,
  KEYWORD_REACTION_EVENT_SOURCE_TYPES,
  KEYWORD_REACTION_EVENT_TYPE,
  buildDemoKeywordReactionEvent,
  normalizeKeywordReactionEvent
} from "../assets/js/keyword-reaction-event.js";

test("default keyword reaction event shape is stable", () => {
  assert.equal(KEYWORD_REACTION_EVENT_SCHEMA_VERSION, 1);
  assert.equal(KEYWORD_REACTION_EVENT_TYPE, "keyword-reaction-event");
  assert.deepEqual(KEYWORD_REACTION_EVENT_SOURCE_TYPES, ["manual", "fixture", "demo"]);
  assert.deepEqual(DEFAULT_KEYWORD_REACTION_EVENT, {
    schemaVersion: 1,
    eventType: "keyword-reaction-event",
    sourceType: "demo",
    eventId: "demo-1",
    displayText: "キーワード反応デモ",
    keyword: "hello",
    displayPattern: "toast",
    reactionStyle: "spark",
    intensity: 1,
    durationMs: 2400,
    offsetMs: 0
  });
});

test("buildDemoKeywordReactionEvent returns fixed artificial text and safe config fields only", () => {
  const encodedLikeText = "manual text should not be used";
  const event = buildDemoKeywordReactionEvent({
    eventId: "manual-raw-id",
    displayText: encodedLikeText,
    keyword: "secret meeting topic",
    reactionStyle: "soft",
    intensity: 2,
    displayPattern: "toast",
    rawConfig: "raw c should not be used"
  });
  const eventText = JSON.stringify(event);

  assert.deepEqual(event, {
    ...DEFAULT_KEYWORD_REACTION_EVENT,
    reactionStyle: "soft",
    intensity: 2
  });
  assert.doesNotMatch(eventText, /manual text should not be used/);
  assert.doesNotMatch(eventText, /secret meeting topic/);
  assert.doesNotMatch(eventText, /raw c should not be used/);
  assert.doesNotMatch(eventText, /manual-raw-id/);
});

test("normalizeKeywordReactionEvent accepts valid manual fixture and demo source shapes", () => {
  const htmlLikeText = "<img src=x onerror=alert(1)>";
  const manual = normalizeKeywordReactionEvent({
    schemaVersion: 1,
    eventType: "keyword-reaction-event",
    sourceType: "manual",
    eventId: "manual-123",
    displayText: htmlLikeText,
    keyword: "配信開始",
    displayPattern: "toast",
    reactionStyle: "pulse",
    intensity: "2.5",
    durationMs: "3200",
    offsetMs: "120",
    rawComment: "drop me",
    displayTextArray: ["drop me"]
  });
  const fixture = normalizeKeywordReactionEvent({
    ...manual,
    sourceType: "fixture",
    eventId: "fixture-1",
    offsetMs: 400
  });
  const demo = normalizeKeywordReactionEvent({
    ...manual,
    sourceType: "demo",
    eventId: "demo-2"
  });

  assert.deepEqual(Object.keys(manual), [
    "schemaVersion",
    "eventType",
    "sourceType",
    "eventId",
    "displayText",
    "keyword",
    "displayPattern",
    "reactionStyle",
    "intensity",
    "durationMs",
    "offsetMs"
  ]);
  assert.equal(manual.displayText, htmlLikeText);
  assert.equal(manual.keyword, "配信開始");
  assert.equal(manual.reactionStyle, "pulse");
  assert.equal(manual.intensity, 2.5);
  assert.equal(manual.durationMs, 3200);
  assert.equal(manual.offsetMs, 120);
  assert.equal("rawComment" in manual, false);
  assert.equal("displayTextArray" in manual, false);
  assert.equal(fixture.sourceType, "fixture");
  assert.equal(fixture.eventId, "fixture-1");
  assert.equal(fixture.offsetMs, 400);
  assert.equal(demo.sourceType, "demo");
  assert.equal(demo.eventId, "demo-2");
});

test("normalizeKeywordReactionEvent falls back safely for unsupported schema event type and source type", () => {
  assert.deepEqual(normalizeKeywordReactionEvent({ schemaVersion: 2, sourceType: "manual" }), DEFAULT_KEYWORD_REACTION_EVENT);
  assert.deepEqual(
    normalizeKeywordReactionEvent({ schemaVersion: 1, eventType: "other-event", sourceType: "manual" }),
    DEFAULT_KEYWORD_REACTION_EVENT
  );
  assert.deepEqual(
    normalizeKeywordReactionEvent({ schemaVersion: 1, eventType: "keyword-reaction-event", sourceType: "youtube" }),
    DEFAULT_KEYWORD_REACTION_EVENT
  );
});

test("normalizeKeywordReactionEvent limits text values and rejects secret-like values without echoing raw input", () => {
  const fakeSecret = ["sk", "event-secret"].join("-");
  const fakePrivateKeyMarker = ["BEGIN", "PRIVATE", "KEY test"].join(" ");
  const normalized = normalizeKeywordReactionEvent({
    schemaVersion: 1,
    eventType: "keyword-reaction-event",
    sourceType: "manual",
    eventId: fakeSecret,
    displayText: fakeSecret,
    keyword: fakePrivateKeyMarker
  });
  const unsafeId = normalizeKeywordReactionEvent({
    schemaVersion: 1,
    eventType: "keyword-reaction-event",
    sourceType: "manual",
    eventId: "<img src=x onerror=alert(1)>",
    displayText: "public text",
    keyword: "hello"
  });
  const long = normalizeKeywordReactionEvent({
    schemaVersion: 1,
    eventType: "keyword-reaction-event",
    sourceType: "fixture",
    eventId: `fixture-${"a".repeat(120)}`,
    displayText: "あ".repeat(200),
    keyword: "k".repeat(120)
  });
  const normalizedText = JSON.stringify(normalized);

  assert.equal(normalized.eventId, DEFAULT_KEYWORD_REACTION_EVENT.eventId);
  assert.equal(normalized.displayText, DEFAULT_KEYWORD_REACTION_EVENT.displayText);
  assert.equal(normalized.keyword, DEFAULT_KEYWORD_REACTION_EVENT.keyword);
  assert.equal(unsafeId.eventId, DEFAULT_KEYWORD_REACTION_EVENT.eventId);
  assert.doesNotMatch(normalizedText, /event-secret/);
  assert.doesNotMatch(normalizedText, /PRIVATE KEY/);
  assert.equal(Array.from(long.eventId).length, KEYWORD_REACTION_EVENT_LIMITS.eventIdLength);
  assert.equal(Array.from(long.displayText).length, KEYWORD_REACTION_EVENT_LIMITS.displayTextLength);
  assert.equal(Array.from(long.keyword).length, KEYWORD_REACTION_EVENT_LIMITS.keywordLength);
});

test("normalizeKeywordReactionEvent clamps bounded numeric fields and toast-only display pattern", () => {
  const low = normalizeKeywordReactionEvent({
    schemaVersion: 1,
    eventType: "keyword-reaction-event",
    sourceType: "manual",
    eventId: "manual-low",
    displayText: "low",
    keyword: "low",
    displayPattern: "ticker",
    reactionStyle: "explode",
    intensity: -10,
    durationMs: -1,
    offsetMs: -100
  });
  const high = normalizeKeywordReactionEvent({
    schemaVersion: 1,
    eventType: "keyword-reaction-event",
    sourceType: "fixture",
    eventId: "fixture-high",
    displayText: "high",
    keyword: "high",
    intensity: 99,
    durationMs: 9999999,
    offsetMs: 9999999
  });

  assert.equal(low.displayPattern, "toast");
  assert.equal(low.reactionStyle, "spark");
  assert.equal(low.intensity, KEYWORD_REACTION_EVENT_LIMITS.intensity[0]);
  assert.equal(low.durationMs, DEFAULT_KEYWORD_REACTION_EVENT.durationMs);
  assert.equal(low.offsetMs, DEFAULT_KEYWORD_REACTION_EVENT.offsetMs);
  assert.equal(high.intensity, KEYWORD_REACTION_EVENT_LIMITS.intensity[1]);
  assert.equal(high.durationMs, KEYWORD_REACTION_EVENT_LIMITS.durationMs[1]);
  assert.equal(high.offsetMs, KEYWORD_REACTION_EVENT_LIMITS.offsetMs[1]);
});

test("event payload is not encoded into generated keyword reaction URLs", () => {
  const event = buildDemoKeywordReactionEvent({ reactionStyle: "pulse", intensity: 3 });
  const url = keywordReactionConfigToUrl(
    {
      keyword: "hello",
      reactionStyle: event.reactionStyle,
      intensity: event.intensity,
      eventId: event.eventId,
      eventType: event.eventType,
      sourceType: event.sourceType,
      displayText: event.displayText,
      durationMs: event.durationMs,
      offsetMs: event.offsetMs
    },
    "https://example.test/"
  );
  const parsed = parseKeywordReactionConfigFromQuery(url);

  assert.equal(parsed.keyword, "hello");
  assert.equal(parsed.reactionStyle, "pulse");
  assert.equal(parsed.intensity, 3);
  assert.equal(Object.hasOwn(parsed, "eventId"), false);
  assert.equal(Object.hasOwn(parsed, "eventType"), false);
  assert.equal(Object.hasOwn(parsed, "sourceType"), false);
  assert.equal(Object.hasOwn(parsed, "displayText"), false);
  assert.equal(Object.hasOwn(parsed, "durationMs"), false);
  assert.equal(Object.hasOwn(parsed, "offsetMs"), false);
  assert.doesNotMatch(url, /キーワード反応デモ/);
});
