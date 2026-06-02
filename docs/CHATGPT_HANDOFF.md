# CHATGPT_HANDOFF

## Status

Prepared by Codex for upload or paste into ChatGPT.

Update 2026-05-30: this handoff already served its original purpose of helping ChatGPT create a Claude Code review prompt. Claude review output is now in `docs/CLAUDE_REVIEW.md`, ChatGPT triage is now in `docs/AI_REVIEW_TRIAGE.md`, and approved Codex first-batch plus second-batch follow-up tasks are now in `docs/CODEX_TASKS.md`.

This file remains a historical context packet. It is not the current triage source of truth. Use the latest Codex final report for exact branch, commit, and validation results.

## How this file should be used

If this file is attached or pasted into ChatGPT now, use it only as repository context.

The current workflow has moved past Claude prompt creation. ChatGPT should use `docs/CLAUDE_REVIEW.md`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`, `docs/DECISION_LOG.md`, and the Codex final report to decide next steps. Codex should still implement only ChatGPT-approved tasks.

## Repository identity

- Repository/folder name: `011_obs-clock-overlay-builder`
- Package name: `obs-clock-overlay-builder`
- Remote repository: `https://github.com/h8nc4y/obs-clock-overlay-builder.git`
- Current branch observed by Codex during the second-batch implementation: `approved-review-followups`
- Historical working tree status observed before this file was first created:
  - `docs/AI_REVIEW_TRIAGE.md` untracked
  - `docs/CLAUDE_REVIEW.md` untracked
  - `docs/CODEX_TASKS.md` untracked
  - `docs/DECISION_LOG.md` untracked
  - `docs/REVIEW_BRIEF.md` untracked
  - After this file is created, `docs/CHATGPT_HANDOFF.md` should also be untracked until staged or committed.
- Recent commits observed:
  - `b3b900c` Merge pull request #18 from `h8nc4y/feat/v0-1-1-font-help-usability`
  - `107d974` `feat: improve font help and editor usability`
  - `15641ac` Merge pull request #17 from `h8nc4y/docs/record-dashboard-check`
  - `78ae6b6` `docs: record billing and usage dashboard check`
  - `370d3ef` `fix: stop release http smoke server`
- Important top-level directories:
  - `assets/`: CSS and browser-side JavaScript.
  - `clock/`: OBS clock-only HTML entry point.
  - `api/`: static `/api/defaults` fallback payload.
  - `functions/`: optional Cloudflare Pages Function compatibility.
  - `worker/`: Cloudflare Workers Static Assets entry point.
  - `scripts/`: local build, lint, smoke, release, and server scripts.
  - `tests/`: Node test suite.
  - `docs/`: QA, operations, backlog, licenses, and AI review coordination docs.
  - `.codegraph/`: local JavaScript code index.
  - `.claude/`: Claude-related local workspace data.
- Important config files:
  - `package.json`
  - `package-lock.json`
  - `wrangler.jsonc`
  - `_headers`
  - `_redirects`
  - `.gitignore`
  - `AGENTS.md`
  - `CLAUDE.md`

## Project summary

`obs-clock-overlay-builder` is a static web app for generating OBS browser-source clock overlay URLs. The editor page lets a user customize clock appearance and copy a generated `/clock/?c=...` URL. The `/clock/` route is a clock-only surface intended for OBS, with transparent background support.

The project is maintained for a Japanese user and Japanese end users. UI copy and operational documentation are Japanese-first.

## Confirmed facts

