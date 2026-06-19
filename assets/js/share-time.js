import { hexToRgba } from "./config.js";
import { clearShadow } from "./share-decorations.js";

// clock.css の `.clock-seconds-small` と共有Canvasを同期する定数。
// ライブ描画が正なので、ここでは CSS 側の比率を手写しして回帰テストで固定する。
const SMALL_SECONDS_SCALE = 0.5;
const SMALL_SECONDS_GAP_EM = 0.04;
const SMALL_SECONDS_BASELINE_OFFSET_EM = 0.18;
const SMALL_SECONDS_STROKE_SCALE = 0.5;

export function hasSmallShareSeconds(config, formatted) {
  return Boolean(config.smallSeconds && config.showSeconds && formatted.secondsText);
}

export function measureShareTime(ctx, config, formatted, px, fontStack) {
  ctx.font = `${config.fontWeight} ${px}px ${fontStack}`;
  if (!hasSmallShareSeconds(config, formatted)) {
    return ctx.measureText(formatted.time).width;
  }
  const mainWidth = ctx.measureText(formatted.timeMain).width;
  const secondsPx = px * SMALL_SECONDS_SCALE;
  ctx.font = `${config.fontWeight} ${secondsPx}px ${fontStack}`;
  return mainWidth + px * SMALL_SECONDS_GAP_EM + ctx.measureText(formatted.secondsText).width;
}

export function drawShareTime(ctx, config, formatted, { x, y, px, fontStack, align, strokeScale }) {
  const smallSeconds = hasSmallShareSeconds(config, formatted);
  applyShareTextEffects(ctx, config);
  ctx.fillStyle = config.textColor;

  if (!smallSeconds) {
    ctx.font = `${config.fontWeight} ${px}px ${fontStack}`;
    ctx.fillText(formatted.time, x, y);
    if (config.strokeWidth > 0) {
      clearShadow(ctx);
      ctx.lineWidth = config.strokeWidth * strokeScale;
      ctx.strokeStyle = config.strokeColor;
      ctx.strokeText(formatted.time, x, y);
    }
    return;
  }

  const previousAlign = ctx.textAlign;
  const gap = px * SMALL_SECONDS_GAP_EM;
  const secondsPx = px * SMALL_SECONDS_SCALE;
  ctx.font = `${config.fontWeight} ${px}px ${fontStack}`;
  const mainWidth = ctx.measureText(formatted.timeMain).width;
  ctx.font = `${config.fontWeight} ${secondsPx}px ${fontStack}`;
  const secondsWidth = ctx.measureText(formatted.secondsText).width;
  const totalWidth = mainWidth + gap + secondsWidth;
  const left = align === "center" ? x - totalWidth / 2 : x;
  const secondsX = left + mainWidth + gap;
  const secondsY = y + px * SMALL_SECONDS_BASELINE_OFFSET_EM;

  ctx.textAlign = "left";
  ctx.font = `${config.fontWeight} ${px}px ${fontStack}`;
  ctx.fillText(formatted.timeMain, left, y);
  ctx.font = `${config.fontWeight} ${secondsPx}px ${fontStack}`;
  ctx.fillText(formatted.secondsText, secondsX, secondsY);

  if (config.strokeWidth > 0) {
    clearShadow(ctx);
    ctx.strokeStyle = config.strokeColor;
    ctx.font = `${config.fontWeight} ${px}px ${fontStack}`;
    ctx.lineWidth = config.strokeWidth * strokeScale;
    ctx.strokeText(formatted.timeMain, left, y);
    ctx.font = `${config.fontWeight} ${secondsPx}px ${fontStack}`;
    ctx.lineWidth = config.strokeWidth * strokeScale * SMALL_SECONDS_STROKE_SCALE;
    ctx.strokeText(formatted.secondsText, secondsX, secondsY);
  }

  ctx.textAlign = previousAlign;
}

// 時計の影と縁取りを Canvas のテキスト描画へ反映する共通処理。
function applyShareTextEffects(ctx, config) {
  if (config.shadowOpacity > 0 && config.shadowBlur > 0) {
    ctx.shadowColor = hexToRgba(config.shadowColor, config.shadowOpacity);
    ctx.shadowBlur = config.shadowBlur * 1.6;
    ctx.shadowOffsetX = config.shadowX * 1.6;
    ctx.shadowOffsetY = config.shadowY * 1.6;
  } else {
    clearShadow(ctx);
  }
}
