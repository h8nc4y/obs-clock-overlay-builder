# CODEX_TASKS

## Status

Approved first-batch tasks were implemented in the first local commit on `approved-review-followups`. Approved second-batch follow-up tasks CL-003 and the narrow CL-005 test slice were implemented in the current Codex run.

## Source of truth

This file is generated from `docs/AI_REVIEW_TRIAGE.md` approved items only.

Claude review suggestions are not implementation instructions by themselves. ChatGPT must first approve a finding, define scope, and provide acceptance criteria. Codex then implements only that approved task scope.

## Rules for Codex

- Implement only approved tasks.
- Do not implement unapproved Claude suggestions.
- Do not change product requirements unless explicitly instructed.
- Preserve the `/clock/?c=...` OBS reproducibility contract.
- Preserve `/clock/` as a transparent, clock-only surface.
- Do not expose secrets, tokens, OAuth credentials, private account identifiers, or real user/customer data.
- Do not run interactive commands.
- Use non-interactive commands with timeouts or bounded execution.
- Do not run foreground dev servers, watch commands, `tail -f`, infinite loops, or sleep loops.
- Do not invent validation results.
- Report changed files and commands run.
- Report skipped checks and residual risk clearly.
- Keep source, tests, docs, config, deployment files, and dependencies unchanged unless the approved task requires them.

## Task template

For each task:

### Task ID

### Priority

P0 / P1 / P2 / P3

### Source finding

Claude finding ID or ChatGPT decision reference.

### Goal

### Scope

### Files likely affected

### Implementation plan

### Acceptance criteria

### Validation commands

### Out of scope

### Risks

### Completion notes

## Approved task queue

### T-00

### Priority

P1

### Source finding

CG-001 and ChatGPT triage instruction.

### Goal

Update review coordination docs so they reflect that Claude review is complete and ChatGPT triage has been performed.

### Scope

Docs-only updates to review coordination files. Do not mark deferred, confirmation-needed, or rejected items as approved.

### Files likely affected

- `docs/CLAUDE_REVIEW.md`
- `docs/AI_REVIEW_TRIAGE.md`
- `docs/CODEX_TASKS.md`
- `docs/DECISION_LOG.md`
- `docs/REVIEW_BRIEF.md`
- `docs/CHATGPT_HANDOFF.md`

### Implementation plan

1. Remove stale pending status where Claude review output or ChatGPT triage is already present.
2. Record approved, deferred, confirmation-needed, and rejected-for-batch decisions separately.
3. Append decision-log entries for first-batch triage.

### Acceptance criteria

Docs clearly show that Claude review and ChatGPT triage have happened. Codex task scope includes approved first-batch work only.

### Validation commands

- `git diff --check`
- Read updated docs.

### Out of scope

- Committing or pushing docs.
- Resolving CL-002 or CL-007.

### Risks

Docs could overstate approval status if deferred items are mixed into approved scope.

### Completion notes

Completed in the current Codex run. Review coordination docs now distinguish approved, deferred, confirmation-needed, and rejected-for-batch findings.

### T-01

### Priority

P1

### Source finding

CL-001

### Goal

Fix `copyText()` fallback so fallback copy uses the function argument text.

### Scope

Small local bugfix in editor copy fallback behavior plus a lightweight regression test.

### Files likely affected

- `assets/js/builder.js`
- `tests/ui-static.test.mjs`

### Implementation plan

1. Add a regression test that fails while fallback always selects `generatedUrl`.
2. Replace generated-URL-specific fallback with a safe temporary text selection based on the `text` argument.
3. Clean up the temporary element and selection.

### Acceptance criteria

URL copy and share text copy both use the requested `text` argument in fallback mode. No untrusted `innerHTML` or equivalent risky sink is introduced.

### Validation commands