- The README describes the app as an OBS clock overlay URL builder.
- The canonical OBS reproducibility contract is the generated `/clock/?c=...` URL.
- `/clock/` should remain a clock-only page with transparent background support.
- Editor-only `localStorage` may assist editing, but the clock page must not depend on it.
- Untrusted URL, label, and font input must stay sanitized and must not be written with `innerHTML`.
- No font files should be bundled unless their licenses are checked and documented under `docs/licenses`.
- The default timezone is documented as `Asia/Tokyo`.
- The app supports templates, style controls, URL import/export, local font discovery where available, PNG preview generation, and X Web Intent sharing.
- The package is private, uses JavaScript ES modules, and uses npm scripts.
- The only listed dev dependency in `package.json` is `wrangler`.
- The deployment preference is Cloudflare Workers with Static Assets.
- `wrangler.jsonc` configures `obs-clock-overlay-builder` with `ASSETS` binding and staging/production environment names.
- `api/defaults` provides static JSON for `/api/defaults`.
- `functions/api/defaults.js` remains as Cloudflare Pages compatibility.
- `worker/index.js` delegates fetches to `env.ASSETS`.
- Existing docs record the production URL as `https://obs-clock-overlay-builder.h8nc4y.workers.dev`.
- Existing docs state `.github/workflows/` is absent and GitHub Actions are not currently triggered by push/PR.
- Existing docs state Cloudflare paid bindings such as D1, KV, R2, Queues, Durable Objects, Workflows, Hyperdrive, Workers AI, and AI Gateway are not configured.
- Claude review has been performed and pasted into `docs/CLAUDE_REVIEW.md`.
- ChatGPT first-batch triage has been performed and recorded in `docs/AI_REVIEW_TRIAGE.md`.
- ChatGPT later approved CL-003 and only a narrow CL-005 automated-test slice; broader CL-005 remains deferred.
- The first-batch implementation is preserved in a local commit on `approved-review-followups`.

## Inferred assumptions

- The likely end users are Japanese OBS users, streamers, livestream operators, or support staff.
- The project is intended to stay static-first and low-operations unless a later product decision changes that.
- Backend state, database storage, authentication, and paid cloud services appear out of scope for the current product.
- Claude Code should review the whole repository unless ChatGPT narrows scope to a diff or specific concern.
- A secrets/config audit may be useful before sending broad repository content to an external review environment, but this has not been decided.

## Current goal

The immediate coordination goal is to implement only ChatGPT-approved review tasks. The first batch has been preserved locally, and the second approved scope is limited to CL-003 plus a narrow CL-005 test slice.

The product goal appears to be a reliable, easy-to-use OBS clock overlay builder where the generated URL fully reproduces the clock display in OBS.

## Target users and use cases

Likely users:

- Japanese OBS users and streamers.
- Livestream operators who need a transparent clock overlay.
- The repository maintainer/operator.
- AI assistants participating in review and implementation under ChatGPT coordination.

Main workflows:

- Customize a clock overlay in the editor.
- Generate and copy `/clock/?c=...`.
- Paste the generated URL into an OBS browser source.
- Open `/clock/` as a transparent, clock-only display.
- Import an existing generated URL or config back into the editor.
- Use local font names where available, with fallback if browser support or permission is absent.
- Generate a PNG preview and sharing text.
- Run local/release validation before deployment.

## Current implementation status

### Implemented or likely implemented

- Static editor page at `/`.
- Clock-only page at `/clock/`.
- Encoded config in `c` query parameter.
- Backward-compatible flat GET parameter parsing for `/clock/`.
- Config defaults, templates, normalization, URL encoding/decoding, and CSS string escaping.
- Clock rendering and second-aligned time updates.
- Optional editor `localStorage` persistence.
- PC-local font discovery path through `window.queryLocalFonts`, with manual fallback documentation.
- Static `/api/defaults` fallback payload.
- Optional Cloudflare Pages Function fallback.
- Cloudflare Workers Static Assets deployment config.
- Node test suite and release-check scripts.
- Manual QA, post-launch operations, release QA, v0.1.1 backlog, and AI review coordination docs.

### Partially implemented

- Cloudflare Pages compatibility is retained, while Workers Static Assets is the preferred deployment path.
- CI automation appears intentionally deferred because this is a private repo and Actions billing must be controlled.
- OBS real-device verification is documented as manual QA and cannot be fully verified from repository files alone.

