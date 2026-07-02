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
  ROMAN_NUMERALS,
  computeAnalogAngles,
  mountClock,
  recommendedObsSize,
  tokenizeFlip
} from "./render.js";
import { clearShadow, drawDigitalTemplateDecorations, drawRoundedRectPath } from "./share-decorations.js";
import { analogParts, createAnalogFormatter, createFormatters, formatClock } from "./time.js";
import {
  buildShareLines,
  buildShareText,
  buildXIntentUrl,
  canvasFontStack,
  computeSideLabelLayout,
  computeStackedLayout,
  resolveShareText,
  templateDecoration
} from "./share.js";
import { drawShareTime, measureShareTime } from "./share-time.js";

const BUILDER_URL = "https://obs-clock-overlay-builder.h8nc4y.workers.dev";
const SHARE_IMAGE_WIDTH = 1200;
const SHARE_IMAGE_HEIGHT = 675;
const SHARE_IMAGE_AUTO_REGENERATE_DELAY_MS = 400;
const PERSIST_URL_DEBOUNCE_MS = 180;

const STORAGE_KEY = "obs-clock-builder:v1";
const THEME_STORAGE_KEY = "obs-clock-builder:theme";
const PIN_STORAGE_KEY = "obs-clock-builder:pin";
const UI_THEMES = new Set(["white", "booth", "fanbox"]);
const LONG_URL_WARNING = 1800;
const TOO_LONG_URL_WARNING = 4000;
const colorPresets = ["#ffffff", "#101828", "#ff8fbd", "#42c6e8", "#f3dfc6", "#151722", "#bafff6", "#563047"];
// 色見本ボタンの読み上げ用に、内部ID(英語)を日本語ラベルへ対応づける。ボタンは可視テキストを
// 持たないため、この aria-label が唯一のアクセシブル名になる。renderSwatches は init() から
// 早期に呼ばれるので、この定義は呼び出しより前(モジュール上部)に置く必要がある(TDZ回避)。
const SWATCH_TARGET_LABELS = {
  textColor: "文字色",
  backgroundColor: "背景色",
  borderColor: "枠線色",
  shadowColor: "影色",
  strokeColor: "縁取り色"
};
// label は系統名。analog/flip は雰囲気ではなく「時計の種類」なので、title で種類だと補足する
// (定番/かわいい/クールは雰囲気で選ぶグループ)。
const TEMPLATE_CATEGORIES = [
  { id: "all", label: "すべて" },
  { id: "standard", label: "定番" },
  { id: "cute", label: "かわいい" },
  { id: "cool", label: "クール" },
  { id: "analog", label: "アナログ", hint: "時計の種類: アナログ（針の時計）" },
  { id: "flip", label: "パタパタ", hint: "時計の種類: パタパタ（数字がめくれる時計）" }
];
// 初期表示は「定番」に絞り、最初の一覧を小さく見やすくする(既定テンプレ mono-compact も定番)。
// 「すべて」はユーザーがタブを押したときだけ全件を表示する。
let templateCategory = "standard";

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
  smallSeconds: byId("smallSeconds"),
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
  preview: document.querySelector(".preview-column"),
  pinPreview: byId("pinPreview"),
  pinLabel: document.querySelector("#pinPreview .pin-toggle-label"),
  previewShell: byId("previewShell"),
  previewCustomColor: byId("previewCustomColor"),
  clockPreview: byId("clockPreview"),
  previewStageDock: document.querySelector(".preview-stage-dock"),
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
  flipGroup: byId("flipGroup"),
  shareText: byId("shareText"),
  shareImage: byId("shareImage"),
  generateShareImage: byId("generateShareImage"),
  shareStatus: byId("shareStatus"),
  shareImagePreview: byId("shareImagePreview"),
  shareImageCaption: byId("shareImageCaption"),
  downloadShareImage: byId("downloadShareImage"),
  xIntent: byId("xIntent")
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
const booleanFields = ["hour12", "showSeconds", "smallSeconds", "showDate", "showWeekday"];
const selectFields = ["dateFormat", "weekdayFormat", "labelPosition", "analogMarks", "analogSecondHand", "flipGroup"];
let state = loadInitialConfig();
let localFontSelectBound = false;
// テンプレカードのミニプレビューが最後に反映した表示設定8項目の署名。
// これと現在の state が変わったときだけカードを差し替える。
let lastMiniPreviewSignature = "";
// 生成済みの宣伝画像をキャッシュし、設定が変わったら無効化する。
// 共有時にまだ無ければ作り、ある間は再生成を省く。
let shareImageBlob = null;
let shareImageDirty = true;
let shareImageAutoRegenerateTimer = 0;
let shareImageGeneration = 0;
let persistUrlTimer = 0;
let userHasGeneratedShareImage = false;

const previewClock = mountClock(elements.clockPreview, state);

init();

function init() {
  initUiTheme();
  initAdjustTabs();
  initPinPreview();
  initMiniFloatObserver();
  renderTemplateCategoryTabs();
  renderTemplateButtons();
  renderFontOptions();
  renderSwatches();
  setupTimezoneCandidate();
  bindForm();
  bindPreviewBackground();
  bindClockType();
  bindShare();
  syncFormFromState();
  updateEverything();
  window.addEventListener("resize", () => {
    window.requestAnimationFrame(fitTemplateMiniPreviews);
    // 浮遊中(.show-mini-float)に幅が変わると実プレビューの高さも変わるので、
    // 予約しておく min-height を測り直して、解除時の段ずれを防ぐ。
    window.requestAnimationFrame(refreshFloatReservedHeight);
  });
  startPreviewTicker();
}

// ライブプレビューを毎秒進めるティッカー。編集していない間も時刻が更新され、
// 浮遊中(スマホで上部に固定した実プレビュー)でも止まって見えないようにする。
// 非表示タブでは setTimeout が間引かれるが、OBSへ貼る本番URL(/clock/)とは独立した
// プレビュー専用の更新なので問題ない。タブが前面に戻ったら即同期する。
function startPreviewTicker() {
  let timerId = 0;
  const tickAll = () => {
    const now = new Date();
    previewClock.tick(now);
  };
  const schedule = () => {
    window.clearTimeout(timerId);
    tickAll();
    // 次の「秒の頭」に合わせて更新し、毎秒きっかりで時刻が変わるようにする。
    const delay = 1000 - (Date.now() % 1000);
    timerId = window.setTimeout(schedule, delay);
  };
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      schedule();
    }
  });
  schedule();
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
  // かんたん/こだわりは「表示の切り替え(トグル)」として扱い、aria-pressed のみで状態を示す。
  // aria-controls/aria-expanded は併用しない(二重シグナルを避ける)。
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

