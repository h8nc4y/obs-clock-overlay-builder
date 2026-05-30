# CODEX_TASKS

## Status

Approved first-batch tasks were implemented in the current Codex run.

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

## Completed tasks

- T-00: Review coordination docs updated for completed Claude review and ChatGPT first-batch triage.
- T-01: `copyText()` fallback fixed to copy the provided `text` argument.
- T-02: Validation script naming and `npm test` `dist/` side effect documented.
- T-03: Existing product requirements and non-goals consolidated in `docs/PRODUCT_REQUIREMENTS.md`.
- T-04: `/api/defaults` `_headers` dependency and smoke-check guard documented.
