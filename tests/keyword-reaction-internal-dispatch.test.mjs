import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { keywordReactionConfigToUrl, parseKeywordReactionConfigFromQuery } from "../assets/js/keyword-reaction-config.js";
import {
  DEFAULT_KEYWORD_REACTION_EVENT,
  KEYWORD_REACTION_EVENT_TYPE
} from "../assets/js/keyword-reaction-event.js";
import {
  KEYWORD_REACTION_INTERNAL_EVENT_NAME,
  createKeywordReactionInternalEvent,
  dispatchKeywordReactionInternalEvent,
  getKeywordReactionInternalEventDetail,
  normalizeKeywordReactionInternalDispatchTarget,
  subscribeKeywordReactionInternalEvents
} from "../assets/js/keyword-reaction-internal-dispatch.js";

test("keyword reaction internal dispatch emits normalized manual event detail only", () => {
  const target = new EventTarget();
  const received = [];
  target.addEventListener(KEYWORD_REACTION_INTERNAL_EVENT_NAME, (event) => {
    received.push(event.detail);
  });
  const rawInput = {
    sourceType: "manual",
    eventId: "manual-internal-1",
    displayText: "<img src=x onerror=alert(1)>",
    keyword: "配信開始",
    displayPattern: "toast",
    reactionStyle: "pulse",
    intensity: "2.5",
    durationMs: "3200",
    offsetMs: "120",
    transportPayload: { raw: "drop me" },
    queueState: { current: 1 },
    rawJson: { displayText: "drop me" }
  };
  const before = structuredClone(rawInput);
  const result = dispatchKeywordReactionInternalEvent(target, rawInput);

  assert.deepEqual(rawInput, before);
  assert.equal(result.ok, true);
  assert.equal(result.reason, "dispatched");
  assert.equal(result.dispatched, true);
  assert.equal(received.length, 1);
  assert.deepEqual(received[0], {
    schemaVersion: 1,
    eventType: KEYWORD_REACTION_EVENT_TYPE,
    sourceType: "manual",
    eventId: "manual-internal-1",
    displayText: "<img src=x onerror=alert(1)>",
    keyword: "配信開始",
    displayPattern: "toast",
    reactionStyle: "pulse",
    intensity: 2.5,
    durationMs: 3200,
    offsetMs: 120
  });
  assert.equal(Object.hasOwn(received[0], "transportPayload"), false);
  assert.equal(Object.hasOwn(received[0], "queueState"), false);
  assert.equal(Object.hasOwn(received[0], "rawJson"), false);
});

test("keyword reaction internal dispatch accepts fixture and demo source types", () => {
  const target = new EventTarget();
  const received = [];
  const unsubscribe = subscribeKeywordReactionInternalEvents(target, (event) => {
    received.push(event);
  });

  dispatchKeywordReactionInternalEvent(target, {
    sourceType: "fixture",
    eventId: "fixture-internal-1",
    displayText: "fixture text",
    keyword: "fixture",
    reactionStyle: "soft",
    intensity: 3,
    durationMs: 5000,
    offsetMs: 800
  });
  dispatchKeywordReactionInternalEvent(target, {
    sourceType: "demo",
    eventId: "demo-internal-1",
    displayText: "demo text",
    keyword: "demo",
    reactionStyle: "spark",
    intensity: 1
  });
  unsubscribe();

  assert.equal(received.length, 2);
  assert.equal(received[0].sourceType, "fixture");
  assert.equal(received[0].eventId, "fixture-internal-1");
  assert.equal(received[0].displayText, "fixture text");
  assert.equal(received[0].offsetMs, 800);
  assert.equal(received[1].sourceType, "demo");
  assert.equal(received[1].eventId, "demo-internal-1");
  assert.equal(received[1].displayText, "demo text");
});

test("keyword reaction internal dispatch rejects unsupported source types without raw echo", () => {
  const target = new EventTarget();
  let callCount = 0;
  const unsubscribe = subscribeKeywordReactionInternalEvents(target, () => {
    callCount += 1;
  });
  const result = dispatchKeywordReactionInternalEvent(target, {
    sourceType: "youtube",
    eventId: "youtube-live-chat-1",
    displayText: "raw YouTube comment should not pass",
    keyword: "youtube",
    accessToken: "token-like-value"
  });
  const resultText = JSON.stringify(result);
  unsubscribe();

  assert.equal(result.ok, false);
  assert.equal(result.reason, "unsupported-source-type");
  assert.equal(result.dispatched, false);
  assert.equal(result.event, null);
  assert.equal(callCount, 0);
  assert.doesNotMatch(resultText, /youtube-live-chat-1/);
  assert.doesNotMatch(resultText, /raw YouTube comment should not pass/);
  assert.doesNotMatch(resultText, /token-like-value/);
});

