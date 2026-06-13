import {
  FONT_CANDIDATES,
  TEMPLATES,
  applyTemplate,
  cloneDefaultConfig,
  configToClockUrl,
  contrastRatio,
  normalizeConfig,
  parseImportInput
} from "./config.js";
import { loadInitialConfigFromSources } from "./builder-initial-config.js";
import { createLocalFontOption } from "./font-names.js";
import { applyClockStyles, mountClock, recommendedObsSize } from "./render.js";

const STORAGE_KEY = "obs-clock-builder:v1";
const THEME_STORAGE_KEY = "obs-clock-builder:theme";
const UI_THEMES = new Set(["white", "booth", "fanbox"]);
const LONG_URL_WARNING = 1800;
const TOO_LONG_URL_WARNING = 4000;
const colorPresets = ["#ffffff", "#101828", "#ff8fbd", "#42c6e8", "#f3dfc6", "#151722", "#bafff6", "#563047"];
const TEMPLATE_CATEGORIES = [
  { id: "all", label: "すべて" },
  { id: "standard", label: "定番" },
  { id: "cute", label: "かわいい" },
  { id: "cool", label: "クール" },
  { id: "analog", label: "アナログ" },
  { id: "flip", label: "パタパタ" }
];
let templateCategory = "all";

const elements = {
  uiTheme: byId("uiTheme"),
  templateCategoryTabs: byId("templateCategoryTabs"),
  adjustTabEasy: byId("adjustTabEasy"),
  adjustTabAdvanced: byId("adjustTabAdvanced"),
  easyControls: byId("easyControls"),
  advancedControls: byId("advancedControls"),
  templateGrid: byId("templateGrid"),
  timezone: byId("timezone"),
  localTimezone: byId("localTimezone"),
  useLocalTimezone: byId("useLocalTimezone"),
  hour12: byId("hour12"),
  showSeconds: byId("showSeconds"),
  showDate: byId("showDate"),
  showWeekday: byId("showWeekday"),
  dateFormat: byId("dateFormat"),
  weekdayFormat: byId("weekdayFormat"),
  labelText: byId("labelText"),
  labelPosition: byId("labelPosition"),
  fontPreset: byId("fontPreset"),
  fontFamily: byId("fontFamily"),
  localFontStatus: byId("localFontStatus"),
  loadLocalFonts: byId("loadLocalFonts"),
  localFontSelectWrap: byId("localFontSelectWrap"),
  localFontSelect: byId("localFontSelect"),
  textColor: byId("textColor"),
  backgroundColor: byId("backgroundColor"),
  backgroundOpacity: byId("backgroundOpacity"),
  fontSize: byId("fontSize"),
  dateSize: byId("dateSize"),
  labelSize: byId("labelSize"),
  fontWeight: byId("fontWeight"),
  letterSpacing: byId("letterSpacing"),
  lineHeight: byId("lineHeight"),
  paddingX: byId("paddingX"),
  paddingY: byId("paddingY"),
  radius: byId("radius"),
  borderColor: byId("borderColor"),
  borderWidth: byId("borderWidth"),
  borderOpacity: byId("borderOpacity"),
  shadowColor: byId("shadowColor"),
  shadowOpacity: byId("shadowOpacity"),
  shadowBlur: byId("shadowBlur"),
  shadowX: byId("shadowX"),
  shadowY: byId("shadowY"),
  strokeColor: byId("strokeColor"),
  strokeWidth: byId("strokeWidth"),
  contrastWarning: byId("contrastWarning"),
  importInput: byId("importInput"),
  importConfig: byId("importConfig"),
  resetConfig: byId("resetConfig"),
  importStatus: byId("importStatus"),
  builderStatus: byId("builderStatus"),
  previewShell: byId("previewShell"),
  previewCustomColor: byId("previewCustomColor"),
  clockPreview: byId("clockPreview"),
  recommendedWidth: byId("recommendedWidth"),
  recommendedHeight: byId("recommendedHeight"),
  compactUrl: byId("compactUrl"),
  generatedUrl: byId("generatedUrl"),
  copyUrl: byId("copyUrl"),
  openClock: byId("openClock"),
  urlStatus: byId("urlStatus"),
  urlWarning: byId("urlWarning"),
  clockTypeDigital: byId("clockTypeDigital"),
  clockTypeAnalog: byId("clockTypeAnalog"),
  clockTypeFlip: byId("clockTypeFlip"),
  analogSize: byId("analogSize"),
  analogMarks: byId("analogMarks"),
  analogSecondHand: byId("analogSecondHand"),
  flipGroup: byId("flipGroup")
};

