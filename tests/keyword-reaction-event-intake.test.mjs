import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { keywordReactionConfigToUrl, parseKeywordReactionConfigFromQuery } from "../assets/js/keyword-reaction-config.js";
import {
  DEFAULT_KEYWORD_REACTION_EVENT,
  KEYWORD_REACTION_EVENT_TYPE
} from "../assets/js/keyword-reaction-event.js";
import {
  KEYWORD_REACTION_LOCAL_EVENT_SOURCE_TYPES,
  buildKeywordReactionEventFromLocalInput,
  normalizeKeywordReactionLocalEventInput,
  validateKeywordReactionLocalEventInput
} from "../assets/js/keyword-reaction-event-intake.js";

test("keyword reaction local event intake accepts manual fixture and demo source types only", () => {
  assert.deepEqual(KEYWORD_REACTION_LOCAL_EVENT_SOURCE_TYPES, ["manual", "fixture", "demo"]);
});

test("keyword reaction local event intake normalizes valid manual input without mutating raw input", () => {
  const rawInput = {
    sourceType: "manual",
    eventId: "manual-1",
    displayText: "<img src=x onerror=alert(1)>",
    keyword: "配信開始",
    displayPattern: "toast",
    reactionStyle: "pulse",
    intensity: "2.5",
    durationMs: "3200",
    offsetMs: "120",
    rawTransportPayload: "drop me",
    displayTextArray: ["drop me"]
  };
  const before = structuredClone(rawInput);
  const event = normalizeKeywordReactionLocalEventInput(rawInput);

  assert.deepEqual(rawInput, before);
  assert.deepEqual(Object.keys(event), [
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
  assert.equal(event.eventType, KEYWORD_REACTION_EVENT_TYPE);
  assert.equal(event.sourceType, "manual");
  assert.equal(event.eventId, "manual-1");
  assert.equal(event.displayText, "<img src=x onerror=alert(1)>");
  assert.equal(event.keyword, "配信開始");
  assert.equal(event.reactionStyle, "pulse");
  assert.equal(event.intensity, 2.5);
  assert.equal(event.durationMs, 3200);
  assert.equal(event.offsetMs, 120);
  assert.equal(Object.hasOwn(event, "rawTransportPayload"), false);
  assert.equal(Object.hasOwn(event, "displayTextArray"), false);
});

test("keyword reaction local event intake normalizes valid fixture and demo inputs", () => {
  const fixture = buildKeywordReactionEventFromLocalInput({
    sourceType: "fixture",
    eventId: "fixture-1",
    displayText: "fixture text",
    keyword: "fixture",
    reactionStyle: "soft",
    intensity: 3,
    durationMs: 5000,
    offsetMs: 800
  });
  const demo = normalizeKeywordReactionLocalEventInput({
    sourceType: "demo",
    eventId: "demo-local-1",
    displayText: "demo text",
    keyword: "demo",
    reactionStyle: "spark",
    intensity: 1
  });

  assert.equal(fixture.sourceType, "fixture");
  assert.equal(fixture.eventId, "fixture-1");
  assert.equal(fixture.displayText, "fixture text");
  assert.equal(fixture.offsetMs, 800);
  assert.equal(demo.sourceType, "demo");
  assert.equal(demo.eventId, "demo-local-1");
  assert.equal(demo.displayText, "demo text");
});

test("keyword reaction local event intake rejects unsupported external source types safely", () => {
  const rawInput = {
    sourceType: "youtube",
    eventId: "youtube-live-chat-1",
    displayText: "raw YouTube comment should not pass",
    keyword: "youtube",
    accessToken: "token-like-value"
  };
  const result = validateKeywordReactionLocalEventInput(rawInput);
  const resultText = JSON.stringify(result);

  assert.equal(result.ok, false);
  assert.equal(result.reason, "unsupported-source-type");
  assert.deepEqual(result.event, DEFAULT_KEYWORD_REACTION_EVENT);
  assert.doesNotMatch(resultText, /youtube-live-chat-1/);
  assert.doesNotMatch(resultText, /raw YouTube comment should not pass/);
  assert.doesNotMatch(resultText, /token-like-value/);
});

test("keyword reaction local event intake drops forbidden fields and falls back for secret-like text", () => {
  const fakeSecret = ["sk", "local-intake-secret"].join("-");
  const result = validateKeywordReactionLocalEventInput({
    sourceType: "manual",
    eventId: fakeSecret,
    displayText: fakeSecret,
    keyword: "BEGIN PRIVATE KEY sample",
    apiKey: fakeSecret,
    oauthToken: fakeSecret,
    refreshToken: fakeSecret,
    clientSecret: fakeSecret,
    privateKey: fakeSecret,
    realViewerId: "viewer-123",
    rawYoutubeComment: "raw comment",
    billingInfo: "billing",
    rawJson: { displayText: "raw json" },
    queueState: { current: 1 }
  });
  const resultText = JSON.stringify(result);

  assert.equal(result.ok, true);
  assert.equal(result.reason, "valid");
  assert.equal(result.event.eventId, DEFAULT_KEYWORD_REACTION_EVENT.eventId);
  assert.equal(result.event.displayText, DEFAULT_KEYWORD_REACTION_EVENT.displayText);
  assert.equal(result.event.keyword, DEFAULT_KEYWORD_REACTION_EVENT.keyword);
  assert.equal(Object.hasOwn(result.event, "apiKey"), false);
  assert.equal(Object.hasOwn(result.event, "oauthToken"), false);
  assert.equal(Object.hasOwn(result.event, "rawJson"), false);
  assert.equal(Object.hasOwn(result.event, "queueState"), false);
  assert.doesNotMatch(resultText, /local-intake-secret/);
  assert.doesNotMatch(resultText, /PRIVATE KEY/);
  assert.doesNotMatch(resultText, /viewer-123/);
  assert.doesNotMatch(resultText, /raw comment/);
});

test("keyword reaction local event intake payload is not encoded into generated URLs", () => {
  const event = normalizeKeywordReactionLocalEventInput({
    sourceType: "manual",
    eventId: "manual-url-1",
    displayText: "manual text must stay local",
    keyword: "hello",
    reactionStyle: "pulse",
    intensity: 3,
    durationMs: 3600,
    offsetMs: 50
  });
  const url = keywordReactionConfigToUrl(
    {
      keyword: event.keyword,
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
  assert.doesNotMatch(url, /manual-url-1/);
  assert.doesNotMatch(url, /manual text must stay local/);
});

test("keyword reaction local event intake helper stays pure and avoids transport storage network and unsafe sinks", () => {
  const helper = readFileSync(new URL("../assets/js/keyword-reaction-event-intake.js", import.meta.url), "utf8");

  assert.match(helper, /normalizeKeywordReactionEvent/);
  assert.doesNotMatch(helper, /document|window|HTMLElement|customElements/);
  assert.doesNotMatch(helper, /postMessage|BroadcastChannel|localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(helper, /fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/);
  assert.doesNotMatch(helper, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
  assert.doesNotMatch(helper, /setInterval|while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/);
});
