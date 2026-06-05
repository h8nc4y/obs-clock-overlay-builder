# Roadmap

This roadmap records likely directions for OBS Clock Overlay Builder. It is not a commitment to ship every item, and dates are intentionally omitted until release planning is concrete.

## Short Term

- Improve README screenshots and examples when the UI changes.
- Collect public feedback through GitHub issue templates.
- Polish docs for OBS setup, troubleshooting, and contributor onboarding.
- Keep Codex for OSS readiness evidence current without claiming application submission or acceptance.
- Define the YouTube Live overlay suite concept, MVP requirements, and data/policy boundary before any integration work.
- Keep Candidate A matching normalization, preview/config consistency, overlay runtime, single synthetic event, and event source shape decisions aligned with the actual PR sequence.
- Keep event transport, fixture linkage, toast queue runtime, ticker, badge, and YouTube integration separated from the overlay queue connection work.
- Keep Candidate A transport scope explicit before any transport implementation.

## Medium Term

- Record public-safe OBS real-device QA results.
- Expand accessibility and keyboard QA for the builder UI.
- Use public issues to triage feedback, bugs, and small improvements.
- Consider an optional simple/advanced control mode if feedback shows the editor is too dense for first-time users.
- Implement Candidate A first as a route/static skeleton for `/overlay/keyword-reaction/`.
- Follow the skeleton with manual input + toast using editor preview, artificial manual text, config-only generated URLs, and integer UI steps for `intensity`.
- Fix preview/config consistency so preview matching and generated URL config use the same normalized config.
- Keep fixture playback artificial and editor-preview scoped; keep paste JSON, overlay runtime event rendering, ticker, badge, and import/export as later follow-ups.
- Implement the next small Candidate A PR as a config-aware overlay runtime skeleton for `/overlay/keyword-reaction/`.
- After the config-aware skeleton, define and implement a single synthetic event rendering PR using an explicit `demo=1` public-safe flag.
- After single synthetic event rendering, define event source shape helper + tests before event transport or fixture linkage.
- After event shape helper, define queue / transport boundaries and implement queue helper + tests before event transport or fixture linkage.
- After queue helper + tests, define overlay runtime queue connection scope before connecting `demo=1` rendering to the queue helper.
- After overlay runtime queue connection, define transport scope before any `postMessage`, `BroadcastChannel`, `localStorage` transport, or external network transport.
- After transport scope, consider a small event intake boundary helper before any cross-window transport or fixture linkage.
- Keep transport implementation, event source, built-in fixture linkage, toast queue runtime, ticker, badge, and real integration as separate follow-up PRs.
- Revisit NFKC, full-width / half-width, and kana / katakana normalization only after feedback, fixture QA, or concrete matching cases justify it.

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
- [Candidate A implementation scope decision](CANDIDATE_A_IMPLEMENTATION_SCOPE_DECISION.md)
- [Candidate A manual input + toast scope decision](CANDIDATE_A_MANUAL_TOAST_SCOPE_DECISION.md)
- [Candidate A matching normalization decision](CANDIDATE_A_MATCHING_NORMALIZATION_DECISION.md)
- [Candidate A fixture playback scope decision](CANDIDATE_A_FIXTURE_PLAYBACK_SCOPE_DECISION.md)
- [Candidate A overlay runtime scope decision](CANDIDATE_A_OVERLAY_RUNTIME_SCOPE_DECISION.md)
- [Candidate A single synthetic event scope decision](CANDIDATE_A_SINGLE_SYNTHETIC_EVENT_SCOPE_DECISION.md)
- [Candidate A event source shape decision](CANDIDATE_A_EVENT_SOURCE_SHAPE_DECISION.md)
- [Candidate A queue / transport scope decision](CANDIDATE_A_QUEUE_TRANSPORT_SCOPE_DECISION.md)
- [Candidate A overlay queue connection scope decision](CANDIDATE_A_OVERLAY_QUEUE_CONNECTION_SCOPE_DECISION.md)
- [Candidate A transport scope decision](CANDIDATE_A_TRANSPORT_SCOPE_DECISION.md)
- [Candidate A keyword reaction overlay design](CANDIDATE_A_KEYWORD_REACTION_OVERLAY_DESIGN.md)
- [Candidate A URL contract draft](CANDIDATE_A_URL_CONTRACT_DRAFT.md)
- [Candidate A fixture schema draft](CANDIDATE_A_FIXTURE_SCHEMA_DRAFT.md)
- [Candidate A security and QA plan](CANDIDATE_A_SECURITY_AND_QA_PLAN.md)
- [YouTube data policy boundary](YOUTUBE_DATA_POLICY_BOUNDARY.md)
- [Issue #30: YouTube Live focused OBS overlay suite exploration](https://github.com/h8nc4y/obs-clock-overlay-builder/issues/30)

Near-term sequence:

1. Gather feedback on the suite direction and MVP scope.
2. Implement the first Candidate A PR as route/static skeleton only.
3. Follow with manual input + toast once the overlay-only surface is stable; keep this PR editor preview centered and do not include manual input text in generated URLs.
4. Fix preview/config consistency so normalized config is the source of truth for both generated URL and preview matching.
5. Fix fixture playback + schema validation scope; prefer built-in artificial fixture first.
6. Add built-in artificial fixture playback in editor preview only; keep paste JSON, overlay runtime event rendering, ticker, badge, and import/export as later follow-ups.
7. Define and implement a config-aware overlay runtime skeleton that reads `?c=...`, stays transparent when idle, and shows debug status only by explicit flag.
8. Define and implement single synthetic event rendering via explicit `demo=1`; keep idle transparent and keep event source / fixture linkage out of that PR.
9. Define event source shape helper + tests; keep generated URLs config-only and keep event payloads out of URLs.
10. Define queue / transport boundaries; keep generated URLs config-only and keep queue state, event payloads, and transport payloads out of URLs.
11. Implement queue helper + tests only; keep transport, event source, fixture linkage, and toast queue runtime out of that PR.
12. Define overlay runtime queue connection scope; keep `demo=1` as the only queued event source for the next implementation PR.
13. Implement overlay runtime queue connection only after that scope is fixed; keep transport, fixture linkage, and real integration out of that PR.
14. Define transport scope; keep generated URLs config-only and keep localStorage transport, external network, and YouTube integration out of initial transport work.
15. Consider a small local event intake boundary helper before any `postMessage`, `BroadcastChannel`, event source, or fixture linkage implementation.
16. Consider event source and fixture linkage only after the normalized event shape, queue helper, overlay queue connection, and transport boundary are stable.
17. Review YouTube API/OAuth/data policy boundaries before any real YouTube integration.

These items are exploratory. They are not committed release scope and are not evidence of broad adoption.

## Out Of Scope For Now

- Claiming broad adoption, critical infrastructure status, or Codex for OSS acceptance.
- Adding paid services or hosted databases.
- Creating YouTube API keys, OAuth flows, or real YouTube data integrations without separate review and approval.
- Bundling font files without documented license review.
- Making `/clock/` depend on editor `localStorage`.
