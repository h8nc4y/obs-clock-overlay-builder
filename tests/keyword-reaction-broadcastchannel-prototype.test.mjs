import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { keywordReactionConfigToUrl } from "../assets/js/keyword-reaction-config.js";
import {
  KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_DEFAULT_CHANNEL,
  buildKeywordReactionBroadcastChannelPrototypePayload,
  getKeywordReactionBroadcastChannelPrototypeState,
  normalizeKeywordReactionBroadcastChannelPrototypeChannel,
  startKeywordReactionBroadcastChannelPrototype
} from "../assets/js/keyword-reaction-broadcastchannel-prototype.js";
import { KEYWORD_REACTION_DEMO_EVENT_TEXT } from "../assets/js/keyword-reaction-overlay.js";

test("broadcast channel prototype stays disabled unless explicitly query gated", () => {
  assert.equal(getKeywordReactionBroadcastChannelPrototypeState("").enabled, false);
  assert.equal(getKeywordReactionBroadcastChannelPrototypeState("?bcRole=receiver").enabled, false);
  assert.equal(getKeywordReactionBroadcastChannelPrototypeState("?bcPrototype=true&bcRole=receiver").enabled, false);

  const state = getKeywordReactionBroadcastChannelPrototypeState(
    "?bcPrototype=1&bcRole=receiver&bcChannel=obs-bc-qa-001"
  );

  assert.equal(state.enabled, true);
  assert.equal(state.role, "receiver");
  assert.equal(state.channel, "obs-bc-qa-001");
  assert.equal(state.channelState, "valid");
});

test("broadcast channel prototype normalizes unsafe channel names without echoing raw values", () => {
  const rawChannel = ["sk", "private channel value"].join("-");
  const normalized = normalizeKeywordReactionBroadcastChannelPrototypeChannel(rawChannel);
  const state = getKeywordReactionBroadcastChannelPrototypeState(`?bcPrototype=1&bcRole=sender&bcChannel=${rawChannel}`);
  const stateText = JSON.stringify(state);

  assert.deepEqual(normalized, {
    channel: KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_DEFAULT_CHANNEL,
    channelState: "fallback"
  });
  assert.equal(state.enabled, true);
  assert.equal(state.role, "sender");
  assert.equal(state.channel, KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_DEFAULT_CHANNEL);
  assert.equal(state.channelState, "fallback");
  assert.doesNotMatch(stateText, /private channel value/);
  assert.doesNotMatch(stateText, new RegExp(rawChannel));
});

test("broadcast channel prototype sender posts synthetic-only normalized payload", () => {
  const channels = createRecordingBroadcastChannelConstructor();
  const state = getKeywordReactionBroadcastChannelPrototypeState(
    "?bcPrototype=1&bcRole=sender&bcChannel=obs-bc-qa-001"
  );

  const runtime = startKeywordReactionBroadcastChannelPrototype(state, {
    BroadcastChannelConstructor: channels.BroadcastChannel
  });
  const posted = channels.instances[0].postedMessages[0];
  const payloadText = JSON.stringify(posted);

  assert.equal(runtime.active, true);
  assert.equal(runtime.role, "sender");
  assert.equal(runtime.status, "sent");
  assert.equal(channels.instances.length, 1);
  assert.equal(channels.instances[0].name, "obs-bc-qa-001");
  assert.equal(posted.event.displayText, KEYWORD_REACTION_DEMO_EVENT_TEXT);
  assert.equal(posted.event.sourceType, "demo");
  assert.equal(Object.hasOwn(posted, "queue"), false);
  assert.equal(Object.hasOwn(posted, "rawPayload"), false);
  assert.doesNotMatch(payloadText, /secret|token|OAuth|private|viewer|comment/i);

  runtime.cleanup();
  assert.equal(channels.instances[0].closed, true);
});

