// 既存ユーザーの /clock/?c=... 再現性を守る互換ガード。
// このテストが落ちた場合、既存の生成URL・旧flat形式URLの見た目が変わる変更が入っている。
// 意図的な契約変更のときだけ tests/fixtures/generate-template-compat-golden.mjs を再実行して更新する。
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  DEFAULT_CONFIG,
  TEMPLATES,
  applyTemplate,
  cloneDefaultConfig,
  decodeConfig,
  parseConfigFromQuery
} from "../assets/js/config.js";
import { applyClockStyles } from "../assets/js/render.js";

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "template-compat.golden.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

class FakeStyle {
  constructor() {
    this.values = new Map();
  }

  setProperty(name, value) {
    this.values.set(name, value);
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

const frozenTemplateIds = fixture.templates.map((template) => template.id);

test("DEFAULT_CONFIG is frozen for compact URL compatibility", () => {
  assert.deepEqual({ ...DEFAULT_CONFIG }, fixture.defaultConfig);
});

test("existing template presets are frozen for flat query compatibility", () => {
  for (const expected of fixture.templates) {
    const actual = TEMPLATES.find((template) => template.id === expected.id);
    assert.ok(actual, `template ${expected.id} must keep existing`);
    assert.deepEqual(actual.config, expected.config, `template ${expected.id} preset must not change`);
  }
});

test("golden encoded c values decode to the same appearance", () => {
  for (const golden of fixture.goldens) {
    assert.deepEqual(decodeConfig(golden.encoded), golden.expected, `golden ${golden.name}`);
  }
});

test("legacy flat query URLs keep resolving to the same config", () => {
  for (const { query, expected } of fixture.flatQueries) {
    assert.deepEqual(parseConfigFromQuery(query), expected, `flat query ${query}`);
  }
});

test("applyClockStyles output stays identical for frozen templates", () => {
  for (const { id, snapshot } of fixture.styleSnapshots) {
    const element = new FakeElement("div");
    applyClockStyles(element, applyTemplate(cloneDefaultConfig(), id));
    assert.equal(element.className, snapshot.className, `className for ${id}`);
    assert.equal(element.dataset.labelPosition, snapshot.labelPosition, `labelPosition for ${id}`);
    assert.deepEqual(Object.fromEntries(element.style.values), snapshot.properties, `css variables for ${id}`);
  }
});

test("golden fixture covers every frozen template", () => {
  for (const id of frozenTemplateIds) {
    assert.ok(
      fixture.goldens.some((golden) => golden.name === `template-${id}-full`),
      `golden for ${id} should exist`
    );
  }
});