// ライブプレビューのピン留め(固定)切り替え。固定するのは「時計の箱だけ」。
// ピンON(デスクトップ >=1101px): 時計ステージ(.preview-stage-dock)を sticky にし、
//   右の設定をスクロールしても時計だけが上部に浮いて追従する。見出し/コピー/共有などは普通に流れる。
// ピンON(スマホ <=1100px): スクロールで実プレビュー(.preview-stage-dock)が上端から外れたら、
//   その実物の時計の箱を実寸のまま画面上部へ fixed で浮かせる(複製ではない)。
//   透明な余白はタップを下の設定へ通す。出し入れは .show-mini-float クラスで切り替える。
// ピンOFF: どちらの幅でも何も固定せず、ページを普通にスクロールできる。
// 既定はON。選択は localStorage に保存するが、保存できない環境でもこの画面内の切り替えはそのまま使える。
function initPinPreview() {
  if (!elements.pinPreview) {
    return;
  }
  const setPinned = (pinned) => {
    elements.preview.classList.toggle("is-pinned", pinned);
    elements.pinPreview.classList.toggle("is-active", pinned);
    elements.pinPreview.setAttribute("aria-pressed", String(pinned));
    const pinActionLabel = pinned ? "プレビューの固定を外す" : "プレビューを固定する";
    elements.pinPreview.setAttribute("aria-label", pinActionLabel);
    // プレビュー上はアイコンのみ表示なので、ホバー時の説明(title)も状態に合わせて出す。
    elements.pinPreview.setAttribute("title", pinActionLabel);
    elements.pinLabel.textContent = pinned ? "固定中" : "固定する";
    // ピンOFFにすると実プレビューは固定されなくなる。浮遊が解けるので、
    // 予約していた高さを片付けて(=段ずれ防止の min-height を外して)整える。
    refreshFloatReservedHeight();
  };
  setPinned(readSavedPinPreference());
  elements.pinPreview.addEventListener("click", () => {
    const next = elements.pinPreview.getAttribute("aria-pressed") !== "true";
    setPinned(next);
    try {
      window.localStorage.setItem(PIN_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // 保存できない環境でも、この画面内の切り替えはそのまま使える。
    }
  });
}

// スクロールで実プレビューが上端から外れたとき「だけ」、実物の時計の箱
// (#previewShell)を実寸のまま画面上部へ浮かせる(複製は作らない)。
// ページ上部には実プレビューが普通に流れているので、見えている間に浮かべると
// 上部で時計が二重に見える。IntersectionObserver で監視し、見えている間は
// .show-mini-float を外して二重表示を防ぎ、上端から外れた瞬間に付ける。
// 表示の最終的な出し分けは CSS(.is-pinned かつ .show-mini-float かつ 1カラム幅)が
// 担うので、ピンOFF/デスクトップでは浮かない。
//
// 監視対象は #previewShell ではなく「外側の器(.preview-stage-dock)」にする。
// 浮遊時に fixed 化して画面内へ戻すのは中身(#previewShell)の方なので、もし
// #previewShell 自体を監視すると「外れた→上部へ出す→画面内に入った判定→外す→
// また外れた…」を毎フレーム繰り返して点滅(自己フィードバックループ)になる。
// dock は浮遊中も min-height で実寸を確保したまま通常フローに残り、高さも位置も
// 変わらないので、交差判定はスクロール位置だけで決まりループが起きない。
//
// 浮かせると CSS は中の箱(#previewShell)だけを position:fixed にし、外側の
// .preview-stage-dock は通常フローに残す。fixed で中身が抜けると dock の高さは
// ほぼ0に潰れて左列がその分だけ縮み、ページがガタッと飛ぶ。これを防ぐため、浮かす
// 直前に dock の実高を測って min-height で場所を確保し(reserveFloatHeight)、
// 解除時に外す(clearFloatHeight)。setFloat はクラスと予約高をまとめて管理する単一窓口。
function setFloat(active) {
  const column = elements.preview;
  const dock = elements.previewStageDock;
  if (!column || !dock) {
    return;
  }
  const changed = column.classList.contains("show-mini-float") !== active;
  if (!changed) {
    return;
  }
  if (active) {
    // #previewShell の実高を dock の min-height として予約してから fixed 化する。
    // shell の高さは fixed 後も同じなので順序に厳密な依存はないが、先に予約して
    // から付けることで、付けた瞬間の段ずれを一度も見せない。
    reserveFloatHeight();
    column.classList.add("show-mini-float");
  } else {
    column.classList.remove("show-mini-float");
    clearFloatHeight();
  }
}

// 実プレビューの箱(#previewShell)の実高を dock の min-height として予約し、中身の
// fixed 化後の段ずれを防ぐ。#previewShell の高さは「通常フロー」でも「fixed(浮遊中)」でも
// そのまま測れる(fixed でも要素は描画され、その実寸を返す)ので、予約済み min-height で
// 潰れた dock を測ってしまう取り違えが起きない。
// CSSOM(element.style)で設定する(インラインstyle属性ではない=CSP順守。
// 時計スタイルと同じ element.style API)。
function reserveFloatHeight() {
  const dock = elements.previewStageDock;
  const shell = elements.previewShell;
  if (!dock || !shell) {
    return;
  }
  const height = shell.getBoundingClientRect().height;
  if (height > 0) {
    dock.style.minHeight = `${Math.round(height)}px`;
  }
}

// 予約していた高さを片付ける(通常フローへ戻す)。
function clearFloatHeight() {
  const dock = elements.previewStageDock;
  if (!dock) {
    return;
  }
  dock.style.minHeight = "";
}

// 浮遊中に幅が変わる/設定で高さが変わる/ピンが外れる、などで状態が変わったとき、予約高を
// 測り直す。浮遊していない(または fixed が効かないデスクトップ)ときは予約を外す。
// 浮遊中は #previewShell の実寸を測り直して付け直すので、実プレビューの高さ変化に追従する。
function refreshFloatReservedHeight() {
  const column = elements.preview;
  if (!column || !column.classList.contains("show-mini-float")) {
    clearFloatHeight();
    return;
  }
  reserveFloatHeight();
}

function initMiniFloatObserver() {
  // 監視するのは「外側の器(dock)」。中身(#previewShell)を監視すると、浮遊時に
  // fixed で画面内へ戻った瞬間に交差判定が反転して点滅する(関数上のコメント参照)。
  const target = elements.previewStageDock;
  const column = elements.preview;
  if (!target || !column) {
    return;
  }
  // IntersectionObserver 非対応の旧ブラウザでは、スクロール連動の出し分けができない。
  // ここで常時浮遊にすると、上部に実プレビューが流れている間も浮遊時計が出て二重に
  // 見えてしまう。二重表示を避けるため、フォールバックでは浮かせず実プレビューのみ表示する。
  if (typeof window.IntersectionObserver !== "function") {
    setFloat(false);
    return;
  }
  const observer = new window.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // 実プレビューの器が(縮めた)ビューポートに掛かっていれば見えている→浮かせない。
        // 上端から完全に外れたら→実物の箱を浮かせる。
        setFloat(!entry.isIntersecting);
      }
    },
    { rootMargin: "0px 0px 0px 0px", threshold: 0 }
  );
  observer.observe(target);
}

