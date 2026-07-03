import { hexToRgba } from "./config.js";
import { clearShadow } from "./share-decorations.js";

// clock.css の `.clock-seconds-small` と共有Canvasを同期する定数。
// ライブ描画が正なので、ここでは CSS 側の比率を手写しして回帰テストで固定する。
const SMALL_SECONDS_SCALE = 0.5;
const SMALL_SECONDS_GAP_EM = 0.04;
const SMALL_SECONDS_BASELINE_OFFSET_EM = 0;
const SMALL_SECONDS_STROKE_SCALE = 0.5;

// clock.css の `.clock-meridiem` と共有Canvasを同期する定数。
// meridiemSize は config 値をそのまま使い、前後の余白だけ CSS の 0.12em を手写しする。
const MERIDIEM_GAP_EM = 0.12;

export function hasSmallShareSeconds(config, formatted) {
  return Boolean(config.smallSeconds && config.showSeconds && formatted.secondsText);
}

// 時刻を「本体(digitsコロン込み)」「小秒(あれば)」「meridiem(あれば、前置/後置)」の並びに
// 分解する。ライブ(.clock-meridiem 分離 + .clock-seconds-small)の描画順を Canvas 側で再現する。
// 各要素の gapEm は「自分の直前に挿入する余白」を表す(先頭要素の gapEm は描画側で無視される)。
function buildTimeSegments(config, formatted, px) {
  const smallSeconds = hasSmallShareSeconds(config, formatted);
  const digitsText = smallSeconds
    ? formatted.timeDigitsMain
    : formatted.secondsText
      ? `${formatted.timeDigitsMain}:${formatted.secondsText}`
      : formatted.timeDigitsMain;

  const segments = [{ kind: "digits", text: digitsText, px, gapEm: 0 }];
  if (smallSeconds) {
    segments.push({ kind: "seconds", text: formatted.secondsText, px: px * SMALL_SECONDS_SCALE, gapEm: SMALL_SECONDS_GAP_EM });
  }

  const meridiemText = formatted.meridiemText;
  if (meridiemText) {
    const meridiemSegment = { kind: "meridiem", text: meridiemText, px: px * config.meridiemSize, gapEm: 0 };
    if (config.meridiemFirst) {
      // 前置: meridiem が先頭(gapEm不要)になり、直後の digits が meridiem との間隔を負う。
      segments[0] = { ...segments[0], gapEm: MERIDIEM_GAP_EM };
      segments.unshift(meridiemSegment);
    } else {
      // 後置: meridiem 自身が「直前の要素との間隔」を負って末尾に付く。
      segments.push({ ...meridiemSegment, gapEm: MERIDIEM_GAP_EM });
    }
  }
  return segments;
}

export function measureShareTime(ctx, config, formatted, px, fontStack) {
  const segments = buildTimeSegments(config, formatted, px);
  let total = 0;
  for (const segment of segments) {
    ctx.font = `${config.fontWeight} ${segment.px}px ${fontStack}`;
    if (segment !== segments[0]) {
      total += px * segment.gapEm;
    }
    total += ctx.measureText(segment.text).width;
  }
  return total;
}

export function drawShareTime(ctx, config, formatted, { x, y, px, fontStack, align, strokeScale }) {
  const segments = buildTimeSegments(config, formatted, px);
  applyShareTextEffects(ctx, config);
  ctx.fillStyle = config.textColor;

  // 幅を測ってから左端を決める(align="center" なら中央寄せ、"left" ならそのまま x を左端に)。
  const widths = segments.map((segment) => {
    ctx.font = `${config.fontWeight} ${segment.px}px ${fontStack}`;
    return ctx.measureText(segment.text).width;
  });
  const totalWidth = widths.reduce(
    (sum, width, index) => sum + width + (index === 0 ? 0 : px * segments[index].gapEm),
    0
  );
  const left = align === "center" ? x - totalWidth / 2 : x;

  const previousAlign = ctx.textAlign;
  ctx.textAlign = "left";

  let cursorX = left;
  const positions = segments.map((segment, index) => {
    if (index > 0) {
      cursorX += px * segment.gapEm;
    }
    const segmentX = cursorX;
    // 小秒/meridiem は本体の下端(baseline)に揃える。ライブの vertical-align: baseline に合わせ、
    // 縦位置オフセットは小秒のみ(SMALL_SECONDS_BASELINE_OFFSET_EM=0)を踏襲する。
    const segmentY = segment.kind === "seconds" ? y + px * SMALL_SECONDS_BASELINE_OFFSET_EM : y;
    cursorX += widths[index];
    return { segmentX, segmentY };
  });

  segments.forEach((segment, index) => {
    ctx.font = `${config.fontWeight} ${segment.px}px ${fontStack}`;
    ctx.fillText(segment.text, positions[index].segmentX, positions[index].segmentY);
  });

  if (config.strokeWidth > 0) {
    clearShadow(ctx);
    ctx.strokeStyle = config.strokeColor;
    segments.forEach((segment, index) => {
      ctx.font = `${config.fontWeight} ${segment.px}px ${fontStack}`;
      ctx.lineWidth =
        segment.kind === "seconds"
          ? config.strokeWidth * strokeScale * SMALL_SECONDS_STROKE_SCALE
          : config.strokeWidth * strokeScale;
      ctx.strokeText(segment.text, positions[index].segmentX, positions[index].segmentY);
    });
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