const rangeFields = [
  "backgroundOpacity",
  "fontSize",
  "dateSize",
  "labelSize",
  "fontWeight",
  "letterSpacing",
  "lineHeight",
  "paddingX",
  "paddingY",
  "radius",
  "borderWidth",
  "borderOpacity",
  "shadowOpacity",
  "shadowBlur",
  "shadowX",
  "shadowY",
  "strokeWidth",
  "analogSize"
];
const colorFields = ["textColor", "backgroundColor", "borderColor", "shadowColor", "strokeColor"];
const booleanFields = ["hour12", "showSeconds", "showDate", "showWeekday"];
const selectFields = ["dateFormat", "weekdayFormat", "labelPosition", "analogMarks", "analogSecondHand", "flipGroup"];
let state = loadInitialConfig();
let localFontSelectBound = false;

const previewClock = mountClock(elements.clockPreview, state);

init();

function init() {
  initUiTheme();
  initAdjustTabs();
  renderTemplateCategoryTabs();
  renderTemplateButtons();
  renderFontOptions();
  renderSwatches();
  setupTimezoneCandidate();
  bindForm();
  bindPreviewBackground();
  bindClockType();
  syncFormFromState();
  updateEverything();
  window.addEventListener("resize", () => window.requestAnimationFrame(fitTemplateMiniPreviews));
}

function bindClockType() {
  elements.clockTypeDigital.addEventListener("click", () => updateState({ clockType: "digital" }, true));
  elements.clockTypeAnalog.addEventListener("click", () => updateState({ clockType: "analog" }, true));
  elements.clockTypeFlip.addEventListener("click", () => updateState({ clockType: "flip" }, true));
}

// 時計種別に応じてコントロールを出し分ける。
// data-clock-mode は「表示する種別(スペース区切り)」を表し、含まれない種別では隠す。
function updateClockTypeVisibility() {
  const type = state.clockType;
  elements.clockTypeDigital.setAttribute("aria-pressed", String(type === "digital"));
  elements.clockTypeAnalog.setAttribute("aria-pressed", String(type === "analog"));
  elements.clockTypeFlip.setAttribute("aria-pressed", String(type === "flip"));
  document.querySelectorAll("[data-clock-mode]").forEach((node) => {
    const modes = node.getAttribute("data-clock-mode").split(/\s+/).filter(Boolean);
    node.classList.toggle("is-hidden", !modes.includes(type));
  });
}

function readSavedUiTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return UI_THEMES.has(saved) ? saved : "white";
  } catch {
    return "white";
  }
}

function applyUiTheme(theme) {
  const safeTheme = UI_THEMES.has(theme) ? theme : "white";
  if (safeTheme === "white") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = safeTheme;
  }
  return safeTheme;
}

function initUiTheme() {
  const theme = applyUiTheme(readSavedUiTheme());
  elements.uiTheme.value = theme;
  elements.uiTheme.addEventListener("change", () => {
    const applied = applyUiTheme(elements.uiTheme.value);
    elements.uiTheme.value = applied;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, applied);
    } catch {
      // 保存できない環境でも、この画面内の切り替えはそのまま使える。
    }
  });
}