### Missing or unclear

- A lightweight product requirements summary now exists at `docs/PRODUCT_REQUIREMENTS.md`.
- No `.github/workflows/` directory was observed.
- It is undecided which future findings are MVP-blocking versus backlog items.

### Risky or broken areas if evidence exists

- No broken runtime behavior was verified during handoff creation.
- Known risk: OBS font appearance depends on fonts installed on the OBS machine.
- Known risk: automated tests do not prove real OBS browser-source behavior or OS font availability.
- Known operational risk: GitHub/Cloudflare billing and usage state depends partly on manual dashboard checks.

## Architecture and tech stack

- Language: JavaScript ES modules.
- Frontend: static HTML, CSS, browser JavaScript.
- Runtime/tooling: Node.js and npm.
- Tests: `node --test`.
- Deployment: Cloudflare Workers Static Assets through Wrangler.
- Optional deployment compatibility: Cloudflare Pages Functions.
- Database: none identified.
- Authentication: none identified.
- External services:
  - Cloudflare Workers Static Assets for hosting.
  - OBS browser source as the primary runtime target.
  - Browser APIs such as `localStorage`, Canvas, Clipboard, Web Share API, X Web Intent, and `window.queryLocalFonts` when available.

Major components:

- `index.html`: editor UI entry.
- `assets/js/builder.js`: editor initialization, templates, form binding, preview, import/export, font discovery, sharing, and generated URL update behavior.
- `assets/js/config.js`: defaults, templates, config normalization, URL encoding/decoding, query parsing, sanitization helpers, and CSS string handling.
- `assets/js/render.js`: clock DOM rendering.
- `assets/js/time.js`: time/date/weekday formatting and second tick scheduling.
- `assets/js/clock.js`: clock page entry that reads URL config and mounts the clock.
- `clock/index.html`: clock-only OBS surface.
- `api/defaults`: static defaults fallback JSON.
- `functions/api/defaults.js`: optional Pages Function defaults provider.
- `worker/index.js`: Workers Static Assets handler.
- `scripts/*.mjs`: build, lint, format, smoke, release, and local server utilities.
- `tests/*.mjs`: config, font, render, time, worker, build, and static UI tests.

Data flow:

1. The editor creates a normalized config.
2. The editor encodes it into `/clock/?c=...`.
3. OBS opens the generated URL.
4. The clock page decodes and normalizes URL config.
5. The clock renderer updates DOM text and style variables.

## Important files for ChatGPT

- `README.md`: product summary, features, local run, deployment, OBS setup, URL design, fonts, sharing, validation commands.
- `AGENTS.md`: project-specific policy, OBS URL contract, Cloudflare preference, release checks, localization expectations.
- `CLAUDE.md`: tells Claude Code to read `AGENTS.md` and preserve project reminders.
- `package.json`: npm scripts and dependency surface.
- `wrangler.jsonc`: Cloudflare Workers Static Assets config.
- `_headers`: static `/api/defaults` headers.
- `_redirects`: `/clock` route compatibility.
- `index.html`: editor page.
- `clock/index.html`: OBS clock-only page.
- `assets/js/builder.js`: editor behavior.
- `assets/js/builder-initial-config.js`: extracted pure helper for editor startup config-source priority.
- `assets/js/config.js`: URL/config/sanitization core.
- `assets/js/render.js`: clock rendering.
- `assets/js/time.js`: time formatting and tick behavior.
- `assets/js/font-names.js`: local font display-name support.
- `api/defaults`: static defaults JSON.
- `functions/api/defaults.js`: Pages fallback behavior.
- `worker/index.js`: Workers Static Assets delegation.
- `scripts/`: local and release validation utilities.
- `tests/`: automated tests.
- `tests/builder-initial-config.test.mjs`: targeted CL-003 regression tests for editor startup config-source priority.
- `docs/manual-qa.md`: manual browser/OBS/font/share/security/deploy QA.
- `docs/post-launch-ops.md`: production URL, billing/cost notes, Cloudflare binding state, rollback runbook.
- `docs/pre-release-qa.md`: release QA record.
- `docs/v0.1.1-backlog.md`: post-launch improvement candidates.
- `docs/licenses/fonts.md`: font license documentation area.
- `docs/REVIEW_BRIEF.md`: detailed review context packet.
- `docs/PRODUCT_REQUIREMENTS.md`: lightweight summary of existing product requirements and non-goals.
- `docs/CLAUDE_REVIEW.md`: Claude review output and findings tracking summary.
- `docs/AI_REVIEW_TRIAGE.md`: ChatGPT decisions on Claude findings.
- `docs/CODEX_TASKS.md`: approved first-batch Codex task queue.
- `docs/DECISION_LOG.md`: durable AI governance decision log.

