import assert from "node:assert/strict";
import test from "node:test";
import { createLatestLocalFontLoader, resetLocalFontResults } from "../assets/js/local-font-state.js";

test("local font reload hides and clears the previous selectable results", () => {
  const classes = new Set();
  const selectWrap = {
    classList: {
      add(className) {
        classes.add(className);
      }
    }
  };
  const select = { textContent: "以前に読み込んだフォント" };

  resetLocalFontResults(selectWrap, select);

  assert.equal(classes.has("is-hidden"), true);
  assert.equal(select.textContent, "");
});

test("an older local font request cannot overwrite the latest failure state", async () => {
  const first = deferred();
  const second = deferred();
  const pending = [first, second];
  const applied = { status: "", options: [] };
  const load = createLatestLocalFontLoader({
    isSupported: () => true,
    query: () => pending.shift().promise,
    toOptions: (fonts) => fonts
  });

  const firstResult = load();
  const secondResult = load();
  second.reject(new Error("synthetic permission denial"));
  applyResult(await secondResult, applied);

  first.resolve([{ value: "Slow Old Font" }]);
  applyResult(await firstResult, applied);

  assert.equal(applied.status, "error");
  assert.deepEqual(applied.options, []);
});

test("an older unsupported result is stale when a newer request starts in the same turn", async () => {
  let supported = false;
  const second = deferred();
  const load = createLatestLocalFontLoader({
    isSupported: () => supported,
    query: () => second.promise,
    toOptions: (fonts) => fonts
  });

  const firstResult = load();
  supported = true;
  const secondResult = load();

  assert.equal(await firstResult, null);
  second.resolve([{ value: "Latest Font" }]);
  assert.deepEqual(await secondResult, {
    state: "ready",
    options: [{ value: "Latest Font" }]
  });
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function applyResult(result, target) {
  if (!result) {
    return;
  }
  target.status = result.state;
  target.options = result.options;
}