function readSavedPinPreference() {
  try {
    // 既定はON。明示的に "0" が保存されているときだけOFFにする。
    return window.localStorage.getItem(PIN_STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
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
    if (category.hint) {
      // アナログ/パタパタは雰囲気ではなく時計の種類なので、ホバー説明で補足する。
      tab.title = category.hint;
    }
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

// ミニプレビューは「今の設定にテンプレを重ねたらどう見えるか」を示す。
// applyTemplate が引き継ぐ8項目(タイムゾーン/12時間/秒/小秒/日付/日付書式/曜日/曜日書式)を
// 現在の state から流し込み、カードとクリック結果を一致させる。
function miniPreviewSignature(cfg) {
  return [
    cfg.timezone,
    cfg.hour12,
    cfg.showSeconds,
    cfg.smallSeconds,
    cfg.showDate,
    cfg.dateFormat,
    cfg.showWeekday,
    cfg.weekdayFormat
  ].join("|");
}

function buildTemplateMiniPreview(template) {
  const mini = document.createElement("span");
  mini.className = "template-mini";
  // 常時更新される装飾プレビューはラベルが無く、スクリーンリーダーには雑音なので隠す。
  mini.setAttribute("aria-hidden", "true");
  // 既定値ではなく現在の state を土台にし、秒・日付・曜日などの表示設定をカードへ反映する。
  const applied = applyTemplate({ ...state }, template.id);

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

  const holder = document.createElement("span");
  holder.className = "template-mini-digital";
  // デジタルも実描画で作り、ラベル位置・テンプレ装飾・小秒表示をライブプレビューと同じ構造にする。
  const clock = mountClock(holder, applied, { now: () => new Date(2026, 0, 1, 12, 34, 56) });
  clock.element.classList.add("template-mini-clock");
  mini.append(holder);
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
    // ミニプレビューは aria-hidden なので、操作名と補足文をボタン名へ明示して迷子を防ぐ。
    button.setAttribute("aria-label", `テンプレート「${template.name}」を適用: ${template.note}`);

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
  // 作り直した時点のカードは現在の state を反映済みなので署名を合わせておく。
  lastMiniPreviewSignature = miniPreviewSignature(state);
  window.requestAnimationFrame(fitTemplateMiniPreviews);
}

// 表示設定(秒/日付/曜日など8項目)が変わったら、ボタンを作り直さずに
// 各カードの .template-mini だけ差し替える。focus や aria-pressed を保つため
// ボタンや DOM の同一性は壊さない。署名が変わったときだけ走らせて無駄な再描画を避ける。
function refreshTemplateMiniPreviews() {
  const signature = miniPreviewSignature(state);
  if (signature === lastMiniPreviewSignature) {
    return;
  }
  lastMiniPreviewSignature = signature;
  document.querySelectorAll(".template-button").forEach((button) => {
    const templateId = button.dataset.template;
    const template = TEMPLATES.find((item) => item.id === templateId);
    if (!template) {
      return;
    }
    const oldMini = button.querySelector(".template-mini");
    if (!oldMini) {
      return;
    }
    const newMini = buildTemplateMiniPreview(template);
    button.replaceChild(newMini, oldMini);
  });
  window.requestAnimationFrame(fitTemplateMiniPreviews);
}

function fitTemplateMiniPreviews() {
  document.querySelectorAll(".template-mini").forEach((mini) => {
    const widget = mini.querySelector(".template-mini-clock");
    if (!widget) {
      return;
    }
    const innerWidth = widget.offsetWidth;
    const innerHeight = widget.offsetHeight;
    const availableWidth = mini.clientWidth - 12;
    const availableHeight = mini.clientHeight - 12;
    if (innerWidth > 0 && innerHeight > 0 && availableWidth > 0 && availableHeight > 0) {
      const scale = Math.min(0.42, availableWidth / innerWidth, availableHeight / innerHeight);
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
      button.setAttribute("aria-label", `${SWATCH_TARGET_LABELS[target] ?? target} を ${color} にする`);
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
    elements[field].addEventListener("input", () =>
      updateState({ [field]: Number(elements[field].value) }, false, { deferPersistent: true })
    );
    elements[field].addEventListener("change", () => updateState({ [field]: Number(elements[field].value) }));
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
  elements.copyUrl.addEventListener("click", () =>
    copyText(
      elements.generatedUrl.value,
      elements.urlStatus,
      "URLをコピーしました。OBSのブラウザソースに貼り付け、最後に下の『作った時計をXでシェア』で共有できます。"
    )
  );
  elements.openClock.addEventListener("click", () => {
    window.open(elements.generatedUrl.value, "_blank", "noopener");
  });
}

function bindPreviewBackground() {
  document.querySelectorAll('input[name="previewBg"]').forEach((radio) => {
    radio.addEventListener("change", updatePreviewBackground);
  });
  elements.previewCustomColor.addEventListener("input", () => {
    // 任意色を編集したら「任意色」ラジオを自動選択し、見た目と選択状態(SR向け)を一致させる。
    const customRadio = document.querySelector('input[name="previewBg"][value="custom"]');
    if (customRadio && !customRadio.checked) {
      customRadio.checked = true;
    }
    updatePreviewBackground();
  });
}

function updateState(partial, sync = false, options = {}) {
  state = normalizeConfig({ ...state, ...partial });
  if (sync) {
    syncFormFromState();
  } else {
    syncOutputValues();
  }
  updateEverything("", options);
}

function syncFormFromState() {
  elements.timezone.value = state.timezone;
  elements.hour12.checked = state.hour12;
  elements.showSeconds.checked = state.showSeconds;
  elements.smallSeconds.checked = state.smallSeconds;
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
    let text;
    if (["backgroundOpacity", "borderOpacity", "shadowOpacity", "lineHeight"].includes(field)) {
      text = value.toFixed(2);
    } else if (field === "letterSpacing" || field === "strokeWidth") {
      text = `${value.toFixed(1)}px`;
    } else if (field === "fontWeight") {
      text = String(value);
    } else {
      text = `${value}px`;
    }
    output.textContent = text;
    // 表示中の単位付き文字列をそのまま読み上げへ流用し、二重管理を避ける。
    // aria-describedby(HTML側)で output と関連付け、ここで値の読みも単位付きにする。
    elements[field].setAttribute("aria-valuetext", text);
  }
}

function updateEverything(status = "", options = {}) {
  state = normalizeConfig(state);
  previewClock.updateConfig(state);
  if (options.deferPersistent) {
    schedulePersistentOutputs();
  } else {
    commitPersistentOutputs();
  }
  updatePreviewBackground();
  updateContrastWarning();
  updateTemplatePressed();
  updateClockTypeVisibility();
  // 表示設定が変わったら、既存カードのミニプレビューを差し替えて実際の適用結果に合わせる。
  refreshTemplateMiniPreviews();
  // 設定が変わったら生成済み画像は古くなる。次の共有時に作り直す。
  // 既に画像を作っていてこれが「初めて古くなった」瞬間なら、プレビュー/説明/保存リンクを
  // 一時的に古い状態として示す。生成済みプレビューがある場合は debounce 後に自動更新する。
  const becameStale = shareImageBlob && !shareImageDirty;
  shareImageDirty = true;
  shareImageGeneration += 1;
  if (becameStale) {
    markShareImageStale();
  }
  scheduleShareImageAutoRegenerate();
  updateXIntent();
  if (status) {
    // 汎用ステータスは常時表示の builderStatus へ。importStatus は「こだわり」内に
    // あり「かんたん」タブでは非表示になるため、確認文が見えなくなるのを防ぐ。
    elements.builderStatus.textContent = status;
  }
  window.requestAnimationFrame(() => {
    updateRecommendedSize();
    // 設定変更で実プレビューの高さが変わると、浮遊中に予約した min-height とずれる。
    // 浮遊中なら測り直し、未浮遊なら予約を外して段ずれを防ぐ。
    refreshFloatReservedHeight();
  });
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
  // 文字数は「案内」なので控えめな色に。コピー成功などの本物の確認文が来たら copyText 側で外す。
  elements.urlStatus.textContent = `${url.length}文字`;
  elements.urlStatus.classList.add("is-info");
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

function schedulePersistentOutputs() {
  if (persistUrlTimer) {
    window.clearTimeout(persistUrlTimer);
  }
  persistUrlTimer = window.setTimeout(() => {
    persistUrlTimer = 0;
    persistState();
    updateGeneratedUrl();
  }, PERSIST_URL_DEBOUNCE_MS);
}

function commitPersistentOutputs() {
  if (persistUrlTimer) {
    window.clearTimeout(persistUrlTimer);
    persistUrlTimer = 0;
  }
  persistState();
  updateGeneratedUrl();
}

function updateRecommendedSize() {
  const size = recommendedObsSize(previewClock.element);
  elements.recommendedWidth.textContent = `${size.width}px`;
  elements.recommendedHeight.textContent = `${size.height}px`;
}

function updatePreviewBackground() {
  const selected = document.querySelector('input[name="previewBg"]:checked')?.value ?? "checker";
  const customColor = elements.previewCustomColor.value;
  const shell = elements.previewShell;
  if (!shell) {
    return;
  }
  shell.classList.remove("preview-checker", "preview-light", "preview-dark", "preview-custom");
  shell.classList.add(`preview-${selected}`);
  shell.style.setProperty("--preview-custom", customColor);
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
  elements.localFontStatus.textContent = "PC内フォント名を確認中…";
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
    // 直前の失敗メッセージを消す(成功確認は常時表示の builderStatus 側に出る)。
    elements.importStatus.textContent = "";
    updateEverything("設定を読み込みました。");
  } catch (error) {
    elements.importStatus.textContent = error instanceof Error ? error.message : "設定を読み込めませんでした。";
  }
}

async function copyText(text, statusElement, successMessage) {
  // 本物の確認文を出すので「案内」修飾(控えめ色)を外し、成功色(緑)へ戻す。
  statusElement.classList.remove("is-info");
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

// ---- 共有(Xでシェアして広める) ------------------------------------------

function bindShare() {
  updateShareText();
  elements.shareImage.addEventListener("click", shareGeneratedImage);
  elements.generateShareImage.addEventListener("click", () => {
    regenerateShareImage("プレビュー画像を作り直しました。");
  });
  // 「PNGを保存」リンクは画像が無い間は aria-disabled。pointer-events だけでは
  // キーボード(Tab+Enter)で href="#" が発火しページ先頭へ飛ぶため、活性化も止める。
  elements.downloadShareImage.addEventListener("click", (event) => {
    if (elements.downloadShareImage.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
    }
  });
  // 投稿文を編集したら、X投稿画面リンク(intent)へ即座に反映する。
  elements.shareText.addEventListener("input", updateXIntent);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelShareImageAutoRegenerate();
    }
  });
  updateXIntent();
}

// 生成済み画像が「今のデザイン」と一致しなくなったことを画面へ反映する。
// 自動更新までの短い間、プレビュー/説明/保存リンクを古い状態として示す。
function markShareImageStale() {
  if (!elements.shareImagePreview) {
    return;
  }
  elements.shareImagePreview.classList.remove("is-ready");
  // 画像が今のデザインと食い違う(古い)あいだは alt を空にして装飾扱いにし、
  // 状態は figcaption(下の説明)で伝える。読み上げが古い説明を読まないようにする。
  elements.shareImagePreview.setAttribute("alt", "");
  elements.shareImageCaption.textContent =
    "デザインを変えました。『プレビュー画像を作り直す』で更新できます。";
  // 古い画像のダウンロードを防ぐ。キーボードでも活性化しないよう tabindex も外す。
  setDownloadShareImageEnabled(false);
}

function setDownloadShareImageEnabled(enabled, href = "#") {
  if (enabled) {
    elements.downloadShareImage.href = href;
    elements.downloadShareImage.removeAttribute("aria-disabled");
    // 無効化時に外したキーボード活性化(tabindex=-1)を戻し、再び Tab で辿れるようにする。
    elements.downloadShareImage.removeAttribute("tabindex");
    return;
  }
  elements.downloadShareImage.setAttribute("href", "#");
  elements.downloadShareImage.setAttribute("aria-disabled", "true");
  elements.downloadShareImage.setAttribute("tabindex", "-1");
}

function cancelShareImageAutoRegenerate() {
  if (!shareImageAutoRegenerateTimer) {
    return;
  }
  window.clearTimeout(shareImageAutoRegenerateTimer);
  shareImageAutoRegenerateTimer = 0;
}

function scheduleShareImageAutoRegenerate() {
  cancelShareImageAutoRegenerate();
  if (document.hidden || !userHasGeneratedShareImage) {
    return;
  }
  shareImageAutoRegenerateTimer = window.setTimeout(() => {
    shareImageAutoRegenerateTimer = 0;
    regenerateShareImage("");
  }, SHARE_IMAGE_AUTO_REGENERATE_DELAY_MS);
}

function updateShareText() {
  // 既定文は最初の一度だけ流し込み、ユーザーが編集した内容は上書きしない。
  if (!elements.shareText.value) {
    elements.shareText.value = buildShareText(BUILDER_URL);
  }
}

function updateXIntent() {
  // 投稿文側にURL/ハッシュタグを含めているので、intent側は text だけにして
  // 重複表示を避ける。X Web Intent は画像添付には非対応(テキスト導線のみ)。
  if (!elements.xIntent) {
    return;
  }
  // 本文(buildShareText)に URL とハッシュタグを既に含めているため、intent には text のみ
  // 渡す。url= / hashtags= を併せて渡すと X Web Intent が本文末へ二重に追記してしまう。
  const text = resolveShareText(elements.shareText.value, BUILDER_URL);
  elements.xIntent.href = buildXIntentUrl({ text });
}

async function regenerateShareImage(successMessage) {
  cancelShareImageAutoRegenerate();
  const myGeneration = ++shareImageGeneration;
  if (successMessage) {
    setShareStatus("宣伝画像を作成中…");
  }
  let dataUrl;
  let blob;
  try {
    const result = await createShareImage();
    dataUrl = result.dataUrl;
    blob = result.blob;
  } catch {
    if (myGeneration !== shareImageGeneration) {
      return false;
    }
    shareImageBlob = null;
    // 生成に失敗したら、直前に成功した古いPNGを保存できないよう保存リンクを無効化する。
    // 説明文(figcaption)はエラー表示のままにしたいので、markShareImageStale ではなく
    // 保存リンクの属性だけを無効状態に揃える(キーボードでも辿れないよう tabindex も外す)。
    setDownloadShareImageEnabled(false);
    setShareStatus("画像を作成できませんでした。ブラウザを更新してもう一度試してください。", true);
    return false;
  }
  if (myGeneration !== shareImageGeneration) {
    return false;
  }
  shareImageBlob = blob;
  shareImageDirty = false;
  userHasGeneratedShareImage = true;
  elements.shareImagePreview.src = dataUrl;
  elements.shareImagePreview.classList.add("is-ready");
  // 生成できたときだけ意味のある alt を付け、読み上げにも画像があると伝える。
  elements.shareImagePreview.setAttribute("alt", "作成した宣伝画像のプレビュー");
  elements.shareImageCaption.textContent = "今の時計デザインで宣伝画像を作りました。共有や保存ができます。";
  setDownloadShareImageEnabled(true, dataUrl);
  if (successMessage) {
    setShareStatus(successMessage);
  }
  return true;
}

// 画像が無い/古いときだけ作り直す。共有や保存の直前に呼ぶ。
async function ensureShareImage() {
  if (shareImageBlob && !shareImageDirty) {
    return true;
  }
  return regenerateShareImage("");
}

async function shareGeneratedImage() {
  const ready = await ensureShareImage();
  if (!ready || !shareImageBlob) {
    return;
  }
  const file = new File([shareImageBlob], "obs-clock-share.png", { type: "image/png" });
  const text = resolveShareText(elements.shareText.value, BUILDER_URL);

  // 画像ファイルごと共有できる端末(主にスマホ)では OS の共有シートを開く。
  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({
        files: [file],
        title: "OBS時計URLビルダー",
        text
      });
      setShareStatus("共有メニューを開きました。Xなどの共有先を選んでください。");
    } catch (error) {
      // ユーザーが共有シートを閉じただけ(キャンセル)はエラー扱いしない。
      if (error && error.name === "AbortError") {
        setShareStatus("共有をキャンセルしました。");
      } else {
        setShareStatus("共有できませんでした。下の「PNGを保存」→「X投稿画面を開く」で手動添付してください。", true);
      }
    }
    return;
  }

  // 画像共有に非対応の環境(主にPC)はフォールバック手順へ誘導する。
  setShareStatus("この環境は画像の直接共有に未対応です。「PNGを保存」→「X投稿画面を開く」で画像を手動添付してください。");
}

function setShareStatus(message, isError = false) {
  elements.shareStatus.textContent = message;
  elements.shareStatus.classList.toggle("is-error", Boolean(isError));
}

// 今の state を 1200x675 の宣伝カードとして Canvas へ描く。
// 外部画像・外部フォント・ネットワークは一切使わない(CSP/オフライン両対応)。
// 返り値: { dataUrl, blob } — dataUrl は img プレビュー/保存(CSP: data: 許可)、
// blob は navigator.share 用の File 生成に使う。
async function createShareImage() {
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_IMAGE_WIDTH;
  canvas.height = SHARE_IMAGE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }

  drawShareBackground(ctx, state);
  drawShareClock(ctx, state);
  drawShareFooter(ctx);

  const dataUrl = canvas.toDataURL("image/png");
  const blob = await canvasToBlob(canvas);
  return { dataUrl, blob };
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== "function") {
      reject(new Error("canvas.toBlob unavailable."));
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas PNG generation failed."));
      }
    }, "image/png");
  });
}

