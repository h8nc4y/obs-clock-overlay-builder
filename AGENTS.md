# AGENTS.md

## Operating Policy

This repository is configured for long-running autonomous Codex work.

Continue autonomously across safe local checkpoints. Do not stop merely because a checkpoint is complete, tests need to be added, docs need to be updated, multiple local implementation choices exist, or a change is ready for the normal GitHub workflow.

Prefer the smallest useful change that preserves this project's OBS clock overlay behavior:

- generated `/clock/?c=...` URLs are the source of truth for OBS reproducibility
- `/clock/` must stay a clock-only surface with transparent background support
- editor-only localStorage may assist editing but must not be required by the clock surface
- untrusted URL, label, and font input must stay sanitized and must not be written with `innerHTML`
- no bundled font files should be added unless their license is checked and documented under `docs/licenses`

## Stop Only When

Stop only when continuation requires cost-incurring API calls, paid model/API execution, a paid Cloudflare plan or billable AI/cloud operation, purchase/subscription/ad-spend changes, secrets/tokens/OAuth credentials/real user data transmission to an external service, GitHub Release writes, production data operations, large storage/egress/compute operations likely to exceed free or included quotas, or a sandbox/approval/usage-limit blocker that physically prevents continuation.

If a cost or external-risk stop condition is hit, do not perform the operation. Report the exact operation, why it is needed, the safest local/mock/free alternative, estimated cost in JPY, the USD/JPY assumption or source, pricing basis, recommended approval wording, and the safest next command after approval.

## Local Work Allowed

Editing repository files, adding tests, updating docs, adding free package dependencies, running local checks, creating local scripts, inspecting git state, creating branches, committing, pushing configured remotes, opening/updating GitHub issues or pull requests, addressing review feedback, merging ready PRs, and cleaning up merged branches are allowed without stopping.

Use a separate branch for each feature/fix/docs/test/chore task:

- `feature/<short-kebab-summary>`
- `fix/<short-kebab-summary>`
- `docs/<short-kebab-summary>`
- `test/<short-kebab-summary>`
- `chore/<short-kebab-summary>`

Before branch or push work, check git status, current branch, remotes, and recent commits. Preserve unrelated uncommitted user work.

Commit messages should use an English conventional prefix and English summary, with Japanese supplement when helpful. Pull request bodies should include Summary / 概要, Changes / 変更内容, Tests / 検証, Review notes / レビュー観点, Risks / 残リスク, Unknowns / 未確認事項, and Cost impact / 費用影響.

## Cloudflare Workflow

For this static web app, prefer Cloudflare Workers with Static Assets for new Cloudflare deployment work. Cloudflare Pages compatibility may remain documented because `functions/api/defaults.js` is still a harmless optional fallback.

Allowed without stopping when no new cost is expected:

- `wrangler dev`
- local preview
- `wrangler deploy --dry-run`
- preview/staging/production deploys for this app
- deployment status checks
- rollback preparation and rollback execution for this app
- reading logs or metrics that do not expose secrets or real user data

Stop before Workers AI, AI Gateway, paid plan changes, paid add-ons, domain purchases, or any large R2/D1/KV/Queues/Durable Objects/Workflows/Hyperdrive operation likely to exceed the free or included quota.

When deploying, report the environment, command/tool used, URL, preview/staging/production classification, expected cost impact, and rollback path.

## Development Loop

Repeat autonomously while useful work remains and no stop condition applies:

1. Read the minimum relevant project instructions and files.
2. Check git status, branch, remotes, default branch evidence, and recent commits.
3. Inspect issues, PRs, test failures, TODOs, docs drift, and code health.
4. Select the next highest-value task and create a task branch.
5. Implement the smallest useful change.
6. Run relevant tests, lint/type/format/build checks, and browser checks when UI behavior is affected.
7. Fix local failures, review the diff, commit, push, create/update PR, address review feedback, and merge when ready.
8. Deploy and verify through Browser/Chrome when appropriate and free.
9. Report results and continue to the next useful task.

## Reporting

Every progress or final report should start with the current Japan time in `YYYY/MM/DD HH:MM:SS` format. Include tests run, git status, `git diff --stat`, unknowns, residual risks, why work stopped, and next recommended action when relevant.

If something is unknown, write `未確認`. Do not fabricate command results, file contents, test results, commit hashes, or external facts.
