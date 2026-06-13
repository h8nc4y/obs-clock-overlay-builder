import { parseConfigFromQuery } from "./config.js";
import { mountClock } from "./render.js";
import { nextSecondDelay } from "./time.js";
import { correctedNow, startTimeSync } from "./time-sync.js";

const root = document.querySelector("#clockRoot");
const config = parseConfigFromQuery(window.location.href);
// 全時計種別(デジタル/アナログ/フリップ)が options.now を使うので、
// サーバー補正後の時刻を一箇所から供給する。
const clock = mountClock(root, config, { now: correctedNow });
let timerId = 0;

function scheduleNextTick() {
  window.clearTimeout(timerId);
  const now = correctedNow();
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

// PCの時計がずれていてもサーバー時刻へ自動補正する。補正できたら即再描画。
// 取得失敗時は offset=0 のままなのでローカル時刻で動き続ける。
startTimeSync({ onUpdate: scheduleNextTick });
scheduleNextTick();
