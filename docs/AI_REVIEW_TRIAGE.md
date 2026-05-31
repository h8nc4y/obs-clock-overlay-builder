# AI_REVIEW_TRIAGE

## Status

ChatGPT triage completed for the approved first-batch tasks and the approved second-batch follow-up scope.

Claude findings remain advisory. This file records ChatGPT's current decision state so Codex can implement only approved work.

## Triage rules

- Claude findings are advisory.
- ChatGPT is the decision-maker for review triage.
- Codex must implement only approved tasks.
- Deferred items must not be implemented unless ChatGPT later approves them.
- Rejected items must not be implemented unless ChatGPT later changes the decision.
- Items needing additional confirmation must not be implemented until the missing human/ChatGPT evidence is supplied.
- If a finding would change product requirements, deployment posture, cost exposure, security posture, public behavior, or dependencies, ChatGPT must explicitly approve the scope before Codex acts.
- Codex must not invent Claude findings, ChatGPT decisions, validation results, issue links, PR links, or commit hashes.

## Approved findings

### CG-001

- Finding ID: CG-001
- Reason for approval: Review coordination docs must reflect that Claude review output is present and ChatGPT triage has happened.
- Scope: Docs-only status and tracking updates.
- Implementation task: Update `docs/CLAUDE_REVIEW.md`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`, `docs/DECISION_LOG.md`, and related review handoff docs where they would otherwise be stale.
- Acceptance criteria: Docs no longer imply Claude review or ChatGPT triage is pending. Deferred or confirmation-needed findings are not marked as approved.
- Validation: Read the updated docs and check `git diff`.
- Priority: P1

### CL-001

- Finding ID: CL-001
- Reason for approval: `copyText()` fallback can copy the wrong text when Clipboard API fails.
- Scope: Small local bugfix only.
- Implementation task: Make the fallback copy the `text` argument, not always `elements.generatedUrl`.
- Acceptance criteria: URL copy and share text copy both use the requested text in fallback mode. Temporary DOM selection is cleaned up where practical. No unsafe HTML sinks are introduced.
- Validation: Add or update a lightweight test, run targeted test, then run local validation commands.
- Priority: P1

### CL-004

- Finding ID: CL-004
- Reason for approval: The names `lint` and `typecheck` can be misunderstood.
- Scope: Docs-only clarification.
- Implementation task: Clarify that `npm run lint` is a `node --check` syntax check and `npm run typecheck` is a module/import smoke check, not TypeScript type checking.
- Acceptance criteria: README or operations docs accurately describe the scripts without adding dependencies or changing package behavior.
- Validation: Read updated docs and run formatting checks.
- Priority: P2

### CL-006

- Finding ID: CL-006
- Reason for approval: Existing requirements and non-goals are spread across docs.
- Scope: Docs-only consolidation of existing requirements.
- Implementation task: Add a lightweight requirements/spec summary that consolidates existing requirements without introducing new product scope.
- Acceptance criteria: The summary includes OBS URL reproducibility, `/clock/` clock-only transparent surface, editor-only optional `localStorage`, static-first Cloudflare preference, no backend state/auth/database/paid bindings unless separately approved, no bundled fonts without license docs, input sanitization/no untrusted `innerHTML`, Japanese-first UX/docs, MVP system-time behavior, and manual QA limitations.
- Validation: Read updated doc and confirm it cites existing scope only.
- Priority: P2

### CL-008

- Finding ID: CL-008
- Reason for approval: `/api/defaults` JSON headers depend on `_headers`.
- Scope: Docs-only clarification.
- Implementation task: Clarify that `_headers` currently guarantees JSON `Content-Type` and `Cache-Control: no-store`, and smoke checks monitor this.
- Acceptance criteria: Docs state the `_headers` dependency and smoke-check coverage without changing deployment behavior.
- Validation: Read updated docs and run formatting checks.
- Priority: P2

### CL-009

- Finding ID: CL-009
- Reason for approval: `npm test` has a local write side effect through build tests.
- Scope: Docs-only clarification.
- Implementation task: Clarify that `npm test` may generate `dist/` through `tests/build.test.mjs`, and `dist/` is ignored local output.
- Acceptance criteria: Docs no longer imply `npm test` is purely read-only.
- Validation: Read updated docs and run formatting checks.
- Priority: P2

### CL-003

- Finding ID: CL-003
- Reason for approval: ChatGPT approved fixing the editor-only URL versus `localStorage` priority edge case after the first batch was preserved in a local commit.
- Scope: Small editor startup bugfix only. Preserve `/clock/` behavior and do not change product requirements.
- Implementation task: Treat the presence of a recognized URL config query as authoritative, even when it decodes to the default config, and fall back to saved editor state only when no recognized config query is present.
- Acceptance criteria: An explicit default-equivalent URL config wins over saved editor state; no-query editor loads may still use saved editor state; malformed explicit config falls back safely to defaults rather than saved state.
- Validation: Add a targeted unit test for the extracted startup decision helper, run the targeted test, then run local validation commands.
- Priority: P1

### CL-005 narrow slice

- Finding ID: CL-005 narrow slice
- Reason for approval: ChatGPT approved a narrow test slice around `builder.js` behavior, without broad refactor, new dependencies, or DOM harness work.
- Scope: Extract only the pure editor startup config-source decision needed for CL-003 and cover it with Node tests.
- Implementation task: Add `assets/js/builder-initial-config.js`, wire `assets/js/builder.js` to it, and add targeted tests in `tests/builder-initial-config.test.mjs`.
- Acceptance criteria: The test suite covers URL priority, saved editor-state fallback, malformed explicit URL fallback, and flat query priority without changing application behavior outside the approved startup path.
- Validation: `node --test tests\builder-initial-config.test.mjs`, then local validation commands.
- Priority: P2

### CL-002

- Finding ID: CL-002
- Reason for approval: ChatGPT approved only the reproduced Neon HUD glow clipping fix after local evidence showed `.clock-widget` at the viewport origin with an 18px glow.
- Scope: Add a small `/clock/` visual safe inset for glow-heavy templates and keep the editor's recommended OBS size calculation aligned with that inset.
- Implementation task: Add a shared 18px visual safe inset in `assets/css/styles.css` and `assets/js/render.js`, then cover the CSS and recommended-size behavior with focused tests.
- Acceptance criteria: `/clock/` remains clock-only and transparent; generated `/clock/?c=...` URLs remain the source of truth; Neon HUD has origin-side visual clearance; no editor redesign, font bundling, dependency change, deploy, or unrelated layout change.
- Validation: `node --test tests\render.test.mjs tests\ui-static.test.mjs`, local validation commands, and local browser/headless screenshot evidence.
- Priority: P1
- Implementation status: Implemented locally by Codex; pending OBS real-device verification.

## Deferred findings

### CL-005 broader scope

- Finding ID: CL-005
- Reason for deferral: ChatGPT approved only a narrow helper extraction and regression tests for the editor startup config-source decision. Broader builder testing/refactor remains outside the current scope.
- Information needed: ChatGPT-approved scope for additional builder logic extraction, DOM/test harness work, or UI automation.
- Revisit condition: Reopen when broader test/refactor scope is explicitly approved.

## Needs additional confirmation

### CL-002

- Finding ID: CL-002
- Reason confirmation is needed: The narrow local fix is implemented, but OBS real-device behavior has not been verified.
- Evidence gathered: 2026-05-31 local browser/headless evidence shows the post-fix Neon HUD clock rendered with visible top/left clearance and `--clock-shadow: 0px 0px 18px rgba(47, 255, 230, 0.58)`. Screenshots were saved only under ignored `browser-temp/`. See `docs/LOCAL_REVIEW_VERIFICATION.md`.
- Information needed: OBS real-device confirmation using a generated `/clock/?c=...` URL and the editor's recommended width/height.
- Revisit condition: Reopen if OBS still clips glow, if the recommended size is insufficient in OBS, or if ChatGPT approves a broader visual/layout change.

### CL-007

- Finding ID: CL-007
- Reason confirmation is needed: Commit/publication policy for AI coordination docs and operation metadata is a human/ChatGPT governance decision.
- Information available: A local decision packet now exists at `docs/CL007_AI_COORDINATION_DOCS_DECISION_PACKET.md`.
- Information needed: Whether to track as-is in a private repo, track redacted copies, split public/private docs, or ignore AI coordination docs.
- Revisit condition: Reopen when the user or ChatGPT decides the policy.

## Rejected for this batch

### Deploy or rollback operations

- Finding ID: batch-scope
- Reason for rejection: This batch is local code/docs only and must not change production or staging infrastructure.
- Risk accepted: Deployment state remains unchanged.
- Notes: Do not run deploy, rollback, remote smoke, Cloudflare dashboard, or Cloudflare API operations in this batch.

### Dependency-adding lint/type tooling

- Finding ID: CL-004 extension
- Reason for rejection: The approved CL-004 scope is docs-only. Adding ESLint, TypeScript, or other tooling would change dependency/package behavior.
- Risk accepted: Existing scripts remain syntax/import smoke checks.
- Notes: Future dependency changes require separate approval.

### Visual CSS changes without evidence (historical)

- Finding ID: CL-002 extension
- Reason for rejection: Historical first-batch rejection before local reproduction and ChatGPT's narrow CL-002 approval.
- Risk accepted: No risk is accepted for the approved narrow CL-002 safe-inset fix. Broader visual redesign or unrelated layout/CSS changes remain unapproved.
- Notes: Do not implement additional visual/layout changes beyond the approved CL-002 safe-inset fix unless ChatGPT approves them.

## Open questions

- Should AI coordination docs be committed, ignored, or redacted? This remains CL-007.
- Has CL-002 been verified in OBS with a real browser source and generated `/clock/?c=...` URL?
- Should broader CL-005 builder testing/refactor work be scheduled for a later batch?
