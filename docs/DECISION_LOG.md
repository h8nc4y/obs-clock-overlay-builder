# DECISION_LOG

## Purpose

This file records important product, architecture, review, and AI coordination decisions over time.

Use it to preserve context across ChatGPT, Claude Code, Codex, GitHub, and future repository maintenance. Do not record secrets, tokens, OAuth credentials, payment details, private account identifiers, or raw customer/user data.

## Decision format

Use this template for future decisions.

- Date:
- Decision:
- Context:
- Options considered:
- Rationale:
- Consequences:
- Status:
- Related files:
- Related review findings:

## Initial decisions

### 2026-05-29: ChatGPT remains commander for review triage

- Date: 2026-05-29
- Decision: ChatGPT remains the decision-maker for accepting, deferring, or rejecting review findings.
- Context: This repository is developed through ChatGPT and Codex, and will later be reviewed by Claude Code.
- Options considered:
  - Let Claude Code directly control implementation.
  - Let Codex implement all Claude suggestions automatically.
  - Keep ChatGPT as commander and require explicit triage before implementation.
- Rationale: The requested governance flow keeps one decision authority and prevents unreviewed suggestions from changing behavior, deployment posture, cost exposure, or product requirements.
- Consequences: Claude findings must be copied into `docs/CLAUDE_REVIEW.md`, then triaged in `docs/AI_REVIEW_TRIAGE.md` before Codex implementation.
- Status: Active.
- Related files: `docs/CLAUDE_REVIEW.md`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`
- Related review findings: None yet.

### 2026-05-29: Claude Code is an independent reviewer

- Date: 2026-05-29
- Decision: Claude Code will be used as an independent reviewer, not as an autonomous editor for this workflow.
- Context: The user plans to ask Claude Code to review the repository after Codex prepares review context documents.
- Options considered:
  - Review only.
  - Review and edit directly.
  - Skip Claude review.
- Rationale: Review-only use allows a second AI system to inspect risks while preserving ChatGPT-led triage and Codex-led implementation discipline.
- Consequences: Claude should not edit files unless the user later gives explicit instructions. Claude output should be stored as review evidence, not treated as accepted work.
- Status: Active.
- Related files: `docs/CLAUDE_REVIEW.md`, `CLAUDE.md`, `AGENTS.md`
- Related review findings: None yet.

### 2026-05-29: Codex implements only ChatGPT-approved tasks

- Date: 2026-05-29
- Decision: Codex must implement only tasks derived from ChatGPT-approved review findings.
- Context: The workflow requires Claude findings to be triaged into approved, deferred, and rejected items before implementation.
- Options considered:
  - Let Codex choose from all Claude suggestions.
  - Let Codex implement only approved findings.
  - Keep all review findings as documentation only.
- Rationale: This keeps implementation scope explicit and prevents accidental adoption of speculative, low-confidence, or out-of-scope review comments.
- Consequences: `docs/CODEX_TASKS.md` must be populated only from approved items in `docs/AI_REVIEW_TRIAGE.md`.
- Status: Active.
- Related files: `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`
- Related review findings: None yet.

### 2026-05-29: Claude review findings are not automatically accepted

- Date: 2026-05-29
- Decision: Claude review findings are advisory until ChatGPT triages them.
- Context: Claude may produce useful findings, false positives, scope-expanding suggestions, or ideas that conflict with project constraints.
- Options considered:
  - Accept all findings by default.
  - Reject all findings by default.
  - Treat findings as advisory and require explicit triage.
- Rationale: Advisory review preserves useful external critique while avoiding blind implementation.
- Consequences: Deferred and rejected findings stay out of Codex task scope unless ChatGPT later changes their status.
- Status: Active.
- Related files: `docs/CLAUDE_REVIEW.md`, `docs/AI_REVIEW_TRIAGE.md`
- Related review findings: None yet.

### 2026-05-29: AI coordination docs preserve context across tools

- Date: 2026-05-29
- Decision: `REVIEW_BRIEF`, `CLAUDE_REVIEW`, `AI_REVIEW_TRIAGE`, `CODEX_TASKS`, and `DECISION_LOG` are used as durable handoff documents across ChatGPT, Claude Code, and Codex.
- Context: The user requested repository-specific documents to support a ChatGPT -> Claude -> ChatGPT -> Codex review-management loop.
- Options considered:
  - Keep all context in chat only.
  - Store only Claude review output.
  - Store review context, raw review, triage decisions, implementation queue, and durable decisions in separate files.
- Rationale: Separate files make the workflow auditable, reduce context loss, and distinguish evidence, advice, decisions, and implementation tasks.
- Consequences: These files should be updated as the review progresses, and fake review findings or fake triage decisions must not be added.
- Status: Active.
- Related files: `docs/REVIEW_BRIEF.md`, `docs/CLAUDE_REVIEW.md`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`, `docs/DECISION_LOG.md`
- Related review findings: None yet.

