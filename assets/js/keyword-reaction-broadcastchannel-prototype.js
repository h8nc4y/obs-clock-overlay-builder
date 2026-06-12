import { buildDemoKeywordReactionEvent } from "./keyword-reaction-event.js";
import { validateKeywordReactionLocalEventInput } from "./keyword-reaction-event-intake.js";

export const KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_MESSAGE_SCHEMA_VERSION = 1;
export const KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_MESSAGE_TYPE =
  "keyword-reaction-broadcastchannel-prototype-event";
export const KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_DEFAULT_CHANNEL = "keyword-reaction-bc-prototype";

const VALID_ROLES = new Set(["receiver", "sender"]);
const CHANNEL_PATTERN = /^[a-z0-9][a-z0-9_-]{2,63}$/;
const DISABLED_STATUS = "disabled";
const UNSUPPORTED_STATUS = "unsupported";
const LISTENING_STATUS = "listening";
const SENT_STATUS = "sent";

export function getKeywordReactionBroadcastChannelPrototypeState(input) {
  const params = searchParamsFromUnknown(input);
  const enabled = params.get("bcPrototype") === "1";
  const role = normalizePrototypeRole(params.get("bcRole"));
  const channel = normalizeKeywordReactionBroadcastChannelPrototypeChannel(params.get("bcChannel"));

  return {
    enabled,
    role,
    channel: channel.channel,
    channelState: channel.channelState
  };
}

export function normalizeKeywordReactionBroadcastChannelPrototypeChannel(value) {
  const channel = String(value ?? "").trim();
  if (CHANNEL_PATTERN.test(channel)) {
    return {
      channel,
      channelState: "valid"
    };
  }
  return {
    channel: KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_DEFAULT_CHANNEL,
    channelState: "fallback"
  };
}

export function buildKeywordReactionBroadcastChannelPrototypePayload(input = {}) {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const event = buildDemoKeywordReactionEvent(raw.eventConfig);
  return {
    schemaVersion: KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_MESSAGE_SCHEMA_VERSION,
    messageType: KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_MESSAGE_TYPE,
    event
  };
}

export function getKeywordReactionBroadcastChannelPrototypeEvent(input = {}) {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? input : null;
  if (!raw) {
    return null;
  }
  if (Number(raw.schemaVersion) !== KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_MESSAGE_SCHEMA_VERSION) {
    return null;
  }
  if (raw.messageType !== KEYWORD_REACTION_BROADCASTCHANNEL_PROTOTYPE_MESSAGE_TYPE) {
    return null;
  }
  const validation = validateKeywordReactionLocalEventInput(raw.event);
  if (!validation.ok || validation.event.sourceType !== "demo") {
    return null;
  }
  return validation.event;
}

export function startKeywordReactionBroadcastChannelPrototype(input, options = {}) {
  const state = input?.enabled === undefined ? getKeywordReactionBroadcastChannelPrototypeState(input) : input;
  if (!state?.enabled) {
    return buildRuntimeResult(false, state, DISABLED_STATUS, noop);
  }

  const BroadcastChannelConstructor = options.BroadcastChannelConstructor ?? globalThis.BroadcastChannel;
  if (typeof BroadcastChannelConstructor !== "function") {
    return buildRuntimeResult(false, state, UNSUPPORTED_STATUS, noop);
  }

  let channel = null;
  try {
    channel = new BroadcastChannelConstructor(state.channel);
  } catch {
    return buildRuntimeResult(false, state, UNSUPPORTED_STATUS, noop);
  }

  let cleanupDone = false;
  let listener = null;
  const cleanup = () => {
    if (cleanupDone) {
      return;
    }
    cleanupDone = true;
    if (listener && typeof channel.removeEventListener === "function") {
      channel.removeEventListener("message", listener);
    } else if (listener && channel.onmessage === listener) {
      channel.onmessage = null;
    }
    if (typeof channel.close === "function") {
      channel.close();
    }
  };

  if (state.role === "sender") {
    channel.postMessage(buildKeywordReactionBroadcastChannelPrototypePayload(options.payloadOptions));
    return buildRuntimeResult(true, state, SENT_STATUS, cleanup);
  }

  listener = (message) => {
    const event = getKeywordReactionBroadcastChannelPrototypeEvent(message?.data);
    if (event && typeof options.onEvent === "function") {
      options.onEvent(event);
    }
  };

  if (typeof channel.addEventListener === "function") {
    channel.addEventListener("message", listener);
  } else {
    channel.onmessage = listener;
  }

  return buildRuntimeResult(true, state, LISTENING_STATUS, cleanup);
}

function buildRuntimeResult(active, state = {}, status, cleanup) {
  return {
    active,
    role: state?.role ?? "receiver",
    channelState: state?.channelState === "valid" ? "valid" : "fallback",
    status,
    cleanup
  };
}

function normalizePrototypeRole(value) {
  const role = String(value ?? "receiver").trim();
  return VALID_ROLES.has(role) ? role : "receiver";
}

function searchParamsFromUnknown(input) {
  if (input instanceof URLSearchParams) {
    return new URLSearchParams(input);
  }
  if (input && typeof URL !== "undefined" && input instanceof URL) {
    return new URLSearchParams(input.search);
  }
  const text = String(input ?? "").trim();
  if (!text) {
    return new URLSearchParams();
  }
  if (text.startsWith("?")) {
    return new URLSearchParams(text.slice(1));
  }
  if (text.includes("?")) {
    try {
      return new URL(text, "https://local.invalid/").searchParams;
    } catch {
      return new URLSearchParams(text.slice(text.indexOf("?") + 1).split("#")[0]);
    }
  }
  return new URLSearchParams(text);
}

function noop() {}
