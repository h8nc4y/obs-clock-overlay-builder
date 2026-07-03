import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_CONFIG,
  NULLABLE_NUMBER_LIMITS,
  NUMBER_LIMITS,
  applyTemplate,
  configToClockUrl,
  contrastRatio,
  cssStringLiteral,
  decodeConfig,
  encodeConfig,
  hexToRgba,
  normalizeConfig,
  parseConfigFromQuery,
  parseImportInput
} from "../assets/js/config.js";
import { readFileSync } from "node:fs";

test("encodes and decodes unicode config through base64url", () => {
  const config = normalizeConfig({
    ...DEFAULT_CONFIG,
    template: "sakura",
    label: "配信中",
    fontFamily: "M PLUS Rounded 1c",
    showDate: true
  });

  const encoded = encodeConfig(config);
  assert.match(encoded, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeConfig(encoded), config);
});

test("parses c parameter from a full generated URL", () => {
  const encoded = encodeConfig({ label: "LIVE", timezone: "UTC", showSeconds: false });
  const config = parseImportInput(`https://example.com/clock/?c=${encoded}`);

  assert.equal(config.label, "LIVE");
  assert.equal(config.timezone, "UTC");
  assert.equal(config.showSeconds, false);
});

test("smallSeconds round-trips through full and compact encoded config", () => {
  const source = normalizeConfig({
    timezone: "UTC",
    showSeconds: true,
    smallSeconds: true
  });

  assert.equal(decodeConfig(encodeConfig(source)).smallSeconds, true);
  assert.equal(decodeConfig(encodeConfig(source, { compact: true })).smallSeconds, true);
});

test("legacy encoded config without smallSeconds decodes with the default false value", () => {
  const legacy = { ...DEFAULT_CONFIG };
  delete legacy.smallSeconds;

  const encoded = encodeConfig(legacy);
  const decoded = decodeConfig(encoded);

  assert.equal(decoded.showSeconds, DEFAULT_CONFIG.showSeconds);
  assert.equal(decoded.smallSeconds, false);
});

test("generated clock URL round-trips through c parameter", () => {
  const source = normalizeConfig({
    label: "長い配信ラベル",
    labelPosition: "right",
    timezone: "Asia/Tokyo",
    hour12: true,
    showSeconds: false,
    showDate: true,
    showWeekday: true,
    fontFamily: "Zen Maru Gothic"
  });
  const url = configToClockUrl(source, "https://example.com/clock/", { compact: true });
  const restored = parseConfigFromQuery(url);

  assert.equal(new URL(url).pathname, "/clock/");
  assert.equal(restored.label, source.label);
  assert.equal(restored.labelPosition, "right");
  assert.equal(restored.hour12, true);
  assert.equal(restored.showSeconds, false);
  assert.equal(restored.showDate, true);
  assert.equal(restored.showWeekday, true);
  assert.equal(restored.fontFamily, "Zen Maru Gothic");
});

test("compact URL round-trips non-default template values", () => {
  const source = normalizeConfig({
    ...applyTemplate(DEFAULT_CONFIG, "milk-tea"),
    timezone: "UTC",
    hour12: true,
    showSeconds: false,
    showDate: true,
    dateZeroPad: false,
    dateSeparator: "jp",
    showWeekday: true,
    weekdayFormat: "en-long"
  });
  const url = configToClockUrl(source, "https://example.com/clock/", { compact: true });
  const restored = parseConfigFromQuery(url);

  assert.equal(restored.template, "milk-tea");
  assert.equal(restored.backgroundColor, "#fff7ef");
  assert.equal(restored.labelPosition, "bottom");
  assert.equal(restored.timezone, "UTC");
  assert.equal(restored.hour12, true);
  assert.equal(restored.showSeconds, false);
  assert.equal(restored.showDate, true);
  // 旧 dateFormat="jp" は入力エイリアスとして新3フィールドへ写像された上で round-trip する。
  assert.equal(restored.dateYear, true);
  assert.equal(restored.dateZeroPad, false);
  assert.equal(restored.dateSeparator, "jp");
  assert.equal(restored.showWeekday, true);
  assert.equal(restored.weekdayFormat, "en-long");
});

