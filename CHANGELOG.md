# Changelog

All notable public changes to this project will be recorded in this file.

This project follows the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Every version ships a git tag and a GitHub Release; see the [GitHub Releases](https://github.com/h8nc4y/obs-clock-overlay-builder/releases) page and `package.json` for the current version.

## [1.6.0] - 2026-07-03

### Added

- Date display is now tuned by independent axes instead of a single preset: year on/off (`dateYear`), month/day zero-padding (`dateZeroPad`), and separator (`dateSeparator`: `/`, `-`, or Japanese 「Y年M月D日」). All 12 combinations render. Requested and approved by the owner (2026-07-03).
- Weekday: a new 「曜日を（）で囲む」 option wraps the weekday in brackets — full-width （金） for Japanese formats, ASCII (Fri) for English formats (`weekdayBrackets`).
- 12-hour clock: a new 「AM/PMを時刻の前にする」 option renders `AM 09:51` instead of `09:51 AM` (`meridiemFirst`); it flows through the live clock, the flip clock, and the share PNG. The checkbox is disabled while 24-hour display is selected.
- Editor: in the 「こだわり」 display settings, the label-position select moved to the left end of the row, matching the label controls' position in the simple mode.

### Changed

- Backward compatibility: legacy `dateFormat` values (`slash` / `dash` / `monthDay` / `jp`) in shared `?c=` URLs, flat queries, JSON imports, and saved editor drafts are mapped onto the new fields and render **identically** to before; `dateFormat` itself is no longer emitted. The template-compat golden fixture was intentionally regenerated for the new config fields (no template visual values changed).

## [1.5.1] - 2026-07-02

### Fixed

- Digital clock 「秒を小さく表示」: the small seconds slot is now bottom-aligned with the main `HH:MM` digits (`vertical-align: baseline`) instead of hanging below them. The share-image PNG renderer mirrors the same alignment. Requested and approved by the owner (2026-07-02).
- Template picker: digital template cards now render the real clock structure (label badge, template decorations, small seconds) via the same renderer as the live preview, so the mini preview no longer differs from what applying the template shows.
- Template picker: the mini preview cards now reflect your current display settings (seconds, small seconds, date, weekday, and their formats, plus timezone/12-hour) instead of always showing the defaults, so a card previews exactly what clicking it will produce. Requested and approved by the owner (2026-07-02).
- Templates `Studio Live` / `Night Studio`: the accent underline under the time now extends beneath the small seconds when 「秒を小さく表示」 is on, instead of stopping at the `HH:MM` digits. The share-image PNG renderer already spanned the full width and is unchanged. Requested and approved by the owner (2026-07-02).

### Changed

A batch of approved UI/UX review polish items (2026-07-02). The `/clock/?c=...` reproduction contract, the live clock rendering, and the strict CSP are unchanged. Requested and approved by the owner.

- Mobile layout (≤1100px): the 「作った時計をXでシェア」 share panel now appears after the STEP sections instead of immediately below the live preview, so the setup steps are not buried under the promotional panel. The desktop two-column layout is unchanged.
- Accessibility: the floating mini preview no longer hides the settings-side headings on mobile — STEP headings and anchor/skip-link targets now reserve `scroll-margin-top` so keyboard focus and jumps land below the floating preview.
- The generated-URL character count now uses a neutral muted color instead of the success green, so it reads as information rather than a copy confirmation; the actual "copied" message still shows in green.
- Accessibility: the STEP numbers (1/2/3) are now announced to screen readers via a visually-hidden 「STEP 1: 」 prefix in each step heading (the visible badge stays `aria-hidden`).
- Added a short helper line under the recommended width/height explaining they are the values to enter in OBS's browser source.
- Reworded the lead paragraph's second sentence to be more active and concrete about saving/sharing the single generated URL to restore the same clock on another PC.
- Reworded the share section heading to 「作った時計をXでシェア」 and softened the body copy's promotional tone slightly while keeping the discovery/word-of-mouth intent.

## [1.5.0] - 2026-06-19

### Added

- Digital clock: added a 「秒を小さく表示」 option that keeps the main time as `HH:MM` while rendering seconds as a smaller lower-right slot when seconds are enabled.
- Templates: added the standard `Mono Sub` template for small-seconds display. The built-in template lineup is now 18 templates across the existing five categories.
- Share image: the promo PNG renderer mirrors the small-seconds layout, including the half-size seconds, lowered baseline, spacing, and stroke scaling. The `/clock/?c=...` reproduction contract is unchanged.

### Tests

- Added direct unit coverage for the share-image small-seconds measurement and drawing helpers, in addition to the config/time/render coverage for the new URL field and live `/clock/` DOM slot.

## [1.4.0] - 2026-06-17

A hardening pass from a full multi-agent source review (8 dimensions, each finding adversarially re-verified). The core was healthy (no blockers/majors); these are the confirmed minor/nit fixes, test-coverage additions, and accessibility/consistency polish. The `/clock/?c=...` reproduction contract, the live clock rendering, and the strict CSP are unchanged.

### Fixed

- Share image: a stale promo PNG could be shared for a brief moment if you kept editing while an auto-regeneration was in flight. Image generation now uses a generation counter so only the latest render commits the blob/preview/save-link.
- Share image: for templates whose label sits beside the time (`labelPosition: left`/`right`) with a long label and a large font, the time could overflow the card. The side-label layout now also shrinks horizontally and re-centers so the content stays inside the panel.
- Config import: importing a settings JSON with `null`/empty numeric values (from another tool or hand-editing) no longer collapses them to `0` (e.g. a fully transparent background); they now fall back to the proper defaults. The `/clock/?c=...` payload was never affected.
- Flip clock: rapid consecutive flips of the same digit (e.g. right after the tab regains focus) no longer briefly show a two-steps-old face.

### Changed

- Accessibility: the contrast warning is now a live region (`role="status"`), so screen readers are notified when it appears; the secondary-button hover text color now meets WCAG AA (4.5:1) across all three editor themes; the `ふんわりブルー` (fanbox) theme's muted text and eyebrow color were darkened slightly to meet AA over its gradient background.
- Performance: dragging a range slider now debounces the `localStorage` save and the generated-URL re-encode (the live preview still updates immediately), reducing per-frame work during a drag.
- Maintainability: `tokens.css` now holds only values genuinely shared by both the builder and `/clock/` (the builder white-theme palette is owned solely by `builder.css`, removing dead/overridden tokens); the Roman-numeral list and the share-image download-link enable/disable logic are now single-sourced; the share-image decoration drawing moved to a dedicated `share-decorations.js` module; the side-label and stacked share-layout math are pure functions in `share.js`. No visual/behavioral change.

### Tests

- Added coverage for: the stacked and side-label share-layout math (fit/clamp), the share-image template decoration drawing (via a Canvas spy), `time.js` date/weekday/12-hour/timezone-boundary formatting, the bare-`c=` import path, `clampNumber` null/empty fallback, compact round-trip for non-default analog/flip fields, and the shadow-`none` / flip CSS-variable render branches. Test count 118 → 139.

### Docs

- Documented the live-preview pinning/float feature in the README and added pin/float QA steps to `docs/manual-qa.md`.

## [1.3.4] - 2026-06-17

### Fixed

- The promo share PNG now matches the live clock for templates whose label sits beside the time (`labelPosition: left`/`right` — the built-in Neon HUD and Soda). The live clock (and OBS `/clock/`) lays the label out next to the date+time block (vertically centered), but the share image was stacking it above/below, so Neon HUD/Soda looked misaligned between the live preview and the shared image. The share image now lays left/right labels beside the date+time block, matching the live `.clock-widget` flex layout (gap, main grid spacing, vertical centering). Top/bottom/hidden label positions are unchanged. The `/clock/?c=...` output and the live clock are unchanged (only the promo image rendering was corrected).

## [1.3.3] - 2026-06-16

### Changed

- The pin (📌) toggle now sits **on the live preview itself** (top-right corner of the preview box) instead of in the preview heading, so the control lives on the thing it controls. It is a compact icon-only round button; its state is shown by fill color (pinned = accent fill, unpinned = white outline) and the pin's tilt, with the accessible name (`aria-label`) and a hover tooltip (`title`) kept in sync. On desktop the button travels with the clock while pinned (it is inside the sticky clock box). Editor-only; the `/clock/?c=...` output is unchanged.

## [1.3.2] - 2026-06-16

### Fixed

- On desktop, the pinned live preview now keeps following all the way down while you scroll the settings. Previously, in 「こだわり」 (advanced) mode the right-hand settings column grows much taller than the left preview column, and because a `position: sticky` element can only travel within its own containing block (the left column), the floating clock stopped following partway down. The pinned preview column now stretches to the full grid-row height (`align-self: stretch`) with its panels kept top-aligned (`align-content: start`), so the sticky clock travels the entire scroll. CSS-only, desktop (>1100px) only; mobile and the `/clock/?c=...` output are unchanged.

## [1.3.1] - 2026-06-15

### Changed

- Editor wording polish (from a UI/UX review): the weekday options now read 「短い英語」「長い英語」 to match the Japanese pair, the copy-success message quotes the actual 「Xでシェアして広める」 heading, the "確認中…" / "作成中…" ellipses are unified, and the easy-mode analog hint no longer lists the 枠線色/縁取り色 colors that only appear in the advanced tab.
- Editor visual consistency: the preview-toolbar label color and the theme-picker corner radius now follow theme tokens (`var(--ink)` / `var(--button-radius)`) instead of hardcoded values.

### Fixed

- Accessibility: color swatch buttons now announce a Japanese label (e.g. 「文字色 を #ffffff にする」) instead of the internal English id; the pin button's initial `aria-label` now matches its pressed (固定中) state.
- The share image's "PNGを保存" link is now disabled when image generation fails, so a previously generated (stale) PNG can no longer be downloaded after an error.
- On browsers without `IntersectionObserver`, the pinned mobile preview no longer floats permanently (which showed the clock twice); the fallback now shows only the real preview.

### Docs

- Refreshed stale "only `v0.1.0` is released" statements in the CHANGELOG intro and the Codex-for-OSS readiness/evidence docs (every version now ships a tag + GitHub Release), and updated manual-qa's analog template examples to list all four analog templates.

## [1.3.0] - 2026-06-15

### Changed

- The promo share PNG (1200x675) now reproduces each digital template's decoration faithfully, matching the live clock (`clock.css` `.template-*`). soda draws bubbles and neon-hud draws corner brackets (previously a stand-in underline), and night-studio (cyan underline + outline badge), pastel-pop (three-color dots), sakura (sakura mark), and aqua-deck (top gradient bar + aqua badge) are now rendered too. studio-live is unchanged (red underline + filled LIVE badge with dot). All decorations are drawn with Canvas primitives only.

## [1.2.5] - 2026-06-15

### Fixed

- On mobile, the pinned floating preview no longer rapidly flickers (toggling visible/hidden many times a second). The `IntersectionObserver` was watching `#previewShell` — the very element that floats to the top of the screen when it scrolls off — so floating it brought it back into view, which made the observer immediately un-float it, and so on in a tight loop. The observer now watches the outer placeholder box (`.preview-stage-dock`) instead, which keeps its size and position (height is reserved while floating) regardless of float state, so the visibility decision depends only on scroll position. Desktop behaviour is unchanged.

## [1.2.4] - 2026-06-15

### Changed

- On mobile, the pinned floating preview is now **the real live-preview clock box at its real size** — the same box desktop floats — instead of a small scaled-down copy. When you scroll the settings and the real preview leaves the top, that exact preview box floats at the top; the space it leaves is reserved so the page doesn't jump, and it keeps updating live as you change settings. The separate mini-clock replica was removed. Desktop behaviour is unchanged.

## [1.2.3] - 2026-06-15

### Changed

- On mobile, the floating mini-clock (shown while the preview is pinned) now appears **only after the real preview scrolls off the top**, instead of always. So at the top of the page you no longer see the same clock twice — you just see the real live preview; the compact floating clock fades in once the real one leaves the top of the screen and disappears again when you scroll back up. Implemented with an `IntersectionObserver` on the live preview (with a graceful fallback to always-show on browsers without it). Desktop behaviour is unchanged.

## [1.2.2] - 2026-06-15

### Changed

- On phones/tablets (≤1100px) the builder now shows the preview column first — live preview, OBS URL, and the "Xでシェア" panel — and the template/settings area below it (the desktop left-then-right order). Previously the settings came first, which buried the share panel ~4100px down the page so it was easy to miss; it now sits near the top of the scroll. CSS-only (grid-template-areas), no change to the `/clock/?c=...` output.

## [1.2.1] - 2026-06-15

### Changed

- The pin (📌) now floats only a **compact clock**, not the whole left column — on **both desktop and mobile**. On desktop the clock box itself becomes sticky inside the left column, so the OBS URL and share panels scroll normally below it. On mobile a short floating mini-clock strip stays at the top of the screen while you scroll the settings; taps pass through to the controls beneath. The mini-clock mirrors the same state as the main preview, so it updates as you adjust settings. Switching かんたん / こだわり no longer jumps the layout in either mode.
- The live preview now ticks every second (the floating mini-clock too), so the clock stays current while you work — independent of `/clock/`.
- The share promo image now auto-regenerates ~400 ms after each settings edit (only when a preview was previously generated), so the thumbnail always reflects the current design without having to click 「プレビュー画像を作り直す」 between edits.
- The share Canvas now reproduces template decorations on the promo PNG: Studio Live's red time-underline + red LIVE badge, Soda's cyan underline, and Neon HUD's teal underline. Pulsing dots become static; the goal is a faithful-enough teaser, not pixel-perfect.

### Fixed

- The 「画像を共有」 button rendered as a giant rounded oval on mobile (≈200 px tall) because a row-only `flex-basis` was being put on the column axis when the row wrapped. Now both share buttons keep their normal 44 px height.

## [1.2.0] - 2026-06-15

### Added

- A pin (📌) toggle on the live preview (desktop). Pinned — the default — keeps the live clock at the top of the left column so you can watch it while adjusting settings on the right; unpin to scroll the left column down to the OBS URL and share panels. The choice is remembered. This also removes a layout jump where switching the かんたん / こだわり adjust mode could shift the left preview by ~340px: the sticky behaviour now lives on the live-preview panel alone instead of the whole column. The toggle is hidden on narrow (≤1100px) single-column layouts.

### Changed

- Polish and hardening from a multi-agent UI/UX + health review (0 blockers; all findings minor):
  - On phones the builder now shows Step 1 (テンプレを選ぶ) before the preview / copy / share output, so the 1→2→3 flow reads top-to-bottom; the template grid opens on the curated 定番 category instead of all templates; `.field-inline` rows stack full-width on narrow screens.
  - Clearer Japanese copy: the label helper no longer reads like a security warning, the copy-URL success message bridges to "paste into OBS → share on X", and the font explanation is consolidated.
  - Accessibility: the share-preview image's `alt` now reflects whether an image exists / has gone stale; range sliders announce their value and unit (`aria-describedby` + `aria-valuetext`); the かんたん/こだわり tabs no longer double-signal ARIA.
  - Visual: the info/warning notes and inner corner radii now follow each of the three editor themes (white / booth / fanbox) instead of fixed colors.
  - Internals: the flip digit-grouping and the digital share-image line composition are now single shared, unit-tested functions (no behavior change); a localStorage config from a different schema version falls back to defaults. Test count 98 → 105.
  - Security: added `form-action 'self'` to the Content-Security-Policy (the builder has no forms; defense-in-depth). `/clock/` stays framable for OBS as before.
- Docs: the README and the manual-QA checklist now cover the v1.1.0 share feature; corrected a stale template count (→ 17) and removed a hardcoded version reference.

The `/clock/?c=...` reproduction contract and the clock rendering are unchanged.

## [1.1.0] - 2026-06-14

### Added

- Share your clock as a promotional image. A new "Xでシェアして広める" panel generates a 1200×675 promo card (Canvas, fully client-side — no upload, no backend, no external fonts or network) that faithfully shows your current clock — digital / analog / flip, with your colors, font, label, date, weekday, and marks — alongside an editable promo message that already includes the builder URL and streamer hashtags. The primary "画像を共有" button uses the Web Share API (`navigator.share({ files })`) to open the OS share sheet (best on mobile, where X is usually a share target); when file sharing isn't available (often on desktop), a fallback saves the PNG and opens the X compose window so you can attach it manually. The preview image and download both use `data:` URLs, so the strict Content-Security-Policy (`img-src 'self' data:`) is unchanged. This partially restores the X-share capability removed in 0.8.0, reframed around image-led promotion. The `/clock/?c=...` reproduction contract and the clock rendering are unchanged.

## [1.0.2] - 2026-06-14

### Changed

- Aligned the "調整モード" (かんたん / こだわり) tab row with the "時計の種類" row above it by adding a matching left-hand "調整モード" label, so both rows' buttons share the same left edge and column width instead of the mode tabs starting flush-left. CSS/HTML only — no change to JavaScript, the generated `/clock/?c=...` output, or the clock rendering.

## [1.0.1] - 2026-06-14

### Changed

- Polished the builder's "こだわり" (advanced) tab so its columns line up. The timezone field and its "端末の地域を採用" button now share one aligned row (with the on-device region shown inline beneath it), the date / weekday / label-position selects align as one row, and the font group's "PC内フォント" loader and the loaded-font list are full-width — removing the ragged, uneven columns. Also tightened some Japanese helper wording for clarity. No change to the generated `/clock/?c=...` output.

## [1.0.0] - 2026-06-14

First stable release. The builder is feature-complete for its scope — digital / analog / flip clocks, reproducible `/clock/?c=...` URLs, automatic server-time correction, and strict security headers. This release focuses on correctness, hardening, and documentation after a full multi-agent audit of every asset (with reproduced findings). The `/clock/?c=...` URL contract is unchanged, so existing generated URLs render identically.

### Fixed

- Pasting malformed JSON into the import box now shows the localized Japanese error instead of a raw English `SyntaxError`.
- A failed import's error message is now cleared when a later import succeeds (it previously lingered).
- The clock resumes ticking after a back/forward (bfcache) page restore, not only after a visibility change.
- The local dev server no longer crashes on a malformed request target (e.g. `//`); it returns 400.

### Changed

- Hardened the server-time sync: it ignores non-2xx / header-less responses, swallows unexpected errors, and exposes a `stop()` handle — so the clock always degrades silently to local time and never emits a console error during a long OBS session.
- The analog face now routes font names through the same CSS sanitizer as the digital and flip clocks.
- Accessibility: the preview-background and recommended-size groups now expose their labels via `role="group"`.
- Removed a dead `fontWeight` re-clamp.
- Docs: added a Security section to the README, corrected a stale `npm test` note in CONTRIBUTING, and confirmed every internal Markdown link resolves. The test suite grew to 87.

## [0.9.0] - 2026-06-14

### Added

- The timezone field now offers a dropdown of common IANA time zones (you can still type any other zone).
- Security headers on all responses: a strict `Content-Security-Policy` (`'self'` only; no inline scripts or styles), `X-Content-Type-Options: nosniff`, and `Referrer-Policy: no-referrer`. The CSP does not restrict framing, so `/clock/` stays embeddable as an OBS browser source.

### Removed

- Removed the non-functional "公開環境の候補を確認" button. With the static Workers deployment, `/api/defaults` is a fixed stub that can never return a real time zone, so the button always showed "未確認"; the on-device candidate (端末の候補) already covers this.

### Changed

- Accessibility: decorative live clock previews are hidden from screen readers; the かんたん / こだわり tabs expose `aria-controls` / `aria-expanded`; and confirmation messages now appear in an always-visible status region (they were previously hidden on the かんたん tab).
- Fixed README inaccuracies (server-time correction is a shipped feature; there are 17 templates) and synced the ops / QA docs. Internal: hardened the test suite (DOM-level tests for the analog and flip renderers, time-sync fetch and offline-fallback tests) and removed dead code (`getOffsetMs`, an unused CSS rule).

## [0.8.0] - 2026-06-13

### Added

- The clock now auto-corrects to server time. `/clock/` reads the HTTP `Date` response header from a same-origin `no-store` request to `/api/defaults`, computes the offset against the PC clock, and applies it — so the displayed time stays accurate even when the streaming PC's clock is wrong. It re-syncs periodically and when the tab regains focus, and falls back to the local PC time when offline. No backend was added; the correction is computed at runtime, so the appearance of existing `/clock/?c=...` URLs is unchanged.

### Removed

- Removed the X (Twitter) sharing feature from the builder — the "X共有・画像" section (post-text copy, PNG image generation, "X投稿画面を開く", PNG save, and Web Share) and the matching "Xに画像が付かない" FAQ. This keeps the project focused on the clock overlay. `/clock/` and the generated URL contract are unaffected.

### Changed

- Refreshed the "よくある問題" (FAQ): plainer wording for streamers, the time entry now explains the new server-time auto-correction, added entries for skipped/paused seconds and switching clock types, and dropped the X entry.

## [0.7.0] - 2026-06-13

### Removed

- Removed the experimental keyword reaction overlay so this project is clock-only. This deletes the bottom "実験室" (Candidate A) panel in the builder, the `/overlay/keyword-reaction/` surface and its redirect, every `keyword-reaction-*` module and test, the `assets/css/overlay.css` bundle (the `styles.css` shim no longer imports it), and the related planning docs. Chat/comment reaction work now lives in a separate project. Your `/clock/?c=...` clock URLs are unaffected, and no clock template, color, font, or size behavior changes.

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
