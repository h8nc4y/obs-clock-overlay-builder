import assert from "node:assert/strict";
import test from "node:test";
import { computeAnalogAngles } from "../assets/js/render.js";
import { DEFAULT_CONFIG, applyTemplate, cloneDefaultConfig, normalizeConfig } from "../assets/js/config.js";

test("computeAnalogAngles maps time to clockwise degrees from 12", () => {
  const noon = computeAnalogAngles({ hours: 12, minutes: 0, seconds: 0 }, "tick");
  assert.equal(noon.hourDeg, 0);
  assert.equal(noon.minuteDeg, 0);
  assert.equal(noon.secondDeg, 0);

  const quarter = computeAnalogAngles({ hours: 3, minutes: 15, seconds: 30 }, "tick");
  assert.equal(quarter.secondDeg, 180);
  assert.equal(quarter.minuteDeg, (15 + 30 / 60) * 6);
  assert.equal(quarter.hourDeg, (3 + (15 + 30 / 60) / 60) * 30);
});

test("sweep blends milliseconds into the second hand, tick does not", () => {
  const sweep = computeAnalogAngles({ hours: 0, minutes: 0, seconds: 10, milliseconds: 500 }, "sweep");
  const tick = computeAnalogAngles({ hours: 0, minutes: 0, seconds: 10, milliseconds: 500 }, "tick");
  assert.equal(sweep.secondDeg, 10.5 * 6);
  assert.equal(tick.secondDeg, 10 * 6);
});

test("clockType normalizes across digital, analog, and flip", () => {
  assert.equal(DEFAULT_CONFIG.clockType, "digital");
  assert.equal(normalizeConfig({ clockType: "analog" }).clockType, "analog");
  assert.equal(normalizeConfig({ clockType: "flip" }).clockType, "flip");
  assert.equal(normalizeConfig({ clockType: "bogus" }).clockType, "digital");
  assert.equal(applyTemplate(cloneDefaultConfig(), "analog-navy").clockType, "analog");
  assert.equal(applyTemplate(cloneDefaultConfig(), "flip-light").clockType, "flip");
  assert.equal(applyTemplate(cloneDefaultConfig(), "mono-compact").clockType, "digital");
});

test("flipGroup normalizes and the pair template selects pair mode", () => {
  assert.equal(DEFAULT_CONFIG.flipGroup, "single");
  assert.equal(normalizeConfig({ flipGroup: "pair" }).flipGroup, "pair");
  assert.equal(normalizeConfig({ flipGroup: "triple" }).flipGroup, "single");
  assert.equal(applyTemplate(cloneDefaultConfig(), "flip-pair").flipGroup, "pair");
});

test("analog enum fields fall back safely and size is clamped", () => {
  assert.equal(normalizeConfig({ analogMarks: "roman" }).analogMarks, "roman");
  assert.equal(normalizeConfig({ analogMarks: "spirals" }).analogMarks, DEFAULT_CONFIG.analogMarks);
  assert.equal(normalizeConfig({ analogSecondHand: "warp" }).analogSecondHand, DEFAULT_CONFIG.analogSecondHand);
  assert.equal(normalizeConfig({ analogSize: 9000 }).analogSize, 480);
  assert.equal(normalizeConfig({ analogSize: 1 }).analogSize, 120);
});
