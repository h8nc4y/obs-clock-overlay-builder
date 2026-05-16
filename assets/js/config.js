export const CONFIG_VERSION = 1;

export const FONT_CANDIDATES = [
  "Noto Sans JP",
  "M PLUS Rounded 1c",
  "Zen Maru Gothic",
  "Kosugi Maru",
  "Kiwi Maru",
  "Dela Gothic One",
  "Poppins",
  "Inter",
  "Roboto Mono"
];

export const DEFAULT_CONFIG = Object.freeze({
  version: CONFIG_VERSION,
  template: "minimal-clear",
  timezone: "Asia/Tokyo",
  hour12: false,
  showSeconds: true,
  showDate: false,
  dateFormat: "slash",
  showWeekday: false,
  weekdayFormat: "ja-short",
  label: "JST",
  labelPosition: "hidden",
  fontFamily: "Poppins",
  textColor: "#ffffff",
  backgroundColor: "#000000",
  backgroundOpacity: 0,
  radius: 4,
  paddingX: 8,
  paddingY: 4,
  fontSize: 48,
  dateSize: 15,
  labelSize: 12,
  letterSpacing: 0.6,
  lineHeight: 1,
  fontWeight: 800,
  gap: 4,
  shadowColor: "#000000",
  shadowOpacity: 0.62,
  shadowBlur: 10,
  shadowX: 0,
  shadowY: 3,
  strokeColor: "#000000",
  strokeWidth: 1.2,
  borderColor: "#ffffff",
  borderOpacity: 0,
  borderWidth: 0
});