test("compact config preserves analog and flip-specific fields", () => {
  const analog = normalizeConfig({
    clockType: "analog",
    analogMarks: "ticks",
    analogSecondHand: "off",
    analogSize: 300
  });
  const decodedAnalog = decodeConfig(encodeConfig(analog, { compact: true }));

  assert.equal(decodedAnalog.clockType, "analog");
  assert.equal(decodedAnalog.analogMarks, "ticks");
  assert.equal(decodedAnalog.analogSecondHand, "off");
  assert.equal(decodedAnalog.analogSize, 300);

  const flip = normalizeConfig({ clockType: "flip", flipGroup: "pair" });
  const decodedFlip = decodeConfig(encodeConfig(flip, { compact: true }));

  assert.equal(decodedFlip.clockType, "flip");
  assert.equal(decodedFlip.flipGroup, "pair");
});

test("parses flat GET parameters when c is missing", () => {
  const config = parseConfigFromQuery(
    "?tz=UTC&hour12=1&seconds=0&smallSeconds=true&date=1&weekday=true&font=Poppins&theme=soda"
  );

  assert.equal(config.timezone, "UTC");
  assert.equal(config.hour12, true);
  assert.equal(config.showSeconds, false);
  assert.equal(config.smallSeconds, true);
  assert.equal(config.showDate, true);
  assert.equal(config.showWeekday, true);
  assert.equal(config.fontFamily, "Poppins");
  assert.equal(config.template, "soda");
  assert.equal(config.labelPosition, "right");
  assert.equal(config.backgroundColor, "#eafcff");
  assert.equal(config.borderWidth, 2);
});

test("parses URL-encoded JSON import input", () => {
  const config = parseImportInput(encodeURIComponent(JSON.stringify({ label: "URL JSON", timezone: "UTC" })));

  assert.equal(config.label, "URL JSON");
  assert.equal(config.timezone, "UTC");
});

test("parses import input with whitespace and URL hash", () => {
  const encoded = encodeConfig({ label: "HASH", timezone: "UTC" });
  const config = parseImportInput(`  https://example.com/clock/?c=${encoded}#obs-source  `);

  assert.equal(config.label, "HASH");
  assert.equal(config.timezone, "UTC");
});

test("parses a bare base64url config paste", () => {
  const encoded = encodeConfig({ label: "BARE", timezone: "UTC" });
  const config = parseImportInput(encoded);

  assert.equal(config.label, "BARE");
  assert.equal(config.timezone, "UTC");
});

test("empty import input reports a clear error", () => {
  assert.throws(() => parseImportInput("  \n\t  "), /入力が空です。/);
});

test("malformed brace-prefixed JSON paste surfaces the localized error, not a raw V8 message", () => {
  for (const bad of ['{"label":}', '{"a":1,}', "{ ", '{"label":"JST"']) {
    assert.throws(() => parseImportInput(bad), /設定を読み込めませんでした。/, `expected localized error for ${bad}`);
  }
});

test("invalid values fall back to safe defaults", () => {
  const config = normalizeConfig({
    timezone: "No/Such_Zone",
    fontSize: Number.NaN,
    backgroundOpacity: 3,
    textColor: "red",
    labelPosition: "center",
    weekdayFormat: "emoji"
  });

  assert.equal(config.timezone, DEFAULT_CONFIG.timezone);
  assert.equal(config.fontSize, DEFAULT_CONFIG.fontSize);
  assert.equal(config.backgroundOpacity, 1);
  assert.equal(config.textColor, DEFAULT_CONFIG.textColor);
  assert.equal(config.labelPosition, DEFAULT_CONFIG.labelPosition);
  assert.equal(config.weekdayFormat, DEFAULT_CONFIG.weekdayFormat);
});

test("null and empty numeric inputs fall back to defaults", () => {
  assert.equal(normalizeConfig({ backgroundOpacity: null }).backgroundOpacity, DEFAULT_CONFIG.backgroundOpacity);

  const flat = parseConfigFromQuery("?backgroundOpacity=&fontSize=");
  assert.equal(flat.backgroundOpacity, DEFAULT_CONFIG.backgroundOpacity);
  assert.equal(flat.fontSize, DEFAULT_CONFIG.fontSize);
});

