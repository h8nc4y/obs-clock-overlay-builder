import { cssStringLiteral, hexToRgba, normalizeConfig } from "./config.js";
import { analogParts, createAnalogFormatter, createFormatters, formatClock } from "./time.js";

export const CLOCK_VISUAL_SAFE_INSET = 18;
const SVG_NS = "http://www.w3.org/2000/svg";

// clockType に応じてデジタル/アナログの実装を選び、種別が変わったら作り直すラッパー。
// ビルダーの previewClock も clock.js も updateConfig を呼ぶだけでよい。
export function mountClock(container, config, options = {}) {
  let currentConfig = normalizeConfig(config);
  let impl = createImpl(container, currentConfig, options);

  return {
    get element() {
      return impl.element;
    },
    updateConfig(nextConfig) {
      const normalized = normalizeConfig(nextConfig);
      if (normalized.clockType !== currentConfig.clockType) {
        impl.destroy();
        impl = createImpl(container, normalized, options);
      } else {
        impl.updateConfig(normalized);
      }
      currentConfig = normalized;
    },
    tick(now = new Date()) {
      impl.tick(now);
    },
    getConfig() {
      return impl.getConfig();
    },
    destroy() {
      impl.destroy();
    }
  };
}

function createImpl(container, config, options) {
  return config.clockType === "analog"
    ? mountAnalogClock(container, config, options)
    : mountDigitalClock(container, config, options);
}

function mountDigitalClock(container, config, options = {}) {
  const root = document.createElement("div");
  const label = document.createElement("div");
  const main = document.createElement("div");
  const dateRow = document.createElement("div");
  const dateNode = document.createElement("span");
  const weekdayNode = document.createElement("span");
  const timeRow = document.createElement("div");
  const timeNode = document.createElement("span");

  root.className = "clock-widget";
  label.className = "clock-label";
  main.className = "clock-main";
  dateRow.className = "clock-date-row";
  dateNode.className = "clock-date";
  weekdayNode.className = "clock-weekday";
  timeRow.className = "clock-time-row";
  timeNode.className = "clock-time";

  dateRow.append(dateNode, weekdayNode);
  timeRow.append(timeNode);
  main.append(dateRow, timeRow);
  root.append(label, main);
  container.textContent = "";
  container.append(root);

  let currentConfig = normalizeConfig(config);
  let formatters = createFormatters(currentConfig);

  const controller = {
    element: root,
    updateConfig(nextConfig) {
      currentConfig = normalizeConfig(nextConfig);
      formatters = createFormatters(currentConfig);
      applyClockStyles(root, currentConfig);
      updateVisibility();
      this.tick(options.now ? options.now() : new Date());
    },
    tick(now = new Date()) {
      const formatted = formatClock(formatters, now);
      label.textContent = currentConfig.label;
      dateNode.textContent = formatted.date;
      weekdayNode.textContent = formatted.weekday;
      setFixedWidthDigits(timeNode, formatted.time);
      updateVisibility();
    },
    getConfig() {
      return { ...currentConfig };
    },
    destroy() {
      root.remove();
    }
  };

  function updateVisibility() {
    const hideLabel = currentConfig.labelPosition === "hidden" || !currentConfig.label;
    label.hidden = hideLabel;
    dateNode.hidden = !currentConfig.showDate;
    weekdayNode.hidden = !currentConfig.showWeekday;
    dateRow.hidden = !currentConfig.showDate && !currentConfig.showWeekday;
  }

  controller.updateConfig(currentConfig);
  return controller;
}

