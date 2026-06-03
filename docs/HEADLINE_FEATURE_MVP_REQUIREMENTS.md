# Headline Feature MVP Requirements

## Status

This document defines candidate MVPs for a future headline feature around a YouTube Live focused OBS overlay suite.

It is requirements planning only. No YouTube API, OAuth, API key, data fetching, scraping, external sending, deployment, dependency addition, or app behavior change is approved by this document.

Related planning issue:

- <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30>

## Product Principles

- Start with an OBS Browser Source surface that can run safely in a normal browser.
- Prefer static/local/manual/fixture input before any YouTube integration.
- Preserve a reproducibility contract similar to `/clock/?c=...` when practical.
- Keep untrusted text rendered as text, not HTML.
- Do not store secrets, private account data, or raw viewer data in the repository.
- Treat YouTube API/OAuth/policy work as a later separately approved phase.

## MVP Candidate A: Manual Or Fixture Keyword Reaction Overlay

### Purpose

Prototype a visual keyword reaction overlay without using YouTube API, OAuth, API keys, live chat, comments, or real viewer data.

### Target Users

- OBS creators who want to test whether keyword-triggered visuals are useful on stream.
- Maintainers who need a safe prototype before designing YouTube integration.

### Input

- Manual test input typed into a local editor surface.
- Public-safe fixture text committed for tests only if needed.
- Optional keyword and reaction configuration encoded into a generated URL or importable config.

### Output

- A dedicated overlay-only surface for OBS Browser Source.
- A small reaction visual when a configured keyword is present in the manual or fixture input.
- A generated URL or config that can reproduce the same visual behavior.

### Non-goals

- No YouTube API access.
- No OAuth.
- No API keys.
- No live chat or comment scraping.
- No storage of real viewer data.
- No claim that this handles production YouTube Live traffic.

### Risks

- A manual prototype may not represent real chat timing or volume.
- Keyword matching can create surprising reactions if text normalization is unclear.
- Visual effects could distract from the stream if defaults are too aggressive.

### Validation

- Local unit tests for keyword matching and config round-trip.
- Browser checks for overlay-only rendering.
- OBS Browser Source manual QA with fixture input.
- Security checks that untrusted text is not written with `innerHTML`.

### Current Priority

This is the preferred first safe MVP candidate because it can be explored without YouTube API, OAuth, API keys, real viewer data, or external service setup.

## MVP Candidate B: Local Browser-Source Overlay With Safe Configuration

### Purpose

Define shared suite mechanics for URL-driven OBS overlays before choosing a YouTube-specific data source.

### Target Users

- Creators who want small reusable overlays with predictable OBS setup.
- Maintainers who want a common overlay contract across clock and future tools.

### Input

- URL-encoded or importable local configuration.
- Manual sample text or local fixture data.
- No private account credentials.

### Output

- A Browser Source friendly overlay surface.
- A public-safe editor or config generator.
- Recommended OBS width and height.
- Clear warnings when generated URLs may contain labels or display settings.

### Non-goals

- No external data fetching.
- No YouTube account connection.
- No server-side storage.
- No bundled paid service.

### Risks

- Too much generic suite structure can slow the simple clock tool.
- Shared contracts may be premature if only one overlay exists.
- URL size and readability need review if configs become larger than the clock config.

### Validation

- Config encode/decode tests.
- Browser rendering checks.
- Manual OBS Browser Source QA.
- Documentation review for privacy and reproducibility wording.

## MVP Candidate C: YouTube Live Integration After Policy/API Review

### Purpose

Explore a real YouTube Live data integration only after policy, OAuth, API key, quota, privacy, and data handling questions are reviewed.

### Target Users

- YouTube Live creators who need live chat or comment-aware overlays.
- Maintainers who can safely operate a documented integration boundary.

### Input

- To be defined after official documentation review.
- May involve YouTube API credentials, OAuth, public live chat data, comments, replay data, or other data classes.
- Must not be designed from assumptions alone.

### Output

- To be defined after data boundary and policy review.
- Any output must avoid exposing private account, viewer, or chat data beyond the creator's intended stream display.

### Non-goals

- No API key creation in this planning phase.
- No OAuth flow in this planning phase.
- No real YouTube data collection in this planning phase.
- No legal or policy compliance claim without review.

### Risks

- YouTube API, OAuth, quota, and policy requirements may make the feature unsuitable for a static-first project.
- User data retention and deletion expectations may require infrastructure that is out of scope.
- Live chat/comment data may include personal data or moderation-sensitive content.

### Validation

- Official documentation review before design approval.
- Privacy and data handling checklist.
- Threat model for credentials, tokens, and viewer data.
- Separate implementation plan with explicit user approval before any API/OAuth work.

## Reproducibility Contract Questions

The current clock tool treats the generated `/clock/?c=...` URL as the source of truth. Future overlays should consider a similar contract:

- Can all visual configuration be encoded into a generated URL?
- Which runtime state must not be encoded because it is private or time-sensitive?
- Should external data source settings be separated from visual settings?
- How should OBS users reproduce a scene without exposing private values?
- How can invalid or unsupported config values be normalized safely?

Open decision: the suite should preserve URL reproducibility for visual configuration where practical, but should not encode secrets, OAuth tokens, API keys, private account identifiers, or raw user data.

## Initial Recommendation

Start with Candidate A: a manual or fixture keyword reaction overlay prototype. It is the safest MVP path because it tests the on-stream visual value while avoiding YouTube API, OAuth, API keys, real viewer data, external sending, and policy claims.

Candidate B can run in parallel as shared contract planning if it does not dilute the existing clock tool. Candidate C should wait until the policy/data boundary is reviewed and separately approved.
