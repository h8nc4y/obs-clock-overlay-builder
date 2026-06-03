# Changelog

All notable public changes to this project will be recorded in this file.

This project follows the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Release tags are pending; entries below describe repository history and should not be treated as published release notes until a tag exists.

## [Unreleased]

### Added

- Public feedback route through GitHub issue templates for bug reports, feature requests, and general feedback.
- Public roadmap documenting short-, medium-, and long-term directions without treating future work as committed.
- Feedback guide for OBS users, including screenshot cautions and generated URL privacy guidance.

### Changed

- README now links to feedback, roadmap, changelog, and Codex-assisted maintenance evidence.
- Codex for OSS readiness docs now record public feedback and roadmap docs as application-preparation evidence.

## [0.1.0] - tag pending

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