// 背景: 時計の背景色から淡いグラデーションを作り、上品な無地カード風にする。
function drawShareBackground(ctx, config) {
  const tint = hexToRgba(config.backgroundColor, 0.16);
  const gradient = ctx.createLinearGradient(0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT);
  gradient.addColorStop(0, "#f4f6fb");
  gradient.addColorStop(0.5, tint);
  gradient.addColorStop(1, "#eef1f7");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT);

  // 主役を載せる白いステージ。中央やや上に大きく取り、足元に余白を残す。
  const stageX = 90;
  const stageY = 96;
  const stageW = SHARE_IMAGE_WIDTH - stageX * 2;
  const stageH = 410;
  ctx.save();
  ctx.shadowColor = "rgba(31, 36, 48, 0.16)";
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 18;
  drawRoundedRectPath(ctx, stageX, stageY, stageW, stageH, 28);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  // ステージ中央へ時計を描くための領域を共有(他の draw 関数が参照)。
  ctx.__stage = { x: stageX, y: stageY, w: stageW, h: stageH, cx: SHARE_IMAGE_WIDTH / 2, cy: stageY + stageH / 2 };
}

function drawShareClock(ctx, config) {
  if (config.clockType === "analog") {
    drawAnalogShareClock(ctx, config);
  } else if (config.clockType === "flip") {
    drawFlipShareClock(ctx, config);
  } else {
    drawDigitalShareClock(ctx, config);
  }
}