test("number limits match HTML range inputs", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const ranges = [...html.matchAll(/<input id="([^"]+)" type="range" min="([^"]+)" max="([^"]+)"/g)];

  assert.ok(ranges.length > 0);
  for (const [, id, min, max] of ranges) {
    // labelWeight/labelLetterSpacing/dateWeight/dateLetterSpacing は「null=連動」を許す
    // nullable override なので、既定値へ丸め込む NUMBER_LIMITS ではなく
    // NULLABLE_NUMBER_LIMITS(clampNullableNumber側のクランプ幅)と比較する。
    const limits = NULLABLE_NUMBER_LIMITS[id] ?? NUMBER_LIMITS[id];
    assert.deepEqual(limits, [Number(min), Number(max)], `${id} range must match NUMBER_LIMITS/NULLABLE_NUMBER_LIMITS`);
  }
});

test("out-of-range imported numbers clamp to UI range", () => {
  const config = normalizeConfig({
    fontSize: 999,
    dateSize: 1,
    labelSize: 999,
    fontWeight: 1000,
    letterSpacing: -99,
    lineHeight: 99,
    paddingX: 999,
    paddingY: 999,
    radius: 999,
    borderWidth: 999,
    shadowBlur: 999,
    shadowX: -999,
    shadowY: 999,
    strokeWidth: 999
  });

  assert.equal(config.fontSize, 120);
  assert.equal(config.dateSize, 10);
  assert.equal(config.labelSize, 48);
  assert.equal(config.fontWeight, 900);
  assert.equal(config.letterSpacing, -1);
  assert.equal(config.lineHeight, 1.8);
  assert.equal(config.paddingX, 80);
  assert.equal(config.paddingY, 60);
  assert.equal(config.radius, 48);
  assert.equal(config.borderWidth, 8);
  assert.equal(config.shadowBlur, 36);
  assert.equal(config.shadowX, -20);
  assert.equal(config.shadowY, 20);
  assert.equal(config.strokeWidth, 8);
});

// --- 文字微調整6フィールド(v1.6.1想定): meridiemSize/dateWeekdayGap/labelWeight/
// labelLetterSpacing/dateWeight/dateLetterSpacing のnormalize・clamp・compact round-trip ---

test("meridiemSize and dateWeekdayGap clamp to their UI range and default when invalid", () => {
  assert.equal(normalizeConfig({ meridiemSize: 0.1 }).meridiemSize, 0.3);
  assert.equal(normalizeConfig({ meridiemSize: 5 }).meridiemSize, 1);
  assert.equal(normalizeConfig({ meridiemSize: 0.72 }).meridiemSize, 0.72);
  assert.equal(normalizeConfig({ meridiemSize: Number.NaN }).meridiemSize, DEFAULT_CONFIG.meridiemSize);
  assert.equal(normalizeConfig({ meridiemSize: null }).meridiemSize, DEFAULT_CONFIG.meridiemSize);

  assert.equal(normalizeConfig({ dateWeekdayGap: -5 }).dateWeekdayGap, 0);
  assert.equal(normalizeConfig({ dateWeekdayGap: 99 }).dateWeekdayGap, 24);
  assert.equal(normalizeConfig({ dateWeekdayGap: 12 }).dateWeekdayGap, 12);
  assert.equal(normalizeConfig({ dateWeekdayGap: "" }).dateWeekdayGap, DEFAULT_CONFIG.dateWeekdayGap);
});

test("nullable overrides (labelWeight/labelLetterSpacing/dateWeight/dateLetterSpacing) default to null", () => {
  const config = normalizeConfig({});
  assert.equal(config.labelWeight, null);
  assert.equal(config.labelLetterSpacing, null);
  assert.equal(config.dateWeight, null);
  assert.equal(config.dateLetterSpacing, null);
});

test("nullable overrides preserve non-null values, clamp out-of-range, and round weight to 100s", () => {
  const config = normalizeConfig({
    labelWeight: 550,
    labelLetterSpacing: 2.4,
    dateWeight: 250,
    dateLetterSpacing: -3
  });

  assert.equal(config.labelWeight, 600, "550 rounds to nearest 100 (Math.round(5.5)=6)");
  assert.equal(config.labelLetterSpacing, 2.4);
  assert.equal(config.dateWeight, 300, "250 is already inside [100,900] and rounds to 300 (Math.round(2.5)=3)");
  assert.equal(config.dateLetterSpacing, -1, "clamped to letterSpacing range [-1,8]");
});

