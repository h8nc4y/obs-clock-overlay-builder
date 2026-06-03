# YouTube Live Overlay Suite Concept

## Status

This document is an exploration plan for a possible future YouTube Live focused OBS overlay suite.

It does not mean the suite is implemented, scheduled for release, submitted to Codex for OSS, accepted by Codex for OSS, or proven by user adoption. It records a public planning direction that can be discussed through issue #30.

Related issue:

- <https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30>

## Current Confirmed Product

The current implemented product is OBS Clock Overlay Builder:

- It generates transparent OBS browser-source clock overlay URLs.
- The dedicated `/clock/` surface is clock-only and transparent-background friendly.
- The generated `/clock/?c=...` URL is the source of truth for OBS reproducibility.
- The app is static-first, has no backend database, and does not require accounts.

In a future suite, the clock overlay can be treated as the first member of a broader OBS browser-source overlay toolkit. That suite is not implemented yet.

## Candidate Suite Direction

The headline direction to explore is a set of safe OBS browser-source overlays for YouTube Live creators:

- YouTube Live keyword reaction overlay.
- Comment or chat signal overlay.
- Local/static-first overlay tools that are easy to paste into OBS.
- URL-driven configuration that can be reproduced, tested, and shared safely.

The suite should preserve the current project values:

- OBS-friendly browser-source surfaces.
- Clear separation between editor surfaces and overlay-only surfaces.
- Public-safe documentation and issue triage.
- No secrets, API keys, OAuth tokens, payment details, or raw user data in the repository.
- Conservative claims: planning evidence is not adoption evidence.

## Why This Could Help OBS Streamers

OBS creators often need small on-stream utilities that are easy to add as Browser Sources and easy to recover when scenes are rebuilt. A suite could help by:

- reducing setup friction for non-programmer creators;
- keeping overlay configuration reproducible through URLs or importable config;
- separating stream visuals from private account configuration;
- giving maintainers a clear public roadmap for feedback and QA;
- making privacy and data boundaries visible before any YouTube integration work begins.

## Confirmed vs Exploration

Confirmed today:

- The clock overlay builder exists and is public.
- The production demo exists.
- `v0.1.0` release/tag exists.
- Public feedback and roadmap issues exist.
- Issue #30 is open for YouTube Live overlay suite exploration.

Exploration only:

- YouTube Live keyword reaction overlay.
- Comment/chat signal overlay.
- Shared suite naming or umbrella repository.
- YouTube API, OAuth, API key, quota, policy, and data handling design.
- Any implementation that consumes live chat, comments, replay data, or author-centric views.

## Codex for OSS Positioning

This concept strengthens the public planning record for a future Codex for OSS application by showing where the project may grow next and how risks will be handled before implementation.

It should be described as:

- public product planning;
- maintainer roadmap evidence;
- issue-driven feedback triage;
- a candidate headline feature direction.

It should not be described as:

- accepted into Codex for OSS;
- submitted to Codex for OSS;
- a completed YouTube integration;
- broad adoption or many users;
- proof of increased stars or forks.

## Next Planning Steps

1. Gather feedback in issue #30.
2. Keep the first MVP local, manual, or fixture-driven where possible.
3. Decide whether the `/clock/?c=...` reproducibility model should become a shared suite contract.
4. Review YouTube data, OAuth, API key, quota, and policy boundaries before any real integration.
5. Define a small implementation PR only after the safe MVP scope is clear.
