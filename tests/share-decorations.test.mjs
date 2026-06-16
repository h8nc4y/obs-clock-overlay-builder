import assert from "node:assert/strict";
import test from "node:test";
import { normalizeConfig } from "../assets/js/config.js";
import { drawDigitalTemplateDecorations } from "../assets/js/share-decorations.js";
import { templateDecoration } from "../assets/js/share.js";

function createFakeContext() {
  const calls = [];
  const record = (name, ...args) => calls.push({ name, args });
  const ctx = {
    __stage: { cx: 600, cy: 340 },
    calls,
    save: () => record("save"),
    restore: () => record("restore"),
    beginPath: () => record("beginPath"),
    roundRect: (...args) => record("roundRect", ...args),
    clip: () => record("clip"),
    createLinearGradient: (...args) => {
      record("createLinearGradient", ...args);
      return {
        addColorStop: (...colorStopArgs) => record("addColorStop", ...colorStopArgs)
      };
    },
    fillRect: (...args) => record("fillRect", ...args),
    moveTo: (...args) => record("moveTo", ...args),
    lineTo: (...args) => record("lineTo", ...args),
    arc: (...args) => record("arc", ...args),
    ellipse: (...args) => record("ellipse", ...args),
    stroke: () => record("stroke"),
    fill: () => record("fill"),
    fillText: (...args) => record("fillText", ...args),
    translate: (...args) => record("translate", ...args),
    rotate: (...args) => record("rotate", ...args),
    measureText: (text) => ({ width: String(text).length * 10 })
  };
  return ctx;
}

function callNames(ctx) {
  return ctx.calls.map((call) => call.name);
}

function countCalls(ctx, name) {
  return callNames(ctx).filter((callName) => callName === name).length;
}

function drawTemplate(template, overrides = {}) {
  const ctx = createFakeContext();
  const config = normalizeConfig({
    template,
    textColor: "#112233",
    fontWeight: 700,
    ...overrides.config
  });
  drawDigitalTemplateDecorations(ctx, {
    config,
    decoration: templateDecoration(template),
    fontStack: '"Roboto Mono", system-ui, sans-serif',
    fit: 1,
    labelLine: overrides.labelLine ?? { text: "LIVE", y: 320, px: 28, width: 70, cx: 610 },
    panel: overrides.panel ?? { x: 240, y: 210, w: 720, h: 260, radius: 18 },
    scale: 2.4,
    timeLine: overrides.timeLine ?? { y: 350, px: 100, width: 300, cx: 600 }
  });
  return ctx;
}

test("drawDigitalTemplateDecorations returns early for plain templates", () => {
  const ctx = drawTemplate("mono-compact");

  assert.deepEqual(ctx.calls, []);
});

test("studio-live draws an underline stroke, filled badge, and white dot", () => {
  const ctx = drawTemplate("studio-live");

  assert.ok(countCalls(ctx, "stroke") >= 1);
  assert.ok(countCalls(ctx, "fill") >= 2);
  assert.ok(countCalls(ctx, "arc") >= 1);
  assert.equal(countCalls(ctx, "fillText"), 1);
});

test("neon-hud draws bracket strokes without underline or arcs", () => {
  const ctx = drawTemplate("neon-hud", { labelLine: null, timeLine: null });

  assert.equal(countCalls(ctx, "stroke"), 1);
  assert.equal(countCalls(ctx, "lineTo"), 4);
  assert.equal(countCalls(ctx, "arc"), 0);
  assert.equal(countCalls(ctx, "ellipse"), 0);
});

test("soda draws multiple bubble arcs", () => {
  const ctx = drawTemplate("soda", { labelLine: null, timeLine: null });

  assert.equal(countCalls(ctx, "arc"), 3);
  assert.equal(countCalls(ctx, "ellipse"), 0);
});

test("pastel-pop draws three dot arcs", () => {
  const ctx = drawTemplate("pastel-pop", { labelLine: null, timeLine: null });

  assert.equal(countCalls(ctx, "arc"), 3);
  assert.equal(countCalls(ctx, "ellipse"), 0);
});

test("sakura draws five petals and a center circle", () => {
  const ctx = drawTemplate("sakura", { labelLine: null, timeLine: null });

  assert.equal(countCalls(ctx, "ellipse"), 5);
  assert.equal(countCalls(ctx, "arc"), 1);
});

test("aqua-deck draws a clipped gradient top bar and filled badge", () => {
  const ctx = drawTemplate("aqua-deck");

  assert.equal(countCalls(ctx, "createLinearGradient"), 1);
  assert.equal(countCalls(ctx, "addColorStop"), 2);
  assert.equal(countCalls(ctx, "clip"), 1);
  assert.equal(countCalls(ctx, "fillRect"), 1);
  assert.equal(countCalls(ctx, "fillText"), 1);
  assert.ok(countCalls(ctx, "fill") >= 1);
});