test("nullable overrides fall back to null (not a default number) for null/undefined/empty/invalid input", () => {
  for (const value of [null, undefined, "", "not-a-number", Number.NaN]) {
    const config = normalizeConfig({ labelWeight: value, dateWeight: value, labelLetterSpacing: value, dateLetterSpacing: value });
    assert.equal(config.labelWeight, null, `labelWeight should stay null for ${JSON.stringify(value)}`);
    assert.equal(config.dateWeight, null, `dateWeight should stay null for ${JSON.stringify(value)}`);
    assert.equal(config.labelLetterSpacing, null, `labelLetterSpacing should stay null for ${JSON.stringify(value)}`);
    assert.equal(config.dateLetterSpacing, null, `dateLetterSpacing should stay null for ${JSON.stringify(value)}`);
  }
});

test("nullable overrides accept zero as a real value (not treated as falsy/empty)", () => {
  const config = normalizeConfig({ labelLetterSpacing: 0, dateLetterSpacing: 0 });
  assert.equal(config.labelLetterSpacing, 0);
  assert.equal(config.dateLetterSpacing, 0);
});

test("compact config round-trip: null overrides are omitted, non-null overrides survive", () => {
  const withNulls = normalizeConfig({});
  const compactNulls = decodeConfig(encodeConfig(withNulls, { compact: true }));
  assert.equal(compactNulls.labelWeight, null);
  assert.equal(compactNulls.dateWeight, null);
  assert.equal(compactNulls.labelLetterSpacing, null);
  assert.equal(compactNulls.dateLetterSpacing, null);

  const withValues = normalizeConfig({
    labelWeight: 900,
    labelLetterSpacing: 1.5,
    dateWeight: 300,
    dateLetterSpacing: -0.5,
    meridiemSize: 0.4,
    dateWeekdayGap: 8
  });
  const compactValues = decodeConfig(encodeConfig(withValues, { compact: true }));
  assert.equal(compactValues.labelWeight, 900);
  assert.equal(compactValues.labelLetterSpacing, 1.5);
  assert.equal(compactValues.dateWeight, 300);
  assert.equal(compactValues.dateLetterSpacing, -0.5);
  assert.equal(compactValues.meridiemSize, 0.4);
  assert.equal(compactValues.dateWeekdayGap, 8);

  // 既定値と同じ非nullフィールドはcompactから省略される(既存のcompactConfig挙動と同じ)。
  const rawCompact = JSON.parse(
    Buffer.from(
      encodeConfig(withValues, { compact: true }).replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8")
  );
  assert.equal("labelWeight" in rawCompact, true);
  assert.equal("meridiemSize" in rawCompact, true);
});

test("flat query parses the 6 new fields (v1.6.1 fine-tuning)", () => {
  const config = parseConfigFromQuery(
    "?meridiemSize=0.4&dateWeekdayGap=6&labelWeight=900&labelLetterSpacing=1.2&dateWeight=300&dateLetterSpacing=-0.4"
  );

  assert.equal(config.meridiemSize, 0.4);
  assert.equal(config.dateWeekdayGap, 6);
  assert.equal(config.labelWeight, 900);
  assert.equal(config.labelLetterSpacing, 1.2);
  assert.equal(config.dateWeight, 300);
  assert.equal(config.dateLetterSpacing, -0.4);
});

test("flat query omitting nullable overrides keeps them null", () => {
  const config = parseConfigFromQuery("?meridiemSize=0.7");
  assert.equal(config.meridiemSize, 0.7);
  assert.equal(config.labelWeight, null);
  assert.equal(config.dateWeight, null);
  assert.equal(config.labelLetterSpacing, null);
  assert.equal(config.dateLetterSpacing, null);
});

test("applyTemplate keeps the 6 new fine-tuning fields as user settings across template switches", () => {
  const current = normalizeConfig({
    meridiemSize: 0.42,
    dateWeekdayGap: 9,
    labelWeight: 900,
    labelLetterSpacing: 0.8,
    dateWeight: 300,
    dateLetterSpacing: 0.2
  });
  const applied = applyTemplate(current, "soda");

  assert.equal(applied.meridiemSize, 0.42);
  assert.equal(applied.dateWeekdayGap, 9);
  assert.equal(applied.labelWeight, 900);
  assert.equal(applied.labelLetterSpacing, 0.8);
  assert.equal(applied.dateWeight, 300);
  assert.equal(applied.dateLetterSpacing, 0.2);
});

// --- null既定の回帰: 既定configではCSS変数を書かない(applyClockStylesはrender.test.mjs側で検証)ため、
// ここではnormalizeConfig/DEFAULT_CONFIGの契約だけを確認する ---
test("DEFAULT_CONFIG keeps the 4 nullable overrides as null (not a numeric fallback)", () => {
  assert.equal(DEFAULT_CONFIG.labelWeight, null);
  assert.equal(DEFAULT_CONFIG.labelLetterSpacing, null);
  assert.equal(DEFAULT_CONFIG.dateWeight, null);
  assert.equal(DEFAULT_CONFIG.dateLetterSpacing, null);
  assert.equal(DEFAULT_CONFIG.meridiemSize, 0.55);
  assert.equal(DEFAULT_CONFIG.dateWeekdayGap, 0);
});

test("color helpers return stable rgba and contrast values", () => {
  assert.equal(hexToRgba("#ff0000", 0.33333), "rgba(255, 0, 0, 0.333)");
  assert.equal(hexToRgba("bad", 2), "rgba(0, 0, 0, 1)");
  assert.equal(contrastRatio("#000000", "#ffffff").toFixed(2), "21.00");
});

test("template application preserves clock behavior settings", () => {
  const applied = applyTemplate(
    {
      timezone: "UTC",
      hour12: true,
      showSeconds: false,
      showDate: true,
      dateFormat: "jp",
      showWeekday: true,
      weekdayFormat: "en-long"
    },
    "soda"
  );

  assert.equal(applied.template, "soda");
  assert.equal(applied.timezone, "UTC");
  assert.equal(applied.hour12, true);
  assert.equal(applied.showSeconds, false);
  assert.equal(applied.showDate, true);
  // 旧 dateFormat="jp" 相当の新3フィールドがテンプレ適用後も保持される。
  assert.equal(applied.dateYear, true);
  assert.equal(applied.dateZeroPad, false);
  assert.equal(applied.dateSeparator, "jp");
  assert.equal(applied.showWeekday, true);
  assert.equal(applied.weekdayFormat, "en-long");
});

test("broken c parameter and unknown versions fall back safely", () => {
  assert.deepEqual(parseConfigFromQuery("?c=not-valid-config"), DEFAULT_CONFIG);

  const future = parseImportInput(JSON.stringify({ version: 999, label: "future", timezone: "UTC" }));
  assert.equal(future.version, DEFAULT_CONFIG.version);
  assert.equal(future.label, "future");
  assert.equal(future.timezone, "UTC");
});

test("empty label clears instead of forcing the default label", () => {
  assert.equal(normalizeConfig({ label: "" }).label, "");
  assert.equal(normalizeConfig({ label: "   " }).label, "");
  assert.equal(normalizeConfig({ label: "ON AIR" }).label, "ON AIR");
  assert.equal(normalizeConfig({}).label, DEFAULT_CONFIG.label);
});

test("overly long text is truncated by code point", () => {
  const config = normalizeConfig({
    label: "😀".repeat(45),
    fontFamily: "A".repeat(100)
  });

  assert.equal(Array.from(config.label).length, 40);
  assert.equal(config.label, "😀".repeat(40));
  assert.equal(config.fontFamily.length, 80);
});

test("CSS string literal escapes arbitrary font input", () => {
  const escaped = cssStringLiteral('Bad"; color:red;\\evil\nFont😀');

  assert.equal(escaped.startsWith('"'), true);
  assert.equal(escaped.endsWith('"'), true);
  assert.equal(escaped.includes("\n"), false);
  assert.equal(JSON.parse(escaped), 'Bad"; color:red;\\evil Font😀');
});

test("CSS string literal limits hostile long CSS-like input", () => {
  const escaped = cssStringLiteral('");background:url(javascript:alert(1));/*'.repeat(10));
  const parsed = JSON.parse(escaped);

  assert.equal(Array.from(parsed).length, 120);
  assert.equal(escaped.includes("\n"), false);
});
