import {
  KEYWORD_REACTION_CONFIG_VERSION,
  KEYWORD_REACTION_OVERLAY_TYPE,
  parseKeywordReactionConfigFromQuery
} from "./keyword-reaction-config.js";
import {
  DEFAULT_KEYWORD_REACTION_EVENT,
  buildDemoKeywordReactionEvent as buildNormalizedDemoKeywordReactionEvent
} from "./keyword-reaction-event.js";
import {
  getKeywordReactionBroadcastChannelPrototypeState,
  startKeywordReactionBroadcastChannelPrototype
} from "./keyword-reaction-broadcastchannel-prototype.js";
import { enqueueKeywordReactionLocalInput } from "./keyword-reaction-intake-queue.js";
import {
  dispatchKeywordReactionInternalEvent,
  subscribeKeywordReactionInternalEvents
} from "./keyword-reaction-internal-dispatch.js";
import { dequeueKeywordReactionEvent } from "./keyword-reaction-queue.js";

const DEBUG_STATUS_ELEMENT_ID = "keywordReactionOverlayStatus";
const DEMO_EVENT_ELEMENT_ID = "keywordReactionOverlayDemo";
const DEFAULT_DEMO_INTENSITY = DEFAULT_KEYWORD_REACTION_EVENT.intensity;
const MIN_DEMO_INTENSITY = 0;
const MAX_DEMO_INTENSITY = 3;

export const KEYWORD_REACTION_DEMO_EVENT_TEXT = DEFAULT_KEYWORD_REACTION_EVENT.displayText;
export const KEYWORD_REACTION_DEMO_DURATION_MS = DEFAULT_KEYWORD_REACTION_EVENT.durationMs;

let demoHideTimer = null;
let demoTimerHost = null;
let broadcastChannelPrototypeCleanup = null;

export function shouldShowKeywordReactionDebug(input) {
  return searchParamsFromUnknown(input).get("debug") === "1";
}

export function shouldShowKeywordReactionDemo(input) {
  return searchParamsFromUnknown(input).get("demo") === "1";
}

export function getKeywordReactionOverlayRuntimeState(input) {
  const params = searchParamsFromUnknown(input);
  const config = parseKeywordReactionConfigFromQuery(params);
  return {
    debug: shouldShowKeywordReactionDebug(params),
    demo: shouldShowKeywordReactionDemo(params),
    broadcastChannelPrototype: getKeywordReactionBroadcastChannelPrototypeState(params),
    configState: configParameterLooksValid(params.get("c")) ? "valid" : "fallback",
    displayPattern: config.displayPattern,
    reactionStyle: config.reactionStyle,
    intensity: normalizeDemoIntensity(config.intensity)
  };
}

export function buildKeywordReactionDebugStatus(state) {
  if (!state?.debug) {
    return [];
  }
  return [
    "Keyword reaction overlay ready",
    `config: ${state.configState === "valid" ? "valid" : "fallback"}`,
    `pattern: ${state.displayPattern || "toast"}`
  ];
}

export function buildKeywordReactionBroadcastChannelPrototypeStatus(state, runtimeState = {}) {
  const prototypeState = state?.broadcastChannelPrototype;
  if (!prototypeState?.enabled) {
    return [];
  }
  const role = prototypeState.role === "sender" ? "sender" : "receiver";
  return [
    `BroadcastChannel prototype ${role} ready`,
    `channel: ${prototypeState.channelState === "valid" ? "valid" : "fallback"}`,
    `status: ${runtimeState.status || "ready"}`
  ];
}

export function buildKeywordReactionDemoEvent(state, options = {}) {
  if (!state?.demo) {
    return null;
  }
  const demoEvent = buildNormalizedDemoKeywordReactionEvent({
    displayPattern: state.displayPattern,
    reactionStyle: state.reactionStyle,
    intensity: state.intensity
  });
  const dispatchTarget = options.internalDispatchTarget ?? createKeywordReactionOverlayInternalDispatchTarget(options);
  let renderedEvent = null;
  const unsubscribe = subscribeKeywordReactionInternalEvents(dispatchTarget, (event) => {
    renderedEvent = buildKeywordReactionRenderableDemoEvent(event);
  });
  try {
    dispatchKeywordReactionInternalEvent(dispatchTarget, demoEvent, options.dispatchOptions ?? {});
  } finally {
    unsubscribe();
  }
  return renderedEvent;
}

function buildKeywordReactionRenderableDemoEvent(event) {
  const queue = enqueueKeywordReactionLocalInput([], event);
  const { event: queuedEvent } = dequeueKeywordReactionEvent(queue);
  if (!queuedEvent) {
    return null;
  }
  return {
    text: queuedEvent.displayText,
    displayPattern: queuedEvent.displayPattern,
    reactionStyle: queuedEvent.reactionStyle,
    intensity: normalizeDemoIntensity(queuedEvent.intensity),
    durationMs: queuedEvent.durationMs
  };
}

function createKeywordReactionOverlayInternalDispatchTarget(options = {}) {
  const EventTargetConstructor = options.EventTargetConstructor ?? globalThis.EventTarget;
  if (typeof EventTargetConstructor !== "function") {
    return null;
  }
  return new EventTargetConstructor();
}

