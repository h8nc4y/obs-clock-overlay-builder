import { KEYWORD_REACTION_FIXTURE_LIMITS, getBuiltinKeywordReactionFixture, validateKeywordReactionFixture } from "./keyword-reaction-fixture.js";
import { buildKeywordReactionQueueFromLocalInputs, buildLocalIntakeQueueSchedule } from "./keyword-reaction-intake-queue.js";
import { DEFAULT_KEYWORD_REACTION_QUEUE_LIMIT, normalizeKeywordReactionQueueLimit } from "./keyword-reaction-queue.js";

const MIN_FIXTURE_LINKAGE_INPUT_LIMIT = 1;

export function normalizeKeywordReactionFixtureLinkageOptions(options = {}) {
  const raw = options && typeof options === "object" && !Array.isArray(options) ? options : {};
  return {
    inputLimit: normalizeFixtureLinkageInputLimit(raw.inputLimit),
    queueLimit: normalizeKeywordReactionQueueLimit(raw.queueLimit ?? raw.limit ?? DEFAULT_KEYWORD_REACTION_QUEUE_LIMIT)
  };
}

export function buildKeywordReactionFixtureLocalInputs(fixture = getBuiltinKeywordReactionFixture(), options = {}) {
  const result = validateKeywordReactionFixture(fixture);
  if (!result.ok || !result.fixture) {
    return [];
  }

  const { inputLimit } = normalizeKeywordReactionFixtureLinkageOptions(options);
  return result.fixture.events.slice(0, inputLimit).map((event) => ({
    sourceType: "fixture",
    eventId: event.id,
    displayText: event.displayText,
    keyword: event.keyword,
    displayPattern: "toast",
    reactionStyle: event.reactionStyle,
    intensity: event.intensity,
    offsetMs: event.offsetMs
  }));
}

export function buildKeywordReactionFixtureQueueCandidate(fixture = getBuiltinKeywordReactionFixture(), options = {}) {
  const normalizedOptions = normalizeKeywordReactionFixtureLinkageOptions(options);
  return buildKeywordReactionQueueFromLocalInputs(buildKeywordReactionFixtureLocalInputs(fixture, normalizedOptions), {
    inputLimit: normalizedOptions.inputLimit,
    limit: normalizedOptions.queueLimit
  });
}

export function buildKeywordReactionFixtureScheduleCandidate(fixture = getBuiltinKeywordReactionFixture(), options = {}) {
  const normalizedOptions = normalizeKeywordReactionFixtureLinkageOptions(options);
  return buildLocalIntakeQueueSchedule(buildKeywordReactionFixtureLocalInputs(fixture, normalizedOptions), {
    inputLimit: normalizedOptions.inputLimit,
    limit: normalizedOptions.queueLimit
  });
}

export function isKeywordReactionFixtureLinkageReady(fixture = getBuiltinKeywordReactionFixture(), options = {}) {
  return buildKeywordReactionFixtureQueueCandidate(fixture, options).length > 0;
}

function normalizeFixtureLinkageInputLimit(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < MIN_FIXTURE_LINKAGE_INPUT_LIMIT) {
    return KEYWORD_REACTION_FIXTURE_LIMITS.events;
  }
  return Math.min(KEYWORD_REACTION_FIXTURE_LIMITS.events, Math.trunc(number));
}
