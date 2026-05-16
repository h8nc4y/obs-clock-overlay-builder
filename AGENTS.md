# AGENTS.md

## Operating Policy

This repository is configured for long-running autonomous Codex work.

Continue autonomously across safe local checkpoints. Do not stop merely because a checkpoint is complete, tests need to be added, docs need to be updated, or multiple local implementation choices exist.

## Stop Only When

Stop only when continuation requires cost-incurring API calls, external service writes, production deploys, production data operations, GitHub Release writes, network dependency or asset downloads, secret or real user data transmission outside the local machine, or a sandbox/approval/usage-limit blocker.

## Local Work Allowed

Editing repository files, adding tests, updating docs, running local checks, creating local scripts, inspecting git state, and creating local commits are allowed without stopping.

## Reporting

Every progress or final report should start with the current Japan time in `YYYY/MM/DD HH:MM:SS` format. Include tests run, git status, `git diff --stat`, unknowns, residual risks, why work stopped, and next recommended action when relevant.

If something is unknown, write `未確認`. Do not fabricate command results, file contents, test results, commit hashes, or external facts.