## Review coordination files

- `docs/REVIEW_BRIEF.md`: completed by Codex as the pre-review repository context packet. It now notes that Claude review and ChatGPT triage happened after the brief was created.
- `docs/CLAUDE_REVIEW.md`: Claude review output is present. The tracking table records first-batch triage and second-batch CL-003/narrow CL-005 status.
- `docs/AI_REVIEW_TRIAGE.md`: ChatGPT triage is recorded. Approved: CG-001, CL-001, CL-004 docs-only, CL-006 docs-only, CL-008 docs-only, CL-009 docs-only, CL-003, CL-005 narrow slice, and the narrow CL-002 local safe-inset fix. Needs confirmation: CL-002 OBS real-device verification and CL-007 publication/tracking policy. Broader CL-005 remains deferred. Rejected for this batch: deploy/rollback, dependency-adding lint/type tooling, and unapproved visual changes beyond CL-002.
- `docs/CODEX_TASKS.md`: approved task queue T-00 through T-07, with T-05/T-06 covering CL-003 and the narrow CL-005 test slice, and T-07 covering the CL-002 local safe-inset fix.
- `docs/DECISION_LOG.md`: governance decisions now include ChatGPT first-batch triage, the lightweight product requirements summary decision, the second-batch CL-003/narrow CL-005 decision, and the narrow CL-002 local fix decision.
- `docs/PR19_REVIEW_READINESS.md`: PR #19 readiness packet, merge gates, CL-007 private/public decision matrix, and human OBS checklist.

## Known risks and review focus

Claude review and later ChatGPT/Codex batches should consider these areas:

- Goal and requirement alignment:
  - Does current behavior match the OBS overlay goal?
  - Are product requirements clear enough, or are key expectations only implicit in README/QA docs?
- Architecture:
  - Is the editor/clock separation clean?
  - Does `/clock/` remain independent from editor-only state?
  - Is the static-first Cloudflare design appropriate?
- Implementation quality:
  - Config encoding/decoding, normalization, defaulting, backward compatibility.
  - Clock scheduling and time-zone formatting.
  - DOM rendering patterns and CSS variable usage.
- Tests:
  - Meaningfulness of current Node tests.
  - Missing high-value tests for config, rendering, build output, deployment assumptions, or UI.
  - Limits of automated tests versus OBS/manual QA.
- Security:
  - URL/import/label/font sanitization.
  - Avoidance of `innerHTML` with untrusted values.
  - CSS string escaping and style injection risks.
  - Safe behavior with malformed config.
- Secret handling:
  - No secrets should be read, exposed, pasted, or sent externally.
  - Check whether repository docs/config contain sensitive material before wider sharing.
- UX/UI:
  - Japanese-first non-programmer copy.
  - OBS setup clarity.
  - Small viewport behavior around 390px, tablet around 768px, and desktop 1280px+.
  - Focus, hover, contrast, validation, empty/error states.
