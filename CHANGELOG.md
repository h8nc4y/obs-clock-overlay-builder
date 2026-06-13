# Changelog

All notable public changes to this project will be recorded in this file.

This project follows the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The `v0.1.0` GitHub Release and tag exist; later entries should be tied to future tags when releases are created.

## [Unreleased]

## [0.6.1] - 2026-06-13

### Changed

- The default clock now hides seconds (shows HH:MM), matching the template cards. Turn on 秒を表示する when you want seconds. Because `DEFAULT_CONFIG` changed, short (compact) `?c=` URLs created before this release may render without seconds for any omitted value; full `?c=` URLs are unaffected.
- Slightly reduced the flip templates' font size and dropped seconds from the default so the flip clock fits inside the builder live preview without overflowing.

## [0.6.0] - 2026-06-13

### Added

- Flip (パタパタ) clock as a new clock type. Each card is split into an upper and lower face; on change the upper face folds forward and the lower face swings up — a real split-flap motion. You can group the digits one-at-a-time or two-at-a-time (桁のまとめ方). This is an original implementation and is not derived from any third-party flip-clock code. Three flip templates: Flip Light, Flip Dark, and Flip Pair. It reuses the existing color / font / size / corner settings and is fully reproducible from `/clock/?c=...`.
- Analog Roman numerals (目盛り = ローマ数字) and a date on the dial (the 日付を表示 toggle now applies to analog). Two new analog templates: Classic Roman and Cafe Brown.
- The builder clock-type switch is now three-way: デジタル / アナログ / パタパタ.

### Changed

- Template lineup grows to 17 across five genres (定番 / かわいい / クール / アナログ / パタパタ). Existing `/clock/?c=...` URLs keep working.

## [0.5.0] - 2026-06-13

### Added

- Analog clock as a new clock type. In the builder, switch between デジタル and アナログ; for analog you can set the face color (背景色), number/hand color (文字色), rim color (枠線色), second-hand color (縁取り色), size, marks (numbers / ticks / both / none), and second-hand motion (sweep / tick / off). Two analog templates: Navy Round and Mono Round.
- The analog clock is drawn as scalable SVG (no bundled images) and is fully reproducible from the same config-only `/clock/?c=...` URL. Hands advance via requestAnimationFrame when visible, with a per-second fallback.

## [0.4.0] - 2026-06-13

### Added

- Rebuilt the clock templates around real streamer-overlay craft (inspired by popular OBS clock assets): soft card depth, signature accents (a pulsing LIVE badge, a sakura petal, soda bubbles, pastel dots, neon corner brackets, an aqua accent bar), and signature shapes. 10 templates in 3 genres: 定番 (Mono Compact, Clean White, Studio Live), かわいい (Milk Tea, Sakura, Pastel Pop, Soda), クール (Night Studio, Neon HUD, Aqua Deck).

### Fixed

- Clearing the label field now hides the label instead of forcing the default "JST" to appear.
- The clock frame width and the colon position no longer move while streaming. Each digit is drawn in a fixed-width slot, so the overall width stays constant as the time ticks (the digits themselves still change). The frame still auto-resizes while you edit settings in the builder.

### Changed

- Removed the previous 和風 genre and the weaker auto-generated templates; the lineup is now a tighter, more polished set. Generated `?c=` URLs keep working; flat `?template=` links for removed ids fall back to the default.

## [0.3.1] - 2026-06-13

### Fixed

- The default `/clock/` overlay (opened with no parameters) and the "Clean White" template are now dark text on a light panel, making them readable on any stream background. The previous white-text-on-transparent default was hard to see over bright scenes.

### Changed

- The builder default is now the readable Mono Compact look (dark monospace text on a near-white panel). The former "Minimal Clear" is renamed "Clean White" and uses a readable light panel instead of a transparent background.
- Because `DEFAULT_CONFIG` changed, short (compact) `?c=` URLs created before this release may render with the new readable default for any omitted values. Full `?c=` URLs are unaffected because they embed every value.

## [0.3.0] - 2026-06-13

### Changed

- Refreshed the five cute-series templates (Pastel Pop, Sakura, Soda, Yume Lavender, Milk Tea) with market-researched pastel palettes: whiter backgrounds, 2px candy-color borders, same-hue soft shadows, and larger rounding. Simple and dark templates are unchanged.
- Added Mochiy Pop One, Hachi Maru Pop, and Yusei Magic to the free font name candidates (names only, no bundled files) and assigned them to cute templates.
- Existing generated `/clock/?c=...` URLs are unaffected. Legacy flat-query URLs such as `?template=sakura` now render with the refreshed preset colors (documented intentional change; golden fixtures regenerated).

## [0.2.1] - 2026-06-13

### Fixed

- Template cards no longer clip wide clock previews (Soda, Sakura, Night Studio, Neon HUD, Cinema Bar). Mini previews now auto-fit to the card width.

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
