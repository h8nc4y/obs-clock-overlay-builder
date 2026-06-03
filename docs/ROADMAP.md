# Roadmap

This roadmap records likely directions for OBS Clock Overlay Builder. It is not a commitment to ship every item, and dates are intentionally omitted until release planning is concrete.

## Short Term

- Improve README screenshots and examples when the UI changes.
- Collect public feedback through GitHub issue templates.
- Polish docs for OBS setup, troubleshooting, and contributor onboarding.
- Keep Codex for OSS readiness evidence current without claiming application submission or acceptance.
- Define the YouTube Live overlay suite concept, MVP requirements, and data/policy boundary before any integration work.
- Prepare Candidate A keyword reaction overlay design docs before implementation.

## Medium Term

- Record public-safe OBS real-device QA results.
- Expand accessibility and keyboard QA for the builder UI.
- Use public issues to triage feedback, bugs, and small improvements.
- Consider an optional simple/advanced control mode if feedback shows the editor is too dense for first-time users.
- Explore a safe MVP prototype for a keyword reaction overlay using manual input or fixtures before any YouTube API/OAuth work.
- Implement Candidate A in a small PR only after design, URL contract, fixture schema, and security/QA boundaries are reviewed.

## Long Term

- Explore a broader YouTube Live OBS overlay suite if the clock builder proves useful.
- Explore a keyword reaction overlay for chat-driven or stream-context visuals.
- Review YouTube API, OAuth, data handling, quota, and policy requirements before any real YouTube integration.
- Consider suite naming, shared documentation, or an umbrella repository only after multiple related tools exist.
- Revisit a Codex for OSS application after objective public signals grow, such as issue triage history, release notes, real OBS QA evidence, external mentions, stars, forks, or other verifiable usage signals.

## Headline Feature Exploration

Current planning docs:

- [YouTube Live overlay suite concept](YOUTUBE_LIVE_OVERLAY_SUITE_CONCEPT.md)
- [Headline feature MVP requirements](HEADLINE_FEATURE_MVP_REQUIREMENTS.md)
- [Candidate A keyword reaction overlay design](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [Candidate A URL contract draft](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [Candidate A fixture schema draft](CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md)
- [Candidate A security and QA plan](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YouTube data policy boundary](YOUTUBE_DATA_POLICY_BOUNDARY.md)
- [Issue #30: YouTube Live focused OBS overlay suite exploration](https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30)

Near-term sequence:

1. Gather feedback on the suite direction and MVP scope.
2. Keep the first prototype local, manual, or fixture-driven when possible.
3. Validate OBS Browser Source behavior and URL/config reproducibility.
4. Use Candidate A design docs to split a small implementation PR.
5. Review YouTube API/OAuth/data policy boundaries before any real YouTube integration.

These items are exploratory. They are not committed release scope and are not evidence of broad adoption.

## Out Of Scope For Now

- Claiming broad adoption, critical infrastructure status, or Codex for OSS acceptance.
- Adding paid services or hosted databases.
- Creating YouTube API keys, OAuth flows, or real YouTube data integrations without separate review and approval.
- Bundling font files without documented license review.
- Making `/clock/` depend on editor `localStorage`.
