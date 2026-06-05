import assert from "node:assert/strict";
import test from "node:test";
import {
  buildKeywordReactionDebugStatus,
  getKeywordReactionOverlayRuntimeState,
  shouldShowKeywordReactionDebug
} from "../assets/js/keyword-reaction-overlay.js";
import { encodeKeywordReactionConfig } from "../assets/js/keyword-reaction-config.js";

test("keyword reaction overlay runtime stays silent without explicit debug", () => {
  const encoded = encodeKeywordReactionConfig({ keyword: "public-keyword", reactionStyle: "pulse" }, { compact: true });
  const state = getKeywordReactionOverlayRuntimeState(new URLSearchParams(`c=${encoded}`));

  assert.equal(state.debug, false);
  assert.equal(state.configState, "valid");
  assert.deepEqual(buildKeywordReactionDebugStatus(state), []);
  assert.equal(shouldShowKeywordReactionDebug(new URLSearchParams(`c=${encoded}`)), false);
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
  assert.equal(state.configState, "valid");
  assert.equal(state.displayPattern, "toast");
  assert.deepEqual(statusLines, ["Keyword reaction overlay ready", "config: valid", "pattern: toast"]);
  assert.doesNotMatch(statusText, /secret meeting topic/);
  assert.doesNotMatch(statusText, new RegExp(encoded));
  assert.doesNotMatch(statusText, /keyword:/);
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
