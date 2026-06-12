import {
  FONT_CANDIDATES,
  TEMPLATES,
  applyTemplate,
  cloneDefaultConfig,
  configToClockUrl,
  contrastRatio,
  hexToRgba,
  normalizeConfig,
  parseImportInput
} from "./config.js";
import { loadInitialConfigFromSources } from "./builder-initial-config.js";
import { createLocalFontOption } from "./font-names.js";
import {
  DEFAULT_KEYWORD_REACTION_CONFIG,
  buildManualKeywordReactionConfig,
  keywordReactionConfigToUrl,
  keywordReactionMatches,
  normalizeKeywordReactionManualText
} from "./keyword-reaction-config.js";
import {
  buildFixturePlaybackSchedule,
  getBuiltinKeywordReactionFixture,
  validateKeywordReactionFixture
} from "./keyword-reaction-fixture.js";
import {
  dispatchKeywordReactionInternalEvent,
  subscribeKeywordReactionInternalEvents
} from "./keyword-reaction-internal-dispatch.js";
import { applyClockStyles, mountClock, recommendedObsSize } from "./render.js";
import { createFormatters, formatClock } from "./time.js";

const STORAGE_KEY = "obs-clock-builder:v1";
const THEME_STORAGE_KEY = "obs-clock-builder:theme";
const UI_THEMES = new Set(["white", "booth", "fanbox"]);
const LONG_URL_WARNING = 1800;
const TOO_LONG_URL_WARNING = 4000;
const KEYWORD_REACTION_FALLBACK_STATUS =
  "キーワードは安全な既定値に戻しました。生成URLには入力テキストは含まれません。";
const colorPresets = ["#ffffff", "#101828", "#ff8fbd", "#42c6e8", "#f3dfc6", "#151722", "#bafff6", "#563047"];
const TEMPLATE_CATEGORIES = [
  { id: "all", label: "すべて" },
  { id: "cute", label: "かわいい" },
  { id: "game", label: "ゲーム" },
  { id: "chic", label: "シック" },
  { id: "japanese", label: "和風" }
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
  cfTimezone: byId("cfTimezone"),
  fetchCfDefaults: byId("fetchCfDefaults"),
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
  shareText: byId("shareText"),
  copyShareText: byId("copyShareText"),
  generateShareImage: byId("generateShareImage"),
  shareImage: byId("shareImage"),
  xIntent: byId("xIntent"),
  shareImagePreview: byId("shareImagePreview"),
  downloadShareImage: byId("downloadShareImage"),
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
  keywordReactionManualText: byId("keywordReactionManualText"),
  keywordReactionKeyword: byId("keywordReactionKeyword"),
  keywordReactionMatchMode: byId("keywordReactionMatchMode"),
  keywordReactionIntensity: byId("keywordReactionIntensity"),
  keywordReactionStyle: byId("keywordReactionStyle"),
  testKeywordReaction: byId("testKeywordReaction"),
  clearKeywordReactionToast: byId("clearKeywordReactionToast"),
  keywordReactionStatus: byId("keywordReactionStatus"),
  playKeywordReactionFixture: byId("playKeywordReactionFixture"),
  stopKeywordReactionFixture: byId("stopKeywordReactionFixture"),
  resetKeywordReactionFixture: byId("resetKeywordReactionFixture"),
  keywordReactionFixtureStatus: byId("keywordReactionFixtureStatus"),
  keywordReactionGeneratedUrl: byId("keywordReactionGeneratedUrl"),
  keywordReactionUrlStatus: byId("keywordReactionUrlStatus"),
  copyKeywordReactionUrl: byId("copyKeywordReactionUrl"),
  keywordReactionToast: byId("keywordReactionToast"),
  keywordReactionToastText: byId("keywordReactionToastText")
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
  "strokeWidth"
];
const colorFields = ["textColor", "backgroundColor", "borderColor", "shadowColor", "strokeColor"];
const booleanFields = ["hour12", "showSeconds", "showDate", "showWeekday"];
const selectFields = ["dateFormat", "weekdayFormat", "labelPosition"];
let state = loadInitialConfig();
let shareBlob = null;
let shareObjectUrl = "";
let localFontSelectBound = false;
let keywordReactionFixtureTimers = [];

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
  bindKeywordReactionExperiment();
  bindPreviewBackground();
  syncFormFromState();
  updateEverything();
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

  const widget = document.createElement("span");
  applyClockStyles(widget, applyTemplate(cloneDefaultConfig(), template.id));
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
  elements.fetchCfDefaults.addEventListener("click", fetchCloudflareDefaults);
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
  elements.copyShareText.addEventListener("click", () =>
    copyText(elements.shareText.value, elements.urlStatus, "投稿文をコピーしました。")
  );
  elements.generateShareImage.addEventListener("click", generateShareImage);
  elements.shareImage.addEventListener("click", shareGeneratedImage);
}