export function renderKeywordReactionDemoEvent(element, event) {
  if (!element || !event) {
    return;
  }
  element.textContent = event.text;
  element.hidden = false;
  element.setAttribute("aria-hidden", "false");
  element.removeAttribute("inert");
  element.dataset.pattern = event.displayPattern;
  element.dataset.style = event.reactionStyle;
  element.dataset.intensity = String(event.intensity);
}

export function mountKeywordReactionOverlayRuntime(
  rootDocument = globalThis.document,
  runtimeLocation = globalThis.location,
  runtimeOptions = {}
) {
  if (!rootDocument) {
    return null;
  }
  const statusElement = rootDocument.getElementById(DEBUG_STATUS_ELEMENT_ID);
  const demoElement = rootDocument.getElementById(DEMO_EVENT_ELEMENT_ID);
  if (!statusElement && !demoElement) {
    return null;
  }

  const state = getKeywordReactionOverlayRuntimeState(runtimeLocation?.search || "");
  clearKeywordReactionBroadcastChannelPrototype();
  let broadcastChannelPrototypeRuntime = null;
  if (state.broadcastChannelPrototype.enabled) {
    broadcastChannelPrototypeRuntime = startKeywordReactionBroadcastChannelPrototype(state.broadcastChannelPrototype, {
      BroadcastChannelConstructor: runtimeOptions.BroadcastChannelConstructor,
      onEvent(event) {
        const renderableEvent = buildKeywordReactionRenderableDemoEvent(event);
        if (renderableEvent) {
          showKeywordReactionOverlayEvent(rootDocument, demoElement, renderableEvent);
        }
      }
    });
    broadcastChannelPrototypeCleanup = broadcastChannelPrototypeRuntime.cleanup;
  }

  const lines = [
    ...buildKeywordReactionDebugStatus(state),
    ...buildKeywordReactionBroadcastChannelPrototypeStatus(state, broadcastChannelPrototypeRuntime)
  ];
  if (statusElement && lines.length === 0) {
    statusElement.textContent = "";
    statusElement.hidden = true;
    statusElement.setAttribute("aria-hidden", "true");
    statusElement.setAttribute("inert", "");
  } else if (statusElement) {
    statusElement.textContent = lines.join("\n");
    statusElement.hidden = false;
    statusElement.setAttribute("aria-hidden", "false");
    statusElement.removeAttribute("inert");
  }

  clearKeywordReactionDemoTimer();
  const demoEvent = buildKeywordReactionDemoEvent(state);
  if (!demoElement || !demoEvent) {
    hideKeywordReactionOverlayElement(demoElement);
    return state;
  }

  showKeywordReactionOverlayEvent(rootDocument, demoElement, demoEvent);
  return state;
}

function showKeywordReactionOverlayEvent(rootDocument, demoElement, event) {
  if (!demoElement || !event) {
    return;
  }
  clearKeywordReactionDemoTimer();
  renderKeywordReactionDemoEvent(demoElement, event);
  const timerHost = rootDocument.defaultView ?? globalThis;
  demoHideTimer = timerHost.setTimeout(() => {
    hideKeywordReactionOverlayElement(demoElement);
    demoHideTimer = null;
    demoTimerHost = null;
  }, event.durationMs);
  demoTimerHost = timerHost;
}

function clearKeywordReactionDemoTimer() {
  if (demoHideTimer !== null) {
    const timerHost = demoTimerHost ?? globalThis;
    if (typeof timerHost.clearTimeout === "function") {
      timerHost.clearTimeout(demoHideTimer);
    } else {
      clearTimeout(demoHideTimer);
    }
    demoHideTimer = null;
    demoTimerHost = null;
  }
}

function clearKeywordReactionBroadcastChannelPrototype() {
  if (typeof broadcastChannelPrototypeCleanup === "function") {
    broadcastChannelPrototypeCleanup();
  }
  broadcastChannelPrototypeCleanup = null;
}

function hideKeywordReactionOverlayElement(element) {
  if (!element) {
    return;
  }
  element.textContent = "";
  element.hidden = true;
  element.setAttribute("aria-hidden", "true");
  element.setAttribute("inert", "");
  delete element.dataset.pattern;
  delete element.dataset.style;
  delete element.dataset.intensity;
}

function normalizeDemoIntensity(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return DEFAULT_DEMO_INTENSITY;
  }
  return Math.min(MAX_DEMO_INTENSITY, Math.max(MIN_DEMO_INTENSITY, Math.round(number)));
}

function configParameterLooksValid(value) {
  const encoded = String(value ?? "").trim();
  if (!encoded) {
    return false;
  }
  try {
    const raw = JSON.parse(decodeBase64UrlText(encoded));
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return false;
    }
    if (raw.schemaVersion !== undefined && Number(raw.schemaVersion) !== KEYWORD_REACTION_CONFIG_VERSION) {
      return false;
    }
    if (raw.overlayType !== undefined && raw.overlayType !== KEYWORD_REACTION_OVERLAY_TYPE) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
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

function decodeBase64UrlText(encoded) {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  const bytes = base64ToBytes(base64);
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(bytes).toString("utf8");
}

function base64ToBytes(base64) {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(base64, "base64"));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountKeywordReactionOverlayRuntime(), { once: true });
  } else {
    mountKeywordReactionOverlayRuntime();
  }
}
