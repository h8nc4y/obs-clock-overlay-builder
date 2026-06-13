import assert from "node:assert/strict";
import test from "node:test";

import { computeOffsetMs, correctedNow, startTimeSync, syncOnce } from "../assets/js/time-sync.js";

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
    ok: true,
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

test("syncOnce returns null for a non-2xx response (no offset applied)", async () => {
  const result = await withStubbedFetch(
    () => Promise.resolve({ ok: false, headers: { get: () => "Sat, 13 Jun 2026 14:00:00 GMT" } }),
    () => syncOnce("/api/defaults")
  );
  assert.equal(result, null);
});

test("syncOnce returns null when the response has no headers object", async () => {
  const result = await withStubbedFetch(
    () => Promise.resolve({ ok: true }),
    () => syncOnce("/api/defaults")
  );
  assert.equal(result, null);
});

test("startTimeSync registers a resync interval + visibilitychange listener and stop() clears both", async () => {
  const listeners = [];
  const original = {
    document: globalThis.document,
    fetch: globalThis.fetch,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval
  };
  let intervals = 0;
  let cleared = 0;
  globalThis.document = {
    hidden: false,
    addEventListener(type, handler) {
      listeners.push({ type, handler });
    },
    removeEventListener(type, handler) {
      const i = listeners.findIndex((l) => l.type === type && l.handler === handler);
      if (i >= 0) listeners.splice(i, 1);
    }
  };
  globalThis.setInterval = (...args) => {
    intervals += 1;
    return original.setInterval(...args);
  };
  globalThis.clearInterval = (id) => {
    cleared += 1;
    return original.clearInterval(id);
  };
  globalThis.fetch = () => Promise.resolve(responseWithDate("Sat, 13 Jun 2026 14:00:00 GMT"));
  try {
    const stop = startTimeSync({ url: "/api/defaults", intervalMs: 9_999_999 });
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(intervals, 1, "one resync interval registered");
    assert.equal(listeners.filter((l) => l.type === "visibilitychange").length, 1, "one visibilitychange listener");
    assert.equal(typeof stop, "function", "returns a stop handle");
    stop();
    assert.equal(cleared, 1, "interval cleared by stop()");
    assert.equal(listeners.filter((l) => l.type === "visibilitychange").length, 0, "listener removed by stop()");
  } finally {
    Object.assign(globalThis, original);
  }
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