export const TEMPLATES = Object.freeze([
  {
    id: "minimal-clear",
    name: "Minimal Clear",
    note: "透明背景と縁取り",
    sampleText: "12:34",
    config: {
      labelPosition: "hidden",
      fontFamily: "Poppins",
      textColor: "#ffffff",
      backgroundColor: "#000000",
      backgroundOpacity: 0,
      radius: 4,
      paddingX: 8,
      paddingY: 4,
      fontSize: 48,
      dateSize: 15,
      labelSize: 12,
      fontWeight: 800,
      letterSpacing: 0.6,
      lineHeight: 1,
      gap: 4,
      shadowColor: "#000000",
      shadowOpacity: 0.62,
      shadowBlur: 10,
      shadowX: 0,
      shadowY: 3,
      strokeColor: "#000000",
      strokeWidth: 1.2,
      borderColor: "#ffffff",
      borderOpacity: 0,
      borderWidth: 0
    }
  },
  {
    id: "milk-tea",
    name: "Milk Tea",
    note: "淡い背景と丸み",
    sampleText: "JST 12:34",
    config: {
      label: "JST",
      labelPosition: "bottom",
      fontFamily: "Zen Maru Gothic",
      textColor: "#3d2d24",
      backgroundColor: "#f3dfc6",
      backgroundOpacity: 0.9,
      radius: 24,
      paddingX: 26,
      paddingY: 16,
      fontSize: 42,
      dateSize: 16,
      labelSize: 13,
      fontWeight: 700,
      letterSpacing: 0.3,
      lineHeight: 1.12,
      gap: 7,
      shadowColor: "#8c6a55",
      shadowOpacity: 0.18,
      shadowBlur: 18,
      shadowX: 0,
      shadowY: 8,
      strokeColor: "#ffffff",
      strokeWidth: 0,
      borderColor: "#cda17e",
      borderOpacity: 0.55,
      borderWidth: 1
    }
  },
  {
    id: "pastel-pop",
    name: "Pastel Pop",
    note: "明るい配信枠向け",
    sampleText: "LIVE 12:34",
    config: {
      label: "LIVE",
      labelPosition: "top",
      fontFamily: "M PLUS Rounded 1c",
      textColor: "#225260",
      backgroundColor: "#ffeaf4",
      backgroundOpacity: 0.94,
      radius: 30,
      paddingX: 30,
      paddingY: 17,
      fontSize: 44,
      dateSize: 16,
      labelSize: 14,
      fontWeight: 800,
      letterSpacing: 0.4,
      lineHeight: 1.1,
      gap: 7,
      shadowColor: "#6fcbd7",
      shadowOpacity: 0.28,
      shadowBlur: 16,
      shadowX: 0,
      shadowY: 5,
      strokeColor: "#ffffff",
      strokeWidth: 0.4,
      borderColor: "#ff8fbd",
      borderOpacity: 0.85,
      borderWidth: 2
    }
  },
  {
    id: "soda",
    name: "Soda",
    note: "爽やかな右ラベル",
    sampleText: "12:34 LIVE",
    config: {
      label: "LIVE",
      labelPosition: "right",
      fontFamily: "Poppins",
      textColor: "#06344b",
      backgroundColor: "#dff8ff",
      backgroundOpacity: 0.9,
      radius: 18,
      paddingX: 24,
      paddingY: 14,
      fontSize: 46,
      dateSize: 15,
      labelSize: 13,
      fontWeight: 800,
      letterSpacing: 0.7,
      lineHeight: 1.05,
      gap: 12,
      shadowColor: "#2aa9c7",
      shadowOpacity: 0.26,
      shadowBlur: 12,
      shadowX: 0,
      shadowY: 5,
      strokeColor: "#ffffff",
      strokeWidth: 0.3,
      borderColor: "#42c6e8",
      borderOpacity: 0.85,
      borderWidth: 2
    }
  },
  {
    id: "sakura",
    name: "Sakura",
    note: "和風で柔らかい",
    sampleText: "配信中 12:34",
    config: {
      label: "配信中",
      labelPosition: "top",
      fontFamily: "Kiwi Maru",
      textColor: "#563047",
      backgroundColor: "#fff0f6",
      backgroundOpacity: 0.88,
      radius: 20,
      paddingX: 28,
      paddingY: 15,
      fontSize: 42,
      dateSize: 15,
      labelSize: 14,
      fontWeight: 700,
      letterSpacing: 0.2,
      lineHeight: 1.15,
      gap: 6,
      shadowColor: "#d7769a",
      shadowOpacity: 0.2,
      shadowBlur: 12,
      shadowX: 0,
      shadowY: 5,
      strokeColor: "#fffafc",
      strokeWidth: 0.2,
      borderColor: "#ff9cbc",
      borderOpacity: 0.72,
      borderWidth: 1
    }
  },
  {
    id: "night-studio",
    name: "Night Studio",
    note: "暗所で読みやすい",
    sampleText: "JST 12:34",
    config: {
      label: "JST",
      labelPosition: "left",
      fontFamily: "Inter",
      textColor: "#f7f8ff",
      backgroundColor: "#151722",
      backgroundOpacity: 0.86,
      radius: 12,
      paddingX: 24,
      paddingY: 13,
      fontSize: 44,
      dateSize: 15,
      labelSize: 13,
      fontWeight: 800,
      letterSpacing: 0.5,
      lineHeight: 1.05,
      gap: 12,
      shadowColor: "#000000",
      shadowOpacity: 0.52,
      shadowBlur: 16,
      shadowX: 0,
      shadowY: 8,
      strokeColor: "#000000",
      strokeWidth: 0.3,
      borderColor: "#687088",
      borderOpacity: 0.75,
      borderWidth: 1
    }
  },
  {
    id: "neon-hud",
    name: "Neon HUD",
    note: "透明HUD風",
    sampleText: "12:34 LIVE",
    config: {
      label: "LIVE",
      labelPosition: "right",
      fontFamily: "Roboto Mono",
      textColor: "#bafff6",
      backgroundColor: "#071322",
      backgroundOpacity: 0.28,
      radius: 6,
      paddingX: 20,
      paddingY: 10,
      fontSize: 42,
      dateSize: 14,
      labelSize: 12,
      fontWeight: 700,
      letterSpacing: 1.1,
      lineHeight: 1.04,
      gap: 12,
      shadowColor: "#2fffe6",
      shadowOpacity: 0.58,
      shadowBlur: 18,
      shadowX: 0,
      shadowY: 0,
      strokeColor: "#02131f",
      strokeWidth: 0.8,
      borderColor: "#48ffe2",
      borderOpacity: 0.9,
      borderWidth: 1
    }
  },
  {
    id: "mono-compact",
    name: "Mono Compact",
    note: "小さく硬派",
    sampleText: "12:34",
    config: {
      labelPosition: "hidden",
      fontFamily: "Roboto Mono",
      textColor: "#151515",
      backgroundColor: "#f7f6f1",
      backgroundOpacity: 0.92,
      radius: 8,
      paddingX: 16,
      paddingY: 8,
      fontSize: 36,
      dateSize: 13,
      labelSize: 11,
      fontWeight: 700,
      letterSpacing: 0.8,
      lineHeight: 1,
      gap: 4,
      shadowColor: "#000000",
      shadowOpacity: 0.12,
      shadowBlur: 4,
      shadowX: 0,
      shadowY: 2,
      strokeColor: "#ffffff",
      strokeWidth: 0,
      borderColor: "#1f1f1f",
      borderOpacity: 0.8,
      borderWidth: 1
    }
  }
]);

const DATE_FORMATS = new Set(["slash", "dash", "monthDay", "jp"]);
const WEEKDAY_FORMATS = new Set(["ja-short", "ja-long", "en-short", "en-long"]);
const LABEL_POSITIONS = new Set(["top", "bottom", "left", "right", "hidden"]);
const TEMPLATE_IDS = new Set(TEMPLATES.map((template) => template.id));

