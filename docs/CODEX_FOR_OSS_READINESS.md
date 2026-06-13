# Codex for OSS Readiness

## Status

This document inventories the current readiness of `obs-clock-overlay-builder` for a future OpenAI Codex for Open Source application.

It is a preparation packet only. It does not submit an application, claim acceptance, claim eligibility, or record private OpenAI account details.

Official source checked: <https://openai.com/form/codex-for-oss/> on 2026-06-03.

## Current Repository State

Facts confirmed from the public repository and local `master`:

- Repository: <https://github.com/h8nc4y/obs-clock-overlay-builder>
- Visibility: public
- Demo: <https://obs-clock-overlay-builder.h8nc4y.workers.dev>
- License: MIT
- GitHub About description: `Static OBS clock overlay builder with reproducible /clock/?c=... URLs.`
- Topics: `obs`, `obs-studio`, `browser-source`, `clock`, `overlay`, `streaming`, `youtube-live`, `cloudflare-workers`, `javascript`
- Stars at inspection time: 0
- Forks at inspection time: 0
- `v0.1.0` GitHub Release exists: <https://github.com/h8nc4y/obs-clock-overlay-builder/releases/tag/v0.1.0>
- `v0.1.0` tag exists and locally resolves to commit `a1ecefd87a4e46a6327bfc13009ba6fb5351ef2b`.
- Recent merged PR evidence includes PR #19 through at least PR #72.
- README, CONTRIBUTING, CODE_OF_CONDUCT, AI-assisted workflow docs, release docs, README screenshot, public feedback route, roadmap, changelog, and production demo are present.
- The project focuses solely on the clock overlay. Chat/comment reaction planning (formerly "Candidate A") was moved to a separate project, and its experiment code and planning docs were removed from this repository.

The project is public and maintained, but public traction is still early. Do not describe it as widely adopted, critical infrastructure, or broadly used unless future objective evidence supports that.

## Official Criteria Fit

| Official signal | Current fit | Notes |
|---|---|---|
| Active open-source project | Partial to good | Public repo, recent PRs, MIT license, contribution docs, production demo. The public period is still short. |
| Primary or core maintainer | Likely good | `h8nc4y` appears to be the repo owner and current maintainer. The actual applicant must confirm their role in the form. |
| Public repository | Good | GitHub visibility is public. |
| Meaningful usage / broad adoption / ecosystem importance | Weak today | Stars and forks are 0 at inspection time. The strongest current claim is ecosystem relevance for OBS browser-source overlays, not demonstrated adoption. |
| Active maintenance evidence | Good for a young project | PR history shows repeated documentation, release, review, bugfix, and UI maintenance. |
| PR review / issue triage / release workflow | Partial to good | PR workflow and release checks are documented, and `v0.1.0` has a public GitHub Release/tag. Issue triage evidence is still limited. GitHub Actions are intentionally absent. |
| Maintainer automation | Partial | Local validation, release scripts, smoke checks, and AI-assisted review docs exist. There is no CI automation yet by design. |
| Codex usage for OSS maintenance | Good as evidence, early as impact | `docs/HOW_WE_USE_CODEX.md`, decision logs, triage docs, and PR history show Codex use for scoped implementation and validation. |
| Confidential information safety | Good posture | Public-safe docs avoid exact private operational metadata. Need a final pre-application scan before copying text into any form. |
| Future product direction | Partial | Public roadmap describes clock-focused directions. Chat/comment reaction work was moved to a separate project and is out of scope here. |

## Strengths

- Clear product niche: reproducible transparent OBS browser-source clock URLs.
- Strong product contract: generated `/clock/?c=...` URL is the source of truth.
- Small static architecture with zero runtime dependencies.
- Public production demo.
- Public `v0.1.0` GitHub Release/tag exists, improving release-discipline evidence.
- MIT license, README, contribution guide, code of conduct, and README screenshot are present.
- Japanese-first UX and docs support a specific user group.
- AI-assisted maintenance process is explicitly documented.
- Local validation and release checks are documented and repeatedly used.
- Cloudflare cost and deploy boundaries are documented.

## Weaknesses

