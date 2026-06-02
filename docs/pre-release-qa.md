# Pre-release QA Notes

This document summarizes the release QA process in a public-safe form. Historical exact deployment URLs, Worker version identifiers, and private issue or PR links are intentionally omitted.

## Summary

Pre-release QA combines local automated checks, local or browser visual checks, OBS manual checks, Cloudflare dry-run checks, and smoke checks. Production operations require separate release approval under the project cost policy.

Production operations, rollback preparation, cost posture, and ongoing checks are tracked in [post-launch-ops.md](post-launch-ops.md).

## Local Automated Checks

Use these checks before release or operations changes:

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
git diff --check
```

Notes:

- `npm run lint` is JavaScript syntax checking.
- `npm run typecheck` is a module/import smoke check.
- `npm test` may generate ignored `dist/` output.
- `npm run cf:dry-run` uses Wrangler deploy dry-run and should be run only when Cloudflare auth/network use is appropriate.

## Release Preflight

```bash
npm run release:check
npm run release:http-smoke
```

`release:check` includes:

- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm run test`
- `npm run build`
- `npm run cf:dry-run`
- `git diff --check`

`release:http-smoke` starts and stops a bounded local server, then checks `/`, `/clock/`, `/clock`, `/api/defaults`, and `/favicon.ico`.

Remote smoke checks are explicit:

```bash
SMOKE_BASE_URL=<deploy-url> npm run release:remote-smoke
```

Do not run remote smoke checks against staging or production unless the current task allows it.

## Cloudflare Verification Plan

Before deploy:

- Confirm the intended staging or production Worker target.
- Confirm `assets.directory`, `assets.binding`, `html_handling`, and `not_found_handling` in `wrangler.jsonc`.
- Confirm no paid plan change, Workers AI, AI Gateway, R2, D1, KV, Queues, Durable Objects, Workflows, or Hyperdrive is required.
- Confirm no secrets, OAuth credentials, or real user data are sent externally.

After deploy, when deploy is authorized:

- Record only the public URL if it is intentionally used as a demo or release reference.
- Verify `/`, `/clock/`, `/clock`, `/api/defaults`, and `/favicon.ico`.
- Verify `/api/defaults` `Content-Type`, `Cache-Control: no-store`, and static fallback body.
- Verify editor and clock surfaces in browser.
- Confirm rollback path without recording exact version identifiers in public docs.

## OBS Manual QA

OBS real-device verification is not completed by repository tests. Use [manual-qa.md](manual-qa.md) for the checklist.

Minimum pass criteria:

- Generated `/clock/?c=...` URL is used, not the editor URL.
- Clock-only surface is shown.
- Transparent background works in OBS.
- Seconds update once per second when enabled.
- Source hide/show returns to current time within the next tick.
- URL can be pasted again to reproduce the same appearance.
- Text and glow are not clipped at the chosen OBS source size.

## Browser QA

For editor and clock checks:

- Check smartphone width around 390px.
- Check tablet width around 768px.
- Check desktop width 1280px or wider.
- Confirm no unexpected horizontal scroll.
- Confirm primary controls are usable.
- Confirm console and network have no relevant errors.
- Confirm `/clock/` has no editor UI and does not depend on editor `localStorage`.

## `/api/defaults` Decision

Workers Static Assets serves `/api/defaults` as static fallback JSON. The OBS clock surface does not depend on this endpoint. `_headers` provides JSON `Content-Type` and `Cache-Control: no-store`, and smoke checks guard this deployment assumption.

The optional `functions/api/defaults.js` file remains for Cloudflare Pages compatibility.

## CI Decision

GitHub Actions are intentionally not introduced by this document. If CI is added later, prefer `workflow_dispatch` first, then consider automatic triggers only after cost limits and billing posture are confirmed.

## Remaining Unknowns

- Future GitHub Actions cost posture if CI is introduced.
- Future Cloudflare usage and spend-limit state at the time of each deployment.
- OBS behavior on each user's machine, especially font availability and browser-source sizing.

## Residual Risks

- OBS font rendering can differ from local browser rendering.
- Cloudflare and GitHub billing posture must be checked outside this repository before cost-sensitive operations.
- Rollback version choice must be confirmed from Cloudflare at the time of incident response.