const NUMBER_LIMITS = {
  backgroundOpacity: [0, 1],
  radius: [0, 80],
  paddingX: [0, 120],
  paddingY: [0, 100],
  fontSize: [10, 180],
  dateSize: [8, 90],
  labelSize: [8, 80],
  letterSpacing: [-2, 12],
  lineHeight: [0.8, 2.2],
  fontWeight: [100, 1000],
  gap: [0, 40],
  shadowOpacity: [0, 1],
  shadowBlur: [0, 80],
  shadowX: [-80, 80],
  shadowY: [-80, 80],
  strokeWidth: [0, 12],
  borderOpacity: [0, 1],
  borderWidth: [0, 16]
};

export function cloneDefaultConfig() {
  return { ...DEFAULT_CONFIG };
}

export function getTemplate(templateId) {
  return TEMPLATES.find((template) => template.id === templateId) ?? TEMPLATES[0];
}

export function applyTemplate(config, templateId) {
  const current = normalizeConfig(config);
  const template = getTemplate(templateId);
  return normalizeConfig({
    ...current,
    ...template.config,
    template: template.id,
    timezone: current.timezone,
    hour12: current.hour12,
    showSeconds: current.showSeconds,
    showDate: current.showDate,
    dateFormat: current.dateFormat,
    showWeekday: current.showWeekday,
    weekdayFormat: current.weekdayFormat
  });
}

export function normalizeConfig(input = {}) {
  const raw = input && typeof input === "object" ? { ...input } : {};
  if (raw.version === undefined && raw.v !== undefined) {
    raw.version = raw.v;
  }
  if (raw.template === undefined && raw.theme !== undefined) {
    raw.template = raw.theme;
  }

  const config = { ...DEFAULT_CONFIG };
  config.version = CONFIG_VERSION;
  config.template = enumValue(raw.template, TEMPLATE_IDS, DEFAULT_CONFIG.template);
  config.timezone = sanitizeTimezone(raw.timezone ?? raw.tz, DEFAULT_CONFIG.timezone);
  config.hour12 = coerceBool(raw.hour12, DEFAULT_CONFIG.hour12);
  config.showSeconds = coerceBool(raw.showSeconds ?? raw.seconds, DEFAULT_CONFIG.showSeconds);
  config.showDate = coerceBool(raw.showDate ?? raw.date, DEFAULT_CONFIG.showDate);
  config.dateFormat = enumValue(raw.dateFormat, DATE_FORMATS, DEFAULT_CONFIG.dateFormat);
  config.showWeekday = coerceBool(raw.showWeekday ?? raw.weekday, DEFAULT_CONFIG.showWeekday);
  config.weekdayFormat = enumValue(raw.weekdayFormat, WEEKDAY_FORMATS, DEFAULT_CONFIG.weekdayFormat);
  config.label = safeText(raw.label, DEFAULT_CONFIG.label, 40);
  config.labelPosition = enumValue(raw.labelPosition, LABEL_POSITIONS, DEFAULT_CONFIG.labelPosition);
  config.fontFamily = safeText(raw.fontFamily ?? raw.font, DEFAULT_CONFIG.fontFamily, 80);
  config.textColor = normalizeHex(raw.textColor, DEFAULT_CONFIG.textColor);
  config.backgroundColor = normalizeHex(raw.backgroundColor ?? raw.bg, DEFAULT_CONFIG.backgroundColor);
  config.borderColor = normalizeHex(raw.borderColor, DEFAULT_CONFIG.borderColor);
  config.shadowColor = normalizeHex(raw.shadowColor, DEFAULT_CONFIG.shadowColor);
  config.strokeColor = normalizeHex(raw.strokeColor, DEFAULT_CONFIG.strokeColor);

  for (const [key, [min, max]] of Object.entries(NUMBER_LIMITS)) {
    config[key] = clampNumber(raw[key], min, max, DEFAULT_CONFIG[key]);
  }

  config.fontWeight = Math.round(config.fontWeight / 100) * 100;
  config.fontWeight = clampNumber(config.fontWeight, 100, 1000, DEFAULT_CONFIG.fontWeight);
  return config;
}

export function encodeConfig(config, options = {}) {
  const normalized = normalizeConfig(config);
  const payload = options.compact ? compactConfig(normalized) : normalized;
  return toBase64Url(JSON.stringify(payload));
}

export function decodeConfig(encoded) {
  const text = fromBase64Url(String(encoded ?? "").trim());
  const parsed = JSON.parse(text);
  return normalizeConfig(parsed);
}

