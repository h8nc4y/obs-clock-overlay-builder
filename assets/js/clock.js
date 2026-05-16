import { parseConfigFromQuery } from "./config.js";
import { mountClock } from "./render.js";
import { nextSecondDelay } from "./time.js";

const root = document.querySelector("#clockRoot");
const config = parseConfigFromQuery(window.location.href);
const clock = mountClock(root, config);
let timerId = 0;

function scheduleNextTick() {
  window.clearTimeout(timerId);
  const now = new Date();
  clock.tick(now);
  timerId = window.setTimeout(scheduleNextTick, nextSecondDelay(now));
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    scheduleNextTick();
  }
});

window.addEventListener("pagehide", () => {
  window.clearTimeout(timerId);
});

scheduleNextTick();