function bindKeywordReactionExperiment() {
  const configInputs = [
    elements.keywordReactionKeyword,
    elements.keywordReactionMatchMode,
    elements.keywordReactionIntensity,
    elements.keywordReactionStyle
  ];
  for (const input of configInputs) {
    input.addEventListener("input", () => {
      stopKeywordReactionFixturePlayback("設定を変更したためfixture再生を停止しました。");
      updateKeywordReactionExperiment();
    });
    input.addEventListener("change", () => {
      stopKeywordReactionFixturePlayback("設定を変更したためfixture再生を停止しました。");
      updateKeywordReactionExperiment();
    });
  }
  elements.keywordReactionManualText.addEventListener("input", () => {
    stopKeywordReactionFixturePlayback("人工テキスト入力へ戻りました。fixture event dataは生成URLへ入りません。");
    hideKeywordReactionToast();
    elements.keywordReactionStatus.textContent = "人工テキストは生成URLへ入りません。";
  });
  elements.testKeywordReaction.addEventListener("click", testKeywordReactionPreview);
  elements.clearKeywordReactionToast.addEventListener("click", () => {
    stopKeywordReactionFixturePlayback("fixture再生を停止しました。");
    hideKeywordReactionToast();
    elements.keywordReactionStatus.textContent = "toast previewを消しました。";
  });
  elements.playKeywordReactionFixture.addEventListener("click", playKeywordReactionFixture);
  elements.stopKeywordReactionFixture.addEventListener("click", () => {
    stopKeywordReactionFixturePlayback("fixture再生を停止しました。");
  });
  elements.resetKeywordReactionFixture.addEventListener("click", resetKeywordReactionFixturePlayback);
  elements.copyKeywordReactionUrl.addEventListener("click", () =>
    copyText(elements.keywordReactionGeneratedUrl.value, elements.keywordReactionStatus, "生成オーバーレイURLをコピーしました。")
  );
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
  updateShareText();
  updateGeneratedUrl();
  updateKeywordReactionExperiment();
  updateContrastWarning();
  updateTemplatePressed();
  if (status) {
    elements.importStatus.textContent = status;
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
  updateXIntent();
}

function readKeywordReactionConfig() {
  return buildManualKeywordReactionConfig({
    keyword: elements.keywordReactionKeyword.value,
    matchMode: elements.keywordReactionMatchMode.value,
    intensity: elements.keywordReactionIntensity.value,
    reactionStyle: elements.keywordReactionStyle.value
  });
}

function updateKeywordReactionExperiment() {
  const config = readKeywordReactionConfig();
  const url = keywordReactionConfigToUrl(config, window.location.href);
  elements.keywordReactionGeneratedUrl.value = url;
  elements.keywordReactionUrlStatus.textContent = `${url.length}文字 / 設定のみ`;
  applyKeywordReactionToastConfig(config);
  if (keywordReactionKeywordUsedSafeFallback(config)) {
    hideKeywordReactionToast();
    elements.keywordReactionStatus.textContent = KEYWORD_REACTION_FALLBACK_STATUS;
  }
}

function testKeywordReactionPreview() {
  stopKeywordReactionFixturePlayback("人工テキスト入力の確認へ切り替えました。");
  const config = readKeywordReactionConfig();
  const manualText = normalizeKeywordReactionManualText(elements.keywordReactionManualText.value);
  const keyword = config.keyword;
  const keywordUsedSafeFallback = keywordReactionKeywordUsedSafeFallback(config);
  applyKeywordReactionToastConfig(config);

  if (!manualText) {
    hideKeywordReactionToast();
    elements.keywordReactionStatus.textContent = "人工テキストを入力してください。";
    return;
  }
  const matched = keywordReactionMatches({ manualText, keyword, matchMode: config.matchMode });
  if (!matched) {
    hideKeywordReactionToast();
    elements.keywordReactionStatus.textContent = keywordUsedSafeFallback
      ? `${KEYWORD_REACTION_FALLBACK_STATUS} 一致しませんでした。人工テキストを変えて確認してください。`
      : "一致しませんでした。人工テキストかキーワードを変えて確認してください。";
    return;
  }

  const dispatchTarget = createKeywordReactionManualPreviewTarget();
  let previewEvent = null;
  const unsubscribe = subscribeKeywordReactionInternalEvents(dispatchTarget, (event) => {
    previewEvent = event;
  });
  const dispatchResult = dispatchKeywordReactionInternalEvent(dispatchTarget, {
    sourceType: "manual",
    eventId: "editor-manual-preview",
    displayText: manualText,
    keyword: config.keyword,
    displayPattern: config.displayPattern,
    reactionStyle: config.reactionStyle,
    intensity: config.intensity
  });
  unsubscribe();

  if (!dispatchResult.ok || !previewEvent) {
    hideKeywordReactionToast();
    elements.keywordReactionStatus.textContent =
      "toast previewを表示できませんでした。ブラウザを更新してもう一度試してください。";
    return;
  }

  showKeywordReactionManualPreviewEvent(previewEvent, keywordUsedSafeFallback);
}

function playKeywordReactionFixture() {
  stopKeywordReactionFixturePlayback();
  const result = validateKeywordReactionFixture(getBuiltinKeywordReactionFixture());
  if (!result.ok) {
    hideKeywordReactionToast();
    elements.keywordReactionFixtureStatus.textContent = result.errors[0] ?? "fixtureを再生できませんでした。";
    return;
  }

  const schedule = buildFixturePlaybackSchedule(result.fixture);
  if (schedule.length === 0) {
    hideKeywordReactionToast();
    elements.keywordReactionFixtureStatus.textContent = "再生できるfixture eventがありません。";
    return;
  }

  elements.keywordReactionFixtureStatus.textContent =
    "人工fixtureを再生中です。YouTube連携ではありません。fixture event dataは生成URLへ入りません。";

  for (const [index, item] of schedule.entries()) {
    const timerId = window.setTimeout(() => {
      showKeywordReactionFixtureEvent(item.event, index + 1, schedule.length);
    }, item.delayMs);
    keywordReactionFixtureTimers.push(timerId);
  }

  const lastDelay = schedule[schedule.length - 1]?.delayMs ?? 0;
  const finishTimerId = window.setTimeout(() => {
    keywordReactionFixtureTimers = [];
    elements.keywordReactionFixtureStatus.textContent =
      "人工fixtureの再生が完了しました。生成URLは設定だけのままです。";
  }, lastDelay + 1200);
  keywordReactionFixtureTimers.push(finishTimerId);
}

function showKeywordReactionFixtureEvent(event, index, total) {
  const dispatchTarget = createKeywordReactionFixturePreviewTarget();
  let previewEvent = null;
  const unsubscribe = subscribeKeywordReactionInternalEvents(dispatchTarget, (fixtureEvent) => {
    previewEvent = fixtureEvent;
  });
  const dispatchResult = dispatchKeywordReactionInternalEvent(dispatchTarget, {
    sourceType: "fixture",
    eventId: event.id,
    displayText: event.displayText,
    keyword: event.keyword,
    displayPattern: "toast",
    reactionStyle: event.reactionStyle,
    intensity: event.intensity,
    offsetMs: event.offsetMs
  });
  unsubscribe();

  if (!dispatchResult.ok || !previewEvent) {
    hideKeywordReactionToast();
    elements.keywordReactionFixtureStatus.textContent =
      "fixture previewを表示できませんでした。ブラウザを更新してもう一度試してください。";
    return;
  }

  showKeywordReactionFixturePreviewEvent(previewEvent, index, total);
}

function showKeywordReactionFixturePreviewEvent(event, index, total) {
  applyKeywordReactionToastConfig(event);
  elements.keywordReactionToastText.textContent = event.displayText;
  elements.keywordReactionToast.hidden = false;
  elements.keywordReactionFixtureStatus.textContent = `人工fixture ${index}/${total}: preview内にtoastを表示しています。`;
}

function showKeywordReactionManualPreviewEvent(event, keywordUsedSafeFallback) {
  applyKeywordReactionToastConfig(event);
  elements.keywordReactionToastText.textContent = event.displayText;
  elements.keywordReactionToast.hidden = false;
  elements.keywordReactionStatus.textContent = keywordUsedSafeFallback
    ? `${KEYWORD_REACTION_FALLBACK_STATUS} ライブプレビュー内にtoastを表示しています。`
    : "一致しました。ライブプレビュー内にtoastを表示しています。";
}

function stopKeywordReactionFixturePlayback(statusMessage = "") {
  if (keywordReactionFixtureTimers.length > 0) {
    for (const timerId of keywordReactionFixtureTimers) {
      window.clearTimeout(timerId);
    }
    keywordReactionFixtureTimers = [];
  }
  if (statusMessage) {
    elements.keywordReactionFixtureStatus.textContent = statusMessage;
  }
}

function resetKeywordReactionFixturePlayback() {
  stopKeywordReactionFixturePlayback("人工fixtureをリセットしました。人工デモデータは生成URLへ入りません。");
  hideKeywordReactionToast();
}

function applyKeywordReactionToastConfig(config) {
  elements.keywordReactionToast.dataset.style = config.reactionStyle;
  elements.keywordReactionToast.dataset.intensity = String(config.intensity);
}

function keywordReactionKeywordUsedSafeFallback(config) {
  const rawKeyword = elements.keywordReactionKeyword.value.trim();
  return config.keyword === DEFAULT_KEYWORD_REACTION_CONFIG.keyword && rawKeyword !== DEFAULT_KEYWORD_REACTION_CONFIG.keyword;
}

function createKeywordReactionManualPreviewTarget() {
  const EventTargetConstructor = globalThis.EventTarget;
  return typeof EventTargetConstructor === "function" ? new EventTargetConstructor() : null;
}

function createKeywordReactionFixturePreviewTarget() {
  const EventTargetConstructor = globalThis.EventTarget;
  return typeof EventTargetConstructor === "function" ? new EventTargetConstructor() : null;
}

function hideKeywordReactionToast() {
  elements.keywordReactionToast.hidden = true;
  elements.keywordReactionToastText.textContent = "";
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

function updateShareText() {
  const text = `OBS用の時計オーバーレイを作ったよ！ テンプレート: ${templateName(state.template)} #OBS #配信素材`;
  elements.shareText.value = text;
}

function updateXIntent() {
  const params = new URLSearchParams({
    text: elements.shareText.value,
    url: new URL("./", window.location.href).href,
    hashtags: "OBS,配信素材"
  });
  elements.xIntent.href = `https://x.com/intent/tweet?${params.toString()}`;
}

async function fetchCloudflareDefaults() {
  elements.cfTimezone.textContent = "確認中...";
  try {
    const response = await fetch("./api/defaults", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const timezone = data.timezone || "未確認";
    const country = data.country || "未確認";
    elements.cfTimezone.textContent = `timezone: ${timezone} / country: ${country}`;
    if (data.timezone) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "この候補を採用";
      button.addEventListener("click", () => updateState({ timezone: data.timezone }, true));
      elements.cfTimezone.append(" ", button);
    }
  } catch {
    elements.cfTimezone.textContent = "取得できませんでした。Cloudflare外や静的配信だけでも問題なく使えます。";
  }
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

async function generateShareImage() {
  try {
    shareBlob = await createShareImageBlob();
  } catch {
    shareBlob = null;
    elements.urlStatus.textContent = "PNG画像を生成できませんでした。ブラウザを更新してもう一度試してください。";
    return;
  }
  if (shareObjectUrl) {
    URL.revokeObjectURL(shareObjectUrl);
  }
  shareObjectUrl = URL.createObjectURL(shareBlob);
  elements.shareImagePreview.src = shareObjectUrl;
  elements.shareImagePreview.hidden = false;
  elements.downloadShareImage.href = shareObjectUrl;
  elements.downloadShareImage.hidden = false;
  elements.urlStatus.textContent = "SNS向けPNG画像を生成しました。";
}

async function shareGeneratedImage() {
  if (!shareBlob) {
    await generateShareImage();
    if (!shareBlob) {
      return;
    }
  }
  const file = new File([shareBlob], "obs-clock-preview.png", { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "OBS Clock Overlay Builder",
      text: elements.shareText.value,
      url: new URL("./", window.location.href).href
    });
    return;
  }
  elements.urlStatus.textContent = "この環境では画像共有に非対応です。PNG保存、投稿文コピー、X投稿画面を使ってください。";
}

function createShareImageBlob() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  const formatters = createFormatters(state);
  const formatted = formatClock(formatters, new Date());

  context.fillStyle = "#fff7ef";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#dff8ff";
  context.fillRect(0, 0, canvas.width, 210);
  context.fillStyle = "#ffe4ef";
  context.fillRect(0, 420, canvas.width, 210);

  drawRoundedRect(context, 120, 140, 960, 300, 34);
  context.fillStyle = hexToRgba(state.backgroundColor, Math.max(state.backgroundOpacity, 0.78));
  context.fill();
  context.lineWidth = Math.max(2, state.borderWidth);
  context.strokeStyle = hexToRgba(state.borderColor, Math.max(state.borderOpacity, 0.5));
  context.stroke();

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = hexToRgba(state.shadowColor, state.shadowOpacity);
  context.shadowBlur = state.shadowBlur;
  context.shadowOffsetX = state.shadowX;
  context.shadowOffsetY = state.shadowY;
  context.fillStyle = state.textColor;
  context.font = `${state.fontWeight} 86px ${canvasFontFamily(state.fontFamily)}`;
  context.fillText(formatted.time, 600, 280);
  context.font = `700 30px ${canvasFontFamily(state.fontFamily)}`;
  const subline = [state.labelPosition === "hidden" ? "" : state.label, formatted.date, formatted.weekday]
    .filter(Boolean)
    .join("  ");
  context.fillText(subline || templateName(state.template), 600, 355);

  context.shadowColor = "transparent";
  context.fillStyle = "#23232a";
  context.font = "800 34px system-ui, sans-serif";
  context.fillText("OBS Clock Overlay Builder", 600, 505);
  context.font = "500 23px system-ui, sans-serif";
  context.fillStyle = "#665f68";
  context.fillText(new URL("./", window.location.href).href, 600, 552);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas PNG generation failed."));
      }
    }, "image/png", 0.92);
  });
}

function persistState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // URL remains the source of truth; localStorage is only a convenience.
  }
}

function drawRoundedRect(context, x, y, width, height, radius) {
  if (typeof context.roundRect === "function") {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    return;
  }
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function canvasFontFamily(fontFamily) {
  const clean = String(fontFamily)
    .replace(/["'\\;\n\r]/g, " ")
    .trim()
    .slice(0, 80);
  return `"${clean || "system-ui"}", system-ui, sans-serif`;
}

function templateName(templateId) {
  return TEMPLATES.find((template) => template.id === templateId)?.name ?? "Custom";
}

function byId(id) {
  return document.getElementById(id);
}