export function parseConfigFromQuery(input) {
  const params = paramsFromUnknown(input);
  if (!params) {
    return cloneDefaultConfig();
  }
  const encoded = params.get("c");
  if (encoded) {
    try {
      return decodeConfig(encoded);
    } catch {
      return cloneDefaultConfig();
    }
  }
  return normalizeFlatQueryConfig(flatParamsToConfig(params));
}

export function parseImportInput(input) {
  const text = String(input ?? "").trim();
  if (!text) {
    throw new Error("入力が空です。");
  }

  const jsonConfig = parseJsonLikeConfig(text);
  if (jsonConfig) {
    return jsonConfig;
  }

  const params = paramsFromUnknown(text);
  if (params) {
    return parseConfigFromQuery(params);
  }

  try {
    return decodeConfig(text);
  } catch {
    try {
      return decodeConfig(decodeURIComponent(text));
    } catch {
      throw new Error("設定を読み込めませんでした。URL、クエリ、JSON、または c の文字列を確認してください。");
    }
  }
}

export function configToClockUrl(config, baseHref, options = {}) {
  const url = new URL(baseHref);
  url.search = "";
  url.searchParams.set("c", encodeConfig(config, { compact: options.compact === true }));
  return url.href;
}

export function cssStringLiteral(value) {
  const safe = truncateCodePoints(stripControlText(value), 120);
  return JSON.stringify(safe).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function hexToRgb(hex) {
  const normalized = normalizeHex(hex, "#000000");
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16)
  };
}

export function hexToRgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  const a = clampNumber(alpha, 0, 1, 1);
  return `rgba(${r}, ${g}, ${b}, ${round(a, 3)})`;
}

export function contrastRatio(foreground, background) {
  const fg = relativeLuminance(hexToRgb(foreground));
  const bg = relativeLuminance(hexToRgb(background));
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

export function sanitizeTimezone(value, fallback = DEFAULT_CONFIG.timezone) {
  const timezone = safeText(value, fallback, 64);
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return fallback;
  }
}

function flatParamsToConfig(params) {
  const raw = {};
  const assign = (param, key = param) => {
    if (params.has(param)) {
      raw[key] = params.get(param);
    }
  };
  assign("v", "version");
  assign("version");
  assign("theme", "template");
  assign("template");
  assign("tz", "timezone");
  assign("timezone");
  assign("hour12");
  assign("seconds", "showSeconds");
  assign("showSeconds");
  assign("date", "showDate");
  assign("showDate");
  assign("dateFormat");
  assign("weekday", "showWeekday");
  assign("showWeekday");
  assign("weekdayFormat");
  assign("label");
  assign("labelPosition");
  assign("font", "fontFamily");
  assign("fontFamily");
  assign("textColor");
  assign("bg", "backgroundColor");
  assign("backgroundColor");
  assign("backgroundOpacity");
  assign("radius");
  assign("paddingX");
  assign("paddingY");
  assign("fontSize");
  assign("dateSize");
  assign("labelSize");
  assign("letterSpacing");
  assign("lineHeight");
  assign("fontWeight");
  assign("gap");
  assign("shadowColor");
  assign("shadowOpacity");
  assign("shadowBlur");
  assign("shadowX");
  assign("shadowY");
  assign("strokeColor");
  assign("strokeWidth");
  assign("borderColor");
  assign("borderOpacity");
  assign("borderWidth");
  return raw;
}

function normalizeFlatQueryConfig(raw) {
  const templateId = String(raw.template ?? "");
  if (TEMPLATE_IDS.has(templateId)) {
    return normalizeConfig({
      ...getTemplate(templateId).config,
      ...raw,
      template: templateId
    });
  }
  return normalizeConfig(raw);
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

function parseJsonLikeConfig(text) {
  if (text.startsWith("{")) {
    return normalizeConfig(JSON.parse(text));
  }
  try {
    const decoded = decodeURIComponent(text);
    if (decoded !== text && decoded.trim().startsWith("{")) {
      return normalizeConfig(JSON.parse(decoded));
    }
  } catch {
    return null;
  }
  return null;
}

function compactConfig(config) {
  const compact = {
    version: CONFIG_VERSION,
    template: config.template
  };
  for (const [key, value] of Object.entries(config)) {
    if (key === "version" || key === "template") {
      continue;
    }
    if (JSON.stringify(value) !== JSON.stringify(DEFAULT_CONFIG[key])) {
      compact[key] = value;
    }
  }
  return compact;
}

function coerceBool(value, fallback) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }
  return fallback;
}

function enumValue(value, allowed, fallback) {
  const normalized = String(value ?? "");
  return allowed.has(normalized) ? normalized : fallback;
}

function normalizeHex(value, fallback) {
  const text = String(value ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text.toLowerCase() : fallback;
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
  return text ? text : fallback;
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

function relativeLuminance({ r, g, b }) {
  const convert = (channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
}

function round(value, places) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