- Public traction is currently weak: 0 GitHub stars and 0 forks at inspection time.
- No monthly download metric applies because this is not an npm package or library distribution.
- Public issue triage and user feedback evidence remain weak in the evidence gathered for this packet.
- No GitHub Actions workflow exists; this is intentional for cost control, but it weakens automation evidence.
- OBS real-device evidence remains a known manual QA limitation in older review packets.
- The project is useful but narrow; it may not yet meet the "critical open-source software" framing without stronger ecosystem evidence.

## Objective Signals To Grow Before Applying

Prioritize evidence that can be linked from a public application without exposing private data:

- Public issues from real users or documented maintainer-created issue triage.
- More merged PRs showing sustained maintenance after public launch.
- Release tags and concise release notes beyond the existing `v0.1.0` release.
- A small public roadmap or good-first-issue list.
- Public feedback guide and issue templates that invite OBS setup reports without requesting private data.
- Changelog entries and release notes that can be tied to tags once releases are created.
- Manual OBS QA evidence recorded in public-safe form.
- README examples that show real OBS use without private account or stream data.
- External mentions, users, stars, forks, or discussions if they happen organically.
- Optional CI only after cost and trigger decisions are settled.

## Evidence Usable In An Application

- Public repo URL and public visibility.
- Production demo URL.
- `v0.1.0` GitHub Release/tag as release-discipline evidence.
- README feature and privacy sections.
- MIT license.
- CONTRIBUTING and CODE_OF_CONDUCT.
- `docs/HOW_WE_USE_CODEX.md` for the AI-assisted maintenance workflow; the repository's commit history, pull requests, and release notes are the durable public record of decisions, review triage, and implementation.
- PRs #19 through #24 (and later) as recent maintenance examples.
- `package.json` scripts for validation and release checks.
- `docs/pre-release-qa.md` and `docs/post-launch-ops.md` for release and operations discipline.
- `docs/FEEDBACK_GUIDE.md`, `.github/ISSUE_TEMPLATE/`, `docs/ROADMAP.md`, and `CHANGELOG.md` for public feedback, roadmap, and release-note preparation.
- Issue #30 for public YouTube Live overlay suite exploration: <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30>

## Claims To Avoid

Do not claim any of the following unless future evidence exists:

- "Accepted into Codex for Open Source."
- "OpenAI-endorsed" or "OpenAI-approved."
- "Widely adopted," "critical infrastructure," or "broadly used."
- Specific user counts, monthly downloads, traffic, stars, forks, or OBS installs beyond current public metrics.
- GitHub Actions automation, if it remains absent.
- Production deploy by Codex, when the user performed deploy manually.
- Codex Security usage, unless it is actually granted and used later.
- API credits usage, unless credits are granted and used later.
- Implemented YouTube Live integration, YouTube API access, OAuth support, or real chat/comment data handling unless those are actually designed, approved, implemented, and validated later.
- Any private OpenAI Organization ID, account email, token, API key, billing value, or payment detail.

## Roadmap To Application

### Phase 1: Ready Packet

- Keep these readiness docs current.
- Keep README, demo, license, and contribution docs public-safe.
- Keep public feedback, roadmap, and changelog docs aligned with actual repository history.
- Confirm GitHub profile visibility before applying.
- Confirm the applicant is the primary/core maintainer.

### Phase 2: Evidence Growth

- Record public-safe manual OBS QA.
- Add a compact public roadmap.
- Use public feedback templates to collect issue triage evidence.
- Add a few issue labels and triage examples.
- Continue using PRs for maintenance work.
- Prefer small releases with release notes when meaningful changes land.

### Phase 3: Application Draft Finalization

- Re-check the official form and character limits.
- Re-check stars, forks, issues, PRs, release tags, and demo health.
- Update application text with only verified facts.
- Keep confidential fields outside the repository.

### Phase 4: User-Only Submission

- The user fills the OpenAI form.
- The user supplies email and OpenAI Organization ID directly in the form.
- Codex does not submit the application, operate the OpenAI site, create API keys, or perform OAuth.

## Application Decision Gate

Apply now only if the user is comfortable with a candid early-stage application that emphasizes niche ecosystem value and disciplined maintenance rather than adoption.

Recommended gate before a stronger application:

- Public repo remains healthy and current.
- At least a few more public maintenance events exist after PR #24.
- Public issue/triage or user feedback exists.
- Demo remains live and current.
- No secret-like values are present in application text.
- The application text does not overstate adoption.

Current recommendation: wait for more objective public signals unless the user wants to apply early with a conservative, transparent narrative.
