export const KEYWORD_REACTION_CONFIG_VERSION = 1;
export const KEYWORD_REACTION_OVERLAY_TYPE = "keyword-reaction";

export const DEFAULT_KEYWORD_REACTION_CONFIG = Object.freeze({
  schemaVersion: KEYWORD_REACTION_CONFIG_VERSION,
  overlayType: KEYWORD_REACTION_OVERLAY_TYPE,
  displayPattern: "toast",
  reactionStyle: "spark",
  intensity: 1,
  keyword: "hello",
  matchMode: "contains"
});

export const KEYWORD_REACTION_LIMITS = Object.freeze({
  intensity: [0, 3],
  keywordLength: 80
});

const DISPLAY_PATTERNS = new Set(["toast", "ticker", "badge"]);
const REACTION_STYLES = new Set(["spark", "pulse", "soft", "none"]);
const MATCH_MODES = new Set(["contains", "exact"]);

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

export function cloneDefaultKeywordReactionConfig() {
  return { ...DEFAULT_KEYWORD_REACTION_CONFIG };
}

export function normalizeKeywordReactionConfig(input = {}) {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? input : {};

  if (raw.schemaVersion !== undefined && Number(raw.schemaVersion) !== KEYWORD_REACTION_CONFIG_VERSION) {
    return cloneDefaultKeywordReactionConfig();
  }
  if (raw.overlayType !== undefined && raw.overlayType !== KEYWORD_REACTION_OVERLAY_TYPE) {
    return cloneDefaultKeywordReactionConfig();
  }

  return {
    schemaVersion: KEYWORD_REACTION_CONFIG_VERSION,
    overlayType: KEYWORD_REACTION_OVERLAY_TYPE,
    displayPattern: enumValue(raw.displayPattern, DISPLAY_PATTERNS, DEFAULT_KEYWORD_REACTION_CONFIG.displayPattern),
    reactionStyle: enumValue(raw.reactionStyle, REACTION_STYLES, DEFAULT_KEYWORD_REACTION_CONFIG.reactionStyle),
    intensity: clampNumber(
      raw.intensity,
      KEYWORD_REACTION_LIMITS.intensity[0],
      KEYWORD_REACTION_LIMITS.intensity[1],
      DEFAULT_KEYWORD_REACTION_CONFIG.intensity
    ),
    keyword: safeText(raw.keyword, DEFAULT_KEYWORD_REACTION_CONFIG.keyword, KEYWORD_REACTION_LIMITS.keywordLength),
    matchMode: normalizeMatchMode(raw.matchMode)
  };
}

export function encodeKeywordReactionConfig(config, options = {}) {
  const normalized = normalizeKeywordReactionConfig(config);
  const payload = options.compact ? compactKeywordReactionConfig(normalized) : normalized;
  return toBase64Url(JSON.stringify(payload));
}

export function decodeKeywordReactionConfig(encoded) {
  try {
    const text = fromBase64Url(String(encoded ?? "").trim());
    return normalizeKeywordReactionConfig(JSON.parse(text));
  } catch {
    return cloneDefaultKeywordReactionConfig();
  }
}

export function parseKeywordReactionConfigFromQuery(input) {
  const params = paramsFromUnknown(input);
  if (!params) {
    return cloneDefaultKeywordReactionConfig();
  }
  const encoded = params.get("c");
  if (!encoded) {
    return cloneDefaultKeywordReactionConfig();
  }
  return decodeKeywordReactionConfig(encoded);
}

function compactKeywordReactionConfig(config) {
  const compact = {
    schemaVersion: KEYWORD_REACTION_CONFIG_VERSION,
    overlayType: KEYWORD_REACTION_OVERLAY_TYPE
  };
  for (const [key, value] of Object.entries(config)) {
    if (key === "schemaVersion" || key === "overlayType") {
      continue;
    }
    if (JSON.stringify(value) !== JSON.stringify(DEFAULT_KEYWORD_REACTION_CONFIG[key])) {
      compact[key] = value;
    }
  }
  return compact;
}

function paramsFromUnknown(input) {
  if (input instanceof URLSearchParams) {
    return input;
  }
  if (input && typeof URL !== "undefined" && input instanceof URL) {
    return input.searchParams;
  }
  const text = String(input ?? "").trim();
  if (!text) {
    return null;
  }
  if (text.startsWith("?")) {
    return new URLSearchParams(text.slice(1));
  }
  if (text.includes("?")) {
    try {
      return new URL(text, "https://local.invalid/").searchParams;
    } catch {
      const query = text.slice(text.indexOf("?") + 1).split("#")[0];
      return new URLSearchParams(query);
    }
  }
  if (text.includes("=") && !text.startsWith("{")) {
    return new URLSearchParams(text);
  }
  return null;
}

function normalizeMatchMode(value) {
  const normalized = String(value ?? "");
  if (normalized === "includes") {
    return "contains";
  }
  return enumValue(normalized, MATCH_MODES, DEFAULT_KEYWORD_REACTION_CONFIG.matchMode);
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

function stripControlText(value) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ");
}

function truncateCodePoints(value, maxLength) {
  return Array.from(String(value)).slice(0, maxLength).join("");
}

function toBase64Url(text) {
  const bytes = encodeUtf8(text);
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(encoded) {
  const base64 = String(encoded)
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(String(encoded).length / 4) * 4, "=");
  return decodeUtf8(base64ToBytes(base64));
}

function encodeUtf8(text) {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(text);
  }
  return Uint8Array.from(Buffer.from(text, "utf8"));
}

function decodeUtf8(bytes) {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(bytes).toString("utf8");
}

function bytesToBase64(bytes) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(base64, "base64"));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
