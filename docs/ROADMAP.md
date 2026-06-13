# Roadmap

This roadmap records likely directions for OBS Clock Overlay Builder. It is not a commitment to ship every item, and dates are intentionally omitted until release planning is concrete.

このプロジェクトは **時計オーバーレイ専用** です。チャット/コメント反応(旧 Candidate A: キーワード反応オーバーレイ)は別プロジェクト `007_yt-live-word-alert-overlay` へ移したため、011 では実装しません。

## Short Term

- Improve README screenshots and examples when the UI changes.
- Collect public feedback through GitHub issue templates.
- Polish docs for OBS setup, troubleshooting, and contributor onboarding.
- Keep Codex for OSS readiness evidence current without claiming application submission or acceptance.
- Gather streamer feedback on the digital / analog / flip clock templates and refine the lineup.

## Medium Term

- Record public-safe OBS real-device QA results.
- Expand accessibility and keyboard QA for the builder UI.
- Use public issues to triage feedback, bugs, and small improvements.
- Consider additional clock types or template genres only if feedback shows demand.
- Revisit NFKC, full-width / half-width, and kana / katakana normalization for labels only when concrete cases justify it.

## Long Term

- Explore additional reproducible, transparent OBS overlay surfaces if the clock builder proves useful, kept config-only and backend-free.
- Consider suite naming, shared documentation, or an umbrella repository only after multiple related tools exist.
- Revisit a Codex for OSS application after objective public signals grow, such as issue triage history, release notes, real OBS QA evidence, external mentions, stars, forks, or other verifiable usage signals.

These items are exploratory. They are not committed release scope and are not evidence of broad adoption.

## Out Of Scope For Now

- Claiming broad adoption, critical infrastructure status, or Codex for OSS acceptance.
- Adding paid services or hosted databases.
- Chat / comment reaction features, YouTube API keys, OAuth flows, or real YouTube data integrations. These belong to project `007_yt-live-word-alert-overlay`, not here.
- Bundling font files without documented license review.
- Making `/clock/` depend on editor `localStorage`.
