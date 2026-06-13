import assert from "node:assert/strict";
import test from "node:test";

import { computeOffsetMs } from "../assets/js/time-sync.js";

test("computeOffsetMs uses the request round-trip midpoint", () => {
  // サーバーは 1,000,000ms、ローカルは start=900,000 / end=901,000 (中点 900,500)。
  // 補正量 = server - localMidpoint = 99,500ms 進める。
  assert.equal(computeOffsetMs(1_000_000, 900_000, 901_000), 99_500);
});

test("computeOffsetMs returns a negative offset when the PC clock runs ahead", () => {
  // ローカルがサーバーより進んでいるケース → offset は負(戻す)。
  assert.equal(computeOffsetMs(1_000_000, 1_002_000, 1_004_000), -3_000);
});

test("computeOffsetMs rounds to the nearest millisecond", () => {
  // 中点が 0.5ms 単位になっても整数へ丸める。
  assert.equal(computeOffsetMs(1_000_000, 900_001, 900_002), Math.round(1_000_000 - 900_001.5));
});

test("computeOffsetMs returns null for a missing or unparseable Date header", () => {
  assert.equal(computeOffsetMs(NaN, 0, 1), null);
  assert.equal(computeOffsetMs(Number.parseInt("not-a-date", 10), 0, 1), null);
});

test("computeOffsetMs is near zero when the PC clock matches the server", () => {
  const offset = computeOffsetMs(1_000_000, 999_980, 1_000_020);
  assert.equal(offset, 0);
});