function initAdjustTabs() {
  const setMode = (advanced) => {
    elements.easyControls.hidden = advanced;
    elements.advancedControls.hidden = !advanced;
    elements.adjustTabEasy.setAttribute("aria-pressed", String(!advanced));
    elements.adjustTabAdvanced.setAttribute("aria-pressed", String(advanced));
    elements.adjustTabEasy.setAttribute("aria-expanded", String(!advanced));
    elements.adjustTabAdvanced.setAttribute("aria-expanded", String(advanced));
  };
  elements.adjustTabEasy.addEventListener("click", () => setMode(false));
  elements.adjustTabAdvanced.addEventListener("click", () => setMode(true));
  setMode(false);
}

function loadInitialConfig() {
  return loadInitialConfigFromSources({
    href: window.location.href,
    search: window.location.search,
    getSavedConfig: () => window.localStorage.getItem(STORAGE_KEY)
  });
}

function renderTemplateCategoryTabs() {
  elements.templateCategoryTabs.textContent = "";
  for (const category of TEMPLATE_CATEGORIES) {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "category-tab";
    tab.textContent = category.label;
    tab.setAttribute("aria-pressed", String(category.id === templateCategory));
    tab.addEventListener("click", () => {
      templateCategory = category.id;
      renderTemplateCategoryTabs();
      renderTemplateButtons();
      updateTemplatePressed();
    });
    elements.templateCategoryTabs.append(tab);
  }
}

function buildTemplateMiniPreview(template) {
  const mini = document.createElement("span");
  mini.className = "template-mini";
  // 常時更新される装飾プレビューはラベルが無く、スクリーンリーダーには雑音なので隠す。
  mini.setAttribute("aria-hidden", "true");
  const applied = applyTemplate(cloneDefaultConfig(), template.id);

  if (applied.clockType === "analog") {
    const holder = document.createElement("span");
    holder.className = "template-mini-analog";
    // "tick" にして rAF ループを立てず、固定ポーズの静止アナログだけ描く。
    // 表示サイズは CSS(.template-mini-analog svg)で固定し、analogSize のクランプに左右されないようにする。
    mountClock(holder, { ...applied, analogSecondHand: "tick" }, { now: () => new Date(2026, 0, 1, 10, 8, 36) });
    mini.append(holder);
    return mini;
  }

  if (applied.clockType === "flip") {
    const holder = document.createElement("span");
    holder.className = "template-mini-flip";
    // 小さい表示なので角丸も小さくして、丸くなりすぎないようにする。
    mountClock(
      holder,
      { ...applied, fontSize: 22, showSeconds: false, radius: 4 },
      { now: () => new Date(2026, 0, 1, 12, 34, 0) }
    );
    mini.append(holder);
    return mini;
  }

  const widget = document.createElement("span");
  applyClockStyles(widget, applied);
  widget.classList.add("template-mini-clock");

  const timeText = document.createElement("span");
  timeText.className = "clock-time";
  timeText.textContent = template.sampleText;
  widget.append(timeText);
  mini.append(widget);
  return mini;
}

