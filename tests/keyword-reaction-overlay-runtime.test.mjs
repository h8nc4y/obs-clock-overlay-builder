import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as overlayRuntime from "../assets/js/keyword-reaction-overlay.js";
import { encodeKeywordReactionConfig } from "../assets/js/keyword-reaction-config.js";
import { KEYWORD_REACTION_INTERNAL_EVENT_NAME } from "../assets/js/keyword-reaction-internal-dispatch.js";

const {
  KEYWORD_REACTION_DEMO_EVENT_TEXT,
  buildKeywordReactionDemoEvent,
  buildKeywordReactionDebugStatus,
  getKeywordReactionOverlayRuntimeState,
  mountKeywordReactionOverlayRuntime,
  renderKeywordReactionDemoEvent,
  shouldShowKeywordReactionDebug,
  shouldShowKeywordReactionDemo
} = overlayRuntime;

test("keyword reaction overlay runtime stays silent without explicit debug or demo", () => {
  const encoded = encodeKeywordReactionConfig({ keyword: "public-keyword", reactionStyle: "pulse" }, { compact: true });
  const state = getKeywordReactionOverlayRuntimeState(new URLSearchParams(`c=${encoded}`));

  assert.equal(state.debug, false);
  assert.equal(state.demo, false);
  assert.equal(state.configState, "valid");
  assert.deepEqual(buildKeywordReactionDebugStatus(state), []);
  assert.equal(buildKeywordReactionDemoEvent(state), null);
  assert.equal(shouldShowKeywordReactionDebug(new URLSearchParams(`c=${encoded}`)), false);
  assert.equal(shouldShowKeywordReactionDemo(new URLSearchParams(`c=${encoded}`)), false);
});

test("keyword reaction overlay runtime exposes only public-safe debug status for valid config", () => {
  const encoded = encodeKeywordReactionConfig(
    { keyword: "secret meeting topic", displayPattern: "toast", reactionStyle: "soft" },
    { compact: true }
  );
  const state = getKeywordReactionOverlayRuntimeState(new URLSearchParams(`c=${encoded}&debug=1`));
  const statusLines = buildKeywordReactionDebugStatus(state);
  const statusText = statusLines.join("\n");

  assert.equal(state.debug, true);
  assert.equal(state.demo, false);
  assert.equal(state.configState, "valid");
  assert.equal(state.displayPattern, "toast");
  assert.deepEqual(statusLines, ["Keyword reaction overlay ready", "config: valid", "pattern: toast"]);
  assert.doesNotMatch(statusText, /secret meeting topic/);
  assert.doesNotMatch(statusText, new RegExp(encoded));
  assert.doesNotMatch(statusText, /keyword:/);
});

test("keyword reaction overlay demo flag builds one fixed public-safe synthetic toast event", () => {
  const encoded = encodeKeywordReactionConfig(
    { keyword: "secret meeting topic", displayPattern: "toast", reactionStyle: "soft", intensity: 2 },
    { compact: true }
  );
  const state = getKeywordReactionOverlayRuntimeState(new URLSearchParams(`c=${encoded}&demo=1`));
  const event = buildKeywordReactionDemoEvent(state);
  const eventText = JSON.stringify(event);

  assert.equal(shouldShowKeywordReactionDemo(new URLSearchParams(`c=${encoded}&demo=1`)), true);
  assert.equal(shouldShowKeywordReactionDemo(new URLSearchParams(`c=${encoded}&demo=true`)), false);
  assert.equal(state.debug, false);
  assert.equal(state.demo, true);
  assert.equal(state.configState, "valid");
  assert.deepEqual(event, {
    text: KEYWORD_REACTION_DEMO_EVENT_TEXT,
    displayPattern: "toast",
    reactionStyle: "soft",
    intensity: 2,
    durationMs: 2400
  });
  assert.doesNotMatch(eventText, /secret meeting topic/);
  assert.doesNotMatch(eventText, new RegExp(encoded));
  assert.doesNotMatch(eventText, /keyword:/);
});

test("keyword reaction overlay routes demo events through local intake queue helper before rendering", () => {
  const source = readFileSync(new URL("../assets/js/keyword-reaction-overlay.js", import.meta.url), "utf8");
  const encoded = encodeKeywordReactionConfig(
    { keyword: "secret meeting topic", displayPattern: "toast", reactionStyle: "pulse", intensity: 3 },
    { compact: true }
  );
  const state = getKeywordReactionOverlayRuntimeState(new URLSearchParams(`c=${encoded}&demo=1`));
  const event = buildKeywordReactionDemoEvent(state);
  const eventText = JSON.stringify(event);

  assert.match(source, /from "\.\/keyword-reaction-intake-queue\.js"/);
  assert.match(source, /\benqueueKeywordReactionLocalInput\b/);
  assert.doesNotMatch(source, /\benqueueKeywordReactionEvent\b/);
  assert.match(source, /\bdequeueKeywordReactionEvent\b/);
  assert.deepEqual(event, {
    text: KEYWORD_REACTION_DEMO_EVENT_TEXT,
    displayPattern: "toast",
    reactionStyle: "pulse",
    intensity: 3,
    durationMs: 2400
  });
  assert.equal(Object.hasOwn(event, "queue"), false);
  assert.equal(Object.hasOwn(event, "eventPayload"), false);
  assert.equal(Object.hasOwn(event, "eventId"), false);
  assert.equal(Object.hasOwn(event, "displayText"), false);
  assert.doesNotMatch(eventText, /secret meeting topic/);
  assert.doesNotMatch(eventText, new RegExp(encoded));
});

