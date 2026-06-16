import assert from "node:assert/strict";
import test from "node:test";
import { normalizeConfig } from "../assets/js/config.js";
import { createFormatters, formatClock, nextSecondDelay, normalizeHour } from "../assets/js/time.js";

test("formats Tokyo time as HH:MM:SS when seconds are on", () => {
  const config = normalizeConfig({ showSeconds: true });
  const formatted = formatClock(createFormatters(config), new Date("2026-01-01T15:04:05.200Z"));

  assert.equal(formatted.time, "00:04:05");
});

test("hides seconds by default", () => {
  const config = normalizeConfig({});
  const formatted = formatClock(createFormatters(config), new Date("2026-01-01T15:04:05.200Z"));

  assert.equal(formatted.time, "00:04");
});

test("can hide seconds", () => {
  const config = normalizeConfig({ showSeconds: false, timezone: "UTC" });
  const formatted = formatClock(createFormatters(config), new Date("2026-01-01T15:04:05Z"));

  assert.equal(formatted.time, "15:04");
});

test("formats 12-hour time with day period", () => {
  const config = normalizeConfig({ hour12: true, showSeconds: true, timezone: "UTC" });
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

test("formats slash dash and month-day date variants deterministically", () => {
  const date = new Date("2026-01-02T03:04:05Z");

  assert.equal(formatClock(createFormatters(normalizeConfig({ timezone: "UTC", showDate: true, dateFormat: "dash" })), date).date, "2026-01-02");
  assert.equal(
    formatClock(createFormatters(normalizeConfig({ timezone: "UTC", showDate: true, dateFormat: "monthDay" })), date).date,
    "01/02"
  );
  assert.equal(
    formatClock(createFormatters(normalizeConfig({ timezone: "UTC", showDate: true, dateFormat: "slash" })), date).date,
    "2026/01/02"
  );
});

test("formats Japanese and English weekday variants deterministically", () => {
  const date = new Date("2026-01-02T03:04:05Z");

  assert.equal(
    formatClock(createFormatters(normalizeConfig({ timezone: "UTC", showWeekday: true, weekdayFormat: "ja-short" })), date)
      .weekday,
    "金"
  );
  assert.equal(
    formatClock(createFormatters(normalizeConfig({ timezone: "UTC", showWeekday: true, weekdayFormat: "ja-long" })), date)
      .weekday,
    "金曜日"
  );
  assert.equal(
    formatClock(createFormatters(normalizeConfig({ timezone: "UTC", showWeekday: true, weekdayFormat: "en-short" })), date)
      .weekday,
    "Fri"
  );
  assert.equal(
    formatClock(createFormatters(normalizeConfig({ timezone: "UTC", showWeekday: true, weekdayFormat: "en-long" })), date)
      .weekday,
    "Friday"
  );
});

test("formats 12-hour midnight and noon boundaries", () => {
  const config = normalizeConfig({ timezone: "UTC", hour12: true, showSeconds: false });
  const formatters = createFormatters(config);

  assert.equal(formatClock(formatters, new Date("2026-01-02T00:30:00Z")).time, "12:30 AM");
  assert.equal(formatClock(formatters, new Date("2026-01-02T12:30:00Z")).time, "12:30 PM");
});

test("formats timezone date rollback and half-hour offset minutes", () => {
  const ny = normalizeConfig({ timezone: "America/New_York", showDate: true, dateFormat: "slash" });
  const kolkata = normalizeConfig({ timezone: "Asia/Kolkata", showSeconds: false });

  assert.equal(formatClock(createFormatters(ny), new Date("2026-01-02T02:30:00Z")).date, "2026/01/01");
  assert.equal(formatClock(createFormatters(kolkata), new Date("2026-01-02T00:05:00Z")).time, "05:35");
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