function renderTemplateButtons() {
  elements.templateGrid.textContent = "";
  for (const template of TEMPLATES) {
    if (templateCategory !== "all" && template.category !== templateCategory) {
      continue;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "template-button";
    button.dataset.template = template.id;
    button.setAttribute("aria-pressed", "false");

    const name = document.createElement("span");
    name.className = "template-name";
    name.textContent = template.name;

    const note = document.createElement("span");
    note.className = "template-note";
    note.textContent = template.note;

    button.append(buildTemplateMiniPreview(template), name, note);
    button.addEventListener("click", () => {
      state = applyTemplate(state, template.id);
      syncFormFromState();
      updateEverything("テンプレートを適用しました。");
    });
    elements.templateGrid.append(button);
  }
  window.requestAnimationFrame(fitTemplateMiniPreviews);
}

function fitTemplateMiniPreviews() {
  document.querySelectorAll(".template-mini").forEach((mini) => {
    const widget = mini.querySelector(".template-mini-clock");
    if (!widget) {
      return;
    }
    const innerWidth = widget.offsetWidth;
    const available = mini.clientWidth - 12;
    if (innerWidth > 0 && available > 0) {
      const scale = Math.min(0.42, available / innerWidth);
      widget.style.transform = `scale(${scale.toFixed(3)})`;
    }
  });
}

function renderFontOptions() {
  elements.fontPreset.textContent = "";
  const customOption = document.createElement("option");
  customOption.value = "";
  customOption.textContent = "手入力またはPC内フォント";
  elements.fontPreset.append(customOption);
  for (const font of FONT_CANDIDATES) {
    const option = document.createElement("option");
    option.value = font;
    option.textContent = font;
    elements.fontPreset.append(option);
  }
}

function renderSwatches() {
  document.querySelectorAll(".swatches").forEach((swatches) => {
    swatches.textContent = "";
    const target = swatches.dataset.colorTarget;
    for (const color of colorPresets) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "swatch";
      button.style.background = color;
      button.setAttribute("aria-label", `${target} を ${color} にする`);
      button.addEventListener("click", () => {
        state[target] = color;
        syncFormFromState();
        updateEverything();
      });
      swatches.append(button);
    }
  });
}

function setupTimezoneCandidate() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone) {
    elements.localTimezone.textContent = timezone;
    elements.useLocalTimezone.disabled = false;
  } else {
    elements.localTimezone.textContent = "取得できませんでした。手入力してください。";
    elements.useLocalTimezone.disabled = true;
  }
}

function bindForm() {
  elements.timezone.addEventListener("input", () => updateState({ timezone: elements.timezone.value }));
  elements.labelText.addEventListener("input", () => updateState({ label: elements.labelText.value }));
  elements.fontFamily.addEventListener("input", () => {
    elements.fontPreset.value = FONT_CANDIDATES.includes(elements.fontFamily.value) ? elements.fontFamily.value : "";
    updateState({ fontFamily: elements.fontFamily.value });
  });
  elements.fontPreset.addEventListener("change", () => {
    if (elements.fontPreset.value) {
      updateState({ fontFamily: elements.fontPreset.value }, true);
    }
  });
  for (const field of booleanFields) {
    elements[field].addEventListener("change", () => updateState({ [field]: elements[field].checked }));
  }
  for (const field of selectFields) {
    elements[field].addEventListener("change", () => updateState({ [field]: elements[field].value }));
  }
  for (const field of colorFields) {
    elements[field].addEventListener("input", () => updateState({ [field]: elements[field].value }));
  }
  for (const field of rangeFields) {
    elements[field].addEventListener("input", () => updateState({ [field]: Number(elements[field].value) }));
  }

  elements.useLocalTimezone.addEventListener("click", () => {
    updateState({ timezone: elements.localTimezone.textContent }, true);
  });
  elements.loadLocalFonts.addEventListener("click", loadLocalFonts);
  elements.importConfig.addEventListener("click", importConfig);
  elements.resetConfig.addEventListener("click", () => {
    state = cloneDefaultConfig();
    syncFormFromState();
    updateEverything("初期設定へ戻しました。");
  });
  elements.compactUrl.addEventListener("change", () => updateEverything());
  elements.copyUrl.addEventListener("click", () => copyText(elements.generatedUrl.value, elements.urlStatus, "URLをコピーしました。"));
  elements.openClock.addEventListener("click", () => {
    window.open(elements.generatedUrl.value, "_blank", "noopener");
  });
}

function bindPreviewBackground() {
  document.querySelectorAll('input[name="previewBg"]').forEach((radio) => {
    radio.addEventListener("change", updatePreviewBackground);
  });
  elements.previewCustomColor.addEventListener("input", updatePreviewBackground);
}