test("keyword reaction overlay routes demo events through same-window internal dispatch with cleanup", () => {
  const target = createRecordingEventTarget();
  const encoded = encodeKeywordReactionConfig(
    { keyword: "secret meeting topic", displayPattern: "toast", reactionStyle: "soft", intensity: 2 },
    { compact: true }
  );
  const state = getKeywordReactionOverlayRuntimeState(new URLSearchParams(`c=${encoded}&demo=1`));
  const event = buildKeywordReactionDemoEvent(state, { internalDispatchTarget: target });
  const eventText = JSON.stringify(event);

  assert.deepEqual(event, {
    text: KEYWORD_REACTION_DEMO_EVENT_TEXT,
    displayPattern: "toast",
    reactionStyle: "soft",
    intensity: 2,
    durationMs: 2400
  });
  assert.equal(target.addCount, 1);
  assert.equal(target.removeCount, 1);
  assert.deepEqual(target.dispatchedTypes, [KEYWORD_REACTION_INTERNAL_EVENT_NAME]);
  assert.equal(target.listenerCount(KEYWORD_REACTION_INTERNAL_EVENT_NAME), 0);
  assert.equal(Object.hasOwn(event, "queue"), false);
  assert.equal(Object.hasOwn(event, "eventPayload"), false);
  assert.equal(Object.hasOwn(event, "eventId"), false);
  assert.equal(Object.hasOwn(event, "displayText"), false);
  assert.doesNotMatch(eventText, /secret meeting topic/);
  assert.doesNotMatch(eventText, new RegExp(encoded));
});

test("keyword reaction overlay demo flag falls back safely for invalid config", () => {
  const rawConfigValue = ["sk", "invalid-config-value"].join("-");
  const state = getKeywordReactionOverlayRuntimeState(new URLSearchParams(`c=${rawConfigValue}&demo=1&debug=1`));
  const statusText = buildKeywordReactionDebugStatus(state).join("\n");
  const event = buildKeywordReactionDemoEvent(state);
  const eventText = JSON.stringify(event);

  assert.equal(state.debug, true);
  assert.equal(state.demo, true);
  assert.equal(state.configState, "fallback");
  assert.match(statusText, /Keyword reaction overlay ready/);
  assert.match(statusText, /config: fallback/);
  assert.deepEqual(event, {
    text: KEYWORD_REACTION_DEMO_EVENT_TEXT,
    displayPattern: "toast",
    reactionStyle: "spark",
    intensity: 1,
    durationMs: 2400
  });
  assert.doesNotMatch(statusText, new RegExp(rawConfigValue));
  assert.doesNotMatch(statusText, /invalid-config-value/);
  assert.doesNotMatch(eventText, new RegExp(rawConfigValue));
  assert.doesNotMatch(eventText, /invalid-config-value/);
});

test("keyword reaction overlay demo rendering uses text and safe bounded style data", () => {
  const element = createFakeElement();
  const event = {
    text: KEYWORD_REACTION_DEMO_EVENT_TEXT,
    displayPattern: "toast",
    reactionStyle: "pulse",
    intensity: 3,
    durationMs: 2400
  };

  renderKeywordReactionDemoEvent(element, event);

  assert.equal(element.textContent, KEYWORD_REACTION_DEMO_EVENT_TEXT);
  assert.equal(element.hidden, false);
  assert.equal(element.attributes.get("aria-hidden"), "false");
  assert.equal(element.attributes.has("inert"), false);
  assert.deepEqual(element.dataset, {
    pattern: "toast",
    style: "pulse",
    intensity: "3"
  });
});

