import assert from "node:assert/strict";
import test from "node:test";
import { normalizeConfig } from "../assets/js/config.js";
import { applyClockStyles, mountClock, recommendedObsSize } from "../assets/js/render.js";

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
    this.attributes = new Map();
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

  removeChild(child) {
    this.children = this.children.filter((c) => c !== child);
    child.parent = null;
    return child;
  }

  setAttribute(name, value) {
    if (name === "class") {
      this.className = String(value);
      return;
    }
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    if (name === "class") {
      return this.className;
    }
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get offsetWidth() {
    return 0;
  }

  get classList() {
    const el = this;
    return {
      add(name) {
        if (!el.className.split(" ").includes(name)) {
          el.className = `${el.className} ${name}`.trim();
        }
      },
      remove(name) {
        el.className = el.className
          .split(" ")
          .filter((token) => token && token !== name)
          .join(" ");
      },
      contains(name) {
        return el.className.split(" ").includes(name);
      }
    };
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
  },
  createElementNS(_namespace, tagName) {
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

test("applyClockStyles writes none for disabled shadows", () => {
  const element = new FakeElement("div");

  applyClockStyles(element, normalizeConfig({ shadowOpacity: 0, shadowBlur: 6 }));
  assert.equal(element.style.getPropertyValue("--clock-shadow"), "none");

  applyClockStyles(element, normalizeConfig({ shadowOpacity: 0.5, shadowBlur: 0 }));
  assert.equal(element.style.getPropertyValue("--clock-shadow"), "none");
});

test("time renders each digit in a fixed-width slot for a stable frame", () => {
  const container = new FakeElement("div");
  mountClock(container, normalizeConfig({ showSeconds: true, timezone: "UTC" }), {
    now: () => new Date("2026-01-02T03:45:06Z")
  });

  const time = findByClass(container, "clock-time");
  const digits = time.children.filter((child) => child.className === "clock-digit");
  const seps = time.children.filter((child) => child.className === "clock-sep");

  assert.equal(digits.length, 6);
  assert.equal(digits.map((digit) => digit.textContent).join(""), "034506");
  assert.equal(
    seps.filter((sep) => sep.textContent === ":").length,
    2
  );
});

test("recommended OBS size reserves the shared visual safe inset around glow", () => {
  const element = new FakeElement("div");
  const size = recommendedObsSize(element);

  assert.equal(size.width, 128 + 18 * 2);
  assert.equal(size.height, 48 + 18 * 2);
});

function countByTag(element, tagName) {
  let count = element.tagName === tagName ? 1 : 0;
  for (const child of element.children) {
    count += countByTag(child, tagName);
  }
  return count;
}

test("analog clock builds an SVG face whose second hand appears only when enabled", () => {
  const container = new FakeElement("div");
  const clock = mountClock(
    container,
    normalizeConfig({
      clockType: "analog",
      analogMarks: "numbers",
      analogSecondHand: "tick",
      showDate: false,
      borderWidth: 2,
      timezone: "UTC"
    }),
    { now: () => new Date("2026-01-01T10:08:36Z") }
  );

  const svg = container.children[0];
  assert.equal(svg.tagName, "svg");
  assert.equal(svg.getAttribute("class"), "clock-analog");
  // numbers → 12 numeral texts, no date text
  assert.equal(countByTag(svg, "text"), 12);
  // hour + minute + second(tick) hands, no tick-mark rects for "numbers"
  assert.equal(countByTag(svg, "rect"), 3);

  // turning the second hand off removes exactly the second-hand rect
  clock.updateConfig(
    normalizeConfig({
      clockType: "analog",
      analogMarks: "numbers",
      analogSecondHand: "off",
      showDate: false,
      borderWidth: 2,
      timezone: "UTC"
    })
  );
  assert.equal(countByTag(container.children[0], "rect"), 2);
});

test("analog marks: roman keeps 12 numerals + date text; ticks add 60 tick rects", () => {
  const container = new FakeElement("div");
  const clock = mountClock(
    container,
    normalizeConfig({
      clockType: "analog",
      analogMarks: "roman",
      analogSecondHand: "off",
      showDate: true,
      borderWidth: 0,
      timezone: "UTC"
    }),
    { now: () => new Date("2026-01-01T10:08:36Z") }
  );

  // roman → 12 numeral texts + 1 date text; off + no rim → 2 hand rects, 0 tick rects
  assert.equal(countByTag(container.children[0], "text"), 13);
  assert.equal(countByTag(container.children[0], "rect"), 2);

  clock.updateConfig(
    normalizeConfig({
      clockType: "analog",
      analogMarks: "ticks",
      analogSecondHand: "off",
      showDate: false,
      borderWidth: 0,
      timezone: "UTC"
    })
  );
  // ticks → 0 texts, 60 tick rects + 2 hand rects
  assert.equal(countByTag(container.children[0], "text"), 0);
  assert.equal(countByTag(container.children[0], "rect"), 62);
});

test("flip clock builds one card per digit and groups pairs into one card", () => {
  const container = new FakeElement("div");
  const clock = mountClock(
    container,
    normalizeConfig({ clockType: "flip", flipGroup: "single", showSeconds: false, timezone: "UTC" }),
    { now: () => new Date("2026-01-01T12:34:00Z") }
  );

  const root = container.children[0];
  assert.equal(root.className, "clock-flip");
  // "12:34" single → digits 1 2 3 4 = 4 cards, ":" = 1 separator
  assert.equal(root.children.filter((c) => c.className === "flip-card").length, 4);
  assert.equal(root.children.filter((c) => c.className === "flip-sep").length, 1);
  // each card has 4 halves: static top/bottom + flap top/bottom
  assert.equal(root.children.find((c) => c.className === "flip-card").children.length, 4);

  clock.updateConfig(
    normalizeConfig({ clockType: "flip", flipGroup: "pair", showSeconds: false, timezone: "UTC" })
  );
  const pairRoot = container.children[0];
  // "12:34" pair → "12" and "34" = 2 cards, ":" = 1 separator
  assert.equal(pairRoot.children.filter((c) => c.className === "flip-card").length, 2);
  assert.equal(pairRoot.children.filter((c) => c.className === "flip-sep").length, 1);
});

test("flip clock writes flip CSS variables on its root", () => {
  const container = new FakeElement("div");
  mountClock(
    container,
    normalizeConfig({
      clockType: "flip",
      backgroundColor: "#112233",
      backgroundOpacity: 0.5,
      textColor: "#abcdef",
      fontSize: 64,
      radius: 14,
      borderColor: "#445566",
      borderOpacity: 0.25,
      borderWidth: 2,
      timezone: "UTC"
    }),
    { now: () => new Date("2026-01-01T12:34:00Z") }
  );

  const root = container.children[0];
  assert.equal(root.style.getPropertyValue("--flip-card-bg"), "rgba(17, 34, 51, 0.5)");
  assert.equal(root.style.getPropertyValue("--flip-ink"), "#abcdef");
  assert.equal(root.style.getPropertyValue("--flip-size"), "64px");
  assert.equal(root.style.getPropertyValue("--flip-border"), "rgba(68, 85, 102, 0.25)");
});

test("mountClock tears down the old implementation when the clock type changes", () => {
  const container = new FakeElement("div");
  const clock = mountClock(container, normalizeConfig({ clockType: "digital", timezone: "UTC" }), {
    now: () => new Date("2026-01-01T00:00:00Z")
  });

  assert.equal(container.children.length, 1);
  assert.notEqual(findByClass(container, "clock-widget"), null);

  clock.updateConfig(normalizeConfig({ clockType: "analog", timezone: "UTC" }));

  // exactly one root remains, it is the analog svg, and the digital widget is gone
  assert.equal(container.children.length, 1);
  assert.equal(container.children[0].tagName, "svg");
  assert.equal(findByClass(container, "clock-widget"), null);
});
