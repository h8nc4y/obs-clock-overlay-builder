export const KEYWORD_REACTION_FIXTURE_SCHEMA_VERSION = 1;

export const KEYWORD_REACTION_FIXTURE_LIMITS = Object.freeze({
  events: 30,
  displayTextLength: 160,
  keywordLength: 80,
  intensity: [0, 3]
});

const REACTION_STYLES = new Set(["spark", "pulse", "soft", "none"]);
const DEFAULT_REACTION_STYLE = "spark";
const DEFAULT_INTENSITY = 1;

// fixture event data stays local to editor preview; generated URLs remain config-only.
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

const BUILTIN_EVENTS = Object.freeze(
  [
    {
      id: "demo-start",
      offsetMs: 0,
      displayText: "配信開始",
      keyword: "配信開始",
      intensity: 1,
      reactionStyle: "soft"
    },
    {
      id: "demo-hello",
      offsetMs: 1600,
      displayText: "hello",
      keyword: "hello",
      intensity: 2,
      reactionStyle: "spark"
    },
    {
      id: "demo-888",
      offsetMs: 3200,
      displayText: "888",
      keyword: "888",
      intensity: 3,
      reactionStyle: "pulse"
    }
  ].map((event) => Object.freeze(event))
);

export const DEFAULT_KEYWORD_REACTION_FIXTURE = Object.freeze({
  schemaVersion: KEYWORD_REACTION_FIXTURE_SCHEMA_VERSION,
  fixtureId: "demo-basic",
  description: "人工デモ: 配信開始と反応確認",
  events: BUILTIN_EVENTS
});

export function getBuiltinKeywordReactionFixture() {
  return cloneFixture(DEFAULT_KEYWORD_REACTION_FIXTURE);
}

export function validateKeywordReactionFixture(input = {}) {
  return normalizeKeywordReactionFixture(input);
}

export function normalizeKeywordReactionFixture(input = {}) {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? input : null;
  if (!raw) {
    return invalid("fixtureの形式が正しくありません。");
  }

  if (Number(raw.schemaVersion) !== KEYWORD_REACTION_FIXTURE_SCHEMA_VERSION) {
    return invalid("fixture schemaVersion が対応外です。");
  }

  const fixtureId = requiredSafeText(raw.fixtureId, KEYWORD_REACTION_FIXTURE_LIMITS.keywordLength);
  if (!fixtureId) {
    return invalid("fixtureId が正しくありません。");
  }

  const description = optionalSafeText(raw.description, KEYWORD_REACTION_FIXTURE_LIMITS.displayTextLength);
  if (raw.description !== undefined && !description) {
    return invalid("fixture description が正しくありません。");
  }

  if (!Array.isArray(raw.events)) {
    return invalid("fixture events は配列にしてください。");
  }

  if (raw.events.length === 0) {
    return invalid("fixture events が空です。");
  }

  if (raw.events.length > KEYWORD_REACTION_FIXTURE_LIMITS.events) {
    return invalid(`fixture events は${KEYWORD_REACTION_FIXTURE_LIMITS.events}件以内にしてください。`);
  }

  const events = [];
  const errors = [];
  for (const [index, event] of raw.events.entries()) {
    const normalized = normalizeFixtureEvent(event);
    if (!normalized.ok) {
      errors.push(`event ${index + 1}: ${normalized.error}`);
      continue;
    }
    events.push(normalized.event);
  }

  if (errors.length > 0) {
    return { ok: false, fixture: null, errors };
  }

  return {
    ok: true,
    fixture: {
      schemaVersion: KEYWORD_REACTION_FIXTURE_SCHEMA_VERSION,
      fixtureId,
      description: description ?? "",
      events: [...events].sort((a, b) => a.offsetMs - b.offsetMs)
    },
    errors: []
  };
}

export function normalizeFixtureEvent(input = {}) {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? input : null;
  if (!raw) {
    return { ok: false, event: null, error: "eventの形式が正しくありません。" };
  }

  const id = requiredSafeText(raw.id, KEYWORD_REACTION_FIXTURE_LIMITS.keywordLength);
  if (!id) {
    return { ok: false, event: null, error: "id が正しくありません。" };
  }

  const offsetMs = Number(raw.offsetMs);
  if (!Number.isFinite(offsetMs) || offsetMs < 0) {
    return { ok: false, event: null, error: "offsetMs は0以上の有限数にしてください。" };
  }

  const displayText = requiredSafeText(raw.displayText, KEYWORD_REACTION_FIXTURE_LIMITS.displayTextLength);
  if (!displayText) {
    return { ok: false, event: null, error: "displayText が正しくありません。" };
  }

  const keyword = requiredSafeText(raw.keyword, KEYWORD_REACTION_FIXTURE_LIMITS.keywordLength);
  if (!keyword) {
    return { ok: false, event: null, error: "keyword が正しくありません。" };
  }

  return {
    ok: true,
    event: {
      id,
      offsetMs,
      displayText,
      keyword,
      intensity: clampNumber(
        raw.intensity,
        KEYWORD_REACTION_FIXTURE_LIMITS.intensity[0],
        KEYWORD_REACTION_FIXTURE_LIMITS.intensity[1],
        DEFAULT_INTENSITY
      ),
      reactionStyle: enumValue(raw.reactionStyle, REACTION_STYLES, DEFAULT_REACTION_STYLE)
    },
    error: ""
  };
}

export function buildFixturePlaybackSchedule(fixture = {}) {
  const events = Array.isArray(fixture.events) ? fixture.events : [];
  return events
    .slice()
    .sort((a, b) => Number(a.offsetMs) - Number(b.offsetMs))
    .map((event) => ({
      delayMs: Number(event.offsetMs),
      event: { ...event }
    }));
}

function invalid(message) {
  return { ok: false, fixture: null, errors: [message] };
}

function cloneFixture(fixture) {
  return {
    schemaVersion: fixture.schemaVersion,
    fixtureId: fixture.fixtureId,
    description: fixture.description,
    events: fixture.events.map((event) => ({ ...event }))
  };
}

function requiredSafeText(value, maxLength) {
  if (value === undefined || value === null) {
    return "";
  }
  const text = truncateCodePoints(stripControlText(value).trim(), maxLength);
  if (!text || isSecretLikeValue(text)) {
    return "";
  }
  return text;
}

function optionalSafeText(value, maxLength) {
  if (value === undefined || value === null) {
    return "";
  }
  const text = truncateCodePoints(stripControlText(value).trim(), maxLength);
  return isSecretLikeValue(text) ? "" : text;
}

function isSecretLikeValue(text) {
  return SECRET_LIKE_VALUE_PATTERNS.some((pattern) => pattern.test(text));
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

function stripControlText(value) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ");
}

function truncateCodePoints(value, maxLength) {
  return Array.from(String(value)).slice(0, maxLength).join("");
}
