import assert from "node:assert/strict";
import test from "node:test";
import { normalizeConfig } from "../assets/js/config.js";
import { applyClockStyles, mountClock } from "../assets/js/render.js";

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
    this.parent = null;
    this._textContent = "";
  }

  append(...children) {
    for (const child of children) {
      child.parent = this;
      this.children.push(child);
    }
  }

  remove() {
    if (!this.parent) {
      return;
    }
    this.parent.children = this.parent.children.filter((child) => child !== this);
    this.parent = null;
  }

  set textContent(value) {
    this._textContent = String(value);
    if (this._textContent === "") {
      this.children = [];
    }
  }

  get textContent() {
    return this._textContent;
  }

  getBoundingClientRect() {
    return { width: 128, height: 48 };
  }
}

globalThis.document = {
  createElement(tagName) {
    return new FakeElement(tagName);
  }
};

function findByClass(element, className) {
  if (element.className.split(" ").includes(className)) {
    return element;
  }
  for (const child of element.children) {
    const match = findByClass(child, className);
    if (match) {
      return match;
    }
  }
  return null;
}

test("mountClock toggles label date weekday and date row visibility", () => {
  const container = new FakeElement("div");
  const clock = mountClock(
    container,
    normalizeConfig({
      label: "LIVE",
      labelPosition: "top",
      showDate: false,
      showWeekday: false,
      timezone: "UTC"
    }),
    { now: () => new Date("2026-01-01T00:00:00Z") }
  );

  const label = findByClass(container, "clock-label");
  const date = findByClass(container, "clock-date");
  const weekday = findByClass(container, "clock-weekday");
  const dateRow = findByClass(container, "clock-date-row");

  assert.equal(label.hidden, false);
  assert.equal(date.hidden, true);
  assert.equal(weekday.hidden, true);
  assert.equal(dateRow.hidden, true);

  clock.updateConfig({ labelPosition: "hidden", showDate: true, showWeekday: true, timezone: "UTC" });

  assert.equal(label.hidden, true);
  assert.equal(date.hidden, false);
  assert.equal(weekday.hidden, false);
  assert.equal(dateRow.hidden, false);
});

test("applyClockStyles writes expected CSS variables", () => {
  const element = new FakeElement("div");
  applyClockStyles(
    element,
    normalizeConfig({
      template: "milk-tea",
      labelPosition: "bottom",
      fontFamily: 'Bad";Font',
      textColor: "#112233",
      backgroundColor: "#445566",
      backgroundOpacity: 0.5,
      borderColor: "#778899",
      borderOpacity: 0.25,
      borderWidth: 2,
      radius: 12,
      paddingX: 20,
      paddingY: 10,
      fontSize: 42,
      dateSize: 14,
      labelSize: 12,
      letterSpacing: 0.5,
      lineHeight: 1.2,
      fontWeight: 700,
      gap: 8,
      strokeColor: "#ffffff",
      strokeWidth: 1.5,
      shadowColor: "#000000",
      shadowOpacity: 0.4,
      shadowBlur: 6,
      shadowX: 1,
      shadowY: 2
    })
  );

  assert.equal(element.className, "clock-widget template-milk-tea");
  assert.equal(element.dataset.labelPosition, "bottom");
  assert.equal(element.style.getPropertyValue("--clock-font"), '"Bad\\";Font"');
  assert.equal(element.style.getPropertyValue("--clock-text"), "#112233");
  assert.equal(element.style.getPropertyValue("--clock-bg"), "rgba(68, 85, 102, 0.5)");
  assert.equal(element.style.getPropertyValue("--clock-border"), "rgba(119, 136, 153, 0.25)");
  assert.equal(element.style.getPropertyValue("--clock-border-width"), "2px");
  assert.equal(element.style.getPropertyValue("--clock-radius"), "12px");
  assert.equal(element.style.getPropertyValue("--clock-padding-x"), "20px");
  assert.equal(element.style.getPropertyValue("--clock-padding-y"), "10px");
  assert.equal(element.style.getPropertyValue("--clock-font-size"), "42px");
  assert.equal(element.style.getPropertyValue("--clock-date-size"), "14px");
  assert.equal(element.style.getPropertyValue("--clock-label-size"), "12px");
  assert.equal(element.style.getPropertyValue("--clock-letter-spacing"), "0.5px");
  assert.equal(element.style.getPropertyValue("--clock-line-height"), "1.2");
  assert.equal(element.style.getPropertyValue("--clock-font-weight"), "700");
  assert.equal(element.style.getPropertyValue("--clock-gap"), "8px");
  assert.equal(element.style.getPropertyValue("--clock-stroke-color"), "#ffffff");
  assert.equal(element.style.getPropertyValue("--clock-stroke-width"), "1.5px");
  assert.equal(element.style.getPropertyValue("--clock-shadow"), "1px 2px 6px rgba(0, 0, 0, 0.4)");
});