- Deployment and operations:
  - Workers Static Assets config.
  - Absence of paid bindings.
  - GitHub Actions cost policy and absence of workflows.
  - Release checks, remote smoke checks, rollback documentation.
- AI-generated-code risks:
  - Claude suggestions must not be treated as implementation approval.
  - Codex should implement only ChatGPT-approved tasks.
  - Avoid scope creep from review findings.

## Validation commands discovered

These commands are supported by repository evidence. This handoff does not claim they were run during handoff creation.

- Install, documented for deploy workflows: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Type/module smoke: `npm run typecheck`
- Format check: `npm run format:check`
- Tests: `npm run test`
- Build: `npm run build`
- Cloudflare dry run: `npm run cf:dry-run`
- Local HTTP smoke, requires a running local server: `npm run http:smoke`
- Release preflight: `npm run release:check`
- Bounded local release HTTP smoke: `npm run release:http-smoke`
- Remote smoke: `SMOKE_BASE_URL=<deploy-url> npm run release:remote-smoke`
- Staging deploy, only when cost policy allows: `npm run deploy:staging`
- Production deploy, only when cost policy allows: `npm run deploy:production`

## Commands run by Codex for this handoff

- `type docs\REVIEW_BRIEF.md`: inspected existing review brief.
- `type docs\CLAUDE_REVIEW.md`: confirmed Claude review is pending.
- `type docs\AI_REVIEW_TRIAGE.md`: confirmed ChatGPT triage is pending.
- `type docs\CODEX_TASKS.md`: confirmed approved Codex task queue is pending.
- `type docs\DECISION_LOG.md`: inspected initial AI governance decisions.
- `type README.md`: inspected project summary, features, local run, deployment, OBS setup, URL design, font, sharing, and validation docs.
- `type AGENTS.md`: inspected project-specific OBS, Cloudflare, release-check, and localization policy.
- `type CLAUDE.md`: inspected Claude-specific repository reminders.
- `type package.json`: inspected npm scripts and dependency surface.
- `type docs\post-launch-ops.md`: inspected production URL, cost notes, rollback, and operations state.
- `type docs\v0.1.1-backlog.md`: inspected post-launch improvement candidates and non-goals.
- `git branch --show-current`: current branch was `master`.
- `git status --short`: before creating this file, the five review coordination docs were untracked.
- `git log --oneline -n 10`: inspected recent commits.
- `dir /b`: inspected top-level repository entries.
- `dir /b docs`: inspected docs directory entries.

No package-manager install, tests, external API calls, deploys, commits, pushes, PRs, foreground dev servers, or interactive commands were run for this handoff.

## Remaining uncertainties

- Whether `docs/CHATGPT_HANDOFF.md` and the other AI coordination docs should be committed to Git.
- Whether generated/local directories such as `dist/`, `node_modules/`, `.wrangler/`, `.codegraph/`, and `.claude/` should be excluded from Claude's review prompt.
- Whether a secrets/config audit should be completed before external review.
- Whether the locally implemented CL-002 safe-inset fix passes OBS real-device browser-source QA, or whether ChatGPT/user explicitly waives that gate for merge.
- Whether broader CL-005 builder testing/refactor work should be scheduled in a later batch.
- How to handle CL-007 commit/publication policy for AI coordination docs and operation metadata.
- Whether current production behavior should be re-verified before any future release or deploy.

## Requested next action for ChatGPT

Please review `docs/PR19_REVIEW_READINESS.md`, `docs/CLAUDE_REVIEW.md`, `docs/AI_REVIEW_TRIAGE.md`, `docs/CODEX_TASKS.md`, `docs/DECISION_LOG.md`, and the latest Codex final report. Decide whether PR #19 should remain draft until OBS real-device verification is completed, whether CL-007 private-repo tracking is acceptable for this PR, and whether any public-redaction work is required before merge or only before public exposure.
