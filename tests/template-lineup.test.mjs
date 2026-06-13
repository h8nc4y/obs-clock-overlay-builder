import assert from "node:assert/strict";
import test from "node:test";
import { TEMPLATES, applyTemplate, cloneDefaultConfig, normalizeConfig } from "../assets/js/config.js";

const KNOWN_CATEGORIES = new Set(["standard", "cute", "cool", "analog"]);
const NEW_TEMPLATE_IDS = ["studio-live", "aqua-deck", "analog-navy", "analog-mono"];

test("template lineup has unique ids and known categories", () => {
  const ids = TEMPLATES.map((template) => template.id);
  assert.equal(new Set(ids).size, ids.length, "template ids must be unique");
  assert.equal(TEMPLATES.length, 12);
  for (const template of TEMPLATES) {
    assert.ok(KNOWN_CATEGORIES.has(template.category), `unknown category for ${template.id}`);
    assert.ok(template.name, `name required for ${template.id}`);
    assert.ok(template.note, `note required for ${template.id}`);
    assert.ok(template.sampleText, `sampleText required for ${template.id}`);
  }
});

test("new templates resolve through normalizeConfig without fallback", () => {
  for (const id of NEW_TEMPLATE_IDS) {
    const applied = applyTemplate(cloneDefaultConfig(), id);
    assert.equal(applied.template, id);
    assert.equal(normalizeConfig(applied).template, id, `normalize must keep ${id}`);
  }
});

test("new template presets stay inside number limits", () => {
  for (const id of NEW_TEMPLATE_IDS) {
    const template = TEMPLATES.find((entry) => entry.id === id);
    const normalized = normalizeConfig({ ...cloneDefaultConfig(), ...template.config, template: id });
    for (const [key, value] of Object.entries(template.config)) {
      if (typeof value === "number") {
        assert.equal(normalized[key], value, `${id}.${key} must survive clamping unchanged`);
      }
    }
  }
});
