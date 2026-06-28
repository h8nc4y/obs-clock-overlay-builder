export const CONFIG_VERSION = 1;

export const FONT_CANDIDATES = [
  "Noto Sans JP",
  "M PLUS Rounded 1c",
  "Zen Maru Gothic",
  "Kosugi Maru",
  "Kiwi Maru",
  "Mochiy Pop One",
  "Hachi Maru Pop",
  "Dela Gothic One",
  "Poppins",
  "Inter",
  "Roboto Mono"
];

export const DEFAULT_CONFIG = Object.freeze({
  version: CONFIG_VERSION,
  template: "mono-compact",
  clockType: "digital",
  timezone: "Asia/Tokyo",
  hour12: false,
  showSeconds: false,
  smallSeconds: false,
  showDate: false,
  dateFormat: "slash",
  showWeekday: false,
  weekdayFormat: "ja-short",
  label: "JST",
  labelPosition: "hidden",
  fontFamily: "Roboto Mono",
  textColor: "#1a1a1a",
  backgroundColor: "#ffffff",
  backgroundOpacity: 0.9,
  radius: 10,
  paddingX: 18,
  paddingY: 10,
  fontSize: 42,
  dateSize: 14,
  labelSize: 12,
  letterSpacing: 0.6,
  lineHeight: 1,
  fontWeight: 700,
  gap: 4,
  shadowColor: "#000000",
  shadowOpacity: 0.18,
  shadowBlur: 6,
  shadowX: 0,
  shadowY: 2,
  strokeColor: "#000000",
  strokeWidth: 0,
  borderColor: "#d9d7cf",
  borderOpacity: 1,
  borderWidth: 1,
  analogSize: 220,
  analogMarks: "numbers",
  analogSecondHand: "sweep",
  flipGroup: "single"
});