test("keyword reaction overlay mount cleans old demo timer when returning to idle", () => {
  const statusElement = createFakeElement();
  const demoElement = createFakeElement();
  const timers = [];
  const clearedTimers = [];
  const fakeDocument = {
    defaultView: {
      setTimeout(callback, durationMs) {
        const timer = { callback, durationMs };
        timers.push(timer);
        return timer;
      },
      clearTimeout(timer) {
        clearedTimers.push(timer);
      }
    },
    getElementById(id) {
      return {
        keywordReactionOverlayStatus: statusElement,
        keywordReactionOverlayDemo: demoElement
      }[id];
    }
  };

  mountKeywordReactionOverlayRuntime(fakeDocument, { search: "?demo=1" });
  assert.equal(demoElement.hidden, false);
  assert.equal(demoElement.textContent, KEYWORD_REACTION_DEMO_EVENT_TEXT);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].durationMs, 2400);

  mountKeywordReactionOverlayRuntime(fakeDocument, { search: "" });
  assert.deepEqual(clearedTimers, [timers[0]]);
  assert.equal(demoElement.hidden, true);
  assert.equal(demoElement.textContent, "");
});

test("keyword reaction overlay mount cleans old demo timer before rerunning queued demo", () => {
  const statusElement = createFakeElement();
  const demoElement = createFakeElement();
  const timers = [];
  const clearedTimers = [];
  const fakeDocument = {
    defaultView: {
      setTimeout(callback, durationMs) {
        const timer = { callback, durationMs };
        timers.push(timer);
        return timer;
      },
      clearTimeout(timer) {
        clearedTimers.push(timer);
      }
    },
    getElementById(id) {
      return {
        keywordReactionOverlayStatus: statusElement,
        keywordReactionOverlayDemo: demoElement
      }[id];
    }
  };

  mountKeywordReactionOverlayRuntime(fakeDocument, { search: "?demo=1" });
  mountKeywordReactionOverlayRuntime(fakeDocument, { search: "?demo=1" });

  assert.deepEqual(clearedTimers, [timers[0]]);
  assert.equal(timers.length, 2);
  assert.equal(timers[1].durationMs, 2400);
  assert.equal(demoElement.hidden, false);
  assert.equal(demoElement.textContent, KEYWORD_REACTION_DEMO_EVENT_TEXT);
});

test("keyword reaction overlay runtime falls back for invalid config without echoing raw c", () => {
  const rawConfigValue = ["sk", "invalid-config-value"].join("-");
  const state = getKeywordReactionOverlayRuntimeState(new URLSearchParams(`c=${rawConfigValue}&debug=1`));
  const statusText = buildKeywordReactionDebugStatus(state).join("\n");

  assert.equal(state.debug, true);
  assert.equal(state.configState, "fallback");
  assert.equal(state.displayPattern, "toast");
  assert.match(statusText, /Keyword reaction overlay ready/);
  assert.match(statusText, /config: fallback/);
  assert.match(statusText, /pattern: toast/);
  assert.doesNotMatch(statusText, new RegExp(rawConfigValue));
  assert.doesNotMatch(statusText, /invalid-config-value/);
});

test("keyword reaction overlay runtime treats empty config as fallback public-safe debug", () => {
  const state = getKeywordReactionOverlayRuntimeState(new URLSearchParams("c=&debug=1"));
  const statusText = buildKeywordReactionDebugStatus(state).join("\n");

  assert.equal(state.configState, "fallback");
  assert.equal(statusText, "Keyword reaction overlay ready\nconfig: fallback\npattern: toast");
});

test("keyword reaction overlay debug status does not expose manual text fixture data or secret-like values", () => {
  const privateMarkerField = ["client", "secret"].join("_");
  const encoded = encodeKeywordReactionConfig(
    {
      keyword: "hello",
      manualText: "manual text should not be kept",
      fixtureEventData: [{ displayText: "fixture display text" }],
      displayText: ["fixture display text"],
      [privateMarkerField]: "private marker should not be kept"
    },
    { compact: true }
  );
  const state = getKeywordReactionOverlayRuntimeState(new URLSearchParams(`c=${encoded}&debug=1`));
  const statusText = buildKeywordReactionDebugStatus(state).join("\n");

  assert.equal(state.configState, "valid");
  assert.doesNotMatch(statusText, /hello/);
  assert.doesNotMatch(statusText, /manual text/);
  assert.doesNotMatch(statusText, /fixture display text/);
  assert.doesNotMatch(statusText, /private marker/);
  assert.doesNotMatch(statusText, /displayText/);
});

function createFakeElement() {
  return {
    textContent: "",
    hidden: true,
    dataset: {},
    attributes: new Map(),
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    }
  };
}

function createRecordingEventTarget() {
  const listeners = new Map();
  return {
    addCount: 0,
    removeCount: 0,
    dispatchedTypes: [],
    addEventListener(type, listener) {
      this.addCount += 1;
      const typeListeners = listeners.get(type) ?? new Set();
      typeListeners.add(listener);
      listeners.set(type, typeListeners);
    },
    removeEventListener(type, listener) {
      this.removeCount += 1;
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent(event) {
      this.dispatchedTypes.push(event.type);
      for (const listener of listeners.get(event.type) ?? []) {
        listener(event);
      }
      return true;
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    }
  };
}