- `node --test tests\ui-static.test.mjs`
- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm run test`
- `npm run build`

### Out of scope

- Broad builder refactor.
- Full clipboard browser automation.

### Risks

Static regression test is intentionally lightweight and does not replace manual browser fallback QA.

### Completion notes

Completed in the current Codex run. `copyText()` fallback now copies the function argument through a temporary textarea fallback, and a lightweight regression test covers the stale generated-URL fallback pattern.

### T-02

### Priority

P2

### Source finding

CL-004 and CL-009

### Goal

Clarify docs for `npm run lint`, `npm run typecheck`, and `npm test` side effects.

### Scope

Docs-only clarification.

### Files likely affected

- `README.md`
- `docs/post-launch-ops.md`
- `docs/PRODUCT_REQUIREMENTS.md`

### Implementation plan

1. State that `npm run lint` is `node --check` syntax checking.
2. State that `npm run typecheck` is module/import smoke, not TypeScript type checking.
3. State that `npm test` can generate ignored `dist/` output through build tests.

### Acceptance criteria

Docs do not overstate local validation as full linting or TypeScript checking, and they identify the `dist/` side effect.

### Validation commands

- `npm run format:check`
- `git diff --check`

### Out of scope

- Adding ESLint, TypeScript, or dependencies.
- Changing package scripts.

### Risks

None beyond documentation drift.

### Completion notes

Completed in the current Codex run. README and operations docs now describe `lint`, `typecheck`, and `npm test` side effects.

### T-03

### Priority

P2

### Source finding

CL-006

### Goal

Add a lightweight product requirements/spec summary that consolidates existing requirements only.

### Scope

Docs-only requirement consolidation.

### Files likely affected

- `docs/PRODUCT_REQUIREMENTS.md`
- `README.md`
- `docs/REVIEW_BRIEF.md`

### Implementation plan

1. Add `docs/PRODUCT_REQUIREMENTS.md`.
2. Include only existing requirements, non-goals, validation expectations, and manual QA limitations.
3. Avoid adding new product requirements or scope.

### Acceptance criteria

The doc captures known product contracts without introducing backend state, auth, database, paid bindings, bundled fonts, or new features.

### Validation commands

- `npm run format:check`
- `git diff --check`

### Out of scope

- New requirements.
- Feature implementation.

### Risks

The summary could become stale if future product decisions are not reflected.

### Completion notes

Completed in the current Codex run. `docs/PRODUCT_REQUIREMENTS.md` consolidates existing requirements and non-goals without adding new product scope.

### T-04

### Priority

P2

### Source finding

CL-008

### Goal

Clarify that `/api/defaults` JSON `Content-Type` is currently guaranteed by `_headers` and monitored by smoke checks.

### Scope

Docs-only clarification.

### Files likely affected

- `README.md`
- `docs/manual-qa.md`
- `docs/post-launch-ops.md`
- `docs/PRODUCT_REQUIREMENTS.md`

### Implementation plan

1. Document `_headers` as the source of `/api/defaults` JSON `Content-Type` and `Cache-Control: no-store`.
2. Document smoke checks as the guard for this deployment assumption.

### Acceptance criteria

Docs explicitly connect `_headers` and smoke checks to `/api/defaults` header correctness.

### Validation commands

- `npm run format:check`
- `git diff --check`

### Out of scope

- Deployment changes.
- Remote smoke, staging deploy, production deploy, rollback.

### Risks

Header correctness still depends on running smoke checks in deploy workflows.

### Completion notes

Completed in the current Codex run. README, manual QA, operations docs, and product requirements now describe the `_headers` dependency and smoke-check guard for `/api/defaults` headers.

### T-05

### Priority

P1

### Source finding

CL-003

### Goal

Fix the editor startup priority edge case where an explicit URL config matching defaults can be overridden by saved editor `localStorage`.

### Scope

Small editor-only startup behavior fix. Preserve `/clock/` behavior, generated URL format, product requirements, deployment files, dependencies, and broad UI behavior.

### Files likely affected

- `assets/js/builder.js`
- `assets/js/builder-initial-config.js`
- `tests/builder-initial-config.test.mjs`

### Implementation plan

1. Extract the initial editor config-source decision into a pure helper.
2. Treat recognized config query keys as explicit URL config intent.
3. Use saved editor state only when no recognized config query is present.
4. Fall back to defaults when an explicit malformed config query is present.

### Acceptance criteria

Explicit URL config wins over saved editor state even if it decodes to defaults. No-query editor loads can still use saved editor state. Malformed explicit URL config falls back safely to defaults.

### Validation commands

- `node --test tests\builder-initial-config.test.mjs`
- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm run test`
- `npm run build`

### Out of scope

- `/clock/` behavior changes.
- CSS/layout changes.
- Broad builder refactor.
- Dependency changes.

### Risks

The helper must stay aligned with config query aliases supported by `assets/js/config.js`.

### Completion notes

Completed in the current Codex run. `assets/js/builder.js` now delegates startup config selection to `assets/js/builder-initial-config.js`, and explicit recognized config queries take priority over saved editor state.

### T-06

### Priority

P2

### Source finding

CL-005 narrow slice

### Goal

Add a small automated test slice around the approved builder startup behavior without taking on the broader CL-005 refactor.

### Scope

Targeted Node tests for the pure initial config-source helper only.

### Files likely affected

- `tests/builder-initial-config.test.mjs`
- `assets/js/builder-initial-config.js`

### Implementation plan

1. Add tests for default-equivalent URL priority, saved-state fallback, malformed explicit config fallback, and flat query priority.
2. Keep tests independent of browser DOM harnesses or new dependencies.
3. Run the targeted test and repository validation commands.

### Acceptance criteria

The approved CL-003 behavior has direct regression coverage. Broader builder UI behavior remains deferred unless ChatGPT approves it later.

### Validation commands

- `node --test tests\builder-initial-config.test.mjs`
- `npm run test`

### Out of scope

- Full `builder.js` DOM test harness.
- Clipboard, canvas, local font, or preview background automation.
- New test dependencies.

### Risks

This narrow test slice does not replace manual QA for actual browser editor workflows.

### Completion notes

Completed in the current Codex run. `tests/builder-initial-config.test.mjs` covers four initial config-source cases.

## Completed tasks

- T-00: Review coordination docs updated for completed Claude review and ChatGPT first-batch triage.
- T-01: `copyText()` fallback fixed to copy the provided `text` argument.
- T-02: Validation script naming and `npm test` `dist/` side effect documented.
- T-03: Existing product requirements and non-goals consolidated in `docs/PRODUCT_REQUIREMENTS.md`.
- T-04: `/api/defaults` `_headers` dependency and smoke-check guard documented.
- T-05: Editor startup URL config priority fixed for default-equivalent explicit URL configs.
- T-06: Narrow builder startup config-source tests added for CL-003 behavior.

## Evidence Recorded, Not Queued

- CL-002: Local browser evidence reproduced Neon HUD top/left glow clipping on `/clock/`. This is evidence only; no CSS/layout task is approved or queued. See `docs/LOCAL_REVIEW_VERIFICATION.md`.
- CL-007: A decision packet exists at `docs/CL007_AI_COORDINATION_DOCS_DECISION_PACKET.md`. This is decision support only; Codex must not choose the publication/tracking policy.
