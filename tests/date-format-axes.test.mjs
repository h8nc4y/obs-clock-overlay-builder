import assert from "node:assert/strict";
import test from "node:test";
import { Buffer } from "node:buffer";
import {
  applyTemplate,
  decodeConfig,
  normalizeConfig,
  parseConfigFromQuery
} from "../assets/js/config.js";
import { tokenizeFlip } from "../assets/js/render.js";
import { buildShareLines } from "../assets/js/share.js";
import { createFormatters, formatClock, formatDate } from "../assets/js/time.js";

const SAMPLE_DATE = new Date("2026-07-03T12:34:56+09:00");
const AM_SAMPLE_DATE = new Date("2026-07-03T09:51:05Z");

function legacyConfigParam(config) {
  return Buffer.from(JSON.stringify(config), "utf8").toString("base64url");
}

function clock(config, date = SAMPLE_DATE) {
  return formatClock(createFormatters(normalizeConfig(config)), date);
}

test("legacy dateFormat payloads keep their previous rendered date", () => {
  const cases = [
    ["slash", "2026/07/03", { dateYear: true, dateZeroPad: true, dateSeparator: "slash" }],
    ["dash", "2026-07-03", { dateYear: true, dateZeroPad: true, dateSeparator: "dash" }],
    ["monthDay", "07/03", { dateYear: false, dateZeroPad: true, dateSeparator: "slash" }],
    ["jp", "2026年7月3日", { dateYear: true, dateZeroPad: false, dateSeparator: "jp" }]
  ];

  for (const [dateFormat, expectedDate, expectedFields] of cases) {
    const decoded = decodeConfig(legacyConfigParam({ version: 1, timezone: "Asia/Tokyo", dateFormat }));

    assert.equal("dateFormat" in decoded, false);
    assert.deepEqual(
      {
        dateYear: decoded.dateYear,
        dateZeroPad: decoded.dateZeroPad,
        dateSeparator: decoded.dateSeparator
      },
      expectedFields
    );
    assert.equal(formatDate(createFormatters(decoded), SAMPLE_DATE), expectedDate);
  }
});

test("new date fields override only the matching legacy dateFormat axes", () => {
  const config = normalizeConfig({
    dateFormat: "jp",
    dateZeroPad: true,
    dateSeparator: "dash"
  });

  assert.equal(config.dateYear, true);
  assert.equal(config.dateZeroPad, true);
  assert.equal(config.dateSeparator, "dash");
  assert.equal(formatDate(createFormatters(config), SAMPLE_DATE), "2026-07-03");
});

test("flat query accepts new date axes and keeps legacy dateFormat fallback", () => {
  const newFields = parseConfigFromQuery(
    "?dateYear=0&dateZeroPad=false&dateSeparator=jp&weekdayBrackets=1&meridiemFirst=on"
  );

  assert.equal(newFields.dateYear, false);
  assert.equal(newFields.dateZeroPad, false);
  assert.equal(newFields.dateSeparator, "jp");
  assert.equal(newFields.weekdayBrackets, true);
  assert.equal(newFields.meridiemFirst, true);

  const legacy = parseConfigFromQuery("?dateFormat=monthDay");
  assert.equal(legacy.dateYear, false);
  assert.equal(legacy.dateZeroPad, true);
  assert.equal(legacy.dateSeparator, "slash");
});

test("dateSeparator clamps to defaults while legacy fallback remains available", () => {
  assert.equal(normalizeConfig({ dateSeparator: "dot" }).dateSeparator, "slash");
  assert.equal(normalizeConfig({ dateFormat: "dash", dateSeparator: "dot" }).dateSeparator, "dash");
});

test("applyTemplate preserves user-controlled date and meridiem axes", () => {
  const applied = applyTemplate(
    {
      template: "mono-compact",
      dateYear: false,
      dateZeroPad: false,
      dateSeparator: "jp",
      weekdayBrackets: true,
      hour12: true,
      meridiemFirst: true
    },
    "studio-live"
  );

  assert.equal(applied.dateYear, false);
  assert.equal(applied.dateZeroPad, false);
  assert.equal(applied.dateSeparator, "jp");
  assert.equal(applied.weekdayBrackets, true);
  assert.equal(applied.hour12, true);
  assert.equal(applied.meridiemFirst, true);
});

test("formatDate covers all separator, year, and zero-padding combinations", () => {
  const cases = [
    ["slash", true, true, "2026/07/03"],
    ["slash", true, false, "2026/7/3"],
    ["slash", false, true, "07/03"],
    ["slash", false, false, "7/3"],
    ["dash", true, true, "2026-07-03"],
    ["dash", true, false, "2026-7-3"],
    ["dash", false, true, "07-03"],
    ["dash", false, false, "7-3"],
    ["jp", true, true, "2026年07月03日"],
    ["jp", true, false, "2026年7月3日"],
    ["jp", false, true, "07月03日"],
    ["jp", false, false, "7月3日"]
  ];

  for (const [dateSeparator, dateYear, dateZeroPad, expected] of cases) {
    const formatted = formatDate(createFormatters({ dateSeparator, dateYear, dateZeroPad }), SAMPLE_DATE);
    assert.equal(formatted, expected);
  }
});

test("weekdayBrackets uses Japanese full-width and English ASCII brackets", () => {
  assert.equal(clock({ showWeekday: true, weekdayBrackets: true, weekdayFormat: "ja-short" }).weekday, "（金）");
  assert.equal(clock({ showWeekday: true, weekdayBrackets: true, weekdayFormat: "en-short" }).weekday, "(Fri)");
});

test("meridiemFirst moves AM/PM before the time without changing secondsText", () => {
  const rear = clock({ timezone: "UTC", hour12: true, showSeconds: true }, AM_SAMPLE_DATE);
  const front = clock({ timezone: "UTC", hour12: true, showSeconds: true, meridiemFirst: true }, AM_SAMPLE_DATE);

  assert.equal(rear.time, "09:51:05 AM");
  assert.equal(rear.timeMain, "09:51 AM");
  assert.equal(front.time, "AM 09:51:05");
  assert.equal(front.timeMain, "AM 09:51");
  assert.equal(front.secondsText, "05");
});

test("meridiemFirst flows through flip tokens and share lines", () => {
  const config = normalizeConfig({
    timezone: "UTC",
    hour12: true,
    meridiemFirst: true,
    showSeconds: true,
    showDate: true,
    labelPosition: "hidden"
  });
  const formatted = clock(config, AM_SAMPLE_DATE);

  assert.equal(tokenizeFlip(formatted.time, "single").map((token) => token.value).join(""), "AM 09:51:05");
  assert.deepEqual(
    buildShareLines(config, formatted).map((line) => line.text),
    ["2026/07/03", "AM 09:51:05"]
  );
});
