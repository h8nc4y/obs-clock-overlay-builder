import {
  DEFAULT_KEYWORD_REACTION_EVENT,
  KEYWORD_REACTION_EVENT_SCHEMA_VERSION,
  KEYWORD_REACTION_EVENT_SOURCE_TYPES,
  KEYWORD_REACTION_EVENT_TYPE,
  normalizeKeywordReactionEvent
} from "./keyword-reaction-event.js";

export const KEYWORD_REACTION_LOCAL_EVENT_SOURCE_TYPES = Object.freeze([...KEYWORD_REACTION_EVENT_SOURCE_TYPES]);

const LOCAL_EVENT_SOURCE_TYPES = new Set(KEYWORD_REACTION_LOCAL_EVENT_SOURCE_TYPES);
const VALID_RESULT_REASON = "valid";
const INVALID_INPUT_REASON = "invalid-input";
const UNSUPPORTED_SOURCE_TYPE_REASON = "unsupported-source-type";

export function normalizeKeywordReactionLocalEventInput(input = {}) {
  return validateKeywordReactionLocalEventInput(input).event;
}

export function buildKeywordReactionEventFromLocalInput(input = {}) {
  return normalizeKeywordReactionLocalEventInput(input);
}

export function validateKeywordReactionLocalEventInput(input = {}) {
  const raw = toLocalEventRecord(input);
  if (!raw) {
    return buildValidationResult(false, INVALID_INPUT_REASON);
  }

  const sourceType = String(raw.sourceType ?? "");
  if (!LOCAL_EVENT_SOURCE_TYPES.has(sourceType)) {
    return buildValidationResult(false, UNSUPPORTED_SOURCE_TYPE_REASON);
  }

  return buildValidationResult(
    true,
    VALID_RESULT_REASON,
    normalizeKeywordReactionEvent({
      schemaVersion: KEYWORD_REACTION_EVENT_SCHEMA_VERSION,
      eventType: KEYWORD_REACTION_EVENT_TYPE,
      sourceType,
      eventId: raw.eventId,
      displayText: raw.displayText,
      keyword: raw.keyword,
      displayPattern: raw.displayPattern,
      reactionStyle: raw.reactionStyle,
      intensity: raw.intensity,
      durationMs: raw.durationMs,
      offsetMs: raw.offsetMs
    })
  );
}

function buildValidationResult(ok, reason, event = DEFAULT_KEYWORD_REACTION_EVENT) {
  return {
    ok,
    reason,
    event: { ...event }
  };
}

function toLocalEventRecord(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }
  return input;
}
