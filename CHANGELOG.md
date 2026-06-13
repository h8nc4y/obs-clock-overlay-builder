# Changelog

All notable public changes to this project will be recorded in this file.

This project follows the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The `v0.1.0` GitHub Release and tag exist; later entries should be tied to future tags when releases are created.

## [Unreleased]

## [0.2.0] - 2026-06-13

### Added

- Switchable editor themes inspired by tools familiar to Japanese streamers: white (default), coral, and soft-gradient blue. The choice persists in editor localStorage only and never affects `/clock/` output.
- Six new clock templates: Yume Lavender, Cream Soda, Cyber Frame, Retro LCD, Cinema Bar, and Sumi (14 templates total).
- Template category tabs (かわいい / ゲーム / シック / 和風) with template cards that render the actual clock appearance on a transparent checker.
- Template compatibility golden guard tests that freeze `DEFAULT_CONFIG`, the original eight template presets, representative `?c=` URLs, and `applyClockStyles` output.

### Changed

- Rebuilt the editor as a step flow (1. choose a template, 2. adjust with かんたん/こだわり layers, 3. paste into OBS) with the keyword reaction experiment collapsed into a bottom "実験室" section.
- Split `styles.css` into `tokens.css` / `base.css` / `clock.css` / `overlay.css` / `builder.css`; the old `styles.css` remains as an import shim for cached HTML.
- Existing generated `/clock/?c=...` URLs keep their exact appearance (guarded by golden tests). Legacy flat-query URLs are also unchanged because the original eight template presets were kept frozen.

## [0.1.1] - 2026-06-13

### Added

- Public feedback route through GitHub issue templates for bug reports, feature requests, and general feedback.
- Public roadmap documenting short-, medium-, and long-term directions without treating future work as committed.
- Feedback guide for OBS users, including screenshot cautions and generated URL privacy guidance.
- Experimental keyword reaction overlay surface at `/overlay/keyword-reaction/` with editor-preview-only manual input and built-in artificial fixture playback. Generated URLs stay config-only and the overlay stays transparent while idle.
- Query-gated limited `BroadcastChannel` prototype (`bcPrototype=1`) for the keyword reaction overlay, verified locally with synthetic data only.
- Keyword reaction event, queue, local intake, internal dispatch, and fixture linkage helpers with focused Node tests.

### Changed

- Refreshed the editor UI, improved preview background controls, and strengthened local font guidance for non-programmer OBS users.
- README now links to feedback, roadmap, changelog, and Codex-assisted maintenance evidence.
- Codex for OSS readiness docs now record public feedback and roadmap docs as application-preparation evidence.
- Manual QA and release notes now cover design-refresh viewports and the keyword reaction experiment boundaries.

### Fixed

- Editor live preview clipping and overflow with large fonts.
- Neon clock glow clipping in the editor preview.
- URL config now takes priority over editor draft state when both are present.
- Release HTTP smoke test now stops its local server reliably.

## [0.1.0] - 2026-05-20

GitHub Release: <https://github.com/h8nc4y/obs-clock-overlay-builder/releases/tag/v0.1.0>

### Added

- OBS clock overlay builder for generating transparent browser-source clock URLs.
- Dedicated `/clock/` surface for clock-only OBS playback.
- Reproducible `/clock/?c=...` URL contract where the generated URL is the source of truth for OBS scenes.
- Static-first project structure for Cloudflare Workers Static Assets deployment.
- Japanese-first editor UI for non-programmer OBS users in Japan.
- Public OSS readiness documentation, contribution guide, code of conduct, and AI-assisted maintenance notes.
- README screenshot showing the editor.

### Changed

- Refreshed the editor UI design to make preview, generated OBS URL, and design controls easier to scan.

### Security

- URL-provided labels and font names are treated as text rather than HTML.
- `/clock/` remains independent from editor `localStorage`.