function drawDigitalShareClock(ctx, config) {
  // プレビューの時計パネル(背景色+枠+角丸)を、実寸より大きめに描いて主役にする。
  const scale = 2.4;
  const formatters = createFormatters(config);
  const formatted = formatClock(formatters, new Date());
  const fontStack = canvasFontStack(config.fontFamily);

  // ライブ時計は --clock-letter-spacing(字間)を反映する。Canvas2D の letterSpacing が
  // 使える環境では同じ字間を適用し、計測も同じ状態で行ってパネル幅を実際の描画に揃える。
  // 非対応環境では従来どおり字間なしで描く(グレースフルフォールバック)。
  const supportsLetterSpacing = "letterSpacing" in ctx;
  const letterSpacingCss = `${config.letterSpacing * scale}px`;
  if (supportsLetterSpacing) {
    ctx.letterSpacing = letterSpacingCss;
  }

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  // ライブ(clock.css)では labelPosition が left/right のとき、ラベルは日付+時刻ブロックの
  // 横(縦中央)に並ぶ。共有カードもこれに合わせ、ラベル表示ありの left/right のときだけ
  // 横並びパスへ分岐する。それ以外(top/bottom/hidden・ラベル空)は従来の縦積みのまま。
  const label = config.labelPosition === "hidden" ? "" : config.label;
  const isSideLabel =
    Boolean(label) && (config.labelPosition === "left" || config.labelPosition === "right");
  if (isSideLabel) {
    drawDigitalShareClockSideLabel(ctx, config, {
      formatted,
      fontStack,
      label,
      scale
    });
  } else {
    drawDigitalShareClockStacked(ctx, config, {
      formatted,
      fontStack,
      label,
      scale
    });
  }

  clearShadow(ctx);
  // 字間が footer など後続の描画へ漏れないよう必ず初期状態へ戻す。
  ctx.textAlign = "center";
  if (supportsLetterSpacing) {
    ctx.letterSpacing = "0px";
  }
}

