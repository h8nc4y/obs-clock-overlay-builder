# Post-launch Operations

This document keeps public-safe operational guidance for release checks, cost posture, rollback preparation, and manual dashboard checks.

## Current Production

- public demo URL: `https://obs-clock-overlay-builder.h8nc4y.workers.dev`
- Cloudflare Worker name: `obs-clock-overlay-builder`
- GitHub release: `v0.2.0`(デザイン全面刷新。`v0.1.1` はデプロイなしの区切りタグ)
- v0.1.1 backlog: [v0.1.1-backlog.md](v0.1.1-backlog.md)

Exact Worker version identifiers, rollback candidate identifiers, and private issue or PR URLs are intentionally not recorded in this public-facing document. Before any rollback, re-check the current Cloudflare version and deployment list in the authorized environment.

## Release Check Surface

Run local release checks before production operations:

```bash
npm run release:check
npm run release:http-smoke
SMOKE_BASE_URL=<deploy-url> npm run release:remote-smoke
```

`release:check` runs `lint`, `typecheck`, `format:check`, `test`, `build`, `cf:dry-run`, and `git diff --check`.

Notes:

- `npm run lint` is JavaScript syntax checking, not ESLint.
- `npm run typecheck` is a module/import smoke check, not TypeScript checking.
- `npm test` can rebuild ignored `dist/` output through build tests.
- `release:http-smoke` starts and stops a bounded local server before checking `/`, `/clock/`, `/clock`, `/api/defaults`, and `/favicon.ico`.

## GitHub Actions And Cost

Current project posture:

- `.github/workflows/` is not part of the current project setup.
- Push and pull request workflows should not be introduced without a separate cost and trigger decision.
- If CI is added later, start with `workflow_dispatch` before considering automatic `push` or `pull_request` triggers.

Do not record payment details, private account identifiers, or billing dashboard values in this repository.

## Cloudflare Static Assets And Cost

Current project posture:

- Workers Static Assets is the preferred hosting model.
- `assets.binding` is `ASSETS`.
- D1, KV, R2, Queues, Durable Objects, Workflows, Hyperdrive, Workers AI, and AI Gateway are not part of the current app contract.
- `/api/defaults` is static fallback JSON; `_headers` provides JSON `Content-Type` and `Cache-Control: no-store`.
- Smoke checks guard the `/api/defaults` header and body assumptions.

Before production deploys or settings changes, manually confirm Cloudflare usage, spend limits, alerts, and paid binding state in the dashboard. Do not record account identifiers, usage numbers, payment details, or private dashboard values here.

## Manual Dashboard Evidence

Issue #12 records the historical human confirmation that GitHub Actions cost posture and Cloudflare Workers & Pages cost posture were checked. For future release or operations work, dashboard確認結果は公開safeな要約だけをIssue #12または個別確認コメントへ残す。数値、支払い詳細、account識別子、個人情報はこのrepositoryへ記録しない。

## Rollback Runbook

Do not run production rollback as a drill while production is healthy.

Before rollback:

```bash
npx wrangler deployments list --env production
npx wrangler versions list --env production
npx wrangler rollback --help
```

If production is broken and rollback is authorized, choose the current verified rollback candidate from Cloudflare, then run:

```bash
npx wrangler rollback <version-id> --env production --yes
SMOKE_BASE_URL=<production-url> npm run release:remote-smoke
```

Alternative recovery:

```bash
git switch master
git pull --ff-only
npm run deploy:production
SMOKE_BASE_URL=<production-url> npm run release:remote-smoke
```

After recovery, verify `/`, `/clock/`, `/clock`, `/api/defaults`, `/favicon.ico`, and browser console/network health.

## Browser Verification Notes

For public demo or production checks:

- `/` displays the editor.
- `/clock/` displays only the clock surface.
- `/clock` reaches the clock surface.
- `/api/defaults` returns static fallback JSON with no-store caching.
- 390px, 768px, and 1280px+ widths have no unexpected horizontal scroll.
- Preview background controls have 44px or larger label targets with visible hover and focus states.
- Local font loading explains permission prompts, empty-list fallback, and actual font-name storage for OBS.
- Browser console has no relevant errors or warnings.
- Network requests have no relevant failures.

## Font Risk

OBS font rendering depends on fonts installed on the OBS computer. The repository does not bundle font files. If bundled fonts are added later, check their licenses first and document them under `docs/licenses`.

## Public Documentation Policy

Keep useful release, validation, and AI-governance evidence in Git. Generalize operational metadata that is not needed by public users:

- exact Worker version IDs;
- exact rollback candidate IDs;
- private issue or PR URLs;
- local machine paths;
- local tool availability or sandbox implementation details.

Never commit secrets, tokens, OAuth credentials, private keys, payment details, private account identifiers, or raw user/customer data.