test("broadcast channel prototype receiver accepts synthetic payload and cleans listener", () => {
  const channels = createRecordingBroadcastChannelConstructor();
  const received = [];
  const state = getKeywordReactionBroadcastChannelPrototypeState(
    "?bcPrototype=1&bcRole=receiver&bcChannel=obs-bc-qa-001"
  );
  const runtime = startKeywordReactionBroadcastChannelPrototype(state, {
    BroadcastChannelConstructor: channels.BroadcastChannel,
    onEvent(event) {
      received.push(event);
    }
  });
  const payload = buildKeywordReactionBroadcastChannelPrototypePayload();

  channels.instances[0].emit(payload);
  runtime.cleanup();
  channels.instances[0].emit(payload);

  assert.equal(runtime.active, true);
  assert.equal(runtime.role, "receiver");
  assert.equal(runtime.status, "listening");
  assert.equal(received.length, 1);
  assert.equal(received[0].displayText, KEYWORD_REACTION_DEMO_EVENT_TEXT);
  assert.equal(received[0].sourceType, "demo");
  assert.equal(channels.instances[0].listenerCount(), 0);
  assert.equal(channels.instances[0].closed, true);
});

test("broadcast channel prototype rejects invalid payload without raw echo", () => {
  const channels = createRecordingBroadcastChannelConstructor();
  const received = [];
  const state = getKeywordReactionBroadcastChannelPrototypeState("?bcPrototype=1&bcRole=receiver");
  startKeywordReactionBroadcastChannelPrototype(state, {
    BroadcastChannelConstructor: channels.BroadcastChannel,
    onEvent(event) {
      received.push(event);
    }
  });

  channels.instances[0].emit({
    messageType: "keyword-reaction-prototype-event",
    rawPayload: ["sk", "private payload"].join("-"),
    event: {
      sourceType: "external",
      displayText: ["sk", "private payload"].join("-")
    }
  });

  assert.deepEqual(received, []);
});

test("broadcast channel prototype payload is not encoded into generated URLs", () => {
  const payload = buildKeywordReactionBroadcastChannelPrototypePayload();
  const url = keywordReactionConfigToUrl(
    {
      keyword: "prototype",
      broadcastPayload: payload,
      fixtureEventData: [payload.event],
      queueState: [payload.event]
    },
    "https://example.test/"
  );

  assert.match(url, /\/overlay\/keyword-reaction\/\?c=/);
  assert.doesNotMatch(url, /keyword-reaction-prototype-event/);
  assert.doesNotMatch(url, /displayText/);
  assert.doesNotMatch(url, new RegExp(KEYWORD_REACTION_DEMO_EVENT_TEXT));
});

test("broadcast channel prototype module avoids disallowed transports and unsafe sinks", () => {
  const source = readFileSync(
    new URL("../assets/js/keyword-reaction-broadcastchannel-prototype.js", import.meta.url),
    "utf8"
  );

  assert.match(source, /\bBroadcastChannel\b/);
  assert.doesNotMatch(
    source,
    /(?<!\.)\bpostMessage\s*\(|globalThis\.postMessage|window\.postMessage|localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket|EventSource/
  );
  assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML|eval\s*\(|new Function|document\.write|onclick=/);
  assert.doesNotMatch(source, /setInterval|while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/);
});

function createRecordingBroadcastChannelConstructor() {
  const instances = [];
  class RecordingBroadcastChannel {
    constructor(name) {
      this.name = name;
      this.closed = false;
      this.listeners = new Set();
      this.postedMessages = [];
      instances.push(this);
    }

    addEventListener(type, listener) {
      if (type === "message") {
        this.listeners.add(listener);
      }
    }

    removeEventListener(type, listener) {
      if (type === "message") {
        this.listeners.delete(listener);
      }
    }

    postMessage(message) {
      this.postedMessages.push(message);
    }

    close() {
      this.closed = true;
    }

    emit(data) {
      for (const listener of this.listeners) {
        listener({ data });
      }
    }

    listenerCount() {
      return this.listeners.size;
    }
  }

  return { BroadcastChannel: RecordingBroadcastChannel, instances };
}
