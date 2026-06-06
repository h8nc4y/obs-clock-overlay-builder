import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { keywordReactionConfigToUrl, parseKeywordReactionConfigFromQuery } from "../assets/js/keyword-reaction-config.js";
import { getBuiltinKeywordReactionFixture } from "../assets/js/keyword-reaction-fixture.js";

async function loadFixtureLinkageHelper() {
  return import("../assets/js/keyword-reaction-fixture-linkage.js");
}

test("fixture linkage helper builds public-safe fixture local inputs without mutating the fixture", async () => {
  const { buildKeywordReactionFixtureLocalInputs } = await loadFixtureLinkageHelper();
  const fixture = getBuiltinKeywordReactionFixture();
  const before = structuredClone(fixture);
  const inputs = buildKeywordReactionFixtureLocalInputs(fixture, {
    rawTransportPayload: "drop me",
    queueState: { current: 1 }
  });

  assert.deepEqual(fixture, before);
  assert.deepEqual(
    inputs.map((input) => ({
      sourceType: input.sourceType,
      eventId: input.eventId,
      displayText: input.displayText,
      keyword: input.keyword,
      reactionStyle: input.reactionStyle,
      intensity: input.intensity,
      offsetMs: input.offsetMs
    })),
    [
      {
        sourceType: "fixture",
        eventId: "demo-start",
        displayText: "配信開始",
        keyword: "配信開始",
        reactionStyle: "soft",
        intensity: 1,
        offsetMs: 0
      },
      {
        sourceType: "fixture",
        eventId: "demo-hello",
        displayText: "hello",
        keyword: "hello",
        reactionStyle: "spark",
        intensity: 2,
        offsetMs: 1600
      },
      {
        sourceType: "fixture",
        eventId: "demo-888",
        displayText: "888",
        keyword: "888",
        reactionStyle: "pulse",
        intensity: 3,
        offsetMs: 3200
      }
    ]
  );
  assert.equal(inputs.every((input) => input.displayPattern === "toast"), true);
  assert.equal(inputs.some((input) => Object.hasOwn(input, "rawTransportPayload")), false);
  assert.equal(inputs.some((input) => Object.hasOwn(input, "queueState")), false);
});

test("fixture linkage helper builds normalized queue and schedule candidates", async () => {
  const { buildKeywordReactionFixtureQueueCandidate, buildKeywordReactionFixtureScheduleCandidate, isKeywordReactionFixtureLinkageReady } =
    await loadFixtureLinkageHelper();
  const queue = buildKeywordReactionFixtureQueueCandidate(getBuiltinKeywordReactionFixture());
  const schedule = buildKeywordReactionFixtureScheduleCandidate(getBuiltinKeywordReactionFixture());

  assert.equal(isKeywordReactionFixtureLinkageReady(getBuiltinKeywordReactionFixture()), true);
  assert.deepEqual(
    queue.map((event) => ({
      sourceType: event.sourceType,
      eventId: event.eventId,
      displayText: event.displayText,
      keyword: event.keyword,
      reactionStyle: event.reactionStyle,
      intensity: event.intensity,
      offsetMs: event.offsetMs
    })),
    [
      {
        sourceType: "fixture",
        eventId: "demo-start",
        displayText: "配信開始",
        keyword: "配信開始",
        reactionStyle: "soft",
        intensity: 1,
        offsetMs: 0
      },
      {
        sourceType: "fixture",
        eventId: "demo-hello",
        displayText: "hello",
        keyword: "hello",
        reactionStyle: "spark",
        intensity: 2,
        offsetMs: 1600
      },
      {
        sourceType: "fixture",
        eventId: "demo-888",
        displayText: "888",
        keyword: "888",
        reactionStyle: "pulse",
        intensity: 3,
        offsetMs: 3200
      }
    ]
  );
  assert.deepEqual(
    schedule.map(({ event, index, startMs, endMs, durationMs }) => ({
      eventId: event.eventId,
      index,
      startMs,
      endMs,
      durationMs
    })),
    [
      { eventId: "demo-start", index: 0, startMs: 0, endMs: 2400, durationMs: 2400 },
      { eventId: "demo-hello", index: 1, startMs: 2400, endMs: 4800, durationMs: 2400 },
      { eventId: "demo-888", index: 2, startMs: 4800, endMs: 7200, durationMs: 2400 }
    ]
  );
});

