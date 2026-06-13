import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_CONFIG,
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
    dateFormat: "jp",
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
  assert.equal(restored.dateFormat, "jp");
  assert.equal(restored.showWeekday, true);
  assert.equal(restored.weekdayFormat, "en-long");
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

test("empty import input reports a clear error", () => {
  assert.throws(() => parseImportInput("  \n\t  "), /入力が空です。/);
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

test("number limits match HTML range inputs", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const ranges = [...html.matchAll(/<input id="([^"]+)" type="range" min="([^"]+)" max="([^"]+)"/g)];

  assert.ok(ranges.length > 0);
  for (const [, id, min, max] of ranges) {
    assert.deepEqual(NUMBER_LIMITS[id], [Number(min), Number(max)], `${id} range must match NUMBER_LIMITS`);
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
  assert.equal(applied.dateFormat, "jp");
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
