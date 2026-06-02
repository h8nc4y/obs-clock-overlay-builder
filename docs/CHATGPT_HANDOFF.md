# ChatGPT Handoff

## Status

This file is a historical context packet for ChatGPT. It is not the current triage source of truth.

Use these current docs first:

- [Claude review](CLAUDE_REVIEW.md)
- [AI review triage](AI_REVIEW_TRIAGE.md)
- [Codex tasks](CODEX_TASKS.md)
- [Decision log](DECISION_LOG.md)
- [How we use Codex](HOW_WE_USE_CODEX.md)

## Project Summary

`obs-clock-overlay-builder` is a static web app for generating OBS browser-source clock overlay URLs. The editor lets a user customize clock appearance and copy a generated `/clock/?c=...` URL. The `/clock/` route is a clock-only surface intended for OBS, with transparent background support.

The project is maintained for a Japanese user and Japanese end users. UI copy is Japanese-first.

## Product Contracts

- The generated `/clock/?c=...` URL is the source of truth for OBS reproducibility.
- `/clock/` remains clock-only and transparent-background friendly.
- Editor-only `localStorage` may assist editing, but `/clock/` must not depend on it.
- Untrusted URL, label, and font input must stay sanitized and must not be written with `innerHTML`.
- No font files should be bundled unless their licenses are checked and documented under `docs/licenses`.
- The app should remain static-first and low operations.

## Architecture And Stack

- JavaScript ES modules.
- Static HTML, CSS, and browser JavaScript.
- Node.js scripts and `node --test`.
- Cloudflare Workers Static Assets as the preferred deployment model.
- Optional Cloudflare Pages Function compatibility for `/api/defaults`.
- No backend database and no authentication.

Major files:

- `index.html`: editor UI entry.
- `clock/index.html`: OBS clock-only page.
- `assets/js/builder.js`: editor behavior.
- `assets/js/config.js`: config defaults, normalization, URL encoding/decoding, and sanitization helpers.
- `assets/js/render.js`: clock DOM rendering and recommended OBS sizing.
- `assets/js/time.js`: time/date formatting and ticking.
- `api/defaults`: static defaults fallback JSON.
- `worker/index.js`: Workers Static Assets handler.
- `scripts/`: local build, validation, smoke, release, and server utilities.
- `tests/`: automated tests.
- `docs/`: QA, operations, backlog, requirements, and AI review coordination docs.

## AI Workflow

- ChatGPT triages review findings and approves implementation scope.
- Claude Code acts as an independent read-only reviewer.
- Codex implements only ChatGPT-approved tasks and records validation evidence.

Claude findings are advisory. Codex should not implement unapproved suggestions, invent validation results, or claim deploys, PRs, application status, or screenshots that do not exist.

## Validation Commands

Supported commands:

```bash
npm run dev
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
npm run release:check
npm run release:http-smoke
SMOKE_BASE_URL=<deploy-url> npm run release:remote-smoke
```

Notes:

- `npm run lint` is JavaScript syntax checking.
- `npm run typecheck` is a module/import smoke check.
- `npm test` can generate ignored `dist/` output.
- Remote smoke, deploy, rollback, and Cloudflare dashboard/API operations require explicit scope under the project policy.

## Remaining Questions

- Whether current changes have passed OBS real-device browser-source verification.
- Whether future broader builder testing/refactor work should be scheduled.
- Whether future operations need a split between public docs and private runbook evidence.
- Whether the user is ready to switch repository visibility to public.

## Requested Use

When this file is attached to ChatGPT, use it only as repository context. Current decisions should be based on the latest docs, commits, pull requests, validation logs, and user instructions.
