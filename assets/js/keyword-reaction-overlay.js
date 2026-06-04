import {
  KEYWORD_REACTION_CONFIG_VERSION,
  KEYWORD_REACTION_OVERLAY_TYPE,
  parseKeywordReactionConfigFromQuery
} from "./keyword-reaction-config.js";

const DEBUG_STATUS_ELEMENT_ID = "keywordReactionOverlayStatus";

export function shouldShowKeywordReactionDebug(input) {
  return searchParamsFromUnknown(input).get("debug") === "1";
}

export function getKeywordReactionOverlayRuntimeState(input) {
  const params = searchParamsFromUnknown(input);
  const config = parseKeywordReactionConfigFromQuery(params);
  return {
    debug: shouldShowKeywordReactionDebug(params),
    configState: configParameterLooksValid(params.get("c")) ? "valid" : "fallback",
    displayPattern: config.displayPattern
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

export function mountKeywordReactionOverlayRuntime(rootDocument = globalThis.document, runtimeLocation = globalThis.location) {
  if (!rootDocument) {
    return null;
  }
  const statusElement = rootDocument.getElementById(DEBUG_STATUS_ELEMENT_ID);
  if (!statusElement) {
    return null;
  }

  const state = getKeywordReactionOverlayRuntimeState(runtimeLocation?.search || "");
  const lines = buildKeywordReactionDebugStatus(state);
  if (lines.length === 0) {
    statusElement.textContent = "";
    statusElement.hidden = true;
    statusElement.setAttribute("aria-hidden", "true");
    statusElement.setAttribute("inert", "");
    return state;
  }

  statusElement.textContent = lines.join("\n");
  statusElement.hidden = false;
  statusElement.setAttribute("aria-hidden", "false");
  statusElement.removeAttribute("inert");
  return state;
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
