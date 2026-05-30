import { cloneDefaultConfig, normalizeConfig, parseConfigFromQuery } from "./config.js";

const CONFIG_QUERY_KEYS = [
  "c",
  "v",
  "version",
  "theme",
  "template",
  "tz",
  "timezone",
  "hour12",
  "seconds",
  "showSeconds",
  "date",
  "showDate",
  "dateFormat",
  "weekday",
  "showWeekday",
  "weekdayFormat",
  "label",
  "labelPosition",
  "font",
  "fontFamily",
  "textColor",
  "bg",
  "backgroundColor",
  "backgroundOpacity",
  "radius",
  "paddingX",
  "paddingY",
  "fontSize",
  "dateSize",
  "labelSize",
  "letterSpacing",
  "lineHeight",
  "fontWeight",
  "gap",
  "shadowColor",
  "shadowOpacity",
  "shadowBlur",
  "shadowX",
  "shadowY",
  "strokeColor",
  "strokeWidth",
  "borderColor",
  "borderOpacity",
  "borderWidth"
];

export function loadInitialConfigFromSources({ href, search, getSavedConfig }) {
  if (hasEditorConfigQuery(search)) {
    return parseConfigFromQuery(href);
  }

  try {
    const saved = getSavedConfig?.();
    if (saved) {
      return normalizeConfig(JSON.parse(saved));
    }
  } catch {
    // localStorage may be blocked or stale; URL generation still works without it.
  }

  return cloneDefaultConfig();
}

export function hasEditorConfigQuery(search) {
  const text = String(search ?? "").trim();
  if (!text) {
    return false;
  }

  const params = new URLSearchParams(text.startsWith("?") ? text.slice(1) : text);
  return CONFIG_QUERY_KEYS.some((key) => params.has(key));
}
