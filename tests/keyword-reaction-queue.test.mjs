import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { keywordReactionConfigToUrl, parseKeywordReactionConfigFromQuery } from "../assets/js/keyword-reaction-config.js";
import {
  DEFAULT_KEYWORD_REACTION_EVENT,
  KEYWORD_REACTION_EVENT_TYPE
} from "../assets/js/keyword-reaction-event.js";
import {
  DEFAULT_KEYWORD_REACTION_QUEUE_LIMIT,
  applyKeywordReactionQueueLimit,
  buildKeywordReactionQueueSchedule,
  clearKeywordReactionQueue,
  createKeywordReactionQueue,
  dequeueKeywordReactionEvent,
  enqueueKeywordReactionEvent,
  normalizeKeywordReactionQueueLimit
} from "../assets/js/keyword-reaction-queue.js";

function rawEvent(id, overrides = {}) {
  return {
    schemaVersion: 1,
    eventType: KEYWORD_REACTION_EVENT_TYPE,
    sourceType: "manual",
    eventId: id,
    displayText: `event ${id}`,
    keyword: `keyword-${id}`,
    displayPattern: "toast",
    reactionStyle: "spark",
    intensity: 1,
    durationMs: 1000,
    offsetMs: 0,
    rawComment: "drop me",
    displayTextArray: ["drop me"],
    ...overrides
  };
}

test("default keyword reaction queue limit is stable and safely normalized", () => {
  assert.equal(DEFAULT_KEYWORD_REACTION_QUEUE_LIMIT, 5);
  assert.equal(normalizeKeywordReactionQueueLimit(undefined), 5);
  assert.equal(normalizeKeywordReactionQueueLimit("bad"), 5);
  assert.equal(normalizeKeywordReactionQueueLimit(0), 5);
  assert.equal(normalizeKeywordReactionQueueLimit(3.8), 3);
  assert.equal(normalizeKeywordReactionQueueLimit(99), 5);
});

test("createKeywordReactionQueue starts empty and normalizes events without unknown fields", () => {
  const queue = createKeywordReactionQueue([
    rawEvent("manual-1", {
      displayText: "<img src=x onerror=alert(1)>",
      keyword: "配信開始",
      reactionStyle: "pulse",
      intensity: 2,
      unknownField: "drop me"
    })
  ]);

  assert.equal(createKeywordReactionQueue().length, 0);
  assert.deepEqual(Object.keys(queue[0]), [
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
  assert.equal(queue[0].eventId, "manual-1");
  assert.equal(queue[0].displayText, "<img src=x onerror=alert(1)>");
  assert.equal(queue[0].keyword, "配信開始");
  assert.equal(queue[0].reactionStyle, "pulse");
  assert.equal("unknownField" in queue[0], false);
  assert.equal("rawComment" in queue[0], false);
  assert.equal("displayTextArray" in queue[0], false);
});

test("enqueue keeps a bounded queue and drops oldest pending events on overflow", () => {
  const queue = ["one", "two", "three", "four", "five"].reduce(
    (currentQueue, id) => enqueueKeywordReactionEvent(currentQueue, rawEvent(id)),
    createKeywordReactionQueue()
  );
  const overflowed = enqueueKeywordReactionEvent(queue, rawEvent("six"));

  assert.deepEqual(
    queue.map((event) => event.eventId),
    ["one", "two", "three", "four", "five"]
  );
  assert.deepEqual(
    overflowed.map((event) => event.eventId),
    ["two", "three", "four", "five", "six"]
  );
});

test("queue helpers are pure and preserve FIFO dequeue semantics", () => {
  const initialEvents = [rawEvent("first"), rawEvent("second")];
  const queue = createKeywordReactionQueue(initialEvents);
  const enqueued = enqueueKeywordReactionEvent(queue, rawEvent("third"));
  const { event, queue: remaining } = dequeueKeywordReactionEvent(enqueued);

  assert.notEqual(queue, enqueued);
  assert.notEqual(enqueued, remaining);
  assert.deepEqual(
    queue.map((item) => item.eventId),
    ["first", "second"]
  );
  assert.deepEqual(
    enqueued.map((item) => item.eventId),
    ["first", "second", "third"]
  );
  assert.equal(event.eventId, "first");
  assert.deepEqual(
    remaining.map((item) => item.eventId),
    ["second", "third"]
  );
  assert.deepEqual(clearKeywordReactionQueue(enqueued), []);
  assert.deepEqual(dequeueKeywordReactionEvent([]), { event: null, queue: [] });
  assert.deepEqual(
    initialEvents.map((item) => Object.hasOwn(item, "rawComment")),
    [true, true]
  );
});

test("queue helpers normalize unsafe events without echoing secret-like values", () => {
  const fakeSecret = ["sk", "queue-secret"].join("-");
  const queue = enqueueKeywordReactionEvent([], rawEvent("unsafe", { eventId: fakeSecret, displayText: fakeSecret, keyword: fakeSecret }));
  const serialized = JSON.stringify(queue);

  assert.equal(queue[0].eventId, DEFAULT_KEYWORD_REACTION_EVENT.eventId);
  assert.equal(queue[0].displayText, DEFAULT_KEYWORD_REACTION_EVENT.displayText);
  assert.equal(queue[0].keyword, DEFAULT_KEYWORD_REACTION_EVENT.keyword);
  assert.doesNotMatch(serialized, /queue-secret/);
});

test("applyKeywordReactionQueueLimit trims existing queues without mutating the input", () => {
  const queue = ["one", "two", "three", "four"].map((id) => rawEvent(id));
  const trimmed = applyKeywordReactionQueueLimit(queue, 2);

  assert.deepEqual(
    trimmed.map((event) => event.eventId),
    ["three", "four"]
  );
  assert.deepEqual(
    queue.map((event) => event.eventId),
    ["one", "two", "three", "four"]
  );
});

test("buildKeywordReactionQueueSchedule returns deterministic pure display ranges", () => {
  const queue = createKeywordReactionQueue([
    rawEvent("first", { durationMs: 500 }),
    rawEvent("second", { durationMs: 1200 }),
    rawEvent("third", { durationMs: 700 })
  ]);
  const schedule = buildKeywordReactionQueueSchedule(queue);

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
  assert.deepEqual(buildKeywordReactionQueueSchedule([]), []);
  assert.deepEqual(
    queue.map((event) => event.eventId),
    ["first", "second", "third"]
  );
});

test("queue state and event payload are not encoded into generated keyword reaction URLs", () => {
  const queue = createKeywordReactionQueue([rawEvent("manual-1", { displayText: "manual display text", keyword: "hello" })]);
  const url = keywordReactionConfigToUrl(
    {
      keyword: "hello",
      reactionStyle: "pulse",
      intensity: 2,
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
  assert.equal(Object.hasOwn(parsed, "queue"), false);
  assert.equal(Object.hasOwn(parsed, "queueState"), false);
  assert.equal(Object.hasOwn(parsed, "eventPayload"), false);
  assert.equal(Object.hasOwn(parsed, "eventId"), false);
  assert.equal(Object.hasOwn(parsed, "displayText"), false);
  assert.doesNotMatch(url, /manual display text/);
});

test("keyword reaction queue helper does not introduce timers storage network or unsafe HTML sinks", () => {
  const source = readFileSync(new URL("../assets/js/keyword-reaction-queue.js", import.meta.url), "utf8");

  assert.doesNotMatch(source, /setTimeout|setInterval|localStorage|fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/);
  assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
});
