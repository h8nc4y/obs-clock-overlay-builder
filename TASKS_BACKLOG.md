# TASKS_BACKLOG

## Inventory Snapshot

- Updated: 2026/06/11 JST
- Branch at inventory: `feature/limited-broadcastchannel-prototype`
- Existing task sources checked: `docs/CODEX_TASKS.md`, `docs/v0.1.1-backlog.md`, `docs/ROADMAP.md`, `docs/CHATGPT_HANDOFF.md`, `docs/PR19_REVIEW_READINESS.md`
- TODO/FIXME search: no literal source-code `TODO` / `FIXME` tasks found; `未確認` / `pending` entries are reflected below where actionable.
- GitHub open issues checked with `gh issue list`: #10, #28, #29, #30.
- Baseline checks already confirmed in this run: `npm run lint`, `npm run typecheck`.
- Baseline checks pending due approval-review timeout: `npm run format:check`, `npm test`, `npm run build`.

## Backlog

| ID | タスク名 | 出典 | 優先度 | 規模 | 状態 |
|---|---|---|---|---|---|
| TB-001 | limited BroadcastChannel prototype のWIPを完成させる | `git status`; `docs/CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md`; `docs/ROADMAP.md` | 高 | M | done |
| TB-002 | limited BroadcastChannel prototype の結果docs / QA notesを記録する | `docs/CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md` Follow-Up Split | 高 | S | todo |
| TB-003 | overlay本体fixture transportのscope decisionをprototype結果後に固定する | `docs/CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md`; `docs/ROADMAP.md` | 中 | S | todo |
| TB-004 | PC内フォント読み込みの説明を非プログラマー向けに強化する | `docs/v0.1.1-backlog.md`; GitHub issue #10 | 中 | S | todo |
| TB-005 | 編集画面の小さな操作性を改善する | `docs/v0.1.1-backlog.md`; GitHub issue #10 | 中 | M | todo |
| TB-006 | manual QAとrelease手順を最新化する | `docs/v0.1.1-backlog.md`; GitHub issue #10 / #12 reference | 中 | S | todo |
| TB-007 | OBS real-device QA結果を記録する | `docs/PR19_REVIEW_READINESS.md`; `docs/CODEX_TASKS.md`; `docs/ROADMAP.md` | 中 | S | skip: Codexローカル環境ではOBS実機確認ができないため、人間QA結果が必要 |
| TB-008 | CL-007 public/private documentation policyを最終決定する | `docs/PR19_REVIEW_READINESS.md`; `docs/CL007_AI_COORDINATION_DOCS_DECISION_PACKET.md` | 中 | S | skip: 人間/ChatGPTの公開方針判断が必要で、Codex単独では決定しない |
| TB-009 | YouTube Live focused OBS overlay suite explorationをtriageする | GitHub issue #30; `docs/ROADMAP.md` | 低 | L | skip: 探索/フィードバック系で、実装前に別途scope decisionが必要 |
| TB-010 | 公開フィードバック導線をtriageする | GitHub issue #28; GitHub issue #29; `docs/ROADMAP.md` | 低 | M | skip: 外部フィードバック待ちで、ローカル実装対象が未確定 |

## Notes

- 1タスク1commitを基本に進める。
- Web/UI変更時は日本語UIを維持し、可能な範囲で 390px / 768px / 1280px と console/network/error/focus/hover を確認する。
- Secret/token/OAuth/real data は扱わない。
