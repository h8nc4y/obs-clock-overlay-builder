# Contributing

Thanks for helping improve OBS Clock Overlay Builder.

## Development Setup

```bash
npm install
npm run dev
```

Local URLs:

- Builder: `http://localhost:4173/`
- Clock surface: `http://localhost:4173/clock/`

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
npm run release:check
```

Notes:

- `npm run lint` checks JavaScript syntax.
- `npm run typecheck` runs module/import smoke checks.
- `npm test` can generate ignored `dist/` output.
- `npm run release:check` includes a Wrangler dry-run, so use it only when that is safe for your environment.

## Pull Request Expectations

- Preserve the `/clock/?c=...` reproducibility contract.
- Keep `/clock/` clock-only, transparent-background friendly, and URL-driven.
- Keep `/clock/` independent from editor `localStorage`.
- Avoid `innerHTML` or equivalent risky sinks for untrusted URL, label, or font values.
- Do not add dependencies, bundled fonts, paid services, or deployment behavior changes without prior discussion.
- Update docs and tests when behavior changes.
- Do not record secrets, credentials, private account identifiers, payment details, or raw user/customer data in repository files.

## AI-Assisted Workflow

This project documents its ChatGPT, Claude Code, and Codex workflow in [docs/HOW_WE_USE_CODEX.md](docs/HOW_WE_USE_CODEX.md). Review findings are advisory until triaged, and implementation tasks should stay scoped to approved work.
