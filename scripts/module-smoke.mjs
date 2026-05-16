import { DEFAULT_CONFIG, decodeConfig, encodeConfig, normalizeConfig } from "../assets/js/config.js";
import { createFormatters, formatClock } from "../assets/js/time.js";

const config = normalizeConfig({ ...DEFAULT_CONFIG, label: "配信中" });
const decoded = decodeConfig(encodeConfig(config));
const formatted = formatClock(createFormatters(decoded), new Date("2026-01-01T15:04:05Z"));

if (decoded.label !== "配信中" || !formatted.time) {
  throw new Error("Module smoke check failed.");
}

console.log("Module imports and shared logic smoke check passed.");