function updateState(partial, sync = false) {
  state = normalizeConfig({ ...state, ...partial });
  if (sync) {
    syncFormFromState();
  } else {
    syncOutputValues();
  }
  updateEverything();
}

function syncFormFromState() {
  elements.timezone.value = state.timezone;
  elements.hour12.checked = state.hour12;
  elements.showSeconds.checked = state.showSeconds;
  elements.showDate.checked = state.showDate;
  elements.showWeekday.checked = state.showWeekday;
  elements.dateFormat.value = state.dateFormat;
  elements.weekdayFormat.value = state.weekdayFormat;
  elements.labelText.value = state.label;
  elements.labelPosition.value = state.labelPosition;
  elements.analogMarks.value = state.analogMarks;
  elements.analogSecondHand.value = state.analogSecondHand;
  elements.flipGroup.value = state.flipGroup;
  elements.fontFamily.value = state.fontFamily;
  elements.fontPreset.value = FONT_CANDIDATES.includes(state.fontFamily) ? state.fontFamily : "";
  for (const field of colorFields) {
    elements[field].value = state[field];
  }
  for (const field of rangeFields) {
    elements[field].value = String(state[field]);
  }
  syncOutputValues();
  updateTemplatePressed();
}

function syncOutputValues() {
  for (const field of rangeFields) {
    const output = byId(`${field}Value`);
    if (!output) {
      continue;
    }
    const value = Number(elements[field].value);
    if (["backgroundOpacity", "borderOpacity", "shadowOpacity", "lineHeight"].includes(field)) {
      output.textContent = value.toFixed(2);
    } else if (field === "letterSpacing" || field === "strokeWidth") {
      output.textContent = `${value.toFixed(1)}px`;
    } else if (field === "fontWeight") {
      output.textContent = String(value);
    } else {
      output.textContent = `${value}px`;
    }
  }
}

function updateEverything(status = "") {
  state = normalizeConfig(state);
  previewClock.updateConfig(state);
  persistState();
  updatePreviewBackground();
  updateGeneratedUrl();
  updateContrastWarning();
  updateTemplatePressed();
  updateClockTypeVisibility();
  if (status) {
    // 汎用ステータスは常時表示の builderStatus へ。importStatus は「こだわり」内に
    // あり「かんたん」タブでは非表示になるため、確認文が見えなくなるのを防ぐ。
    elements.builderStatus.textContent = status;
  }
  window.requestAnimationFrame(updateRecommendedSize);
}

function updateTemplatePressed() {
  document.querySelectorAll(".template-button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.template === state.template));
  });
}

function updateGeneratedUrl() {
  const baseUrl = new URL("./clock/", window.location.href).href;
  const url = configToClockUrl(state, baseUrl, { compact: elements.compactUrl.checked });
  elements.generatedUrl.value = url;
  elements.urlStatus.textContent = `${url.length}文字`;
  elements.urlWarning.hidden = true;
  elements.urlWarning.textContent = "";
  if (url.length > TOO_LONG_URL_WARNING) {
    elements.urlWarning.hidden = false;
    elements.urlWarning.textContent =
      "URLがかなり長いです。デフォルト値を省略し、ラベルやフォント名を短くするとOBSやチャットで扱いやすくなります。";
  } else if (url.length > LONG_URL_WARNING) {
    elements.urlWarning.hidden = false;
    elements.urlWarning.textContent = "URLが長めです。必要なら「デフォルト値を省略して短くする」を使ってください。";
  }
}

function updateRecommendedSize() {
  const size = recommendedObsSize(previewClock.element);
  elements.recommendedWidth.textContent = `${size.width}px`;
  elements.recommendedHeight.textContent = `${size.height}px`;
}

function updatePreviewBackground() {
  const selected = document.querySelector('input[name="previewBg"]:checked')?.value ?? "checker";
  elements.previewShell.classList.remove("preview-checker", "preview-light", "preview-dark", "preview-custom");
  elements.previewShell.classList.add(`preview-${selected}`);
  elements.previewShell.style.setProperty("--preview-custom", elements.previewCustomColor.value);
}