test("keyword reaction internal dispatch falls back for secret-like event values", () => {
  const target = new EventTarget();
  const received = [];
  subscribeKeywordReactionInternalEvents(target, (event) => {
    received.push(event);
  });
  const fakeSecret = ["sk", "internal-dispatch-secret"].join("-");
  const result = dispatchKeywordReactionInternalEvent(target, {
    sourceType: "manual",
    eventId: fakeSecret,
    displayText: fakeSecret,
    keyword: "BEGIN PRIVATE KEY sample",
    transportPayload: fakeSecret,
    queueState: { current: fakeSecret },
    realViewerId: "viewer-123",
    rawComment: "raw comment"
  });
  const resultText = JSON.stringify(result);
  const receivedText = JSON.stringify(received);

  assert.equal(result.ok, true);
  assert.equal(received.length, 1);
  assert.equal(received[0].eventId, DEFAULT_KEYWORD_REACTION_EVENT.eventId);
  assert.equal(received[0].displayText, DEFAULT_KEYWORD_REACTION_EVENT.displayText);
  assert.equal(received[0].keyword, DEFAULT_KEYWORD_REACTION_EVENT.keyword);
  assert.equal(Object.hasOwn(received[0], "transportPayload"), false);
  assert.equal(Object.hasOwn(received[0], "queueState"), false);
  assert.doesNotMatch(resultText, /internal-dispatch-secret|PRIVATE KEY|viewer-123|raw comment/);
  assert.doesNotMatch(receivedText, /internal-dispatch-secret|PRIVATE KEY|viewer-123|raw comment/);
});

test("keyword reaction internal subscribe cleanup prevents later delivery", () => {
  const target = new EventTarget();
  const received = [];
  const unsubscribe = subscribeKeywordReactionInternalEvents(target, (event) => {
    received.push(event.eventId);
  });

  dispatchKeywordReactionInternalEvent(target, {
    sourceType: "demo",
    eventId: "demo-before-cleanup",
    displayText: "demo before cleanup"
  });
  unsubscribe();
  unsubscribe();
  dispatchKeywordReactionInternalEvent(target, {
    sourceType: "demo",
    eventId: "demo-after-cleanup",
    displayText: "demo after cleanup"
  });

  assert.deepEqual(received, ["demo-before-cleanup"]);
});

test("keyword reaction internal event detail helper ignores invalid event detail safely", () => {
  const validEvent = createKeywordReactionInternalEvent({
    sourceType: "manual",
    eventId: "manual-detail-1",
    displayText: "manual detail"
  });
  const invalidEvent = new CustomEvent(KEYWORD_REACTION_INTERNAL_EVENT_NAME, {
    detail: {
      sourceType: "youtube",
      eventId: "youtube-detail-1",
      displayText: "raw comment",
      accessToken: "token-like-value"
    }
  });
  const wrongNameEvent = new CustomEvent("keyword-reaction:other", {
    detail: { sourceType: "demo", displayText: "wrong name" }
  });

  assert.equal(validEvent.type, KEYWORD_REACTION_INTERNAL_EVENT_NAME);
  assert.equal(getKeywordReactionInternalEventDetail(validEvent).eventId, "manual-detail-1");
  assert.equal(getKeywordReactionInternalEventDetail(invalidEvent), null);
  assert.equal(getKeywordReactionInternalEventDetail(wrongNameEvent), null);
});

test("keyword reaction internal dispatch target normalization is explicit and safe", () => {
  const target = new EventTarget();

  assert.equal(normalizeKeywordReactionInternalDispatchTarget(target), target);
  assert.equal(normalizeKeywordReactionInternalDispatchTarget(null), null);
  assert.equal(normalizeKeywordReactionInternalDispatchTarget({ dispatchEvent() {} }), null);
});

test("keyword reaction internal dispatch payload is not encoded into generated URLs", () => {
  const internalEvent = createKeywordReactionInternalEvent({
    sourceType: "manual",
    eventId: "manual-internal-url-1",
    displayText: "manual text must stay local",
    keyword: "hello",
    reactionStyle: "pulse",
    intensity: 3,
    durationMs: 3600,
    offsetMs: 50
  });
  const url = keywordReactionConfigToUrl(
    {
      keyword: internalEvent.detail.keyword,
      reactionStyle: internalEvent.detail.reactionStyle,
      intensity: internalEvent.detail.intensity,
      eventId: internalEvent.detail.eventId,
      eventType: internalEvent.detail.eventType,
      sourceType: internalEvent.detail.sourceType,
      displayText: internalEvent.detail.displayText,
      durationMs: internalEvent.detail.durationMs,
      offsetMs: internalEvent.detail.offsetMs
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
  assert.doesNotMatch(url, /manual-internal-url-1/);
  assert.doesNotMatch(url, /manual text must stay local/);
});

test("keyword reaction internal dispatch helper stays same-window only and avoids unsafe sinks", () => {
  const helper = readFileSync(new URL("../assets/js/keyword-reaction-internal-dispatch.js", import.meta.url), "utf8");

  assert.match(helper, /validateKeywordReactionLocalEventInput/);
  assert.match(helper, /EventTarget/);
  assert.match(helper, /CustomEvent/);
  assert.doesNotMatch(helper, /postMessage|BroadcastChannel|localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(helper, /fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/);
  assert.doesNotMatch(helper, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
  assert.doesNotMatch(helper, /setTimeout|setInterval|while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/);
});
