import assert from "node:assert/strict";
import { test } from "node:test";
import { formatCheckFailure } from "../scripts/check-js.mjs";

test("node --check の起動エラーを診断文字列として返す", () => {
  const message = formatCheckFailure("scripts/check-js.mjs", {
    error: new Error("spawnSync node EPERM"),
    status: null,
    stdout: undefined,
    stderr: undefined,
  });

  assert.match(message, /scripts\/check-js\.mjs/);
  assert.match(message, /spawnSync node EPERM/);
  assert.match(message, /\n$/);
});