// 従来の縦積みパス: 各行(ラベル/日付/時刻)を上から下へ積み、パネル中央へ置く。
// top / bottom / hidden ラベルと、ラベル非表示の left/right はこのパスで描く。
function drawDigitalShareClockStacked(ctx, config, { formatted, fontStack, label, scale }) {
  const stage = ctx.__stage;
  const fontPx = Math.round(config.fontSize * scale);

  // パネル幅は時刻文字の実測から決める。
  const rawLines = buildShareLines(config, formatted);
  const labelAbove = config.labelPosition === "top" || config.labelPosition === "left";
  const labelBelow = config.labelPosition === "bottom" || config.labelPosition === "right";
  const labelIndex = label ? (labelAbove ? 0 : labelBelow ? rawLines.length - 1 : -1) : -1;
  const lines = rawLines.map((line, index) => ({
    ...line,
    px: Math.round(line.size * scale),
    isLabel: index === labelIndex
  }));

  clearShadow(ctx);
  const timeWidth = measureShareTime(ctx, config, formatted, fontPx, fontStack);
  let panelContentWidth = timeWidth;
  for (const line of lines) {
    if (line.isTime) {
      continue;
    }
    ctx.font = `${config.fontWeight} ${line.px}px ${fontStack}`;
    panelContentWidth = Math.max(panelContentWidth, ctx.measureText(line.text).width);
  }

  const padX = config.paddingX * scale + 24;
  const padY = config.paddingY * scale + 18;

  const gap = Math.max(8, config.gap * scale);
  // 高さが上限を超えるなら、文字サイズ・行送り・縦パディングを同率で縮めてカード内に収める
  // (クランプだけだと行カーソルがクランプ前の値のまま進み、最下行がカード外へはみ出す)。
  const { fit, fitGap, fitPadY, panelW, panelH, panelX, panelY } = computeStackedLayout({
    lineSizesPx: lines.map((line) => line.px),
    panelContentWidth,
    padX,
    padY,
    gap,
    maxW: stage.w - 80,
    maxH: stage.h - 80,
    stageCx: stage.cx,
    stageCy: stage.cy
  });

  // 時計パネル本体(背景・角丸・枠線)。
  clearShadow(ctx);
  drawRoundedRectPath(ctx, panelX, panelY, panelW, panelH, Math.min(config.radius * scale, panelH / 2));
  ctx.fillStyle = hexToRgba(config.backgroundColor, config.backgroundOpacity);
  ctx.fill();
  if (config.borderWidth > 0) {
    ctx.lineWidth = Math.max(1, config.borderWidth * scale);
    ctx.strokeStyle = hexToRgba(config.borderColor, config.borderOpacity);
    ctx.stroke();
  }

  // 各行を縦に積んで描く。時刻行だけ影/縁取りを反映する。
  // フォントサイズ・行送り・パディングは収まり係数 fit を掛けてカード内に収める。
  let cursorY = panelY + fitPadY + (lines[0].px * fit) / 2;
  let timeLineMetrics = null;
  let labelLineMetrics = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const linePx = line.px * fit;
    ctx.font = `${config.fontWeight} ${linePx}px ${fontStack}`;
    const lineWidth = line.isTime
      ? measureShareTime(ctx, config, formatted, linePx, fontStack)
      : ctx.measureText(line.text).width;
    const metrics = { text: line.text, y: cursorY, px: linePx, width: lineWidth };
    if (line.isTime) {
      timeLineMetrics = metrics;
    } else if (line.isLabel) {
      labelLineMetrics = metrics;
    }
    if (line.isTime) {
      drawShareTime(ctx, config, formatted, {
        x: stage.cx,
        y: cursorY,
        px: linePx,
        fontStack,
        align: "center",
        strokeScale: scale * fit
      });
    } else {
      clearShadow(ctx);
      ctx.fillStyle = config.textColor;
      ctx.fillText(line.text, stage.cx, cursorY);
    }
    if (i < lines.length - 1) {
      cursorY += linePx / 2 + fitGap + (lines[i + 1].px * fit) / 2;
    }
  }
  drawDigitalTemplateDecorations(ctx, {
    config,
    decoration: templateDecoration(config.template),
    fontStack,
    fit,
    labelLine: labelLineMetrics,
    panel: {
      x: panelX,
      y: panelY,
      w: panelW,
      h: panelH,
      radius: Math.min(config.radius * scale, panelH / 2)
    },
    scale,
    timeLine: timeLineMetrics
  });
}