test("fixture linkage helper safely rejects invalid or secret-like fixture values", async () => {
  const {
    buildKeywordReactionFixtureLocalInputs,
    buildKeywordReactionFixtureQueueCandidate,
    buildKeywordReactionFixtureScheduleCandidate,
    isKeywordReactionFixtureLinkageReady
  } = await loadFixtureLinkageHelper();
  const fakeSecret = ["sk", "fixture-linkage-secret"].join("-");
  const unsafeFixture = {
    schemaVersion: 1,
    fixtureId: "unsafe",
    description: "unsafe artificial fixture",
    events: [
      {
        id: "unsafe-1",
        offsetMs: 0,
        displayText: fakeSecret,
        keyword: "hello",
        reactionStyle: "spark",
        intensity: 1,
        rawTransportPayload: fakeSecret,
        queueState: { secret: fakeSecret }
      }
    ]
  };
  const results = {
    inputs: buildKeywordReactionFixtureLocalInputs(unsafeFixture),
    queue: buildKeywordReactionFixtureQueueCandidate(unsafeFixture),
    schedule: buildKeywordReactionFixtureScheduleCandidate(unsafeFixture),
    ready: isKeywordReactionFixtureLinkageReady(unsafeFixture)
  };

  assert.deepEqual(results.inputs, []);
  assert.deepEqual(results.queue, []);
  assert.deepEqual(results.schedule, []);
  assert.equal(results.ready, false);
  assert.doesNotMatch(JSON.stringify(results), /fixture-linkage-secret/);
});

test("fixture linkage payloads are not encoded into generated keyword reaction URLs", async () => {
  const { buildKeywordReactionFixtureLocalInputs, buildKeywordReactionFixtureQueueCandidate } = await loadFixtureLinkageHelper();
  const fixture = getBuiltinKeywordReactionFixture();
  const inputs = buildKeywordReactionFixtureLocalInputs(fixture);
  const queue = buildKeywordReactionFixtureQueueCandidate(fixture);
  const url = keywordReactionConfigToUrl(
    {
      keyword: "hello",
      reactionStyle: "pulse",
      intensity: 2,
      fixtureLinkagePayload: { fixture },
      fixtureEventData: fixture.events,
      localIntakePayload: inputs,
      eventPayload: queue[0],
      queueState: queue,
      eventId: queue[0].eventId,
      displayText: queue[0].displayText
    },
    "https://example.test/"
  );
  const parsed = parseKeywordReactionConfigFromQuery(url);

  assert.equal(parsed.keyword, "hello");
  assert.equal(parsed.reactionStyle, "pulse");
  assert.equal(parsed.intensity, 2);
  assert.equal(Object.hasOwn(parsed, "fixtureLinkagePayload"), false);
  assert.equal(Object.hasOwn(parsed, "fixtureEventData"), false);
  assert.equal(Object.hasOwn(parsed, "localIntakePayload"), false);
  assert.equal(Object.hasOwn(parsed, "eventPayload"), false);
  assert.equal(Object.hasOwn(parsed, "queueState"), false);
  assert.equal(Object.hasOwn(parsed, "eventId"), false);
  assert.equal(Object.hasOwn(parsed, "displayText"), false);
  for (const event of fixture.events) {
    assert.doesNotMatch(url, new RegExp(encodeURIComponent(event.displayText)));
    assert.doesNotMatch(url, new RegExp(event.displayText));
  }
});

test("fixture linkage helper stays pure and avoids runtime transport timers storage network and unsafe sinks", async () => {
  await loadFixtureLinkageHelper();
  const source = readFileSync(new URL("../assets/js/keyword-reaction-fixture-linkage.js", import.meta.url), "utf8");

  assert.match(source, /validateKeywordReactionFixture/);
  assert.match(source, /buildKeywordReactionQueueFromLocalInputs/);
  assert.doesNotMatch(source, /document|window|HTMLElement|customElements/);
  assert.doesNotMatch(source, /postMessage|BroadcastChannel|localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(source, /fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/);
  assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
  assert.doesNotMatch(source, /setTimeout|setInterval|while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/);
});
