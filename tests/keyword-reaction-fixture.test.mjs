import assert from "node:assert/strict";
import test from "node:test";

import { keywordReactionConfigToUrl, parseKeywordReactionConfigFromQuery } from "../assets/js/keyword-reaction-config.js";
import {
  DEFAULT_KEYWORD_REACTION_FIXTURE,
  buildFixturePlaybackSchedule,
  getBuiltinKeywordReactionFixture,
  normalizeKeywordReactionFixture,
  validateKeywordReactionFixture
} from "../assets/js/keyword-reaction-fixture.js";

test("built-in fixture is artificial public-safe demo data", () => {
  const fixture = getBuiltinKeywordReactionFixture();

  assert.equal(fixture.schemaVersion, 1);
  assert.equal(fixture.fixtureId, "demo-basic");
  assert.match(fixture.description, /人工デモ/);
  assert.deepEqual(
    fixture.events.map((event) => ({
      offsetMs: event.offsetMs,
      displayText: event.displayText,
      keyword: event.keyword,
      intensity: event.intensity,
      reactionStyle: event.reactionStyle
    })),
    [
      { offsetMs: 0, displayText: "配信開始", keyword: "配信開始", intensity: 1, reactionStyle: "soft" },
      { offsetMs: 1600, displayText: "hello", keyword: "hello", intensity: 2, reactionStyle: "spark" },
      { offsetMs: 3200, displayText: "888", keyword: "888", intensity: 3, reactionStyle: "pulse" }
    ]
  );
  assert.equal(fixture.events.every((event) => event.id.startsWith("demo-")), true);
  assert.doesNotMatch(JSON.stringify(fixture), /viewer|channel|comment|chat|oauth|api[_-]?key/i);
});

test("valid fixture normalizes and drops unknown fields", () => {
  const normalized = normalizeKeywordReactionFixture({
    ...DEFAULT_KEYWORD_REACTION_FIXTURE,
    privateNote: "drop me",
    events: [
      {
        id: "evt-late",
        offsetMs: 200,
        displayText: "late",
        keyword: "late",
        reactionStyle: "spark",
        intensity: 2,
        unknown: "drop me"
      },
      {
        id: "evt-first",
        offsetMs: 0,
        displayText: "first",
        keyword: "first",
        reactionStyle: "soft",
        intensity: 1
      }
    ]
  });

  assert.equal(normalized.ok, true);
  assert.deepEqual(Object.keys(normalized.fixture), ["schemaVersion", "fixtureId", "description", "events"]);
  assert.deepEqual(
    normalized.fixture.events.map((event) => event.id),
    ["evt-first", "evt-late"]
  );
  assert.deepEqual(Object.keys(normalized.fixture.events[0]), [
    "id",
    "offsetMs",
    "displayText",
    "keyword",
    "intensity",
    "reactionStyle"
  ]);
});

test("invalid fixture returns safe Japanese errors without raw values", () => {
  const secretLikeText = ["sk", "fixture-secret"].join("-");
  const cases = [
    { schemaVersion: 2, fixtureId: "bad", description: "bad", events: [] },
    { schemaVersion: 1, fixtureId: "bad", description: "bad", events: "not-array" },
    {
      schemaVersion: 1,
      fixtureId: "bad",
      description: "bad",
      events: [{ id: "bad-1", offsetMs: -1, displayText: "bad", keyword: "bad", reactionStyle: "soft", intensity: 1 }]
    },
    {
      schemaVersion: 1,
      fixtureId: "bad",
      description: "bad",
      events: [{ id: "bad-2", offsetMs: 0, displayText: secretLikeText, keyword: "hello", reactionStyle: "soft", intensity: 1 }]
    }
  ];

  for (const source of cases) {
    const result = validateKeywordReactionFixture(source);
    assert.equal(result.ok, false);
    assert.equal(result.fixture, null);
    assert.ok(result.errors.length > 0);
    assert.doesNotMatch(result.errors.join(" "), /fixture-secret/);
  }
});

test("fixture validation enforces event count and text limits", () => {
  const tooManyEvents = Array.from({ length: 31 }, (_, index) => ({
    id: `evt-${index}`,
    offsetMs: index * 100,
    displayText: "hello",
    keyword: "hello",
    reactionStyle: "spark",
    intensity: 1
  }));
  const tooMany = validateKeywordReactionFixture({
    schemaVersion: 1,
    fixtureId: "too-many",
    description: "too many artificial events",
    events: tooManyEvents
  });

  assert.equal(tooMany.ok, false);
  assert.match(tooMany.errors.join(" "), /30件/);

  const long = normalizeKeywordReactionFixture({
    schemaVersion: 1,
    fixtureId: "long-text",
    description: "long artificial text",
    events: [
      {
        id: "evt-long",
        offsetMs: 0,
        displayText: "😀".repeat(200),
        keyword: "k".repeat(120),
        reactionStyle: "none",
        intensity: 0
      }
    ]
  });

  assert.equal(long.ok, true);
  assert.equal(Array.from(long.fixture.events[0].displayText).length, 160);
  assert.equal(Array.from(long.fixture.events[0].keyword).length, 80);
});

test("HTML-like fixture text remains inert text and unsupported enum values fall back", () => {
  const result = normalizeKeywordReactionFixture({
    schemaVersion: 1,
    fixtureId: "html-like",
    description: "html-like artificial text",
    events: [
      {
        id: "evt-html",
        offsetMs: 0,
        displayText: "<img src=x onerror=alert(1)>",
        keyword: "<b>hello</b>",
        reactionStyle: "explode",
        intensity: 99
      }
    ]
  });

  assert.equal(result.ok, true);
  assert.equal(result.fixture.events[0].displayText, "<img src=x onerror=alert(1)>");
  assert.equal(result.fixture.events[0].keyword, "<b>hello</b>");
  assert.equal(result.fixture.events[0].reactionStyle, "spark");
  assert.equal(result.fixture.events[0].intensity, 3);
});

test("generated keyword reaction URL excludes fixture event data", () => {
  const fixture = getBuiltinKeywordReactionFixture();
  const url = keywordReactionConfigToUrl({ keyword: "hello", reactionStyle: "pulse", intensity: 2 }, "https://example.test/");
  const parsed = parseKeywordReactionConfigFromQuery(url);

  assert.equal(parsed.keyword, "hello");
  assert.equal(Object.hasOwn(parsed, "events"), false);
  assert.equal(Object.hasOwn(parsed, "fixture"), false);
  assert.equal(Object.hasOwn(parsed, "fixtureId"), false);
  for (const event of fixture.events) {
    assert.doesNotMatch(url, new RegExp(encodeURIComponent(event.displayText)));
    assert.doesNotMatch(url, new RegExp(event.displayText));
  }
});

test("fixture playback schedule preserves sorted bounded offsets", () => {
  const schedule = buildFixturePlaybackSchedule(
    normalizeKeywordReactionFixture({
      schemaVersion: 1,
      fixtureId: "schedule",
      description: "schedule test",
      events: [
        { id: "second", offsetMs: 120, displayText: "second", keyword: "second", reactionStyle: "pulse", intensity: 2 },
        { id: "first", offsetMs: 0, displayText: "first", keyword: "first", reactionStyle: "soft", intensity: 1 }
      ]
    }).fixture
  );

  assert.deepEqual(
    schedule.map((item) => ({ id: item.event.id, delayMs: item.delayMs })),
    [
      { id: "first", delayMs: 0 },
      { id: "second", delayMs: 120 }
    ]
  );
});