export const TEMPLATES = Object.freeze([
  {
    id: "mono-compact",
    name: "Mono Compact",
    note: "見やすい定番・等幅",
    sampleText: "12:34",
    category: "standard",
    config: {
      labelPosition: "hidden",
      fontFamily: "Roboto Mono",
      textColor: "#1a1a1a",
      backgroundColor: "#ffffff",
      backgroundOpacity: 0.9,
      radius: 10,
      paddingX: 18,
      paddingY: 10,
      fontSize: 42,
      dateSize: 14,
      labelSize: 12,
      fontWeight: 700,
      letterSpacing: 0.6,
      lineHeight: 1,
      gap: 4,
      shadowColor: "#000000",
      shadowOpacity: 0.18,
      shadowBlur: 6,
      shadowX: 0,
      shadowY: 2,
      strokeColor: "#000000",
      strokeWidth: 0,
      borderColor: "#d9d7cf",
      borderOpacity: 1,
      borderWidth: 1
    }
  },
  {
    id: "mono-sub",
    name: "Mono Sub",
    note: "秒を小さく添える",
    sampleText: "12:43",
    category: "standard",
    config: {
      labelPosition: "hidden",
      showSeconds: true,
      smallSeconds: true,
      fontFamily: "Roboto Mono",
      textColor: "#1a1a1a",
      backgroundColor: "#ffffff",
      backgroundOpacity: 0.9,
      radius: 10,
      paddingX: 18,
      paddingY: 10,
      fontSize: 42,
      dateSize: 14,
      labelSize: 12,
      fontWeight: 700,
      letterSpacing: 0.6,
      lineHeight: 1,
      gap: 4,
      shadowColor: "#000000",
      shadowOpacity: 0.18,
      shadowBlur: 6,
      shadowX: 0,
      shadowY: 2,
      strokeColor: "#000000",
      strokeWidth: 0,
      borderColor: "#d9d7cf",
      borderOpacity: 1,
      borderWidth: 1
    }
  },
  {
    id: "minimal-clear",
    name: "Clean White",
    note: "白パネルで一番見やすい",
    sampleText: "12:34",
    category: "standard",
    config: {
      labelPosition: "hidden",
      fontFamily: "Poppins",
      textColor: "#1f2430",
      backgroundColor: "#ffffff",
      backgroundOpacity: 0.82,
      radius: 14,
      paddingX: 22,
      paddingY: 12,
      fontSize: 46,
      dateSize: 15,
      labelSize: 12,
      fontWeight: 800,
      letterSpacing: 0.4,
      lineHeight: 1.05,
      gap: 5,
      shadowColor: "#1f2430",
      shadowOpacity: 0.12,
      shadowBlur: 8,
      shadowX: 0,
      shadowY: 3,
      strokeColor: "#ffffff",
      strokeWidth: 0,
      borderColor: "#e2e2e2",
      borderOpacity: 1,
      borderWidth: 1
    }
  },
  {
    id: "studio-live",
    name: "Studio Live",
    note: "LIVE枠＋下線の鉄板",
    sampleText: "LIVE 12:34",
    category: "standard",
    config: {
      label: "LIVE",
      labelPosition: "top",
      fontFamily: "Poppins",
      textColor: "#16181d",
      backgroundColor: "#ffffff",
      backgroundOpacity: 0.86,
      radius: 16,
      paddingX: 22,
      paddingY: 12,
      fontSize: 46,
      dateSize: 18,
      labelSize: 16,
      fontWeight: 800,
      letterSpacing: 0.5,
      lineHeight: 1.1,
      gap: 6,
      shadowColor: "#16181d",
      shadowOpacity: 0.14,
      shadowBlur: 10,
      shadowX: 0,
      shadowY: 4,
      strokeColor: "#ffffff",
      strokeWidth: 0,
      borderColor: "#e6e6e6",
      borderOpacity: 1,
      borderWidth: 1
    }
  },
  {
    id: "milk-tea",
    name: "Milk Tea",
    note: "やさしいミルクティー",
    sampleText: "JST 12:34",
    category: "cute",
    config: {
      label: "JST",
      labelPosition: "bottom",
      fontFamily: "Zen Maru Gothic",
      textColor: "#6b4a35",
      backgroundColor: "#fff7ef",
      backgroundOpacity: 0.95,
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
      shadowColor: "#cda17e",
      shadowOpacity: 0.32,
      shadowBlur: 14,
      shadowX: 0,
      shadowY: 6,
      strokeColor: "#ffffff",
      strokeWidth: 0,
      borderColor: "#e8c9a8",
      borderOpacity: 0.85,
      borderWidth: 2
    }
  },
  {
    id: "sakura",
    name: "Sakura",
    note: "桜色のまるい手書き",
    sampleText: "配信中 12:34",
    category: "cute",
    config: {
      label: "配信中",
      labelPosition: "top",
      fontFamily: "Hachi Maru Pop",
      textColor: "#b24a6e",
      backgroundColor: "#fff5f8",
      backgroundOpacity: 0.95,
      radius: 24,
      paddingX: 26,
      paddingY: 14,
      fontSize: 42,
      dateSize: 15,
      labelSize: 14,
      fontWeight: 700,
      letterSpacing: 0.2,
      lineHeight: 1.15,
      gap: 6,
      shadowColor: "#ffb7cd",
      shadowOpacity: 0.45,
      shadowBlur: 14,
      shadowX: 0,
      shadowY: 6,
      strokeColor: "#fffafc",
      strokeWidth: 0,
      borderColor: "#ffb7cd",
      borderOpacity: 0.9,
      borderWidth: 2
    }
  },
  {
    id: "pastel-pop",
    name: "Pastel Pop",
    note: "ポップでにぎやか",
    sampleText: "LIVE 12:34",
    category: "cute",
    config: {
      label: "LIVE",
      labelPosition: "top",
      fontFamily: "Mochiy Pop One",
      textColor: "#c2477e",
      backgroundColor: "#fff0f7",
      backgroundOpacity: 0.96,
      radius: 28,
      paddingX: 28,
      paddingY: 16,
      fontSize: 44,
      dateSize: 16,
      labelSize: 14,
      fontWeight: 800,
      letterSpacing: 0.4,
      lineHeight: 1.1,
      gap: 7,
      shadowColor: "#ff9ed2",
      shadowOpacity: 0.42,
      shadowBlur: 14,
      shadowX: 0,
      shadowY: 5,
      strokeColor: "#ffffff",
      strokeWidth: 0.4,
      borderColor: "#ff9ed2",
      borderOpacity: 0.9,
      borderWidth: 2
    }
  },
  {
    id: "soda",
    name: "Soda",
    note: "爽やかソーダ水",
    sampleText: "12:34 LIVE",
    category: "cute",
    config: {
      label: "LIVE",
      labelPosition: "right",
      fontFamily: "M PLUS Rounded 1c",
      textColor: "#0e7490",
      backgroundColor: "#eafcff",
      backgroundOpacity: 0.96,
      radius: 22,
      paddingX: 24,
      paddingY: 14,
      fontSize: 46,
      dateSize: 15,
      labelSize: 13,
      fontWeight: 800,
      letterSpacing: 0.7,
      lineHeight: 1.05,
      gap: 12,
      shadowColor: "#7fdfee",
      shadowOpacity: 0.42,
      shadowBlur: 12,
      shadowX: 0,
      shadowY: 5,
      strokeColor: "#ffffff",
      strokeWidth: 0.3,
      borderColor: "#7fdfee",
      borderOpacity: 0.9,
      borderWidth: 2
    }
  },
  {
    id: "night-studio",
    name: "Night Studio",
    note: "暗い画面で映える",
    sampleText: "LIVE 12:34",
    category: "cool",
    config: {
      label: "LIVE",
      labelPosition: "top",
      fontFamily: "Poppins",
      textColor: "#f1f5fb",
      backgroundColor: "#161b26",
      backgroundOpacity: 0.9,
      radius: 14,
      paddingX: 24,
      paddingY: 13,
      fontSize: 46,
      dateSize: 16,
      labelSize: 14,
      fontWeight: 700,
      letterSpacing: 0.5,
      lineHeight: 1.1,
      gap: 6,
      shadowColor: "#000000",
      shadowOpacity: 0.4,
      shadowBlur: 14,
      shadowX: 0,
      shadowY: 5,
      strokeColor: "#000000",
      strokeWidth: 0,
      borderColor: "#3a4660",
      borderOpacity: 0.9,
      borderWidth: 1
    }
  },
  {
    id: "neon-hud",
    name: "Neon HUD",
    note: "ゲーム配信・ネオン",
    sampleText: "12:34 LIVE",
    category: "cool",
    config: {
      label: "LIVE",
      labelPosition: "right",
      fontFamily: "Roboto Mono",
      textColor: "#bafff6",
      backgroundColor: "#071322",
      backgroundOpacity: 0.3,
      radius: 6,
      paddingX: 20,
      paddingY: 10,
      fontSize: 44,
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
    id: "aqua-deck",
    name: "Aqua Deck",
    note: "クールな水色デッキ",
    sampleText: "LIVE 12:34",
    category: "cool",
    config: {
      label: "LIVE",
      labelPosition: "top",
      fontFamily: "Poppins",
      textColor: "#e8f6fb",
      backgroundColor: "#22303c",
      backgroundOpacity: 0.92,
      radius: 12,
      paddingX: 22,
      paddingY: 12,
      fontSize: 46,
      dateSize: 15,
      labelSize: 13,
      fontWeight: 800,
      letterSpacing: 0.6,
      lineHeight: 1.1,
      gap: 6,
      shadowColor: "#000000",
      shadowOpacity: 0.35,
      shadowBlur: 12,
      shadowX: 0,
      shadowY: 4,
      strokeColor: "#000000",
      strokeWidth: 0,
      borderColor: "#aedded",
      borderOpacity: 0.85,
      borderWidth: 2
    }
  },
  {
    id: "analog-navy",
    name: "Navy Round",
    note: "アナログ・落ち着いた紺",
    sampleText: "10:08",
    category: "analog",
    config: {
      clockType: "analog",
      fontFamily: "Poppins",
      textColor: "#e7d3b5",
      backgroundColor: "#163a4a",
      backgroundOpacity: 1,
      borderColor: "#d8b48c",
      borderOpacity: 1,
      borderWidth: 5,
      strokeColor: "#e07a5f",
      analogSize: 240,
      analogMarks: "numbers",
      analogSecondHand: "sweep"
    }
  },
  {
    id: "analog-mono",
    name: "Mono Round",
    note: "アナログ・白文字盤",
    sampleText: "10:08",
    category: "analog",
    config: {
      clockType: "analog",
      fontFamily: "Poppins",
      textColor: "#1f2430",
      backgroundColor: "#ffffff",
      backgroundOpacity: 0.95,
      borderColor: "#d9d7cf",
      borderOpacity: 1,
      borderWidth: 2,
      strokeColor: "#e23b3b",
      analogSize: 220,
      analogMarks: "both",
      analogSecondHand: "sweep"
    }
  },
  {
    id: "analog-roman",
    name: "Classic Roman",
    note: "アナログ・ローマ数字",
    sampleText: "10:08",
    category: "analog",
    config: {
      clockType: "analog",
      fontFamily: "Poppins",
      textColor: "#2a2622",
      backgroundColor: "#fbf7ee",
      backgroundOpacity: 1,
      borderColor: "#c9a86a",
      borderOpacity: 1,
      borderWidth: 4,
      strokeColor: "#9a6b4a",
      analogSize: 240,
      analogMarks: "roman",
      analogSecondHand: "sweep"
    }
  },
  {
    id: "analog-cafe",
    name: "Cafe Brown",
    note: "アナログ・温かみのある茶",
    sampleText: "10:08",
    category: "analog",
    config: {
      clockType: "analog",
      fontFamily: "Zen Maru Gothic",
      textColor: "#f3e4cf",
      backgroundColor: "#5a4636",
      backgroundOpacity: 1,
      borderColor: "#caa46f",
      borderOpacity: 1,
      borderWidth: 5,
      strokeColor: "#e8b07a",
      analogSize: 230,
      analogMarks: "ticks",
      analogSecondHand: "sweep"
    }
  },
  {
    id: "flip-light",
    name: "Flip Light",
    note: "パタパタ・白カード",
    sampleText: "12:34",
    category: "flip",
    config: {
      clockType: "flip",
      flipGroup: "single",
      fontFamily: "Poppins",
      textColor: "#1f2430",
      backgroundColor: "#f4f5f7",
      backgroundOpacity: 1,
      radius: 12,
      fontSize: 56,
      fontWeight: 800,
      borderColor: "#d9dde3",
      borderOpacity: 1,
      borderWidth: 1
    }
  },
  {
    id: "flip-dark",
    name: "Flip Dark",
    note: "パタパタ・黒カード",
    sampleText: "12:34",
    category: "flip",
    config: {
      clockType: "flip",
      flipGroup: "single",
      fontFamily: "Poppins",
      textColor: "#f4f6fb",
      backgroundColor: "#23262e",
      backgroundOpacity: 1,
      radius: 12,
      fontSize: 56,
      fontWeight: 800,
      borderColor: "#3a3f4a",
      borderOpacity: 1,
      borderWidth: 1
    }
  },
  {
    id: "flip-pair",
    name: "Flip Pair",
    note: "パタパタ・2桁パネル",
    sampleText: "12 34",
    category: "flip",
    config: {
      clockType: "flip",
      flipGroup: "pair",
      fontFamily: "Poppins",
      textColor: "#1f2430",
      backgroundColor: "#f4f5f7",
      backgroundOpacity: 1,
      radius: 10,
      fontSize: 56,
      fontWeight: 800,
      borderColor: "#d9dde3",
      borderOpacity: 1,
      borderWidth: 1
    }
  }
]);

const DATE_FORMATS = new Set(["slash", "dash", "monthDay", "jp"]);
const WEEKDAY_FORMATS = new Set(["ja-short", "ja-long", "en-short", "en-long"]);
const LABEL_POSITIONS = new Set(["top", "bottom", "left", "right", "hidden"]);
const CLOCK_TYPES = new Set(["digital", "analog", "flip"]);
const ANALOG_MARKS = new Set(["numbers", "roman", "ticks", "both", "none"]);
const ANALOG_SECOND_HANDS = new Set(["sweep", "tick", "off"]);
const FLIP_GROUPS = new Set(["single", "pair"]);
const TEMPLATE_IDS = new Set(TEMPLATES.map((template) => template.id));

export const NUMBER_LIMITS = {
  backgroundOpacity: [0, 1],
  radius: [0, 48],
  paddingX: [0, 80],
  paddingY: [0, 60],
  fontSize: [18, 120],
  dateSize: [10, 56],
  labelSize: [10, 48],
  letterSpacing: [-1, 8],
  lineHeight: [0.9, 1.8],
  fontWeight: [300, 900],
  // gap はテンプレ専用・編集UI非公開。旧flat/共有URL/描画互換のため受理を続ける。
  gap: [0, 40],
  shadowOpacity: [0, 1],
  shadowBlur: [0, 36],
  shadowX: [-20, 20],
  shadowY: [-20, 20],
  strokeWidth: [0, 8],
  borderOpacity: [0, 1],
  borderWidth: [0, 8],
  analogSize: [120, 480]
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
    clockType: template.config.clockType ?? "digital",
    // タイムゾーン/12時間表記/日付は配信者の設定を守り、テンプレ切替で共有URLを揺らさない。
    timezone: current.timezone,
    hour12: current.hour12,
    // 秒表示だけは mono-sub などのテンプレ表現を優先し、未指定なら現在設定を引き継ぐ。
    showSeconds: template.config.showSeconds ?? current.showSeconds,
    smallSeconds: template.config.smallSeconds ?? current.smallSeconds,
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
  config.clockType = enumValue(raw.clockType, CLOCK_TYPES, DEFAULT_CONFIG.clockType);
  config.analogMarks = enumValue(raw.analogMarks, ANALOG_MARKS, DEFAULT_CONFIG.analogMarks);
  config.analogSecondHand = enumValue(raw.analogSecondHand, ANALOG_SECOND_HANDS, DEFAULT_CONFIG.analogSecondHand);
  config.flipGroup = enumValue(raw.flipGroup, FLIP_GROUPS, DEFAULT_CONFIG.flipGroup);
  config.timezone = sanitizeTimezone(raw.timezone ?? raw.tz, DEFAULT_CONFIG.timezone);
  config.hour12 = coerceBool(raw.hour12, DEFAULT_CONFIG.hour12);
  config.showSeconds = coerceBool(raw.showSeconds ?? raw.seconds, DEFAULT_CONFIG.showSeconds);
  config.smallSeconds = coerceBool(raw.smallSeconds, DEFAULT_CONFIG.smallSeconds);
  config.showDate = coerceBool(raw.showDate ?? raw.date, DEFAULT_CONFIG.showDate);
  config.dateFormat = enumValue(raw.dateFormat, DATE_FORMATS, DEFAULT_CONFIG.dateFormat);
  config.showWeekday = coerceBool(raw.showWeekday ?? raw.weekday, DEFAULT_CONFIG.showWeekday);
  config.weekdayFormat = enumValue(raw.weekdayFormat, WEEKDAY_FORMATS, DEFAULT_CONFIG.weekdayFormat);
  config.label =
    raw.label === undefined || raw.label === null
      ? DEFAULT_CONFIG.label
      : truncateCodePoints(stripControlText(raw.label).trim(), 40);
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

  // NUMBER_LIMITS.fontWeight ([300,900]) で既にクランプ済みなので、100刻みへの丸めだけ行う。
  config.fontWeight = Math.round(config.fontWeight / 100) * 100;
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
  assign("smallSeconds");
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
    // 壊れたJSONをそのまま投げると V8 の英語エラーが日本語UIへ漏れる。
    // ここは null を返し、parseImportInput 側の日本語メッセージへ集約する。
    try {
      return normalizeConfig(JSON.parse(text));
    } catch {
      return null;
    }
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
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
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
