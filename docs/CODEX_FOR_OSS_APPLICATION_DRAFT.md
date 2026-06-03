# Codex for OSS Application Draft

## Status

This is a draft packet for a future OpenAI Codex for Open Source application.

Do not paste private values into this repository. The user's email address, OpenAI Organization ID, API keys, billing details, and account identifiers must be entered by the user directly into the official form if they choose to apply.

Official form checked: <https://openai.com/form/codex-for-oss/> on 2026-06-03.

## Field Candidates

### GitHub Username

Candidate:

```text
h8nc4y
```

Before applying, confirm the GitHub profile visibility is public.

### Repository URL

```text
https://github.com/h8nc4y/obs-clock-overlay-builder
```

### Maintainer Role

Conservative draft:

```text
I am the primary maintainer and repository owner. I maintain product scope, review findings, release checks, documentation, and the public demo for this static OBS browser-source overlay builder.
```

Do not use this wording if the applicant is not actually the primary maintainer at submission time.

## Project Description

Short draft:

```text
OBS Clock Overlay Builder is a zero-runtime-dependency static web app that generates reproducible transparent OBS browser-source clock overlay URLs. Its /clock/?c=... contract lets streamers reproduce the same clock appearance from a URL without accounts, backend state, or bundled fonts.
```

More detailed draft:

```text
OBS Clock Overlay Builder helps OBS users create transparent browser-source clock overlays. The editor generates a /clock/?c=... URL that becomes the source of truth for replaying the same clock surface in OBS. The project is static, MIT-licensed, Japanese-first, and designed to avoid backend state and unsafe HTML rendering.
```

## Why This Repository Qualifies

Important constraint: the official form asks why the repository qualifies and suggests signals such as GitHub stars, monthly downloads, or ecosystem importance. Current public metrics are weak: stars and forks were 0 at inspection time, and monthly downloads do not apply.

### Conservative Current Draft

```text
This is an early public OSS project in a specific streaming niche: reproducible OBS browser-source clock overlays. It provides a static, MIT-licensed tool with a live demo, a v0.1.0 GitHub Release/tag, a clear /clock/?c=... reproducibility contract, Japanese-first docs, release checks, and documented AI-assisted maintenance.
```

Use now only if applying early and transparently.

### Stronger After Traction

```text
This project serves OBS streamers who need reproducible browser-source clock overlays without backend accounts or paid services. It now has public user feedback, issue triage, release history, and a maintained demo, showing it is useful beyond a private experiment.
```

Use only after public user feedback or issue/triage evidence exists.

## How Codex Is Used

Current factual draft:

```text
Codex is used as an implementation and validation agent after ChatGPT-approved scope is defined. The repo records an auditable workflow: Claude Code provides advisory review, ChatGPT triages findings, and Codex implements approved tasks, runs local validation, creates PRs, and records skipped checks and residual risks.
```

Shorter draft:

```text
Codex turns approved review findings into scoped PRs, runs local validation, and keeps public-safe evidence. The repository documents the ChatGPT -> Claude Code -> ChatGPT -> Codex flow so AI assistance remains auditable and does not silently change scope.
```

## Intended Use Of API Credits

Do not claim credits are granted. These are future-use plans only.

Draft:

```text
I would use API credits for maintainer automation around this repository: local review summarization, release-readiness evidence, issue/PR triage drafts, documentation consistency checks, and targeted regression-test planning. I would not use credits for production app runtime, user tracking, or paid service expansion.
```

Shorter draft:

```text
For maintainer automation: PR review summaries, release-readiness checks, issue triage drafts, docs consistency checks, and targeted regression-test planning. Credits would support OSS maintenance, not production runtime or user data processing.
```

## Intended Use Of ChatGPT Pro / Codex

Draft:

```text
I would use Codex for day-to-day maintenance: small bug fixes, documentation updates, browser QA, validation runs, release preparation, and review follow-up PRs while preserving the repo's strict /clock/?c=... reproducibility and no-secret policies.
```

## Intended Use Of Codex Security

Only request this if the user wants security review support and the project scope justifies it.

Draft:

```text
If available, Codex Security would be used for periodic review of untrusted URL/config handling, XSS sink avoidance, dependency posture, and release-safety docs. The current app is static and has zero runtime dependencies, so security use would focus on preventing regressions rather than responding to known incidents.
```

## Anything Else We Should Know?

The official form limits this field to 500 characters. These drafts avoid claiming adoption or acceptance.

### Option A: Immediate, Conservative

```text
This is an early public project, so I am not claiming broad adoption yet. The value is a focused OBS utility with a reproducible URL contract, public demo, MIT license, and transparent AI-assisted maintenance workflow. I would use Codex to keep review, QA, and docs disciplined as the project grows.
```

Recommended timing: usable now, but candidly early.

### Option B: Maintenance Workflow Focus

```text
The repository intentionally documents how AI review and Codex implementation are governed: Claude findings are advisory, ChatGPT triages scope, and Codex implements approved work with validation evidence. I want Codex support to strengthen that maintainer workflow for a public OSS repo.
```

Recommended timing: usable now.

### Option C: Ecosystem Fit, Not Overstated

```text
OBS browser-source overlays are common in streaming workflows, but this project is still young. It focuses on a narrow problem: reproducible transparent clock URLs without accounts or backend state. I plan to build more public evidence through issues, releases, and user QA before making stronger adoption claims.
```

Recommended timing: usable now if the application should emphasize honesty.

### Option D: After More Traction

```text
Since public launch, this project has accumulated user feedback, triaged issues, release notes, and maintenance PRs showing real use by OBS streamers. Codex support would help keep the static app secure, documented, and release-ready without adding backend complexity.
```

Recommended timing: traction追加後。Do not use until those facts are true.

## Do Not Include In The Form

- Private email text copied into the repository.
- OpenAI Organization ID.
- API keys.
- Billing or payment details.
- Private Cloudflare account values.
- Private dashboard screenshots or metrics.
- Unverified usage, star, fork, traffic, or monthly download numbers.
- Claims that OpenAI has accepted, endorsed, reviewed, or approved this project.