// 横並びパス: ライブ(clock.css)の left/right ラベルを再現する。
// .clock-widget は inline-flex / align-items:center / gap:--clock-gap で、
//   right → [ main(日付↑時刻↓・左揃え) ] [gap] [ LABEL ]
//   left  → [ LABEL ] [gap] [ main ]
// を縦中央に揃え、ウィジェット全体をパネル中央へ置く。
// .clock-main は grid(日付行↑時刻行↓・行間 --clock-gap*0.55)。
function drawDigitalShareClockSideLabel(ctx, config, { formatted, fontStack, label, scale }) {
  const stage = ctx.__stage;

  // main 行を作る。buildShareLines と同じ作り(日付と曜日は全角スペース2つで連結)。
  const dateText = [
    config.showDate ? formatted.date : "",
    config.showWeekday ? formatted.weekday : ""
  ]
    .filter(Boolean)
    .join("  ");
  const mainRows = [];
  if (dateText) {
    mainRows.push({ text: dateText, px: Math.round(config.dateSize * scale), isTime: false });
  }
  mainRows.push({ text: formatted.time, px: Math.round(config.fontSize * scale), isTime: true });

  // 各 main 行の幅(描画と同じ字間で計測)→ mainW/mainH。
  let mainW = 0;
  let mainH = 0;
  const mainGap = config.gap * 0.55 * scale;
  for (const row of mainRows) {
    ctx.font = `${config.fontWeight} ${row.px}px ${fontStack}`;
    mainW = Math.max(
      mainW,
      row.isTime ? measureShareTime(ctx, config, formatted, row.px, fontStack) : ctx.measureText(row.text).width
    );
    mainH += row.px;
  }
  mainH += mainGap * (mainRows.length - 1);

  // ラベル(LABEL)の幅/高さ。ライブの .clock-label は font-weight:800。
  const labelPx = Math.round(config.labelSize * scale);
  ctx.font = `800 ${labelPx}px ${fontStack}`;
  const labelW = ctx.measureText(label).width;
  const labelH = labelPx;

  // ウィジェット間ギャップ(--clock-gap)。
  const widgetGap = config.gap * scale;
  const padX = config.paddingX * scale + 24;
  const padY = config.paddingY * scale + 18;

  // 横並びの座標計算は純粋関数(share.js)へ委譲し、ライブ面との一致を単体テストできるようにする。
  const layout = computeSideLabelLayout({
    mainW,
    mainH,
    labelW,
    labelH,
    widgetGap,
    mainGap,
    padX,
    padY,
    maxW: stage.w - 80,
    maxH: stage.h - 80,
    stageCx: stage.cx,
    stageCy: stage.cy,
    isLeft: config.labelPosition === "left"
  });
  const { fit, hfit, panel, mainLeft, labelCx, centerY: groupCenterY, fitMainGap } = layout;
  const textFit = fit * hfit;
  const { x: panelX, y: panelY, w: panelW, h: panelH } = panel;

  // 時計パネル本体(背景・角丸・枠線)。
  clearShadow(ctx);
  drawRoundedRectPath(ctx, panelX, panelY, panelW, panelH, Math.min(config.radius * scale, panelH / 2));
  ctx.fillStyle = hexToRgba(config.backgroundColor, config.backgroundOpacity);
  ctx.fill();
  if (config.borderWidth > 0) {
    ctx.lineWidth = Math.max(1, config.borderWidth * scale);
    ctx.strokeStyle = hexToRgba(config.borderColor, config.borderOpacity);
    ctx.stroke();
  }

  // main の各行(左揃え)。日付↑・時刻↓を fitMainGap で積み、main ブロックを縦中央に。
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const fitMainH = mainH * textFit;
  let rowY = groupCenterY - fitMainH / 2;
  let timeLineMetrics = null;
  for (let i = 0; i < mainRows.length; i += 1) {
    const row = mainRows[i];
    const rowPx = row.px * textFit;
    rowY += rowPx / 2;
    ctx.font = `${config.fontWeight} ${rowPx}px ${fontStack}`;
    const rowWidth = row.isTime
      ? measureShareTime(ctx, config, formatted, rowPx, fontStack)
      : ctx.measureText(row.text).width;
    if (row.isTime) {
      // cx は時刻の中心x(左寄せ描画のため left + 幅/2)。装飾(下線)はこれを基準にする。
      timeLineMetrics = {
        text: row.text,
        y: rowY,
        px: rowPx,
        width: rowWidth,
        cx: mainLeft + rowWidth / 2
      };
      drawShareTime(ctx, config, formatted, {
        x: mainLeft,
        y: rowY,
        px: rowPx,
        fontStack,
        align: "left",
        strokeScale: scale * textFit
      });
    } else {
      clearShadow(ctx);
      ctx.fillStyle = config.textColor;
      ctx.fillText(row.text, mainLeft, rowY);
    }
    rowY += rowPx / 2 + fitMainGap;
  }

  // ラベルはグループの縦中央に置く(影なし)。textAlign は center にして labelCx を中心に描く。
  const fitLabelPx = labelPx * textFit;
  clearShadow(ctx);
  ctx.textAlign = "center";
  ctx.font = `800 ${fitLabelPx}px ${fontStack}`;
  ctx.fillStyle = config.textColor;
  ctx.fillText(label, labelCx, groupCenterY);
  const labelLineMetrics = {
    text: label,
    y: groupCenterY,
    px: fitLabelPx,
    width: labelW * textFit,
    cx: labelCx
  };

  drawDigitalTemplateDecorations(ctx, {
    config,
    decoration: templateDecoration(config.template),
    fontStack,
    fit: textFit,
    labelLine: labelLineMetrics,
    panel: {
      x: panelX,
      y: panelY,
      w: panelW,
      h: panelH,
      radius: Math.min(config.radius * scale, panelH / 2)
    },
    scale,
    timeLine: timeLineMetrics
  });
}

