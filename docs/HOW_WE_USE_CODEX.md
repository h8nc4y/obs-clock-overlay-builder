# How We Use Codex

This project uses AI tools as review and implementation aids. The workflow is documented so future public claims can be checked against commits, pull requests, docs, and validation logs.

## Roles

- ChatGPT: commander, triage owner, and task-ordering assistant.
- Claude Code: independent read-only reviewer. Claude findings are advisory until triaged.
- Codex: implementation agent after ChatGPT-approved scope is available.

## How Codex Is Used

Codex is used to:

- implement approved PR review follow-ups;
- convert triaged findings into task queues;
- run local validation;
- support release readiness checks;
- record results without fabricating test results, commits, deploys, PRs, or application status.

Codex should not treat review suggestions as implementation approval by themselves. It should preserve the `/clock/?c=...` OBS reproducibility contract, avoid risky HTML sinks for untrusted values, and report skipped checks or unknowns directly.

## Evidence Links

- [Decision log](DECISION_LOG.md)
- [AI review triage](AI_REVIEW_TRIAGE.md)
- [Codex task queue](CODEX_TASKS.md)
- [Claude review](CLAUDE_REVIEW.md)
- [PR 19 review readiness](PR19_REVIEW_READINESS.md)

## Public Claims

This document is evidence for a future Codex for OSS application, but it does not claim the project has been accepted, endorsed, or found eligible. Public claims should be backed by repository artifacts such as commits, pull requests, documentation, or validation logs.

## 日本語メモ

このリポジトリでは、ChatGPT が判断と優先順位付けを行い、Claude Code は助言的レビューを行い、Codex は承認済み作業だけを実装します。AI の出力はそのまま事実扱いせず、検証結果や未確認事項を明記します。