function updateContrastWarning() {
  const ratio = contrastRatio(state.textColor, state.backgroundColor);
  const warnings = [];
  if (state.backgroundOpacity >= 0.45 && ratio < 4.5) {
    warnings.push(`文字色と背景色のコントラストが低めです（${ratio.toFixed(1)}:1）。`);
  }
  if (state.backgroundOpacity < 0.25 && state.strokeWidth < 0.8 && state.shadowOpacity < 0.35) {
    warnings.push("透明背景で縁取りと影が弱いため、ゲーム画面上で読みにくい可能性があります。");
  }
  elements.contrastWarning.hidden = warnings.length === 0;
  elements.contrastWarning.textContent = warnings.join(" ");
}

async function loadLocalFonts() {
  if (!("queryLocalFonts" in window)) {
    elements.localFontStatus.textContent =
      "このブラウザではPC内フォント一覧を読み込めません。手入力フォント名に、OBS側PCで使えるフォント名を入れてください。";
    return;
  }
  elements.localFontStatus.textContent = "PC内フォント名を確認中...";
  try {
    const fonts = await window.queryLocalFonts();
    const options = localFontOptions(fonts);
    if (options.length === 0) {
      elements.localFontSelectWrap.classList.add("is-hidden");
      elements.localFontStatus.textContent =
        "読み込めるフォント名が見つかりませんでした。許可後でも一覧が空になる場合があります。手入力フォント名に、OBS側PCで使えるフォント名を入れてください。";
      return;
    }
    elements.localFontSelect.textContent = "";
    for (const fontOption of options) {
      const option = document.createElement("option");
      option.value = fontOption.value;
      option.textContent = fontOption.label;
      option.dataset.displayName = fontOption.displayName;
      option.dataset.searchText = fontOption.searchText;
      option.title = fontOption.searchText;
      elements.localFontSelect.append(option);
    }
    elements.localFontSelectWrap.classList.remove("is-hidden");
    elements.localFontStatus.textContent = `${options.length}件のフォント名を読み込みました。表示名ではなく、OBSで参照する実フォント名をURLに保存します。`;
    bindLocalFontSelect();
  } catch {
    elements.localFontStatus.textContent =
      "フォント一覧の取得が拒否されました。手入力フォント名に、OBS側PCで使えるフォント名を入れてください。";
  }
}

function localFontOptions(fonts) {
  const byValue = new Map();
  for (const font of fonts) {
    const fontOption = createLocalFontOption(font);
    if (!fontOption.value || byValue.has(fontOption.value)) {
      continue;
    }
    byValue.set(fontOption.value, fontOption);
  }
  return [...byValue.values()].sort((a, b) => a.label.localeCompare(b.label, "ja"));
}

function bindLocalFontSelect() {
  if (localFontSelectBound) {
    return;
  }
  elements.localFontSelect.addEventListener("change", () => updateState({ fontFamily: elements.localFontSelect.value }, true));
  localFontSelectBound = true;
}

function importConfig() {
  try {
    state = parseImportInput(elements.importInput.value);
    syncFormFromState();
    updateEverything("設定を読み込みました。");
  } catch (error) {
    elements.importStatus.textContent = error instanceof Error ? error.message : "設定を読み込めませんでした。";
  }
}

async function copyText(text, statusElement, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    statusElement.textContent = successMessage;
  } catch {
    const copied = copyTextWithSelectionFallback(text);
    statusElement.textContent = copied ? successMessage : "コピーできませんでした。手動で選択してコピーしてください。";
  }
}

function copyTextWithSelectionFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "0";
  textarea.style.top = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.append(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
    window.getSelection()?.removeAllRanges();
  }
}

function persistState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // URL remains the source of truth; localStorage is only a convenience.
  }
}

function byId(id) {
  return document.getElementById(id);
}
