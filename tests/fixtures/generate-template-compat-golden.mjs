// 互換ガードgoldenフィクスチャ生成スクリプト。
// 既存ユーザーの /clock/?c=... 再現性を守るため、DEFAULT_CONFIG・既存テンプレート・
// 代表URLのデコード結果・applyClockStylesの出力を template-compat.golden.json に固定する。
// 意図的に契約を変更する場合のみ再実行する: node tests/fixtures/generate-template-compat-golden.mjs
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_CONFIG,
  TEMPLATES,
  applyTemplate,
  cloneDefaultConfig,
  decodeConfig,
  encodeConfig,
  parseConfigFromQuery
} from "../../assets/js/config.js";
import { applyClockStyles } from "../../assets/js/render.js";

class FakeStyle {
  constructor() {
    this.values = new Map();
  }

  setProperty(name, value) {
    this.values.set(name, value);
  }

  removeProperty(name) {
    this.values.delete(name);
  }

  getPropertyValue(name) {
    return this.values.get(name) ?? "";
  }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.className = "";
    this.dataset = {};
    this.hidden = false;
    this.style = new FakeStyle();
  }
}

globalThis.document ??= {
  createElement(tagName) {
    return new FakeElement(tagName);
  }
};

function styleSnapshot(config) {
  const element = new FakeElement("div");
  applyClockStyles(element, config);
  return {
    className: element.className,
    labelPosition: element.dataset.labelPosition,
    properties: Object.fromEntries(element.style.values)
  };
}

const goldens = [];

function addGolden(name, config, options) {
  const encoded = encodeConfig(config, options);
  goldens.push({ name, encoded, expected: decodeConfig(encoded) });
}

addGolden("default-compact", cloneDefaultConfig(), { compact: true });
addGolden("default-full", cloneDefaultConfig(), {});

for (const template of TEMPLATES) {
  const applied = applyTemplate(cloneDefaultConfig(), template.id);
  addGolden(`template-${template.id}-compact`, applied, { compact: true });
  addGolden(`template-${template.id}-full`, applied, {});
}

addGolden(
  "custom-mixed-options-full",
  {
    template: "sakura",
    timezone: "Asia/Tokyo",
    hour12: true,
    showSeconds: false,
    showDate: true,
    dateFormat: "jp",
    showWeekday: true,
    weekdayFormat: "ja-long",
    label: "らいぶ",
    labelPosition: "top",
    fontFamily: "Kiwi Maru",
    textColor: "#5a3a47",
    backgroundColor: "#fff1f5",
    backgroundOpacity: 0.85,
    fontSize: 64,
    strokeWidth: 0,
    borderWidth: 2,
    borderOpacity: 0.4
  },
  {}
);

const flatQueries = [
  "?tz=Asia/Tokyo&hour12=0&seconds=1&date=0&weekday=0&font=system-ui&theme=soda",
  "?template=sakura&fontSize=50",
  "?theme=neon-hud&seconds=0&label=LIVE"
].map((query) => ({ query, expected: parseConfigFromQuery(query) }));

const styleSnapshots = TEMPLATES.map((template) => ({
  id: template.id,
  snapshot: styleSnapshot(applyTemplate(cloneDefaultConfig(), template.id))
}));

const fixture = {
  generatedFor: "v0.2.0 design refresh compatibility guard",
  defaultConfig: DEFAULT_CONFIG,
  templates: TEMPLATES,
  goldens,
  flatQueries,
  styleSnapshots
};

const target = join(dirname(fileURLToPath(import.meta.url)), "template-compat.golden.json");
writeFileSync(target, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`wrote ${target}`);
