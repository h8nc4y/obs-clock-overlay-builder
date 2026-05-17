import assert from "node:assert/strict";
import test from "node:test";
import worker from "../worker/index.js";

test("worker delegates static defaults API to static assets", async () => {
  const request = new Request("https://example.com/api/defaults");
  request.cf = { timezone: "Asia/Tokyo", country: "JP" };
  let delegatedUrl = null;

  const response = await worker.fetch(request, {
    ASSETS: {
      fetch(request) {
        delegatedUrl = request.url;
        return Response.json({
          timezone: null,
          country: null,
          source: "static"
        });
      }
    }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(delegatedUrl, "https://example.com/api/defaults");
  assert.deepEqual(body, {
    timezone: null,
    country: null,
    source: "static"
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
