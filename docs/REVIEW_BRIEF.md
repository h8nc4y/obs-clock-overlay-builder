# REVIEW_BRIEF

## Status

This brief was prepared by Codex from local repository inspection. It is a review context packet for ChatGPT and Claude Code, not a completed review.

Confirmed facts are based on files and commands inspected in this working tree. Inferred assumptions are explicitly marked as inferred. Commands listed under validation are repository-supported commands; they were not run during creation of this brief unless the final Codex report says otherwise.

Update 2026-05-30: Claude Code review has since been pasted into `docs/CLAUDE_REVIEW.md`, and ChatGPT triage has been recorded in `docs/AI_REVIEW_TRIAGE.md`. This file remains the pre-review repository context packet.

## Project summary

Confirmed: `obs-clock-overlay-builder` is a static web app that generates reproducible OBS browser-source clock overlay URLs. The editor page lets a user customize the clock appearance and copy a generated `/clock/?c=...` URL. The `/clock/` page is a clock-only surface intended for OBS, with transparent background support.

Inferred: The current product is a small production-deployed utility for Japanese streamers or operators who want a configurable clock overlay without running a backend.

## Repository identity

- Repository/folder name: `011_obs-clock-overlay-builder`
- Package name: `obs-clock-overlay-builder`
- Remote: `https://github.com/h8nc4y/obs-clock-overlay-builder.git`
- Current branch at inspection time: `master`
- Working tree at inspection time: no uncommitted changes before these review documents were created.
- Important top-level directories:
  - `assets/`: CSS and browser-side JavaScript.
  - `clock/`: OBS clock-only HTML entry point.
  - `api/`: static `/api/defaults` fallback payload.
  - `functions/`: optional Cloudflare Pages Function compatibility.
  - `worker/`: Cloudflare Workers Static Assets entry point.
  - `scripts/`: local build, lint, smoke, release, and server scripts.
  - `tests/`: Node test suite.
  - `docs/`: manual QA, operations, release, backlog, license, and AI review coordination docs.
  - `.codegraph/`: local CodeGraph index.
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

## Intended goal

Confirmed: The app's documented goal is to generate every-second OBS clock overlay URLs that can be pasted into OBS browser sources. The generated `/clock/?c=...` URL is the source of truth for reproducibility. The editor may use `localStorage`, but the clock surface must not depend on editor-only state.

Inferred: The project aims to stay lightweight, static-first, and easy to operate on Cloudflare Workers Static Assets, with Cloudflare Pages compatibility kept as a harmless fallback.

## Target users

- Confirmed: Japanese end users and a Japanese maintainer are explicitly named in `AGENTS.md`.
- Inferred: OBS users, streamers, livestream operators, or support staff who need a clock overlay.
- Inferred: The repository operator who runs release checks, Cloudflare deployment, manual QA, and rollback procedures.
- Inferred: AI reviewers and coding agents coordinated through ChatGPT, Claude Code, and Codex.

## Primary use cases

- Customize a clock overlay in the editor UI.
- Generate and copy a reproducible `/clock/?c=...` URL.
- Paste the generated URL into OBS as a browser source.
- Open `/clock/` as a clock-only transparent page.
- Import an existing generated URL, query string, encoded config, or JSON config back into the editor.
- Generate a PNG preview and X sharing text from the configured clock.
- Run local and release validation commands before deployment.
- Deploy or verify Cloudflare Workers Static Assets when approved by the project's cost and operations policy.

## Non-goals

- Confirmed: Do not require `localStorage` for OBS clock reproducibility.
- Confirmed: Do not add bundled font files unless license checks are completed and documented under `docs/licenses`.
- Confirmed: Do not execute untrusted URL, label, or font input as HTML.
- Confirmed: Do not use server-time correction in the MVP; clock display follows the user's system time.
- Confirmed: Do not run production rollback as a drill while production is healthy.
- Inferred: Avoid adding backend state, databases, authentication, or paid cloud bindings unless a later product decision explicitly requires them.
- Inferred: Avoid making Claude Code an implementation authority; Claude review is advisory and ChatGPT triages findings.

## Current implementation status

### Implemented or likely implemented

- Static editor page at `/` with Japanese UI copy.
- Clock-only page at `/clock/`.
- Base64url encoded config stored in `c` query parameter.
- Backward-compatible flat GET parameter parsing for `/clock/`.
- Config normalization, defaulting, compact encoding, and CSS string escaping in `assets/js/config.js`.
- Clock rendering and time formatting modules in `assets/js/render.js` and `assets/js/time.js`.
- Optional local editor persistence through `localStorage`.
- PC-local font discovery path through `window.queryLocalFonts`, with manual fallback documented.
- Static `/api/defaults` fallback payload at `api/defaults`.
- Optional Cloudflare Pages Function fallback at `functions/api/defaults.js`.
- Cloudflare Workers Static Assets configuration in `wrangler.jsonc`.
- Release-oriented local scripts and Node tests.
- Manual QA, post-launch operations, and v0.1.1 backlog docs.