function mountAnalogClock(container, config, options = {}) {
  const root = document.createElementNS(SVG_NS, "svg");
  root.setAttribute("class", "clock-analog");
  root.setAttribute("viewBox", "0 0 100 100");
  container.textContent = "";
  container.append(root);

  let currentConfig = normalizeConfig(config);
  let formatter = createAnalogFormatter(currentConfig.timezone);
  let hands = buildAnalogFace(root, currentConfig);
  let rafId = 0;

  function render(now) {
    const parts = analogParts(formatter, now);
    const angles = computeAnalogAngles(parts, currentConfig.analogSecondHand);
    hands.hour.setAttribute("transform", `rotate(${angles.hourDeg.toFixed(2)} 50 50)`);
    hands.minute.setAttribute("transform", `rotate(${angles.minuteDeg.toFixed(2)} 50 50)`);
    if (hands.second) {
      hands.second.setAttribute("transform", `rotate(${angles.secondDeg.toFixed(2)} 50 50)`);
    }
  }

  function stopLoop() {
    if (rafId && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(rafId);
    }
    rafId = 0;
  }

  function startLoop() {
    stopLoop();
    if (currentConfig.analogSecondHand === "sweep" && typeof requestAnimationFrame === "function") {
      const loop = () => {
        render(options.now ? options.now() : new Date());
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }
  }

  const controller = {
    element: root,
    updateConfig(nextConfig) {
      currentConfig = normalizeConfig(nextConfig);
      formatter = createAnalogFormatter(currentConfig.timezone);
      hands = buildAnalogFace(root, currentConfig);
      render(options.now ? options.now() : new Date());
      startLoop();
    },
    tick(now = new Date()) {
      render(now);
    },
    getConfig() {
      return { ...currentConfig };
    },
    destroy() {
      stopLoop();
      root.remove();
    }
  };

  controller.updateConfig(currentConfig);
  return controller;
}

// 時刻 → 針の角度(12時=0°, 時計回り)。
// secondHand が "sweep" のときだけ ms を混ぜて秒針を滑らかに動かす。
export function computeAnalogAngles({ hours, minutes, seconds, milliseconds = 0 }, secondHand = "sweep") {
  const sec = secondHand === "sweep" ? seconds + milliseconds / 1000 : seconds;
  const min = minutes + sec / 60;
  const hour = (hours % 12) + min / 60;
  return {
    hourDeg: hour * 30,
    minuteDeg: min * 6,
    secondDeg: sec * 6
  };
}

function buildAnalogFace(root, config) {
  root.setAttribute("width", String(config.analogSize));
  root.setAttribute("height", String(config.analogSize));
  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }

  const faceColor = hexToRgba(config.backgroundColor, config.backgroundOpacity);
  const rimColor = hexToRgba(config.borderColor, config.borderOpacity);
  const inkColor = config.textColor;
  const accentColor = config.strokeColor;
  const rimWidth = Math.max(0, config.borderWidth);

  if (rimWidth > 0) {
    root.append(svgEl("circle", { cx: 50, cy: 50, r: 48, fill: rimColor }));
  }
  root.append(svgEl("circle", { cx: 50, cy: 50, r: 48 - rimWidth, fill: faceColor }));

  appendMarks(root, config, inkColor);

  // 針(12時方向に伸びる矩形。rotate(deg 50 50) で中心周りに回す)。
  const hour = svgEl("rect", { x: 48.8, y: 26, width: 2.4, height: 28, rx: 1.2, fill: inkColor });
  const minute = svgEl("rect", { x: 49.1, y: 15, width: 1.8, height: 39, rx: 0.9, fill: inkColor });
  root.append(hour, minute);

  let second = null;
  if (config.analogSecondHand !== "off") {
    second = svgEl("rect", { x: 49.6, y: 11, width: 0.8, height: 45, rx: 0.4, fill: accentColor });
    root.append(second);
  }

  root.append(svgEl("circle", { cx: 50, cy: 50, r: 2.4, fill: inkColor }));
  root.append(svgEl("circle", { cx: 50, cy: 50, r: 1.1, fill: accentColor }));

  return { hour, minute, second };
}

