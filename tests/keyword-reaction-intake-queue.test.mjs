import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { keywordReactionConfigToUrl, parseKeywordReactionConfigFromQuery } from "../assets/js/keyword-reaction-config.js";
import { DEFAULT_KEYWORD_REACTION_EVENT, KEYWORD_REACTION_EVENT_TYPE } from "../assets/js/keyword-reaction-event.js";
import { dequeueKeywordReactionEvent } from "../assets/js/keyword-reaction-queue.js";
import {
  buildKeywordReactionQueueFromLocalInputs,
  buildLocalIntakeQueueSchedule,
  enqueueKeywordReactionLocalInput,
  normalizeKeywordReactionLocalInputBatch
} from "../assets/js/keyword-reaction-intake-queue.js";

function localInput(id, overrides = {}) {
  return {
    sourceType: "manual",
    eventId: id,
    displayText: `event ${id}`,
    keyword: `keyword-${id}`,
    displayPattern: "toast",
    reactionStyle: "spark",
    intensity: 1,
    durationMs: 1000,
    offsetMs: 0,
    rawJson: { displayText: "drop me" },
    transportPayload: "drop me",
    queueState: { current: 1 },
    ...overrides
  };
}

test("local intake queue helper normalizes manual fixture and demo inputs before queueing", () => {
  const rawInputs = [
    localInput("manual-1", {
      displayText: "<img src=x onerror=alert(1)>",
      keyword: "配信開始",
      reactionStyle: "pulse",
      intensity: "2.5",
      durationMs: "3200",
      offsetMs: "120"
    }),
    localInput("fixture-1", {
      sourceType: "fixture",
      displayText: "fixture text",
      keyword: "fixture",
      reactionStyle: "soft",
      intensity: 3,
      offsetMs: 500
    }),
    localInput("demo-local-1", {
      sourceType: "demo",
      displayText: "demo text",
      keyword: "demo"
    })
  ];
  const before = structuredClone(rawInputs);
  const queue = buildKeywordReactionQueueFromLocalInputs(rawInputs);

  assert.deepEqual(rawInputs, before);
  assert.deepEqual(
    queue.map((event) => event.sourceType),
    ["manual", "fixture", "demo"]
  );
  assert.equal(queue[0].eventType, KEYWORD_REACTION_EVENT_TYPE);
  assert.equal(queue[0].eventId, "manual-1");
  assert.equal(queue[0].displayText, "<img src=x onerror=alert(1)>");
  assert.equal(queue[0].keyword, "配信開始");
  assert.equal(queue[0].reactionStyle, "pulse");
  assert.equal(queue[0].intensity, 2.5);
  assert.equal(queue[0].durationMs, 3200);
  assert.equal(queue[0].offsetMs, 120);
  assert.equal(queue[1].eventId, "fixture-1");
  assert.equal(queue[2].eventId, "demo-local-1");
  assert.equal(Object.hasOwn(queue[0], "rawJson"), false);
  assert.equal(Object.hasOwn(queue[0], "transportPayload"), false);
  assert.equal(Object.hasOwn(queue[0], "queueState"), false);
});

test("enqueueKeywordReactionLocalInput appends valid local input and rejects unsupported source types", () => {
  const queue = buildKeywordReactionQueueFromLocalInputs([localInput("existing")]);
  const enqueued = enqueueKeywordReactionLocalInput(queue, localInput("manual-2", { displayText: "queued manual" }));
  const rejected = enqueueKeywordReactionLocalInput(enqueued, localInput("youtube-1", { sourceType: "youtube" }));
  const { event, queue: remaining } = dequeueKeywordReactionEvent(rejected);

  assert.deepEqual(
    enqueued.map((item) => item.eventId),
    ["existing", "manual-2"]
  );
  assert.deepEqual(rejected, enqueued);
  assert.equal(event.eventId, "existing");
  assert.deepEqual(
    remaining.map((item) => item.eventId),
    ["manual-2"]
  );
});

test("local intake queue helper keeps max five events and drops oldest pending events on overflow", () => {
  const rawInputs = ["one", "two", "three", "four", "five", "six"].map((id) => localInput(id));
  const queue = buildKeywordReactionQueueFromLocalInputs(rawInputs);

  assert.deepEqual(
    queue.map((event) => event.eventId),
    ["two", "three", "four", "five", "six"]
  );
});

