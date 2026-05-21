# AGENTS.md

## Project-Specific Rules

Follow the global Codex instructions, global `config.toml`, and global rules for common autonomy, cost, GitHub, Cloudflare, and reporting policy. This file only keeps rules that are specific to this OBS clock overlay builder.

Do not duplicate or narrow the global autonomy, GitHub, Cloudflare, or cost-guard policy here. If global policy changes, keep this file as a project-specific delta unless this app needs an explicit exception.

Preserve the OBS clock overlay contract:

- generated `/clock/?c=...` URLs are the source of truth for OBS reproducibility
- `/clock/` must stay a clock-only surface with transparent background support
- editor-only `localStorage` may assist editing but must not be required by the clock surface
- untrusted URL, label, and font input must stay sanitized and must not be written with `innerHTML`
- no bundled font files should be added unless their license is checked and documented under `docs/licenses`

For Cloudflare deployment work in this static web app, prefer Workers with Static Assets. Cloudflare Pages compatibility may remain documented because `functions/api/defaults.js` is still a harmless optional fallback.

For post-launch operations, keep `docs/post-launch-ops.md` aligned with production URL, rollback candidate, GitHub Actions cost state, Cloudflare binding state, and manual dashboard checks. Do not run production rollback as a drill while production is healthy; use version/help checks and staging-only drills when safe.

Use the existing release check surface before release or operations changes:

- `npm run release:check`
- `npm run release:http-smoke`
- `SMOKE_BASE_URL=<deploy-url> npm run release:remote-smoke`

## Language and Localization

This project is maintained for a Japanese user and Japanese end users.

Use Japanese-first copy for web UI. Prefer short, concrete labels, helper text, empty states, validation messages, and error messages that are understandable to non-programmer users in Japan.

Do not add Japanese comments mechanically. Add Japanese comments only when they clarify non-obvious product behavior, operational constraints, cost-related behavior, deployment behavior, or other project-specific context.