function drawAnalogShareClock(ctx, config) {
  const stage = ctx.__stage;
  // 宣伝カードは固定フレーム(1200x675のティザー)として描く設計。半径はステージに
  // フィットさせ、config.analogSize は意図的に反映しない(忠実再現の正は /clock/?c= URL)。
  const radius = Math.min(stage.h, stage.w) / 2 - 36;
  const cx = stage.cx;
  const cy = stage.cy;
  const rimWidth = Math.max(0, config.borderWidth) / 48 * radius;

  clearShadow(ctx);
  // 外周(枠)→ 文字盤の順に塗る。render.js の比率(r=48, rim=borderWidth)に合わせる。
  if (config.borderWidth > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(config.borderColor, config.borderOpacity);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius - rimWidth, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(config.backgroundColor, config.backgroundOpacity);
  ctx.fill();

  const ink = config.textColor;
  const accent = config.strokeColor;
  const fontStack = canvasFontStack(config.fontFamily);

  drawAnalogMarks(ctx, config, cx, cy, radius, ink, fontStack);

  // 針の角度はタイムゾーン補正済みの実時刻から計算(プレビューと一致)。
  const formatter = createAnalogFormatter(config.timezone);
  const parts = analogParts(formatter, new Date());
  const angles = computeAnalogAngles(parts, config.analogSecondHand);

  // 文字盤の日付(showDate のとき)。ライブ面(render.js)は viewBox 0-100 / r=48 で
  // y=66・font-size=6 に描くので、中心の下 radius*0.333・サイズ radius*0.125 で近似する。
  if (config.showDate) {
    const dateText = formatClock(createFormatters(config), new Date()).date;
    if (dateText) {
      clearShadow(ctx);
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${radius * 0.125}px ${fontStack}`;
      ctx.fillText(dateText, cx, cy + radius * 0.333);
    }
  }

  drawHand(ctx, cx, cy, angles.hourDeg, radius * 0.5, radius * 0.05, ink);
  drawHand(ctx, cx, cy, angles.minuteDeg, radius * 0.72, radius * 0.037, ink);
  if (config.analogSecondHand !== "off") {
    drawHand(ctx, cx, cy, angles.secondDeg, radius * 0.8, radius * 0.017, accent);
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.023, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
}

function drawAnalogMarks(ctx, config, cx, cy, radius, ink, fontStack) {
  const marks = config.analogMarks;
  const showNumbers = marks === "numbers" || marks === "both";
  const showRoman = marks === "roman";
  const showTicks = marks === "ticks" || marks === "both";

  clearShadow(ctx);
  if (showTicks) {
    for (let i = 0; i < 60; i += 1) {
      const isHour = i % 5 === 0;
      const angle = (i * 6 * Math.PI) / 180;
      const outer = radius * 0.92;
      const inner = outer - radius * (isHour ? 0.09 : 0.05);
      ctx.beginPath();
      ctx.lineWidth = isHour ? radius * 0.024 : radius * 0.012;
      ctx.strokeStyle = ink;
      ctx.moveTo(cx + outer * Math.sin(angle), cy - outer * Math.cos(angle));
      ctx.lineTo(cx + inner * Math.sin(angle), cy - inner * Math.cos(angle));
      ctx.stroke();
    }
  }
  if (showNumbers || showRoman) {
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const numberRadius = radius * (showRoman ? 0.78 : 0.76);
    const fontPx = radius * (showRoman ? 0.13 : 0.18);
    ctx.font = `700 ${fontPx}px ${fontStack}`;
    for (let i = 1; i <= 12; i += 1) {
      const angle = (i * 30 * Math.PI) / 180;
      const x = cx + numberRadius * Math.sin(angle);
      const y = cy - numberRadius * Math.cos(angle);
      ctx.fillText(showRoman ? ROMAN_NUMERALS[i - 1] : String(i), x, y);
    }
  }
}

function drawHand(ctx, cx, cy, deg, length, width, color) {
  const angle = (deg * Math.PI) / 180;
  // 針は12時方向(上)に伸ばし、後端を中心から少し下げる。
  const tailLength = length * 0.18;
  const tipX = cx + length * Math.sin(angle);
  const tipY = cy - length * Math.cos(angle);
  const tailX = cx - tailLength * Math.sin(angle);
  const tailY = cy + tailLength * Math.cos(angle);
  ctx.beginPath();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2, width);
  ctx.strokeStyle = color;
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
}

function drawFlipShareClock(ctx, config) {
  const stage = ctx.__stage;
  const formatters = createFormatters(config);
  const time = formatClock(formatters, new Date()).time;
  const fontStack = canvasFontStack(config.fontFamily);

  const tokens = tokenizeFlip(time, config.flipGroup);

  const scale = 2.6;
  const cardFontPx = Math.round(config.fontSize * scale);
  const cardH = cardFontPx * 1.4;
  const sepW = cardFontPx * 0.5;
  const gap = cardFontPx * 0.12;
  const radius = Math.min(config.radius * scale, cardH / 4);

  ctx.font = `${config.fontWeight} ${cardFontPx}px ${fontStack}`;
  // 各トークンの横幅を決める。
  const sized = tokens.map((token) => {
    if (!token.digit) {
      return { ...token, w: sepW };
    }
    const w = ctx.measureText(token.value).width + cardFontPx * 0.5;
    return { ...token, w: Math.max(w, cardFontPx * 0.78) };
  });
  let totalW = sized.reduce((sum, token) => sum + token.w, 0) + gap * (sized.length - 1);
  // 広すぎる場合はステージ幅に収める。
  const maxW = stage.w - 80;
  let drawScale = 1;
  if (totalW > maxW) {
    drawScale = maxW / totalW;
  }

  ctx.save();
  ctx.translate(stage.cx, stage.cy);
  ctx.scale(drawScale, drawScale);
  let cursorX = -totalW / 2;
  const cardBg = hexToRgba(config.backgroundColor, config.backgroundOpacity);
  const border = hexToRgba(config.borderColor, config.borderOpacity);
  for (const token of sized) {
    if (!token.digit) {
      clearShadow(ctx);
      ctx.fillStyle = config.textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${config.fontWeight} ${cardFontPx}px ${fontStack}`;
      ctx.fillText(token.value, cursorX + token.w / 2, 0);
      cursorX += token.w + gap;
      continue;
    }
    const cardX = cursorX;
    const cardY = -cardH / 2;
    ctx.save();
    ctx.shadowColor = "rgba(20, 22, 28, 0.28)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 10;
    drawRoundedRectPath(ctx, cardX, cardY, token.w, cardH, radius);
    ctx.fillStyle = cardBg;
    ctx.fill();
    ctx.restore();
    if (config.borderWidth > 0) {
      drawRoundedRectPath(ctx, cardX, cardY, token.w, cardH, radius);
      ctx.lineWidth = Math.max(1, config.borderWidth * scale);
      ctx.strokeStyle = border;
      ctx.stroke();
    }
    // カード中央の分割線(パタパタの折れ目を示す)。
    clearShadow(ctx);
    ctx.beginPath();
    ctx.strokeStyle = hexToRgba("#000000", 0.12);
    ctx.lineWidth = Math.max(1, cardFontPx * 0.02);
    ctx.moveTo(cardX, 0);
    ctx.lineTo(cardX + token.w, 0);
    ctx.stroke();

    ctx.fillStyle = config.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${config.fontWeight} ${cardFontPx}px ${fontStack}`;
    ctx.fillText(token.value, cardX + token.w / 2, 0);
    cursorX += token.w + gap;
  }
  ctx.restore();
  clearShadow(ctx);
}

function drawShareFooter(ctx) {
  clearShadow(ctx);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#2a2f3a";
  ctx.font = "800 38px system-ui, sans-serif";
  ctx.fillText("OBS時計URLビルダーで作成", SHARE_IMAGE_WIDTH / 2, 588);
  ctx.fillStyle = "#5a6172";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText(BUILDER_URL, SHARE_IMAGE_WIDTH / 2, 628);
}

function byId(id) {
  return document.getElementById(id);
}
