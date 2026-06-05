export const KEYWORD_REACTION_EVENT_SCHEMA_VERSION = 1;
export const KEYWORD_REACTION_EVENT_TYPE = "keyword-reaction-event";
export const KEYWORD_REACTION_EVENT_SOURCE_TYPES = Object.freeze(["manual", "fixture", "demo"]);

export const KEYWORD_REACTION_EVENT_LIMITS = Object.freeze({
  eventIdLength: 80,
  displayTextLength: 160,
  keywordLength: 80,
  intensity: [0, 3],
  durationMs: [500, 10000],
  offsetMs: [0, 600000]
});

export const DEFAULT_KEYWORD_REACTION_EVENT = Object.freeze({
  schemaVersion: KEYWORD_REACTION_EVENT_SCHEMA_VERSION,
  eventType: KEYWORD_REACTION_EVENT_TYPE,
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

const SOURCE_TYPES = new Set(KEYWORD_REACTION_EVENT_SOURCE_TYPES);
const DISPLAY_PATTERNS = new Set(["toast"]);
const REACTION_STYLES = new Set(["spark", "pulse", "soft", "none"]);
const PUBLIC_SAFE_EVENT_ID_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/i;

const SECRET_LIKE_VALUE_PATTERNS = [
  /sk-/i,
  /ghp_/i,
  /github_pat_/i,
  /BEGIN\s+PRIVATE\s+KEY/i,
  /\bapi[_-]?key\b/i,
  /\bauthorization\b/i,
  /\bpassword\b/i,
  /\boauth\b/i,
  /\bclient[_-]?secret\b/i,
  /\brefresh[_-]?token\b/i,
  /\baccess[_-]?token\b/i,
  /\bpayment\b/i,
  /\bbilling\b/i,
  /\braw\s+user\s+data\b/i,
  /\braw\s+(youtube\s+)?(comment|chat)\b/i,
  /\breal\s+viewer\b/i
];

export function normalizeKeywordReactionEvent(input = {}) {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? input : null;
  if (!raw) {
    return cloneDefaultKeywordReactionEvent();
  }

  if (Number(raw.schemaVersion) !== KEYWORD_REACTION_EVENT_SCHEMA_VERSION) {
    return cloneDefaultKeywordReactionEvent();
  }
  if (raw.eventType !== KEYWORD_REACTION_EVENT_TYPE) {
    return cloneDefaultKeywordReactionEvent();
  }
  if (!SOURCE_TYPES.has(String(raw.sourceType ?? ""))) {
    return cloneDefaultKeywordReactionEvent();
  }

  return {
    schemaVersion: KEYWORD_REACTION_EVENT_SCHEMA_VERSION,
    eventType: KEYWORD_REACTION_EVENT_TYPE,
    sourceType: String(raw.sourceType),
    eventId: safeEventId(raw.eventId, DEFAULT_KEYWORD_REACTION_EVENT.eventId),
    displayText: safeText(
      raw.displayText,
      DEFAULT_KEYWORD_REACTION_EVENT.displayText,
      KEYWORD_REACTION_EVENT_LIMITS.displayTextLength
    ),
    keyword: safeText(raw.keyword, DEFAULT_KEYWORD_REACTION_EVENT.keyword, KEYWORD_REACTION_EVENT_LIMITS.keywordLength),
    displayPattern: enumValue(raw.displayPattern, DISPLAY_PATTERNS, DEFAULT_KEYWORD_REACTION_EVENT.displayPattern),
    reactionStyle: enumValue(raw.reactionStyle, REACTION_STYLES, DEFAULT_KEYWORD_REACTION_EVENT.reactionStyle),
    intensity: clampNumber(
      raw.intensity,
      KEYWORD_REACTION_EVENT_LIMITS.intensity[0],
      KEYWORD_REACTION_EVENT_LIMITS.intensity[1],
      DEFAULT_KEYWORD_REACTION_EVENT.intensity
    ),
    durationMs: boundedNumber(
      raw.durationMs,
      KEYWORD_REACTION_EVENT_LIMITS.durationMs[0],
      KEYWORD_REACTION_EVENT_LIMITS.durationMs[1],
      DEFAULT_KEYWORD_REACTION_EVENT.durationMs
    ),
    offsetMs: boundedNumber(
      raw.offsetMs,
      KEYWORD_REACTION_EVENT_LIMITS.offsetMs[0],
      KEYWORD_REACTION_EVENT_LIMITS.offsetMs[1],
      DEFAULT_KEYWORD_REACTION_EVENT.offsetMs
    )
  };
}

export function buildDemoKeywordReactionEvent(config = {}) {
  const raw = config && typeof config === "object" && !Array.isArray(config) ? config : {};
  return normalizeKeywordReactionEvent({
    schemaVersion: KEYWORD_REACTION_EVENT_SCHEMA_VERSION,
    eventType: KEYWORD_REACTION_EVENT_TYPE,
    sourceType: "demo",
    eventId: DEFAULT_KEYWORD_REACTION_EVENT.eventId,
    displayText: DEFAULT_KEYWORD_REACTION_EVENT.displayText,
    keyword: DEFAULT_KEYWORD_REACTION_EVENT.keyword,
    displayPattern: raw.displayPattern,
    reactionStyle: raw.reactionStyle,
    intensity: raw.intensity,
    durationMs: DEFAULT_KEYWORD_REACTION_EVENT.durationMs,
    offsetMs: DEFAULT_KEYWORD_REACTION_EVENT.offsetMs
  });
}

function cloneDefaultKeywordReactionEvent() {
  return { ...DEFAULT_KEYWORD_REACTION_EVENT };
}

function enumValue(value, allowed, fallback) {
  const normalized = String(value ?? "");
  return allowed.has(normalized) ? normalized : fallback;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, number));
}

function boundedNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min) {
    return fallback;
  }
  return Math.min(max, number);
}

function safeText(value, fallback, maxLength) {
  if (value === undefined || value === null) {
    return fallback;
  }
  const text = truncateCodePoints(stripControlText(value).trim(), maxLength);
  if (!text || SECRET_LIKE_VALUE_PATTERNS.some((pattern) => pattern.test(text))) {
    return fallback;
  }
  return text;
}

function safeEventId(value, fallback) {
  const text = safeText(value, fallback, KEYWORD_REACTION_EVENT_LIMITS.eventIdLength);
  return PUBLIC_SAFE_EVENT_ID_PATTERN.test(text) ? text : fallback;
}

function stripControlText(value) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ");
}

function truncateCodePoints(value, maxLength) {
  return Array.from(String(value)).slice(0, maxLength).join("");
}