function appendMarks(root, config, inkColor) {
  const showNumbers = config.analogMarks === "numbers" || config.analogMarks === "both";
  const showTicks = config.analogMarks === "ticks" || config.analogMarks === "both";

  if (showTicks) {
    for (let i = 0; i < 60; i += 1) {
      const isHour = i % 5 === 0;
      const tick = svgEl("rect", {
        x: isHour ? 49.4 : 49.75,
        y: 4,
        width: isHour ? 1.2 : 0.5,
        height: isHour ? 4.5 : 2.5,
        fill: inkColor
      });
      tick.setAttribute("transform", `rotate(${i * 6} 50 50)`);
      root.append(tick);
    }
  }

  if (showNumbers) {
    for (let i = 1; i <= 12; i += 1) {
      const angle = (i * 30 * Math.PI) / 180;
      const radius = 38;
      const text = svgEl("text", {
        x: (50 + radius * Math.sin(angle)).toFixed(2),
        y: (50 - radius * Math.cos(angle)).toFixed(2),
        fill: inkColor,
        "text-anchor": "middle",
        "dominant-baseline": "central"
      });
      text.setAttribute("font-size", "9");
      text.setAttribute("font-weight", "700");
      text.style.fontFamily = `${config.fontFamily}, sans-serif`;
      text.textContent = String(i);
      root.append(text);
    }
  }
}

function svgEl(tag, attrs) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) {
    element.setAttribute(name, String(value));
  }
  return element;
}

export function applyClockStyles(element, config) {
  const normalized = normalizeConfig(config);
  element.className = `clock-widget template-${normalized.template}`;
  element.dataset.labelPosition = normalized.labelPosition;
  element.style.setProperty("--clock-font", cssStringLiteral(normalized.fontFamily));
  element.style.setProperty("--clock-text", normalized.textColor);
  element.style.setProperty("--clock-bg", hexToRgba(normalized.backgroundColor, normalized.backgroundOpacity));
  element.style.setProperty("--clock-border", hexToRgba(normalized.borderColor, normalized.borderOpacity));
  element.style.setProperty("--clock-border-width", `${normalized.borderWidth}px`);
  element.style.setProperty("--clock-radius", `${normalized.radius}px`);
  element.style.setProperty("--clock-padding-x", `${normalized.paddingX}px`);
  element.style.setProperty("--clock-padding-y", `${normalized.paddingY}px`);
  element.style.setProperty("--clock-font-size", `${normalized.fontSize}px`);
  element.style.setProperty("--clock-date-size", `${normalized.dateSize}px`);
  element.style.setProperty("--clock-label-size", `${normalized.labelSize}px`);
  element.style.setProperty("--clock-letter-spacing", `${normalized.letterSpacing}px`);
  element.style.setProperty("--clock-line-height", String(normalized.lineHeight));
  element.style.setProperty("--clock-font-weight", String(normalized.fontWeight));
  element.style.setProperty("--clock-gap", `${normalized.gap}px`);
  element.style.setProperty("--clock-stroke-color", normalized.strokeColor);
  element.style.setProperty("--clock-stroke-width", `${normalized.strokeWidth}px`);
  element.style.setProperty("--clock-shadow", shadowValue(normalized));
}

export function recommendedObsSize(element) {
  const rect = element.getBoundingClientRect();
  const shadowPad = CLOCK_VISUAL_SAFE_INSET * 2;
  return {
    width: Math.max(160, Math.ceil(rect.width + shadowPad)),
    height: Math.max(80, Math.ceil(rect.height + shadowPad))
  };
}

// 各数字を等幅スロット(span.clock-digit)で描画する。
// 数字グリフは可変でも1文字あたりの占有幅を固定し、配信中に時刻が変わっても
// 時計全体の横幅(=外枠)とコロンの位置が動かないようにする。
function setFixedWidthDigits(node, text) {
  node.textContent = "";
  for (const char of String(text)) {
    const span = document.createElement("span");
    span.className = char >= "0" && char <= "9" ? "clock-digit" : "clock-sep";
    span.textContent = char;
    node.append(span);
  }
}

function shadowValue(config) {
  if (config.shadowOpacity <= 0 || config.shadowBlur <= 0) {
    return "none";
  }
  return `${config.shadowX}px ${config.shadowY}px ${config.shadowBlur}px ${hexToRgba(
    config.shadowColor,
    config.shadowOpacity
  )}`;
}
