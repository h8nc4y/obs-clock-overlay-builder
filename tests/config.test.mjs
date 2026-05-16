import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_CONFIG,
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

test("parses flat GET parameters when c is missing", () => {
  const config = parseConfigFromQuery("?tz=UTC&hour12=1&seconds=0&date=1&weekday=true&font=Poppins&theme=soda");

  assert.equal(config.timezone, "UTC");
  assert.equal(config.hour12, true);
  assert.equal(config.showSeconds, false);
  assert.equal(config.showDate, true);
  assert.equal(config.showWeekday, true);
  assert.equal(config.fontFamily, "Poppins");
  assert.equal(config.template, "soda");
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

test("CSS string literal escapes arbitrary font input", () => {
  const escaped = cssStringLiteral('Bad"; color:red;\nFont');

  assert.equal(escaped.startsWith('"'), true);
  assert.equal(escaped.endsWith('"'), true);
  assert.equal(escaped.includes("\n"), false);
  assert.equal(JSON.parse(escaped), 'Bad"; color:red; Font');
});
