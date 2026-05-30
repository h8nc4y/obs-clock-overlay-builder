# AI_REVIEW_TRIAGE

## Status

ChatGPT triage completed for the approved first-batch tasks.

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

## Deferred findings

### CL-003

- Finding ID: CL-003
- Reason for deferral: The issue is a rare editor-only `localStorage` precedence edge case and is not part of this first batch.
- Information needed: ChatGPT decision that the edge case is worth changing now.
- Revisit condition: Reopen when editor import/URL precedence work is prioritized.

### CL-005

- Finding ID: CL-005
- Reason for deferral: Broader builder testing/refactor is valuable but outside this first batch. A tiny test that directly protects CL-001 is allowed.
- Information needed: ChatGPT-approved scope for builder logic extraction or broader DOM/test harness work.
- Revisit condition: Reopen when test/refactor scope is explicitly approved.

## Needs additional confirmation

### CL-002

- Finding ID: CL-002
- Reason confirmation is needed: The visual clipping concern needs browser/OBS evidence before any CSS/layout change.
- Information needed: Screenshot or manual visual QA showing actual clipping, affected templates, and desired behavior.
- Revisit condition: Reopen after visual evidence and ChatGPT approval.

### CL-007

- Finding ID: CL-007
- Reason confirmation is needed: Commit/publication policy for AI coordination docs and operation metadata is a human/ChatGPT governance decision.
- Information needed: Whether to track, ignore, redact, or split the AI coordination and operation metadata docs.
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

### Visual CSS changes without evidence

- Finding ID: CL-002 extension
- Reason for rejection: CL-002 needs visual confirmation before changing layout or CSS.
- Risk accepted: Potential clipping remains a deferred visual QA item.
- Notes: Do not implement layout/CSS changes in this batch.

## Open questions

- Should AI coordination docs be committed, ignored, or redacted? This remains CL-007.
- Should CL-002 be verified with Browser/OBS before a future visual patch?
- Should CL-003 and broader CL-005 work be scheduled for a later batch?