### 2026-05-30: ChatGPT triaged Claude review first batch

- Date: 2026-05-30
- Decision: ChatGPT approved only the first-batch items CG-001, CL-001, CL-004 docs-only, CL-006 docs-only, CL-008 docs-only, and CL-009 docs-only for Codex implementation.
- Context: Claude Code completed an independent read-only review. ChatGPT triaged the review before asking Codex to implement anything.
- Options considered:
  - Implement all Claude findings.
  - Implement only ChatGPT-approved first-batch findings.
  - Defer all findings.
- Rationale: The approved set addresses a concrete fallback copy bug and documentation/governance clarity without taking on visual changes, broad refactors, dependencies, deployment, or unresolved publication policy decisions.
- Consequences: Codex may implement T-00 through T-04 only. Deferred, confirmation-needed, and rejected-for-batch items stay out of scope.
- Status: Active.
- Related files: `docs/CLAUDE_REVIEW.md`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`
- Related review findings: CG-001, CL-001, CL-004, CL-006, CL-008, CL-009

### 2026-05-30: Product requirements summary consolidates existing scope only

- Date: 2026-05-30
- Decision: Add a lightweight product requirements summary that consolidates existing requirements and non-goals without creating new product scope.
- Context: Claude finding CL-006 noted that requirements and non-goals were spread across README, AGENTS, QA docs, backlog, and review docs.
- Options considered:
  - Leave requirements distributed.
  - Add a new heavy specification process.
  - Add a lightweight summary of existing scope only.
- Rationale: A lightweight summary reduces future AI/human misunderstanding while preserving the current product contracts and avoiding scope expansion.
- Consequences: Future product changes should update `docs/PRODUCT_REQUIREMENTS.md` alongside the source docs when relevant.
- Status: Active.
- Related files: `docs/PRODUCT_REQUIREMENTS.md`, `README.md`, `AGENTS.md`, `docs/manual-qa.md`, `docs/post-launch-ops.md`
- Related review findings: CL-006

### 2026-05-30: ChatGPT approved CL-003 and a narrow CL-005 test slice

- Date: 2026-05-30
- Decision: ChatGPT approved a second local implementation batch for CL-003 and only the narrow CL-005 test slice needed to cover that startup behavior.
- Context: The first-batch work was preserved in a local commit. ChatGPT then approved fixing the editor-only `loadInitialConfig()` URL versus `localStorage` priority edge case and adding small automated coverage around that behavior.
- Options considered:
  - Leave CL-003 deferred.
  - Implement CL-003 with a minimal helper and tests.
  - Expand into broader `builder.js` refactor or DOM test harness work.
- Rationale: The approved scope addresses a concrete, low-risk editor startup inconsistency while avoiding broad refactor, dependency changes, CSS/layout work, or unapproved Claude suggestions.
- Consequences: Codex may change `assets/js/builder.js`, add a focused pure helper, and add targeted tests. Broader CL-005 work, CL-002 visual changes, and CL-007 publication policy remain outside implementation scope.
- Status: Active.
- Related files: `assets/js/builder.js`, `assets/js/builder-initial-config.js`, `tests/builder-initial-config.test.mjs`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`
- Related review findings: CL-003, CL-005

### 2026-05-31: Local verification and decision evidence recorded

- Date: 2026-05-31
- Decision: Record local-only verification evidence, CL-002 visual evidence, and a CL-007 decision packet without implementing CL-002 or deciding CL-007.
- Context: ChatGPT asked Codex to review the completed local commits, run local-only validation, gather CL-002 evidence, and prepare CL-007 decision material. Push, PR, deploy, rollback, remote smoke, Cloudflare dashboard/API, GitHub Actions operations, dependency installs, and external API calls were out of scope.
- Options considered:
  - Only report evidence in chat.
  - Record local verification and decision material in repository docs.
  - Implement CL-002 or decide CL-007 directly.
