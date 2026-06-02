# OBS Clock Overlay Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/demo-workers.dev-blue)](https://obs-clock-overlay-builder.h8nc4y.workers.dev)

A zero-runtime-dependency static builder for transparent OBS browser-source clock overlay URLs.

Demo: https://obs-clock-overlay-builder.h8nc4y.workers.dev

## Features

- Transparent OBS clock overlay with a dedicated clock-only `/clock/` surface.
- Reproducible `/clock/?c=...` URL contract for OBS browser sources.
- Eight built-in templates: Minimal Clear, Milk Tea, Pastel Pop, Soda, Sakura, Night Studio, Neon HUD, and Mono Compact.
- Zero runtime dependencies; the clock renders from URL and browser state only.
- Static-first, free-tier-friendly Cloudflare Workers Static Assets hosting.
- Japanese-first editor UI for non-programmer OBS users in Japan.
- Optional browser features for local font discovery, clipboard copy, canvas preview export, and Web Share.

No screenshot is currently tracked in this repository, so this README does not show one.

## Quick Start For OBS

1. Open the builder demo or run it locally.
2. Customize the clock style in the editor.
3. Copy the generated `/clock/?c=...` URL.
4. Add an OBS Browser Source and paste that generated URL into the URL field.
5. Use the recommended width and height shown by the editor. If any glow or text is clipped, add 20px to 80px in OBS.
6. Keep the OBS source background transparent and avoid custom CSS that forces a background color.

The OBS clock uses the computer's system clock. Server-side time correction is intentionally out of scope for this static app.

## Reproducibility Contract

The generated URL is the source of truth:

```text
/clock/?c=<base64url encoded config>
```

- All visual state needed by `/clock/` is encoded into `?c=...`.
- `/clock/` must not depend on editor `localStorage`.
- Editor `localStorage` may help restore draft editing state, but it is not required for OBS playback.
- Keep the generated `/clock/?c=...` URL with your OBS scene if you need to reproduce the same appearance later.
- Invalid or unsupported URL values are normalized to safe defaults.
- URL-provided labels and font names are rendered as text, not HTML.

Older flat query parameters are still read for compatibility, for example:

```text
/clock/?tz=Asia/Tokyo&hour12=0&seconds=1&date=0&weekday=0&font=system-ui&theme=soda
```

## Privacy

- No account is required.
- There is no backend database.
- Clock rendering is based on the URL and the local browser runtime.
- This app does not intentionally send user clock configuration to its server.
- Local font discovery, clipboard, canvas export, and Web Share are optional browser features. Browser permission prompts and browser behavior depend on the user's environment.

## Development

Install dependencies once, then use the npm scripts:

```bash
npm install
npm run dev
npm test
npm run build
npm run release:check
```

Local URLs:

- Builder: `http://localhost:4173/`
- Clock surface: `http://localhost:4173/clock/`

Useful checks:

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
```

Notes:

- `npm run lint` is JavaScript syntax checking with `node --check`, not ESLint.
- `npm run typecheck` is a module/import smoke check, not TypeScript checking.
- `npm test` may rebuild ignored `dist/` output through the build tests.
- `npm run release:check` includes `cf:dry-run`; run it only when Wrangler dry-run is safe in your environment.

## Deployment

The preferred deployment target is Cloudflare Workers with Static Assets. The static output is generated into `dist/`, and `wrangler.jsonc` keeps the Workers Static Assets configuration.

Cloudflare Pages compatibility remains documented because `functions/api/defaults.js` is a harmless optional fallback. The OBS clock surface does not depend on `/api/defaults`.

Remote smoke checks use an explicit base URL:

```bash
SMOKE_BASE_URL=https://example.workers.dev npm run release:remote-smoke
```

Do not deploy, roll back, or run remote smoke checks unless the current release policy allows it.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

Key project contracts:

- Preserve `/clock/?c=...` reproducibility.
- Keep `/clock/` clock-only and transparent-background friendly.
- Do not make `/clock/` depend on editor `localStorage`.
- Do not write untrusted URL, label, or font values with `innerHTML`.
- Do not add dependencies, paid services, bundled fonts, or deployment behavior changes without discussion.

## AI-Assisted Development

This repository records how ChatGPT, Claude Code, and Codex are used for review triage, implementation, and validation evidence. See [docs/HOW_WE_USE_CODEX.md](docs/HOW_WE_USE_CODEX.md).

## 日本語概要

OBS Clock Overlay Builder は、OBS のブラウザソースに貼り付ける透明な時計オーバーレイ URL を作る静的 Web アプリです。

使い方:

1. ビルダーを開きます。
2. 時計の見た目を調整します。
3. 生成された `/clock/?c=...` URL をコピーします。
4. OBS のブラウザソースに貼り付けます。
5. 推奨幅と推奨高さを OBS に入力します。

重要な約束:

- OBS で再現するための正本は生成 URL です。
- `/clock/` は時計だけを表示する面です。
- 編集画面の保存状態がなくても、生成 URL だけで時計表示を再現できる必要があります。
- フォントファイルは同梱していません。OBS を動かす PC に入っているフォント名を使います。

## License

MIT. See [LICENSE](LICENSE).
