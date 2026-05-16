import assert from "node:assert/strict";
import test from "node:test";
import worker from "../worker/index.js";

test("worker returns Cloudflare request defaults when available", async () => {
  const request = new Request("https://example.com/api/defaults");
  request.cf = { timezone: "Asia/Tokyo", country: "JP" };

  const response = await worker.fetch(request, { ASSETS: unreachableAssets() });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    timezone: "Asia/Tokyo",
    country: "JP",
    source: "cloudflare"
  });
});

test("worker returns fallback defaults outside Cloudflare", async () => {
  const response = await worker.fetch(new Request("https://example.com/api/defaults"), {
    ASSETS: unreachableAssets()
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    timezone: null,
    country: null,
    source: "fallback"
  });
});

test("worker delegates non-api requests to static assets", async () => {
  let delegatedUrl = null;
  const response = await worker.fetch(new Request("https://example.com/clock/"), {
    ASSETS: {
      fetch(request) {
        delegatedUrl = request.url;
        return new Response("asset response", { status: 203 });
      }
    }
  });

  assert.equal(response.status, 203);
  assert.equal(await response.text(), "asset response");
  assert.equal(delegatedUrl, "https://example.com/clock/");
});

function unreachableAssets() {
  return {
    fetch() {
      throw new Error("ASSETS.fetch should not be called");
    }
  };
}
