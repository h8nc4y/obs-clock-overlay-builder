import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_CONFIG,
  configToClockUrl,
  cssStringLiteral,
  decodeConfig,
  encodeConfig,
  normalizeConfig,
  parseConfigFromQuery,
  parseImportInput
} from "../assets/js/config.js";

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

test("parses flat GET parameters when c is missing", () => {
  const config = parseConfigFromQuery("?tz=UTC&hour12=1&seconds=0&date=1&weekday=true&font=Poppins&theme=soda");

  assert.equal(config.timezone, "UTC");
  assert.equal(config.hour12, true);
  assert.equal(config.showSeconds, false);
  assert.equal(config.showDate, true);
  assert.equal(config.showWeekday, true);
  assert.equal(config.fontFamily, "Poppins");
  assert.equal(config.template, "soda");
  assert.equal(config.labelPosition, "right");
  assert.equal(config.backgroundColor, "#dff8ff");
  assert.equal(config.borderWidth, 2);
});

test("parses URL-encoded JSON import input", () => {
  const config = parseImportInput(encodeURIComponent(JSON.stringify({ label: "URL JSON", timezone: "UTC" })));

  assert.equal(config.label, "URL JSON");
  assert.equal(config.timezone, "UTC");
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

test("broken c parameter and unknown versions fall back safely", () => {
  assert.deepEqual(parseConfigFromQuery("?c=not-valid-config"), DEFAULT_CONFIG);

  const future = parseImportInput(JSON.stringify({ version: 999, label: "future", timezone: "UTC" }));
  assert.equal(future.version, DEFAULT_CONFIG.version);
  assert.equal(future.label, "future");
  assert.equal(future.timezone, "UTC");
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
