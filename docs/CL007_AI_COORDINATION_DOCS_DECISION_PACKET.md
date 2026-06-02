# CL007 AI Coordination Docs Decision Packet

## Status

This packet supports the CL-007 decision about tracking, redacting, or splitting AI coordination docs and operational metadata.

Phase 0 OSS readiness applies the public-safe default: keep useful governance evidence, but generalize operational metadata that public readers do not need.

## Files Inspected

Tracked docs inspected during the CL-007 review process included:

- `docs/CLAUDE_REVIEW.md`
- `docs/AI_REVIEW_TRIAGE.md`
- `docs/CODEX_TASKS.md`
- `docs/DECISION_LOG.md`
- `docs/CHATGPT_HANDOFF.md`
- `docs/REVIEW_BRIEF.md`
- `docs/post-launch-ops.md`
- `docs/pre-release-qa.md`
- `docs/LOCAL_REVIEW_VERIFICATION.md`
- `docs/PR19_REVIEW_READINESS.md`

## Scan Summary

High-risk token and key patterns were checked with file-list output first to avoid printing values. No confirmed secrets, private keys, OAuth tokens, payment details, private account identifiers, or raw user/customer data were confirmed in the inspected docs during this pass.

Generic security and billing terms can appear in policy or checklist context. Those matches are not proof of secrets.

## Content Classification

### Safe To Track

Likely safe to track:

- ChatGPT, Claude Code, and Codex role separation;
- Claude review summaries;
- ChatGPT triage records;
- Codex task queues limited to approved findings;
- decision log entries;
- product requirements summary;
- local validation command summaries;
- notes that secrets, payment details, private account identifiers, and raw user/customer data should not be recorded.

### Public-redaction Candidates

Generalize before public exposure:

- exact Worker version identifiers;
- exact rollback candidate identifiers;
- private issue or PR URLs;
- local machine paths;
- local tool, plugin, browser-runtime, or sandbox implementation details;
- account-specific dashboard values or billing details.

### Must Not Be Committed Or Published

Do not commit or publish:

- API keys;
- OAuth tokens;
- GitHub personal access tokens;
- Cloudflare API tokens;
- private keys;
- login secrets;
- payment card or bank details;
- raw customer/user data;
- private account identifiers where project policy says not to record them.

If any are discovered later, report only the file path and risk category, not the value.

## Recommended Public-safe Default

- Keep AI governance docs in Git because they are useful evidence.
- Keep the public demo URL where intentionally used as demo documentation.
- Replace exact deployment and rollback metadata with placeholders or process descriptions.
- Replace private issue/PR URLs with issue or PR numbers when the number itself is useful.
- Remove local workflow internals that do not help public contributors.

## Decision Options For Future Changes

### Option A: Track Public-safe Docs

Best for OSS publication. Keep governance and validation evidence, but remove exact internal operational values.

### Option B: Split Public And Private Docs

Best if future operations require detailed private rollback or dashboard evidence. Public docs stay clean; private docs carry operational values outside the public repository.

### Option C: Keep Private-only Docs

Best if the repository remains private. Requires a redaction pass before any public visibility switch.

## Current Decision

For Phase 0 OSS readiness, Codex applies Option A within the approved scope. The user still controls the actual repository public visibility switch and any future detailed private/public documentation split.
