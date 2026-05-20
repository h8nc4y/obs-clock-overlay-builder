const FONT_DISPLAY_ALIASES = [
  {
    displayName: "ラノベPOP v2",
    matches: ["LightNovelPopV2 V2", "LightNovelPopV2", "Light Novel Pop V2"]
  },
  {
    displayName: "メイリオ",
    matches: ["Meiryo"]
  },
  {
    displayName: "メイリオ UI",
    matches: ["Meiryo UI"]
  },
  {
    displayName: "游ゴシック",
    matches: ["Yu Gothic", "YuGothic"]
  },
  {
    displayName: "游ゴシック UI",
    matches: ["Yu Gothic UI", "YuGothic UI"]
  },
  {
    displayName: "游明朝",
    matches: ["Yu Mincho", "YuMincho"]
  },
  {
    displayName: "BIZ UDPゴシック",
    matches: ["BIZ UDPGothic", "BIZ UDP Gothic"]
  },
  {
    displayName: "BIZ UDP明朝",
    matches: ["BIZ UDPMincho", "BIZ UDP Mincho"]
  }
];

export function createLocalFontOption(font) {
  const value = localFontCssValue(font);
  const rawNames = localFontRawNames(font);
  const displayName = localFontDisplayName(font) || value;
  const label = displayName && value && displayName !== value ? `${displayName}（${value}）` : displayName || value;
  const searchText = [...new Set([displayName, label, value, ...rawNames])]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ja");

  return {
    value,
    label,
    displayName,
    searchText
  };
}

export function localFontCssValue(font) {
  return cleanFontName(font?.family) || cleanFontName(font?.fullName) || cleanFontName(font?.postscriptName) || "";
}

export function localFontDisplayName(font) {
  const names = localFontRawNames(font);
  for (const alias of FONT_DISPLAY_ALIASES) {
    if (names.some((name) => alias.matches.some((match) => normalizeFontName(name) === normalizeFontName(match)))) {
      return alias.displayName;
    }
  }
  return "";
}

function localFontRawNames(font) {
  return [font?.family, font?.fullName, font?.postscriptName, font?.style].map(cleanFontName).filter(Boolean);
}

function cleanFontName(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeFontName(value) {
  return cleanFontName(value).toLocaleLowerCase("en-US").replace(/[\s_-]+/g, "");
}
