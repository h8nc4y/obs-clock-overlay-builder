# Codex for OSS Evidence Index

## Status

This index lists public-safe evidence that may support a future Codex for Open Source application.

It is not an application submission and does not claim acceptance.

## Official Program Reference

- Codex for Open Source form: <https://openai.com/form/codex-for-oss/>

The official page says applications are reviewed on a rolling basis and asks applicants to describe maintainer role, repository qualification, interest in Codex Security or API credits, OpenAI Organization ID, API credit usage, and optional additional context. Do not store private form-only values in this repository.

## Repository And Demo

- Repository: <https://github.com/h8nc4y/obs-clock-overlay-builder>
- Production demo: <https://obs-clock-overlay-builder.h8nc4y.workers.dev>
- README: [../README.md](../README.md)
- README screenshot: [assets/editor-preview.png](assets/editor-preview.png)
- Feedback guide: [FEEDBACK_GUIDE.md](FEEDBACK_GUIDE.md)
- Roadmap: [ROADMAP.md](ROADMAP.md)
- Changelog: [../CHANGELOG.md](../CHANGELOG.md)
- v0.1.0 GitHub Release: <https://github.com/h8nc4y/obs-clock-overlay-builder/releases/tag/v0.1.0>
- License: [../LICENSE](../LICENSE)
- Contributing guide: [../CONTRIBUTING.md](../CONTRIBUTING.md)
- Code of conduct: [../CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)

## Product And Operations Evidence

- Product requirements: [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md)
- Public feedback guide: [FEEDBACK_GUIDE.md](FEEDBACK_GUIDE.md)
- Public roadmap: [ROADMAP.md](ROADMAP.md)
- Changelog: [../CHANGELOG.md](../CHANGELOG.md)
- v0.1.0 Release/tag: <https://github.com/h8nc4y/obs-clock-overlay-builder/releases/tag/v0.1.0>
- Manual QA checklist: [manual-qa.md](manual-qa.md)
- Pre-release QA: [pre-release-qa.md](pre-release-qa.md)
- Post-launch operations: [post-launch-ops.md](post-launch-ops.md)
- Font license notes: [licenses/fonts.md](licenses/fonts.md)

## AI-Assisted Maintenance Evidence

- How we use Codex: [HOW_WE_USE_CODEX.md](HOW_WE_USE_CODEX.md)
- The durable, public record of the AI-assisted review-and-implementation flow is the repository's commit history, pull requests, and release notes.

## Representative Pull Requests

Recent public PR history confirmed with GitHub metadata:

- PR #24: <https://github.com/h8nc4y/obs-clock-overlay-builder/pull/24> — README screenshot.
- PR #23: <https://github.com/h8nc4y/obs-clock-overlay-builder/pull/23> — editor UI design refresh.
- PR #22: <https://github.com/h8nc4y/obs-clock-overlay-builder/pull/22> — Japanese README support.
- PR #21: <https://github.com/h8nc4y/obs-clock-overlay-builder/pull/21> — OSS readiness phase 0.
- PR #20: <https://github.com/h8nc4y/obs-clock-overlay-builder/pull/20> — editor live preview clipping fix.
- PR #19: <https://github.com/h8nc4y/obs-clock-overlay-builder/pull/19> — approved review follow-ups.
- PR #18: <https://github.com/h8nc4y/obs-clock-overlay-builder/pull/18> — font help and editor usability.
- PR #17: <https://github.com/h8nc4y/obs-clock-overlay-builder/pull/17> — dashboard check record.

Use current GitHub pages for exact latest PR state.

## Public Planning Issues

- Issue #28: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/28> — public feedback request.
- Issue #29: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/29> — roadmap feedback and priorities.
- Issue #30: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30> — YouTube Live focused OBS overlay suite exploration.
- Issue #30 safe MVP comment: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30#issuecomment-4613411826> — Candidate A scope notes.

These are public maintenance and planning signals. They are not user adoption evidence by themselves.

## Validation And Release Workflow Evidence

Key scripts in [../package.json](../package.json):

- `npm run lint` — JavaScript syntax check.
- `npm run typecheck` — module/import smoke check.
- `npm run format:check` — repository text formatting check.
- `npm test` — Node tests; the build test uses a temporary directory, so it does not touch `dist/`.
- `npm run build` — static build.
- `npm run release:check` — local release gate including Wrangler dry-run.
- `npm run release:http-smoke` — bounded local HTTP smoke.
- `npm run release:remote-smoke` — explicit remote smoke when deploy/release scope allows it.

Release workflow docs:

- [pre-release-qa.md](pre-release-qa.md)
- [post-launch-ops.md](post-launch-ops.md)
- [manual-qa.md](manual-qa.md)

Confirmed release evidence:

- `v0.1.0` GitHub Release: <https://github.com/h8nc4y/obs-clock-overlay-builder/releases/tag/v0.1.0>
- Release title: `v0.1.0 - OBS時計オーバーレイビルダー初回公開`
- Release state: published, not draft, not prerelease.
- Published date: 2026-05-20.
- Tag: `v0.1.0`.
- Local tag object resolves to commit `a1ecefd87a4e46a6327bfc13009ba6fb5351ef2b`.
- Subsequent releases: every version since `v0.1.0` ships a git tag and a published, Japanese-titled GitHub Release. See the full list at <https://github.com/h8nc4y/obs-clock-overlay-builder/releases>.

This is release-discipline evidence. It is not evidence of broad adoption, user count, stars, forks, or Codex for OSS acceptance.

## Claude Review To Codex Implementation Flow

The repository records a governance flow:

1. Claude Code findings are advisory.
2. ChatGPT triages findings and decides accepted, deferred, rejected, or confirmation-needed status.
3. Codex implements only approved scope.
4. Codex runs validation and records skipped checks, unknowns, and residual risks.

Evidence:

- [HOW_WE_USE_CODEX.md](HOW_WE_USE_CODEX.md)
- Public pull requests and commit history in the repository.

## Current Weak Signals

These are not blockers for maintaining the project, but they weaken a Codex for OSS application today:

- Stars: 0 at inspection time.
- Forks: 0 at inspection time.
- No monthly download signal applies.
- Public issue triage evidence is limited.
- GitHub Actions are intentionally absent.
- Public user adoption evidence is not yet established.

## Evidence To Add Later

- Public issue triage examples.
- Release tags and release notes for meaningful updates.
- Updates to the public roadmap or milestone notes as direction becomes concrete.
- Public-safe OBS real-device QA record.
- More maintenance PRs after public launch.
- Organic stars, forks, discussions, or external mentions if they happen.
- Optional CI evidence only after cost and trigger policy is settled.

## Confidential Information Boundary

Do not add the following to application evidence files:

- OpenAI Organization ID.
- ChatGPT account email.
- API keys or OAuth tokens.
- Cloudflare account IDs, secret names, exact private dashboard values, usage numbers, or payment details.
- Private customer/user data.
- Raw local paths that are not needed by public users.