- Rationale: Repository docs preserve evidence for ChatGPT review while respecting that CL-002 implementation was not approved at that time and that CL-007 remains a human/ChatGPT decision.
- Consequences: `docs/LOCAL_REVIEW_VERIFICATION.md` and `docs/CL007_AI_COORDINATION_DOCS_DECISION_PACKET.md` should be used as evidence packets. This decision did not authorize CSS/layout changes, publication decisions, push, PR, or deploy.
- Status: Historical evidence record; CL-002 implementation was later approved narrowly, while the CL-007 decision remains open.
- Related files: `docs/LOCAL_REVIEW_VERIFICATION.md`, `docs/CL007_AI_COORDINATION_DOCS_DECISION_PACKET.md`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`
- Related review findings: CL-002, CL-007

### 2026-05-31: ChatGPT approved narrow CL-002 local fix

- Date: 2026-05-31
- Decision: Implement only the ChatGPT-approved CL-002 Neon HUD glow-clipping fix locally.
- Context: Local browser evidence reproduced Neon HUD clipping at the `/clock/` viewport origin. ChatGPT then approved CL-002 implementation only and explicitly excluded CL-007 final decision, broad CL-005 work, deploy/rollback/remote smoke, dependency changes, CI, and unrelated UI redesign.
- Options considered:
  - Leave CL-002 as evidence only.
  - Add a narrow visual safe inset for `/clock/` and align recommended OBS sizing.
  - Redesign the clock/editor layout more broadly.
- Rationale: A shared 18px visual safe inset addresses the reproduced glow clipping with a small, testable change while preserving generated URL reproducibility and the clock-only transparent surface.
- Consequences: `/clock/` now reserves local visual clearance around glow-heavy templates, and `recommendedObsSize()` uses the same inset on both axes. OBS real-device verification is still required before treating CL-002 as production-verified.
- Status: Implemented locally; OBS real-device verification pending.
- Related files: `assets/css/styles.css`, `assets/js/render.js`, `tests/render.test.mjs`, `tests/ui-static.test.mjs`, `docs/LOCAL_REVIEW_VERIFICATION.md`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`, `docs/manual-qa.md`
- Related review findings: CL-002

### 2026-05-31: PR #19 remains draft until review gates are satisfied

- Date: 2026-05-31
- Decision: Keep PR #19 as a draft review-followup PR until human/ChatGPT gates are satisfied or explicitly waived.
- Context: PR #19 now contains ChatGPT-approved first-batch work, CL-003, a narrow CL-005 test slice, the narrow CL-002 local safe-inset fix, and CL-007 decision evidence. Local validation and local browser/headless evidence exist, but OBS real-device verification remains pending and CL-007 public/private documentation policy is not fully decided.
- Options considered:
  - Mark the PR ready and merge based on local validation only.
  - Keep the PR draft until OBS verification and CL-007 gates are resolved.
  - Split all docs and implementation work into separate PRs after the fact.
- Rationale: The draft gate preserves a clear boundary between local implementation evidence and final product/release confidence. It also prevents AI coordination docs and operational metadata from being exposed more broadly before ChatGPT/user decides CL-007.
- Consequences: `docs/PR19_REVIEW_READINESS.md` records merge gates, the CL-007 decision matrix, and a human OBS checklist. Codex should not merge, deploy, mark ready, or perform public-redaction work unless ChatGPT/user explicitly approves that next step.
- Status: Active.
- Related files: `docs/PR19_REVIEW_READINESS.md`, `docs/LOCAL_REVIEW_VERIFICATION.md`, `docs/CL007_AI_COORDINATION_DOCS_DECISION_PACKET.md`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`
- Related review findings: CL-002, CL-007

## Open decisions

- Whether these docs should remain tracked as-is if the repository is ever made public.
- Whether secrets/config should be audited before external review.
- Whether the locally implemented CL-002 fix passes OBS real-device browser-source QA.
- Whether PR #19 can be merged after OBS verification, or whether ChatGPT/user wants an explicit OBS waiver.
- Whether broader CL-005 builder testing/refactor work should be scheduled.
- How to handle CL-007: track, ignore, redact, or split AI coordination docs and operation metadata.
