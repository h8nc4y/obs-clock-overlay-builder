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
      month: normalized.dateZeroPad ? "2-digit" : "numeric",
      day: normalized.dateZeroPad ? "2-digit" : "numeric"
    }),
    weekdayFormatter: new Intl.DateTimeFormat(weekdayLocale(normalized.weekdayFormat), {
      timeZone: timezone,
      weekday: normalized.weekdayFormat.endsWith("long") ? "long" : "short"
    })
  };
}

export function formatClock(formatters, date = new Date()) {
  const { config } = formatters;
  const timeParts = formatTimeParts(formatters, date);
  const result = {
    time: timeParts.time,
    timeMain: timeParts.timeMain,
    secondsText: timeParts.secondsText,
    date: "",
    weekday: ""
  };
  if (config.showDate) {
    result.date = formatDate(formatters, date);
  }
  if (config.showWeekday) {
    result.weekday = formatWeekday(formatters, date);
  }
  return result;
}

export function formatTime(formatters, date = new Date()) {
  return formatTimeParts(formatters, date).time;
}

function formatTimeParts(formatters, date) {
  const parts = partsToObject(formatters.timeFormatter.formatToParts(date));
  const hour = normalizeHour(parts.hour);
  const minute = parts.minute ?? "00";
  const secondsText = formatters.config.showSeconds ? parts.second ?? "00" : "";
  const second = secondsText ? `:${secondsText}` : "";
  const meridiem = formatters.config.hour12 && parts.dayPeriod ? parts.dayPeriod.toUpperCase() : "";
  const main = `${hour}:${minute}`;
  const timeWithoutMeridiem = `${main}${second}`;
  const time = formatters.config.meridiemFirst
    ? [meridiem, timeWithoutMeridiem].filter(Boolean).join(" ")
    : [timeWithoutMeridiem, meridiem].filter(Boolean).join(" ");
  const timeMain = formatters.config.meridiemFirst
    ? [meridiem, main].filter(Boolean).join(" ")
    : [main, meridiem].filter(Boolean).join(" ");
  return {
    time,
    timeMain,
    secondsText
  };
}

export function formatDate(formatters, date = new Date()) {
  const { config } = formatters;
  const parts = partsToObject(formatters.dateFormatter.formatToParts(date));
  const year = String(parts.year ?? "0000").padStart(4, "0");
  const month = formatMonthDay(parts.month, config.dateZeroPad);
  const day = formatMonthDay(parts.day, config.dateZeroPad);

  switch (config.dateSeparator) {
    case "dash":
      return config.dateYear ? `${year}-${month}-${day}` : `${month}-${day}`;
    case "jp":
      return config.dateYear ? `${year}年${month}月${day}日` : `${month}月${day}日`;
    case "slash":
    default:
      return config.dateYear ? `${year}/${month}/${day}` : `${month}/${day}`;
  }
}

function formatWeekday(formatters, date) {
  const weekday = formatters.weekdayFormatter.format(date);
  if (!formatters.config.weekdayBrackets) {
    return weekday;
  }
  return formatters.config.weekdayFormat.startsWith("ja") ? `（${weekday}）` : `(${weekday})`;
}

function formatMonthDay(value, zeroPad) {
  if (zeroPad) {
    return String(value ?? "01").padStart(2, "0");
  }
  return String(Number(value ?? "1"));
}

// アナログ時計の針角度に使う、タイムゾーン補正済みの時・分・秒を取り出す。
// formatterを1つ作って使い回し、フレームごとのIntl生成コストを避ける。
export function createAnalogFormatter(timezone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: sanitizeTimezone(timezone),
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
}

export function analogParts(formatter, date = new Date()) {
  const result = { hours: 0, minutes: 0, seconds: 0, milliseconds: date.getMilliseconds() };
  for (const part of formatter.formatToParts(date)) {
    if (part.type === "hour") {
      result.hours = Number(part.value) % 24;
    } else if (part.type === "minute") {
      result.minutes = Number(part.value);
    } else if (part.type === "second") {
      result.seconds = Number(part.value);
    }
  }
  return result;
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
