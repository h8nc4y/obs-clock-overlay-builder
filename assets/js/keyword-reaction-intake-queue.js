import { validateKeywordReactionLocalEventInput } from "./keyword-reaction-event-intake.js";
import {
  DEFAULT_KEYWORD_REACTION_QUEUE_LIMIT,
  buildKeywordReactionQueueSchedule,
  createKeywordReactionQueue,
  enqueueKeywordReactionEvent,
  normalizeKeywordReactionQueueLimit
} from "./keyword-reaction-queue.js";

export const DEFAULT_KEYWORD_REACTION_LOCAL_INPUT_BATCH_LIMIT = 50;

const MIN_LOCAL_INPUT_BATCH_LIMIT = 1;
const MAX_LOCAL_INPUT_BATCH_LIMIT = 50;

export function normalizeKeywordReactionLocalInputBatch(inputs = [], options = {}) {
  return localInputBatch(inputs, options).flatMap((input) => {
    const result = validateKeywordReactionLocalEventInput(input);
    return result.ok ? [result.event] : [];
  });
}

export function buildKeywordReactionQueueFromLocalInputs(inputs = [], options = {}) {
  return createKeywordReactionQueue(normalizeKeywordReactionLocalInputBatch(inputs, options), options);
}

export function enqueueKeywordReactionLocalInput(queue = [], input = {}, options = {}) {
  const normalizedQueue = createKeywordReactionQueue(queue, options);
  const result = validateKeywordReactionLocalEventInput(input);
  if (!result.ok) {
    return normalizedQueue;
  }
  return enqueueKeywordReactionEvent(normalizedQueue, result.event, options);
}

export function buildLocalIntakeQueueSchedule(inputs = [], options = {}) {
  return buildKeywordReactionQueueSchedule(buildKeywordReactionQueueFromLocalInputs(inputs, options), options);
}

function localInputBatch(inputs, options) {
  if (!Array.isArray(inputs)) {
    return [];
  }
  const limit = normalizeLocalInputBatchLimit(options.inputLimit ?? DEFAULT_KEYWORD_REACTION_LOCAL_INPUT_BATCH_LIMIT);
  return inputs.slice(-limit);
}

function normalizeLocalInputBatchLimit(value) {
  const queueLimitFallback = normalizeKeywordReactionQueueLimit(DEFAULT_KEYWORD_REACTION_QUEUE_LIMIT);
  const number = Number(value);
  if (!Number.isFinite(number) || number < MIN_LOCAL_INPUT_BATCH_LIMIT) {
    return queueLimitFallback;
  }
  return Math.min(MAX_LOCAL_INPUT_BATCH_LIMIT, Math.trunc(number));
}