### Partially implemented

- Cloudflare Pages compatibility remains documented and present, but Workers Static Assets is the preferred deployment path.
- GitHub Actions are intentionally absent per `docs/post-launch-ops.md`; CI automation appears deferred because private repository Actions billing must be controlled.
- OBS real-device verification is documented as a manual process; it cannot be fully automated from repository files.

### Missing or unclear

- No formal product requirements document was found beyond README, QA docs, backlog, and agent instructions.
- No `.github/workflows/` directory was found during inspection.
- It is unclear whether Claude should review the whole repository, a diff, or only the current release surface.
- It is unclear whether a secrets/config audit should be performed before sharing repository content with external review tools.

### Broken or risky, if evidence exists

- No broken behavior was verified during this documentation task.
- Known operational risk: Cloudflare and GitHub billing/cost state depends on dashboard checks recorded outside raw repository data.
- Known UX/runtime risk: OBS font rendering depends on fonts installed on the OBS machine.
- Known testing risk: automated tests do not prove actual OBS browser-source behavior or OS font availability.

## Architecture overview

The repository is a static-first JavaScript web app.

- `index.html` loads the editor UI.
- `assets/js/builder.js` initializes the editor, templates, form bindings, preview, import/export, font discovery, sharing, and generated URL updates.
- `assets/js/config.js` defines default config, templates, allowed ranges, URL encoding/decoding, normalization, and sanitization helpers.
- `assets/js/render.js` mounts and updates the clock DOM.
- `assets/js/time.js` formats time/date/weekday output and schedules second-aligned updates.
- `clock/index.html` loads only the clock surface and `assets/js/clock.js`.
- `assets/js/clock.js` reads config from the current URL, mounts the clock, and schedules ticks.
- `api/defaults` provides static JSON for `/api/defaults`.
- `functions/api/defaults.js` is an optional Cloudflare Pages Function variant.
- `worker/index.js` delegates requests to the Static Assets binding.
- `scripts/build.mjs` and release scripts prepare and verify `dist/`.
- `wrangler.jsonc` deploys `dist/` through Cloudflare Workers Static Assets with staging and production environments.

Data flow:

1. The editor builds a normalized config.
2. The config is encoded into `/clock/?c=...`.
3. OBS opens the generated clock URL.
4. The clock page decodes and normalizes URL config.
5. The renderer writes clock text and CSS variables to DOM elements using text-based APIs rather than `innerHTML`.

External integrations:

- Cloudflare Workers Static Assets for deployment.
- Optional Cloudflare Pages Functions compatibility.
- OBS browser source as the primary runtime target.
- Browser APIs: `localStorage`, Canvas, Clipboard, Web Share API, X Web Intent, `window.queryLocalFonts` where available.

No database or authentication system was identified.

## Tech stack

- Language: JavaScript ES modules.
- Runtime/tooling: Node.js.
- Frontend: static HTML, CSS, browser JavaScript.
- Test runner: `node --test`.
- Deployment: Cloudflare Workers Static Assets through Wrangler.
- Optional compatibility: Cloudflare Pages Functions.
- Local analysis: CodeGraph index exists for JavaScript files.
- Package manager: npm with `package-lock.json`.
- Documented deployment target: `https://obs-clock-overlay-builder.h8nc4y.workers.dev`.

## Important files and directories

- `README.md`: main product, local use, deployment, OBS setup, URL design, font, sharing, and quality-check documentation.
- `AGENTS.md`: project-specific rules, OBS URL contract, Cloudflare preference, release-check surface, and Japanese localization requirements.
- `CLAUDE.md`: tells Claude Code to treat `AGENTS.md` as the authoritative repo policy.
- `package.json`: npm scripts and Wrangler dependency.
- `wrangler.jsonc`: Cloudflare Workers Static Assets configuration.
- `_headers`: `/api/defaults` content type and no-store cache header.
- `_redirects`: `/clock` to `/clock/index.html` compatibility route.
- `index.html`: editor UI entry point.
- `clock/index.html`: OBS clock-only entry point.
- `assets/js/builder.js`: editor behavior and generated URL workflow.
- `assets/js/config.js`: templates, defaults, URL config encoding, normalization, and sanitization.
- `assets/js/render.js`: clock DOM rendering.
- `assets/js/time.js`: clock formatting and second tick timing.
- `assets/js/font-names.js`: local font display-name support.
- `api/defaults`: static defaults fallback JSON.
- `functions/api/defaults.js`: optional Pages Function fallback.
- `worker/index.js`: Workers Static Assets fetch entry point.
- `scripts/`: build, lint, format, smoke, release, and local server utilities.
- `tests/`: config, render, time, worker, build, font, and static UI tests.
- `docs/manual-qa.md`: manual browser and OBS QA checklist.
- `docs/post-launch-ops.md`: production URL, rollback, cost, and operations notes.
- `docs/pre-release-qa.md`: release QA record.
- `docs/v0.1.1-backlog.md`: post-launch improvement candidates.
- `docs/PRODUCT_REQUIREMENTS.md`: lightweight summary of existing product requirements and non-goals.
- `docs/licenses/fonts.md`: font license documentation area.
- `docs/CLAUDE_REVIEW.md`: future Claude review record.
- `docs/AI_REVIEW_TRIAGE.md`: future ChatGPT triage record.
- `docs/CODEX_TASKS.md`: future Codex implementation queue generated only from approved triage.
- `docs/DECISION_LOG.md`: durable product, architecture, review, and AI coordination decision log.

