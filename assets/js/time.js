import { normalizeConfig, sanitizeTimezone } from "./config.js";

export function createFormatters(config) {
  const normalized = normalizeConfig(config);
  const timezone = sanitizeTimezone(normalized.timezone);
  const timeOptions = {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit"
  };

  if (normalized.showSeconds) {
    timeOptions.second = "2-digit";
  }

  if (normalized.hour12) {
    timeOptions.hour12 = true;
  } else {
    timeOptions.hourCycle = "h23";
  }

  return {
    config: { ...normalized, timezone },
    timeFormatter: new Intl.DateTimeFormat("en-US", timeOptions),
    dateFormatter: new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: normalized.dateFormat === "jp" ? "numeric" : "2-digit",
      day: normalized.dateFormat === "jp" ? "numeric" : "2-digit"
    }),
    weekdayFormatter: new Intl.DateTimeFormat(weekdayLocale(normalized.weekdayFormat), {
      timeZone: timezone,
      weekday: normalized.weekdayFormat.endsWith("long") ? "long" : "short"
    })
  };
}

export function formatClock(formatters, date = new Date()) {
  const { config } = formatters;
  const result = {
    time: formatTime(formatters, date),
    date: "",
    weekday: ""
  };
  if (config.showDate) {
    result.date = formatDate(formatters, date);
  }
  if (config.showWeekday) {
    result.weekday = formatters.weekdayFormatter.format(date);
  }
  return result;
}

export function formatTime(formatters, date = new Date()) {
  const parts = partsToObject(formatters.timeFormatter.formatToParts(date));
  const hour = normalizeHour(parts.hour);
  const minute = parts.minute ?? "00";
  const second = formatters.config.showSeconds ? `:${parts.second ?? "00"}` : "";
  const dayPeriod = formatters.config.hour12 && parts.dayPeriod ? ` ${parts.dayPeriod.toUpperCase()}` : "";
  return `${hour}:${minute}${second}${dayPeriod}`;
}

export function formatDate(formatters, date = new Date()) {
  const { config } = formatters;
  const parts = partsToObject(formatters.dateFormatter.formatToParts(date));
  const year = parts.year ?? "0000";
  const month = parts.month ?? "01";
  const day = parts.day ?? "01";

  switch (config.dateFormat) {
    case "dash":
      return `${year}-${month}-${day}`;
    case "monthDay":
      return `${month}/${day}`;
    case "jp":
      return `${year}年${Number(month)}月${Number(day)}日`;
    case "slash":
    default:
      return `${year}/${month}/${day}`;
  }
}

export function nextSecondDelay(now = new Date(), correctionMs = 16) {
  const ms = now.getMilliseconds();
  return Math.max(50, 1000 - ms + correctionMs);
}

function weekdayLocale(format) {
  return format.startsWith("ja") ? "ja-JP" : "en-US";
}

function partsToObject(parts) {
  const object = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      object[part.type] = part.value;
    }
  }
  return object;
}

export function normalizeHour(hour) {
  if (!hour) {
    return "00";
  }
  return hour === "24" ? "00" : hour.padStart(2, "0");
}
