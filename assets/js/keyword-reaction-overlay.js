import {
  KEYWORD_REACTION_CONFIG_VERSION,
  KEYWORD_REACTION_OVERLAY_TYPE,
  parseKeywordReactionConfigFromQuery
} from "./keyword-reaction-config.js";

const DEBUG_STATUS_ELEMENT_ID = "keywordReactionOverlayStatus";
const DEMO_EVENT_ELEMENT_ID = "keywordReactionOverlayDemo";
const DEMO_DISPLAY_PATTERN = "toast";
const DEFAULT_DEMO_INTENSITY = 1;
const MIN_DEMO_INTENSITY = 0;
const MAX_DEMO_INTENSITY = 3;

export const KEYWORD_REACTION_DEMO_EVENT_TEXT = "キーワード反応デモ";
export const KEYWORD_REACTION_DEMO_DURATION_MS = 2400;

let demoHideTimer = null;
let demoTimerHost = null;

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

export function buildKeywordReactionDemoEvent(state) {
  if (!state?.demo) {
    return null;
  }
  return {
    text: KEYWORD_REACTION_DEMO_EVENT_TEXT,
    displayPattern: DEMO_DISPLAY_PATTERN,
    reactionStyle: normalizeDemoReactionStyle(state.reactionStyle),
    intensity: normalizeDemoIntensity(state.intensity),
    durationMs: KEYWORD_REACTION_DEMO_DURATION_MS
  };
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

export function mountKeywordReactionOverlayRuntime(rootDocument = globalThis.document, runtimeLocation = globalThis.location) {
  if (!rootDocument) {
    return null;
  }
  const statusElement = rootDocument.getElementById(DEBUG_STATUS_ELEMENT_ID);
  const demoElement = rootDocument.getElementById(DEMO_EVENT_ELEMENT_ID);
  if (!statusElement && !demoElement) {
    return null;
  }

  const state = getKeywordReactionOverlayRuntimeState(runtimeLocation?.search || "");
  const lines = buildKeywordReactionDebugStatus(state);
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

  renderKeywordReactionDemoEvent(demoElement, demoEvent);
  const timerHost = rootDocument.defaultView ?? globalThis;
  demoHideTimer = timerHost.setTimeout(() => {
    hideKeywordReactionOverlayElement(demoElement);
    demoHideTimer = null;
    demoTimerHost = null;
  }, demoEvent.durationMs);
  demoTimerHost = timerHost;
  return state;
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

function normalizeDemoReactionStyle(value) {
  const normalized = String(value ?? "");
  return ["spark", "pulse", "soft", "none"].includes(normalized) ? normalized : "spark";
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