## Validation commands

Commands visible from repository files:

- Install, documented before deploy workflows: `npm install`
- Local dev server: `npm run dev`
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
- Staging deploy, only when allowed by cost policy: `npm run deploy:staging`
- Production deploy, only when allowed by cost policy: `npm run deploy:production`

For Codex automation, foreground dev servers should be started in the background with PID/log tracking and bounded health checks, following `AGENTS.md`.

## Known risks and review focus

- Requirement ambiguity: product goals are mostly spread across README, QA docs, backlog, AGENTS, and post-launch ops; a single requirements spec was not found.
- Architecture risk: static-first design is simple, but review should confirm the editor and clock surfaces remain separated.
- Security risk: URL, label, font, import, and CSS string handling must remain sanitized and must not use `innerHTML`.
- Data handling: editor `localStorage` must remain optional and must not become a clock-surface dependency.
- Auth/permissions: `queryLocalFonts` requires browser permission and must degrade cleanly.
- Testing gaps: automated tests do not cover actual OBS browser-source behavior, OS font availability, or full visual rendering.
- UX/UI issues: Japanese non-programmer copy, small viewport behavior, focus states, contrast warnings, and OBS setup instructions need review.
- Deployment/config risk: Workers Static Assets should remain free-tier aware; avoid paid Cloudflare bindings and unintended Worker-first request paths.
- Operations risk: production rollback should be evidence-based and not drilled against healthy production.
- AI-generated-code risk: future Claude findings must not be applied automatically; ChatGPT must triage before Codex changes code.

## Questions for ChatGPT before Claude review

- Should Claude review the whole repository or only the current `master` branch state?
- Should Claude focus on product readiness, security, UI/UX, deployment operations, tests, or all of them?
- Should Claude include low-severity polish suggestions, or only findings that could block MVP/release confidence?
- Should Claude avoid reading local `.claude/` worktrees and generated `dist/` artifacts unless needed?
- Should a local secrets/config audit be completed before any external review prompt includes repository content?
- Which findings should be considered MVP-blocking versus backlog candidates?
- Should Claude review cost and deployment documentation, or should that stay under ChatGPT/Codex operations review?

## Questions for Claude reviewer

- Does the `/clock/?c=...` contract remain robust, reproducible, and independent of editor-only state?
- Are URL/import inputs, labels, font names, and CSS string outputs sanitized enough to avoid script or style injection?
- Are clock rendering, timer scheduling, and time-zone formatting reliable across common browser/OBS conditions?
- Are default values, template behavior, and compact URL encoding backward-compatible and test-covered?
- Are Japanese UI labels and OBS instructions clear for non-programmers?
- Are release, rollback, and Cloudflare cost controls documented clearly enough to prevent unsafe operations?
- Are the current tests meaningful, and what high-value gaps remain?
- Is any source, config, or documentation likely to mislead Codex into changing product behavior without ChatGPT approval?

## Source evidence

- `README.md`: project purpose, features, local usage, Cloudflare deployment, OBS setup, URL design, fonts, sharing, quality checks, manual checks.
- `AGENTS.md`: OBS contract, project-specific Cloudflare guidance, release-check commands, Japanese localization requirements.
- `CLAUDE.md`: Claude review policy pointer to `AGENTS.md` and project reminders.
- `package.json`: npm scripts, module type, Wrangler dependency.
- `wrangler.jsonc`: Workers Static Assets deployment configuration and environments.
- `_headers`: static `/api/defaults` response headers.
- `_redirects`: `/clock` compatibility route.
- `api/defaults`: static JSON fallback response.
- `functions/api/defaults.js`: Pages Function fallback behavior.
- `worker/index.js`: Workers Static Assets fetch delegation.
- `clock/index.html`: clock-only page structure.
- `docs/manual-qa.md`: manual browser, OBS, font, sharing, security sample, and deployment QA expectations.
- `docs/post-launch-ops.md`: production URL, version notes, GitHub Actions cost state, Cloudflare binding state, rollback runbook, browser verification notes.
- `docs/v0.1.1-backlog.md`: post-launch improvement candidates and non-goals.
- `.gitignore`: generated/temporary files ignored; `docs/` is not ignored.
- CodeGraph index: confirmed JavaScript file structure, symbols, and relationships across app, scripts, and tests.
- Git commands: confirmed repository root, branch, remote, tracked docs, and clean working tree before this documentation change.
