import assert from "node:assert/strict";
import test from "node:test";

import { computeOffsetMs, correctedNow, syncOnce } from "../assets/js/time-sync.js";

// fetch を差し替えて syncOnce を1回だけ動かすヘルパー。後始末で元に戻す。
async function withStubbedFetch(stub, run) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

function responseWithDate(dateValue) {
  return {
    headers: {
      get(name) {
        return name.toLowerCase() === "date" ? dateValue : null;
      }
    }
  };
}

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

test("syncOnce returns null and does not throw when the fetch rejects (offline fallback)", async () => {
  const result = await withStubbedFetch(
    () => Promise.reject(new Error("offline")),
    () => syncOnce("/api/defaults")
  );
  assert.equal(result, null);
});

test("syncOnce returns null when the response has no Date header", async () => {
  const result = await withStubbedFetch(
    () => Promise.resolve(responseWithDate(null)),
    () => syncOnce("/api/defaults")
  );
  assert.equal(result, null);
});

test("syncOnce applies the server Date offset and correctedNow reflects it", async () => {
  // サーバー時刻を約1時間先に見せる → 補正量は約 +3,600,000ms になるはず。
  const aheadMs = 3_600_000;
  const serverDate = new Date(Date.now() + aheadMs).toUTCString();
  const offset = await withStubbedFetch(
    () => Promise.resolve(responseWithDate(serverDate)),
    () => syncOnce("/api/defaults")
  );

  // Date ヘッダは秒精度なので緩い範囲で確認(往復と切り捨て分の許容)。
  assert.ok(offset > aheadMs - 2_000 && offset < aheadMs + 2_000, `offset ${offset} should be ~${aheadMs}`);
  // correctedNow() は現在時刻に offset を足したものになる。
  assert.ok(Math.abs(correctedNow().getTime() - Date.now() - offset) <= 5);
});
