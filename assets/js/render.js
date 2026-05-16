import { cssStringLiteral, hexToRgba, normalizeConfig } from "./config.js";
import { createFormatters, formatClock } from "./time.js";

export function mountClock(container, config, options = {}) {
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
      timeNode.textContent = formatted.time;
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
  const shadowPad = 32;
  return {
    width: Math.max(160, Math.ceil(rect.width + shadowPad)),
    height: Math.max(80, Math.ceil(rect.height + shadowPad))
  };
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
