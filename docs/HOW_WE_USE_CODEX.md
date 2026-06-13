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

## Evidence

The durable, public record of this workflow is the repository itself — commit history, pull requests, release notes, and the validation scripts in `package.json`.

## Public Claims

This document describes how AI tools assist maintenance; it does not claim the project has been endorsed, accepted, or found eligible for any program. Public claims should be backed by repository artifacts such as commits, pull requests, documentation, or validation logs.

## 日本語メモ

このリポジトリでは、ChatGPT が判断と優先順位付けを行い、Claude Code は助言的レビューを行い、Codex は承認済み作業だけを実装します。AI の出力はそのまま事実扱いせず、検証結果や未確認事項を明記します。
