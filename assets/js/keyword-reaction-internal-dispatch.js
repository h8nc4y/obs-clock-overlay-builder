import { validateKeywordReactionLocalEventInput } from "./keyword-reaction-event-intake.js";

export const KEYWORD_REACTION_INTERNAL_EVENT_NAME = "keyword-reaction:internal-event";

export const DEFAULT_KEYWORD_REACTION_INTERNAL_DISPATCH_OPTIONS = Object.freeze({
  bubbles: false,
  cancelable: false,
  composed: false
});

const DISPATCHED_REASON = "dispatched";
const INVALID_TARGET_REASON = "invalid-target";

export function normalizeKeywordReactionInternalDispatchTarget(target = globalThis) {
  const EventTargetConstructor = globalThis.EventTarget;
  if (typeof EventTargetConstructor === "function" && target instanceof EventTargetConstructor) {
    return target;
  }

  if (
    target &&
    typeof target.addEventListener === "function" &&
    typeof target.removeEventListener === "function" &&
    typeof target.dispatchEvent === "function"
  ) {
    return target;
  }
  return null;
}

export function createKeywordReactionInternalEvent(input = {}, options = {}) {
  const validation = validateKeywordReactionLocalEventInput(input);
  if (!validation.ok) {
    return null;
  }
  return createInternalCustomEvent(KEYWORD_REACTION_INTERNAL_EVENT_NAME, validation.event, options);
}

export function dispatchKeywordReactionInternalEvent(target, input = {}, options = {}) {
  const dispatchTarget = normalizeKeywordReactionInternalDispatchTarget(target);
  if (!dispatchTarget) {
    return buildDispatchResult(false, INVALID_TARGET_REASON, null, false);
  }

  const validation = validateKeywordReactionLocalEventInput(input);
  if (!validation.ok) {
    return buildDispatchResult(false, validation.reason, null, false);
  }

  const event = createInternalCustomEvent(KEYWORD_REACTION_INTERNAL_EVENT_NAME, validation.event, options);
  const dispatched = dispatchTarget.dispatchEvent(event);
  return buildDispatchResult(true, DISPATCHED_REASON, validation.event, dispatched);
}

export function subscribeKeywordReactionInternalEvents(target, listener, options = {}) {
  const dispatchTarget = normalizeKeywordReactionInternalDispatchTarget(target);
  if (!dispatchTarget || typeof listener !== "function") {
    return () => {};
  }

  const listenerOptions = options.listenerOptions;
  const wrappedListener = (event) => {
    const detail = getKeywordReactionInternalEventDetail(event);
    if (detail) {
      listener(detail, event);
    }
  };

  dispatchTarget.addEventListener(KEYWORD_REACTION_INTERNAL_EVENT_NAME, wrappedListener, listenerOptions);
  let active = true;

  return () => {
    if (!active) {
      return;
    }
    dispatchTarget.removeEventListener(KEYWORD_REACTION_INTERNAL_EVENT_NAME, wrappedListener, listenerOptions);
    active = false;
  };
}

export function isKeywordReactionInternalEvent(event) {
  return Boolean(getKeywordReactionInternalEventDetail(event));
}

export function getKeywordReactionInternalEventDetail(event) {
  if (!event || event.type !== KEYWORD_REACTION_INTERNAL_EVENT_NAME) {
    return null;
  }
  const validation = validateKeywordReactionLocalEventInput(event.detail);
  return validation.ok ? validation.event : null;
}

function buildDispatchResult(ok, reason, event, dispatched) {
  return {
    ok,
    reason,
    event: event ? { ...event } : null,
    dispatched: Boolean(dispatched)
  };
}

function createInternalCustomEvent(type, detail, options = {}) {
  const eventOptions = {
    bubbles: Boolean(options.bubbles ?? DEFAULT_KEYWORD_REACTION_INTERNAL_DISPATCH_OPTIONS.bubbles),
    cancelable: Boolean(options.cancelable ?? DEFAULT_KEYWORD_REACTION_INTERNAL_DISPATCH_OPTIONS.cancelable),
    composed: Boolean(options.composed ?? DEFAULT_KEYWORD_REACTION_INTERNAL_DISPATCH_OPTIONS.composed),
    detail: { ...detail }
  };
  const CustomEventConstructor = options.CustomEventConstructor ?? globalThis.CustomEvent;
  if (typeof CustomEventConstructor === "function") {
    return new CustomEventConstructor(type, eventOptions);
  }

  const EventConstructor = options.EventConstructor ?? globalThis.Event;
  const event = new EventConstructor(type, eventOptions);
  Object.defineProperty(event, "detail", {
    value: eventOptions.detail,
    enumerable: true
  });
  return event;
}