test("normalizeKeywordReactionLocalInputBatch safely handles invalid batches and secret-like fallback", () => {
  const fakeSecret = ["sk", "local-intake-queue-secret"].join("-");
  const fakePrivateKeyMarker = ["BEGIN", "PRIVATE", "KEY sample"].join(" ");
  const batch = normalizeKeywordReactionLocalInputBatch([
    null,
    localInput("external", {
      sourceType: "external",
      displayText: "raw external text"
    }),
    localInput(fakeSecret, {
      displayText: fakeSecret,
      keyword: fakePrivateKeyMarker,
      apiKey: fakeSecret,
      rawYoutubeComment: "raw comment",
      realViewerId: "viewer-123"
    })
  ]);
  const serialized = JSON.stringify(batch);

  assert.deepEqual(normalizeKeywordReactionLocalInputBatch("not an array"), []);
  assert.equal(batch.length, 1);
  assert.equal(batch[0].sourceType, "manual");
  assert.equal(batch[0].eventId, DEFAULT_KEYWORD_REACTION_EVENT.eventId);
  assert.equal(batch[0].displayText, DEFAULT_KEYWORD_REACTION_EVENT.displayText);
  assert.equal(batch[0].keyword, DEFAULT_KEYWORD_REACTION_EVENT.keyword);
  assert.doesNotMatch(serialized, /local-intake-queue-secret/);
  assert.doesNotMatch(serialized, /raw external text/);
  assert.doesNotMatch(serialized, /raw comment/);
  assert.doesNotMatch(serialized, /viewer-123/);
});

test("buildLocalIntakeQueueSchedule returns deterministic schedule from local inputs", () => {
  const schedule = buildLocalIntakeQueueSchedule([
    localInput("first", { durationMs: 500 }),
    localInput("second", { durationMs: 1200 }),
    localInput("third", { durationMs: 700 })
  ]);

  assert.deepEqual(
    schedule.map(({ event, index, startMs, endMs, durationMs }) => ({
      eventId: event.eventId,
      index,
      startMs,
      endMs,
      durationMs
    })),
    [
      { eventId: "first", index: 0, startMs: 0, endMs: 500, durationMs: 500 },
      { eventId: "second", index: 1, startMs: 500, endMs: 1700, durationMs: 1200 },
      { eventId: "third", index: 2, startMs: 1700, endMs: 2400, durationMs: 700 }
    ]
  );
});

test("local intake queue payload is not encoded into generated keyword reaction URLs", () => {
  const queue = buildKeywordReactionQueueFromLocalInputs([
    localInput("manual-url-1", { displayText: "manual text must stay local", keyword: "hello" })
  ]);
  const url = keywordReactionConfigToUrl(
    {
      keyword: "hello",
      reactionStyle: "pulse",
      intensity: 2,
      localIntakePayload: [localInput("manual-url-1")],
      queue,
      queueState: queue,
      eventPayload: queue[0],
      eventId: queue[0].eventId,
      displayText: queue[0].displayText
    },
    "https://example.test/"
  );
  const parsed = parseKeywordReactionConfigFromQuery(url);

  assert.equal(parsed.keyword, "hello");
  assert.equal(parsed.reactionStyle, "pulse");
  assert.equal(parsed.intensity, 2);
  assert.equal(Object.hasOwn(parsed, "localIntakePayload"), false);
  assert.equal(Object.hasOwn(parsed, "queue"), false);
  assert.equal(Object.hasOwn(parsed, "queueState"), false);
  assert.equal(Object.hasOwn(parsed, "eventPayload"), false);
  assert.equal(Object.hasOwn(parsed, "eventId"), false);
  assert.equal(Object.hasOwn(parsed, "displayText"), false);
  assert.doesNotMatch(url, /manual-url-1/);
  assert.doesNotMatch(url, /manual text must stay local/);
});

test("keyword reaction local intake queue helper stays pure and avoids runtime transport and unsafe sinks", () => {
  const helper = readFileSync(new URL("../assets/js/keyword-reaction-intake-queue.js", import.meta.url), "utf8");

  assert.match(helper, /validateKeywordReactionLocalEventInput/);
  assert.match(helper, /enqueueKeywordReactionEvent/);
  assert.doesNotMatch(helper, /document|window|HTMLElement|customElements/);
  assert.doesNotMatch(helper, /postMessage|BroadcastChannel|localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(helper, /fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/);
  assert.doesNotMatch(helper, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
  assert.doesNotMatch(helper, /setTimeout|setInterval|while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/);
});
