# TASKS_BACKLOG

## Inventory Snapshot

- Updated: 2026/06/13 JST(Claude Codeへの引き継ぎ後、デザイン全面刷新 & v0.2.0 リリース計画をオーナー承認済み)
- Branch at inventory: `feature/limited-broadcastchannel-prototype`
- Existing task sources checked: `docs/CODEX_TASKS.md`, `docs/v0.1.1-backlog.md`, `docs/ROADMAP.md`, `docs/CHATGPT_HANDOFF.md`, `docs/PR19_REVIEW_READINESS.md`
- TODO/FIXME search: no literal source-code `TODO` / `FIXME` tasks found; `未確認` / `pending` entries are reflected below where actionable.
- GitHub open issues checked with `gh issue list`: #10, #28, #29, #30.
- Baseline checks confirmed in this run: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test`, `npm run build`.
- Browser checks confirmed in this run: limited BroadcastChannel prototype receiver/sender on local server at 390px, 768px, and 1280px.

## Backlog

| ID | タスク名 | 出典 | 優先度 | 規模 | 状態 |
|---|---|---|---|---|---|
| TB-001 | limited BroadcastChannel prototype のWIPを完成させる | `git status`; `docs/CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md`; `docs/ROADMAP.md` | 高 | M | done |
| TB-002 | limited BroadcastChannel prototype の結果docs / QA notesを記録する | `docs/CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md` Follow-Up Split | 高 | S | done |
| TB-003 | overlay本体fixture transportのscope decisionをprototype結果後に固定する | `docs/CANDIDATE_A_LIMITED_BROADCASTCHANNEL_PROTOTYPE_SCOPE_DECISION.md`; `docs/ROADMAP.md` | 中 | S | done |
| TB-004 | PC内フォント読み込みの説明を非プログラマー向けに強化する | `docs/v0.1.1-backlog.md`; GitHub issue #10 | 中 | S | done |
| TB-005 | 編集画面の小さな操作性を改善する | `docs/v0.1.1-backlog.md`; GitHub issue #10 | 中 | M | done |
| TB-006 | manual QAとrelease手順を最新化する | `docs/v0.1.1-backlog.md`; GitHub issue #10 / #12 reference | 中 | S | done |
| TB-007 | OBS real-device QA結果を記録する | `docs/PR19_REVIEW_READINESS.md`; `docs/CODEX_TASKS.md`; `docs/ROADMAP.md` | 低 | S | 省略: 2026/06/13 オーナー判断でv0.2.0リリースでは省略(リスク受容)。問題発生時はv0.1.1へロールバック |
| TB-008 | CL-007 public/private documentation policyを最終決定する | `docs/PR19_REVIEW_READINESS.md`; `docs/CL007_AI_COORDINATION_DOCS_DECISION_PACKET.md` | 中 | S | skip: 人間/ChatGPTの公開方針判断が必要で、Codex単独では決定しない |
| TB-009 | YouTube Live focused OBS overlay suite explorationをtriageする | GitHub issue #30; `docs/ROADMAP.md` | 低 | L | skip: 探索/フィードバック系で、実装前に別途scope decisionが必要 |
| TB-010 | 公開フィードバック導線をtriageする | GitHub issue #28; GitHub issue #29; `docs/ROADMAP.md` | 低 | M | skip: 外部フィードバック待ちで、ローカル実装対象が未確定 |
| TB-011 | 未マージ7commitをpush→PR→masterへマージし、v0.1.1タグ+GitHub releaseで区切る(deployなし) | 2026/06/13 オーナー承認済み引き継ぎ計画 | 高 | S | todo |
| TB-012 | デザイン刷新モックアップ3案(Sakura Studio / Night Console / Craft Pop)を`docs/design-mockups/`に作成しオーナー承認を得る | 同上 | 高 | M | todo |
| TB-013 | 互換ガードテスト(DEFAULT_CONFIGスナップショット+既知`?c=` golden)を追加し、styles.cssをtokens/clock/overlay/builderへ分割する(見た目diffゼロ) | 同上 | 高 | M | todo |
| TB-014 | 承認デザイン案でビルダーUIを全面刷新する(STEP化、かんたん/こだわり2層、実験パネル降格) | 同上 | 高 | L | todo |
| TB-015 | 時計テンプレートを刷新し新テンプレート約6種を追加する(DEFAULT_CONFIG凍結、`.clock-widget`構造互換維持) | 同上 | 高 | L | todo |
| TB-016 | overlay実験面の意匠を最小限調整する(idle透明・config-only URL・payload非表示の契約維持) | 同上 | 中 | S | todo |
| TB-017 | QA+v0.2.0リリース(CHANGELOG/README/スクリーンショット更新、staging→production deploy、remote smoke、タグ+GitHub release) | 同上 | 高 | M | todo |

## Notes

- 1タスク1commitを基本に進める。
- Web/UI変更時は日本語UIを維持し、可能な範囲で 390px / 768px / 1280px と console/network/error/focus/hover を確認する。
- Secret/token/OAuth/real data は扱わない。
- Candidate A の overlay本体fixture transport 本実装(narrow BroadcastChannel fixture transport)は保留。デザイン刷新(TB-012〜TB-017)完了後にオーナーと再判断する。
- TB-013〜TB-015 の互換方針: `DEFAULT_CONFIG` は凍結、`TEMPLATES` preset値は刷新可(既存IDは削除しない)、`.clock-widget` 構造CSSは互換維持。旧flat形式URLの見た目変化はCHANGELOGに明記する。
