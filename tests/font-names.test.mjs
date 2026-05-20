import assert from "node:assert/strict";
import test from "node:test";
import { createLocalFontOption, localFontCssValue, localFontDisplayName } from "../assets/js/font-names.js";

test("local font option shows LightNovelPopV2 V2 with Japanese display name", () => {
  const option = createLocalFontOption({
    family: "LightNovelPopV2 V2",
    fullName: "LightNovelPopV2 V2",
    postscriptName: "LightNovelPopV2V2-Regular",
    style: "Regular"
  });

  assert.equal(option.value, "LightNovelPopV2 V2");
  assert.equal(option.displayName, "ラノベPOP v2");
  assert.equal(option.label, "ラノベPOP v2（LightNovelPopV2 V2）");
  assert.match(option.searchText, /ラノベpop v2/i);
  assert.match(option.searchText, /lightnovelpopv2 v2/);
  assert.match(option.searchText, /lightnovelpopv2v2-regular/);
});

test("local font option keeps actual CSS family separate from full name", () => {
  const option = createLocalFontOption({
    family: "LightNovelPopV2",
    fullName: "LightNovelPopV2 V2",
    postscriptName: "LightNovelPopV2V2-Regular",
    style: "Regular"
  });

  assert.equal(option.value, "LightNovelPopV2");
  assert.equal(option.displayName, "ラノベPOP v2");
  assert.equal(option.label, "ラノベPOP v2（LightNovelPopV2）");
  assert.match(option.searchText, /lightnovelpopv2 v2/);
});

test("known Japanese Windows fonts get friendly display names", () => {
  assert.equal(localFontDisplayName({ family: "Meiryo" }), "メイリオ");
  assert.equal(localFontDisplayName({ family: "Yu Gothic UI" }), "游ゴシック UI");
  assert.equal(localFontDisplayName({ family: "YuMincho" }), "游明朝");
  assert.equal(localFontDisplayName({ family: "BIZ UDPGothic" }), "BIZ UDPゴシック");
  assert.equal(localFontDisplayName({ family: "BIZ UDPMincho" }), "BIZ UDP明朝");
});

test("unknown local font names remain unchanged", () => {
  const option = createLocalFontOption({
    family: "Streamer Custom Sans",
    fullName: "Streamer Custom Sans Regular",
    postscriptName: "StreamerCustomSans-Regular",
    style: "Regular"
  });

  assert.equal(option.value, "Streamer Custom Sans");
  assert.equal(option.displayName, "Streamer Custom Sans");
  assert.equal(option.label, "Streamer Custom Sans");
  assert.match(option.searchText, /streamer custom sans regular/);
});

test("local font CSS value falls back to fullName then postscriptName", () => {
  assert.equal(localFontCssValue({ fullName: "Full Name Only", postscriptName: "PostScriptOnly" }), "Full Name Only");
  assert.equal(localFontCssValue({ postscriptName: "PostScriptOnly" }), "PostScriptOnly");
  assert.equal(localFontCssValue({ family: "  Trimmed Family  " }), "Trimmed Family");
});
