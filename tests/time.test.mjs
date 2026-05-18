import assert from "node:assert/strict";
import test from "node:test";
import { normalizeConfig } from "../assets/js/config.js";
import { createFormatters, formatClock, nextSecondDelay, normalizeHour } from "../assets/js/time.js";

test("formats Tokyo time as HH:MM:SS by default", () => {
  const config = normalizeConfig({});
  const formatted = formatClock(createFormatters(config), new Date("2026-01-01T15:04:05.200Z"));

  assert.equal(formatted.time, "00:04:05");
});

test("can hide seconds", () => {
  const config = normalizeConfig({ showSeconds: false, timezone: "UTC" });
  const formatted = formatClock(createFormatters(config), new Date("2026-01-01T15:04:05Z"));

  assert.equal(formatted.time, "15:04");
});

test("formats 12-hour time with day period", () => {
  const config = normalizeConfig({ hour12: true, timezone: "UTC" });
  const formatted = formatClock(createFormatters(config), new Date("2026-01-01T15:04:05Z"));

  assert.equal(formatted.time, "03:04:05 PM");
});

test("formats date and weekday variants", () => {
  const config = normalizeConfig({
    timezone: "Asia/Tokyo",
    showDate: true,
    dateFormat: "jp",
    showWeekday: true,
    weekdayFormat: "en-long"
  });
  const formatted = formatClock(createFormatters(config), new Date("2026-01-01T15:04:05Z"));

  assert.equal(formatted.date, "2026年1月2日");
  assert.equal(formatted.weekday, "Friday");
});

test("next tick is scheduled near the next second boundary", () => {
  assert.equal(nextSecondDelay(new Date("2026-01-01T00:00:00.250Z"), 16), 766);
  assert.equal(nextSecondDelay(new Date("2026-01-01T00:00:00.999Z"), 16), 50);
});

test("normalizes 24-hour formatter edge hour to 00", () => {
  assert.equal(normalizeHour("24"), "00");
  assert.equal(normalizeHour("4"), "04");
  assert.equal(normalizeHour(""), "00");
});
