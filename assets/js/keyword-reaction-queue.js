import { normalizeKeywordReactionEvent } from "./keyword-reaction-event.js";

export const DEFAULT_KEYWORD_REACTION_QUEUE_LIMIT = 5;

const MIN_KEYWORD_REACTION_QUEUE_LIMIT = 1;
const MAX_KEYWORD_REACTION_QUEUE_LIMIT = 5;

export function normalizeKeywordReactionQueueLimit(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < MIN_KEYWORD_REACTION_QUEUE_LIMIT) {
    return DEFAULT_KEYWORD_REACTION_QUEUE_LIMIT;
  }
  return Math.min(MAX_KEYWORD_REACTION_QUEUE_LIMIT, Math.trunc(number));
}

export function createKeywordReactionQueue(events = [], options = {}) {
  if (!Array.isArray(events)) {
    return [];
  }
  const normalizedEvents = events.map((event) => normalizeKeywordReactionEvent(event));
  return applyKeywordReactionQueueLimit(normalizedEvents, options.limit);
}

export function enqueueKeywordReactionEvent(queue = [], event = {}, options = {}) {
  const normalizedQueue = createKeywordReactionQueue(queue, options);
  const normalizedEvent = normalizeKeywordReactionEvent(event);
  return applyKeywordReactionQueueLimit([...normalizedQueue, normalizedEvent], options.limit);
}

export function dequeueKeywordReactionEvent(queue = [], options = {}) {
  const normalizedQueue = createKeywordReactionQueue(queue, options);
  if (normalizedQueue.length === 0) {
    return { event: null, queue: [] };
  }
  const [event, ...remainingQueue] = normalizedQueue;
  return { event, queue: remainingQueue };
}

export function clearKeywordReactionQueue() {
  return [];
}

export function applyKeywordReactionQueueLimit(queue = [], limit = DEFAULT_KEYWORD_REACTION_QUEUE_LIMIT) {
  if (!Array.isArray(queue)) {
    return [];
  }
  const normalizedLimit = normalizeKeywordReactionQueueLimit(limit);
  const normalizedQueue = queue.map((event) => normalizeKeywordReactionEvent(event));
  return normalizedQueue.slice(-normalizedLimit);
}

export function buildKeywordReactionQueueSchedule(queue = [], options = {}) {
  const normalizedQueue = createKeywordReactionQueue(queue, options);
  let cursorMs = 0;
  return normalizedQueue.map((event, index) => {
    const startMs = cursorMs;
    const durationMs = event.durationMs;
    const endMs = startMs + durationMs;
    cursorMs = endMs;
    return {
      event,
      index,
      startMs,
      endMs,
      durationMs
    };
  });
}
