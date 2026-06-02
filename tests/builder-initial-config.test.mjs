import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_CONFIG, encodeConfig, normalizeConfig } from "../assets/js/config.js";
import { loadInitialConfigFromSources } from "../assets/js/builder-initial-config.js";

test("explicit default-equivalent URL config wins over localStorage", () => {
  const saved = JSON.stringify(normalizeConfig({ label: "保存済み", timezone: "UTC", showDate: true }));
  const href = `https://example.com/?c=${encodeConfig(DEFAULT_CONFIG)}`;

  const config = loadInitialConfigFromSources({
    href,
    search: new URL(href).search,
    getSavedConfig: () => saved
  });

  assert.deepEqual(config, DEFAULT_CONFIG);
});

test("no-query editor load may use localStorage", () => {
  const savedConfig = normalizeConfig({ label: "保存済み", timezone: "UTC", showDate: true });

  const config = loadInitialConfigFromSources({
    href: "https://example.com/",
    search: "",
    getSavedConfig: () => JSON.stringify(savedConfig)
  });

  assert.equal(config.label, "保存済み");
  assert.equal(config.timezone, "UTC");
  assert.equal(config.showDate, true);
});

test("invalid URL config source falls back safely instead of localStorage", () => {
  const saved = JSON.stringify(normalizeConfig({ label: "保存済み", timezone: "UTC", showDate: true }));

  const config = loadInitialConfigFromSources({
    href: "https://example.com/?c=not-valid-config",
    search: "?c=not-valid-config",
    getSavedConfig: () => saved
  });

  assert.deepEqual(config, DEFAULT_CONFIG);
});

test("flat config query also wins over localStorage", () => {
  const saved = JSON.stringify(normalizeConfig({ label: "保存済み", showDate: true }));

  const config = loadInitialConfigFromSources({
    href: "https://example.com/?tz=UTC&seconds=0",
    search: "?tz=UTC&seconds=0",
    getSavedConfig: () => saved
  });

  assert.equal(config.timezone, "UTC");
  assert.equal(config.showSeconds, false);
  assert.equal(config.label, DEFAULT_CONFIG.label);
});
